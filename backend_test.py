import requests
import sys
import json
from datetime import datetime

class AICompanionAPITester:
    def __init__(self, base_url="https://a23f8ee2-ade2-4a75-91d9-1fcfa541421e.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.companion_id = None
        self.user_id = "test_user_123"

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            print(f"   Status Code: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_create_companion(self):
        """Test creating a companion with Emma personality"""
        personality_data = {
            "name": "Emma",
            "gender": "feminine",
            "personality_traits": ["caring", "romantic", "supportive"],
            "affection_level": 8,
            "humor_style": "gentle",
            "love_language": "words_of_affirmation",
            "voice_style": "warm"
        }
        
        companion_data = {
            "user_id": self.user_id,
            "personality": personality_data
        }
        
        success, response = self.run_test(
            "Create Companion (Emma)",
            "POST",
            "companions",
            200,
            data=companion_data
        )
        
        if success and 'id' in response:
            self.companion_id = response['id']
            print(f"   Created companion with ID: {self.companion_id}")
            return True
        return False

    def test_get_companions(self):
        """Test getting user companions"""
        return self.run_test(
            "Get User Companions",
            "GET",
            f"companions/{self.user_id}",
            200
        )

    def test_send_message(self, message_text):
        """Test sending a message to companion"""
        if not self.companion_id:
            print("❌ No companion ID available for messaging")
            return False
            
        message_data = {
            "user_id": self.user_id,
            "companion_id": self.companion_id,
            "message": message_text
        }
        
        success, response = self.run_test(
            f"Send Message: '{message_text}'",
            "POST",
            "chat",
            200,
            data=message_data
        )
        
        if success:
            # Check if we got both user message and companion response
            if 'message' in response and 'companion_response' in response:
                print(f"   User message saved: {response['message']['message']}")
                if response['companion_response']:
                    print(f"   AI Response: {response['companion_response']['message'][:100]}...")
                    return True
                else:
                    print("   Warning: No companion response received")
                    return False
        return False

    def test_conversation_history(self):
        """Test getting conversation history"""
        if not self.companion_id:
            print("❌ No companion ID available for conversation history")
            return False
            
        success, response = self.run_test(
            "Get Conversation History",
            "GET",
            f"chat/{self.user_id}/{self.companion_id}",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} messages in history")
            return True
        return False

    def test_daily_greeting(self):
        """Test daily greeting endpoint"""
        if not self.companion_id:
            print("❌ No companion ID available for daily greeting")
            return False
            
        return self.run_test(
            "Get Daily Greeting",
            "GET",
            f"daily-greeting/{self.user_id}/{self.companion_id}",
            200
        )

def main():
    print("🚀 Starting AI Companion API Tests")
    print("=" * 50)
    
    # Setup
    tester = AICompanionAPITester()
    
    # Test sequence
    tests = [
        ("API Root", tester.test_api_root),
        ("Create Companion", tester.test_create_companion),
        ("Get Companions", tester.test_get_companions),
        ("Send Hello Message", lambda: tester.test_send_message("Hello Emma! Nice to meet you.")),
        ("Send Emotional Message", lambda: tester.test_send_message("I had a really tough day today and could use some support.")),
        ("Send Casual Message", lambda: tester.test_send_message("How are you feeling today?")),
        ("Get Conversation History", tester.test_conversation_history),
        ("Daily Greeting", tester.test_daily_greeting),
    ]
    
    # Run all tests
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ Test '{test_name}' failed with exception: {str(e)}")
            tester.tests_run += 1
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! Backend API is working correctly.")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed.")
        return 1

if __name__ == "__main__":
    sys.exit(main())