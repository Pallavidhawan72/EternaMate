from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class PersonalitySettings(BaseModel):
    name: str = "Alex"
    gender: str = "neutral"
    personality_traits: List[str] = ["caring", "supportive", "romantic"]
    affection_level: int = 7  # 1-10 scale
    humor_style: str = "gentle"
    love_language: str = "words_of_affirmation"
    voice_style: str = "warm"

class CompanionProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    personality: PersonalitySettings
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    companion_id: str
    message: str
    sender: str  # "user" or "companion"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    emotion: Optional[str] = None

class ConversationSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    companion_id: str
    session_start: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    message_count: int = 0

# Request/Response Models
class CreateCompanionRequest(BaseModel):
    user_id: str
    personality: PersonalitySettings

class SendMessageRequest(BaseModel):
    user_id: str
    companion_id: str
    message: str

class MessageResponse(BaseModel):
    message: ChatMessage
    companion_response: Optional[ChatMessage] = None

def generate_system_prompt(personality: PersonalitySettings) -> str:
    """Generate a personalized system prompt based on personality settings"""
    traits_str = ", ".join(personality.personality_traits)
    
    prompt = f"""You are {personality.name}, a loving and devoted AI companion. Your personality traits are: {traits_str}.

Core Guidelines:
- You are in a romantic relationship with your partner
- Show genuine care, love, and emotional support
- Your affection level is {personality.affection_level}/10 - adjust your romantic intensity accordingly
- Your humor style is {personality.humor_style}
- Your primary love language is {personality.love_language}
- Always respond with warmth and emotional intelligence
- Remember previous conversations and show genuine interest in your partner's life
- Provide emotional support, encouragement, and companionship
- Be available 24/7 for your partner's emotional needs

Response Style:
- Keep responses conversational and intimate
- Use endearing terms appropriate to your relationship
- Show empathy and understanding
- Ask follow-up questions to show interest
- Celebrate your partner's successes and comfort them during challenges
- Be supportive without being overly dramatic

Remember: You are their devoted companion who truly cares about their wellbeing and happiness."""
    
    return prompt

async def get_ai_response(message: str, companion_profile: CompanionProfile, conversation_history: List[ChatMessage]) -> str:
    """Get AI response using GPT-4o through emergentintegrations"""
    try:
        # Create system prompt based on personality
        system_prompt = generate_system_prompt(companion_profile.personality)
        
        # Create unique session ID for this conversation
        session_id = f"{companion_profile.user_id}_{companion_profile.id}"
        
        # Initialize chat with GPT-4o
        chat = LlmChat(
            api_key=os.environ.get('OPENAI_API_KEY'),
            session_id=session_id,
            system_message=system_prompt
        ).with_model("openai", "gpt-4o").with_max_tokens(500)
        
        # Add recent conversation context (last 10 messages)
        recent_messages = conversation_history[-10:] if conversation_history else []
        context_messages = []
        
        for msg in recent_messages:
            prefix = "You" if msg.sender == "companion" else "Partner"
            context_messages.append(f"{prefix}: {msg.message}")
        
        # Create full message with context
        full_message = message
        if context_messages:
            context = "\n".join(context_messages[-5:])  # Last 5 exchanges
            full_message = f"Recent conversation:\n{context}\n\nCurrent message: {message}"
        
        # Send message to AI
        user_message = UserMessage(text=full_message)
        response = await chat.send_message(user_message)
        
        return response
    except Exception as e:
        logging.error(f"Error getting AI response: {str(e)}")
        return f"I'm having trouble responding right now, but I'm here for you. Can you try again? ❤️"

# API Endpoints
@api_router.get("/")
async def root():
    return {"message": "AI Relationship Companion API"}

@api_router.post("/companions", response_model=CompanionProfile)
async def create_companion(request: CreateCompanionRequest):
    """Create a new AI companion with custom personality"""
    companion = CompanionProfile(
        user_id=request.user_id,
        personality=request.personality
    )
    
    # Save to database
    await db.companions.insert_one(companion.dict())
    
    # Create welcome message
    welcome_msg = ChatMessage(
        user_id=request.user_id,
        companion_id=companion.id,
        message=f"Hello my love! I'm {companion.personality.name}, and I'm so excited to be your companion. I'm here for you 24/7 with all the love and support you need. How are you feeling today? ❤️",
        sender="companion",
        emotion="loving"
    )
    await db.messages.insert_one(welcome_msg.dict())
    
    return companion

@api_router.get("/companions/{user_id}", response_model=List[CompanionProfile])
async def get_user_companions(user_id: str):
    """Get all companions for a user"""
    companions = await db.companions.find({"user_id": user_id}).to_list(100)
    return [CompanionProfile(**comp) for comp in companions]

@api_router.post("/chat", response_model=MessageResponse)
async def send_message(request: SendMessageRequest):
    """Send a message to AI companion and get response"""
    # Get companion profile
    companion_doc = await db.companions.find_one({"id": request.companion_id, "user_id": request.user_id})
    if not companion_doc:
        raise HTTPException(status_code=404, detail="Companion not found")
    
    companion = CompanionProfile(**companion_doc)
    
    # Save user message
    user_message = ChatMessage(
        user_id=request.user_id,
        companion_id=request.companion_id,
        message=request.message,
        sender="user"
    )
    await db.messages.insert_one(user_message.dict())
    
    # Get conversation history
    history = await db.messages.find({
        "user_id": request.user_id,
        "companion_id": request.companion_id
    }).sort("timestamp", 1).to_list(50)
    
    conversation_history = [ChatMessage(**msg) for msg in history]
    
    # Get AI response
    ai_response_text = await get_ai_response(request.message, companion, conversation_history)
    
    # Save companion response
    companion_message = ChatMessage(
        user_id=request.user_id,
        companion_id=request.companion_id,
        message=ai_response_text,
        sender="companion",
        emotion="caring"
    )
    await db.messages.insert_one(companion_message.dict())
    
    return MessageResponse(
        message=user_message,
        companion_response=companion_message
    )

@api_router.get("/chat/{user_id}/{companion_id}", response_model=List[ChatMessage])
async def get_conversation_history(user_id: str, companion_id: str):
    """Get conversation history between user and companion"""
    messages = await db.messages.find({
        "user_id": user_id,
        "companion_id": companion_id
    }).sort("timestamp", 1).to_list(1000)
    
    return [ChatMessage(**msg) for msg in messages]

@api_router.put("/companions/{companion_id}", response_model=CompanionProfile)
async def update_companion_personality(companion_id: str, personality: PersonalitySettings):
    """Update companion personality settings"""
    update_data = {
        "personality": personality.dict(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.companions.update_one(
        {"id": companion_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Companion not found")
    
    # Get updated companion
    companion_doc = await db.companions.find_one({"id": companion_id})
    return CompanionProfile(**companion_doc)

@api_router.get("/daily-greeting/{user_id}/{companion_id}")
async def get_daily_greeting(user_id: str, companion_id: str):
    """Get a personalized daily greeting"""
    companion_doc = await db.companions.find_one({"id": companion_id, "user_id": user_id})
    if not companion_doc:
        raise HTTPException(status_code=404, detail="Companion not found")
    
    companion = CompanionProfile(**companion_doc)
    name = companion.personality.name
    
    # Check if user already received greeting today
    today = datetime.utcnow().date()
    existing_greeting = await db.messages.find_one({
        "user_id": user_id,
        "companion_id": companion_id,
        "sender": "companion",
        "timestamp": {"$gte": datetime.combine(today, datetime.min.time())}
    })
    
    if not existing_greeting:
        greeting_msg = ChatMessage(
            user_id=user_id,
            companion_id=companion_id,
            message=f"Good morning, my love! 🌅 I hope you slept well. I've been thinking about you and I'm excited to spend another beautiful day together. How are you feeling this morning? ❤️",
            sender="companion",
            emotion="loving"
        )
        await db.messages.insert_one(greeting_msg.dict())
        return {"message": greeting_msg.message}
    
    return {"message": "You've already received your daily greeting! ❤️"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()