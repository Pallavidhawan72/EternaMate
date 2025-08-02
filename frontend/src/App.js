import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Slider } from './components/ui/slider';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { ScrollArea } from './components/ui/scroll-area';
import { Separator } from './components/ui/separator';
import { Heart, MessageCircle, Settings, Plus, Send, Mic, MicOff, Volume2, VolumeX, Globe } from 'lucide-react';
import './App.css';

// Language configurations
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', speechLang: 'en-US' },
  { code: 'es', name: 'Español', flag: '🇪🇸', speechLang: 'es-ES' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', speechLang: 'fr-FR' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', speechLang: 'de-DE' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', speechLang: 'it-IT' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', speechLang: 'pt-BR' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', speechLang: 'ru-RU' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', speechLang: 'ja-JP' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', speechLang: 'ko-KR' },
  { code: 'zh', name: '中文', flag: '🇨🇳', speechLang: 'zh-CN' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', speechLang: 'ar-SA' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', speechLang: 'hi-IN' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭', speechLang: 'th-TH' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', speechLang: 'vi-VN' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱', speechLang: 'nl-NL' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪', speechLang: 'sv-SE' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴', speechLang: 'no-NO' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰', speechLang: 'da-DK' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱', speechLang: 'pl-PL' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', speechLang: 'tr-TR' }
];

// Translation service for user input
const translateText = async (text, targetLang) => {
  // Simple translation mappings for common phrases
  const translations = {
    'hi': {
      'hello': 'नमस्ते',
      'hi': 'नमस्ते',
      'how are you': 'आप कैसे हैं',
      'i love you': 'मैं तुमसे प्यार करता हूं',
      'good morning': 'सुप्रभात',
      'good night': 'शुभ रात्रि',
      'thank you': 'धन्यवाद',
      'yes': 'हां',
      'no': 'नहीं',
      'where are you': 'आप कहाँ हैं',
      'speak in hindi': 'हिंदी में बोलें',
      'i miss you': 'मुझे आपकी याद आती है',
      'i am fine': 'मैं ठीक हूं',
      'what are you doing': 'आप क्या कर रहे हैं'
    },
    'es': {
      'hello': 'hola',
      'hi': 'hola',
      'how are you': 'como estas',
      'i love you': 'te amo',
      'good morning': 'buenos días',
      'good night': 'buenas noches',
      'thank you': 'gracias',
      'yes': 'sí',
      'no': 'no'
    },
    'fr': {
      'hello': 'bonjour',
      'hi': 'salut',
      'how are you': 'comment allez-vous',
      'i love you': 'je t\'aime',
      'good morning': 'bonjour',
      'good night': 'bonne nuit',
      'thank you': 'merci',
      'yes': 'oui',
      'no': 'non'
    }
  };

  if (targetLang === 'en' || !translations[targetLang]) {
    return text; // No translation needed for English or unsupported languages
  }

  const lowerText = text.toLowerCase().trim();
  const targetTranslations = translations[targetLang];
  
  // Check for exact matches first
  if (targetTranslations[lowerText]) {
    return targetTranslations[lowerText];
  }
  
  // Check for partial matches
  for (const [english, translated] of Object.entries(targetTranslations)) {
    if (lowerText.includes(english)) {
      return text.replace(new RegExp(english, 'gi'), translated);
    }
  }
  
  return text; // Return original if no translation found
};

// Translations
const TRANSLATIONS = {
  en: {
    appName: "EternaMate",
    tagline: "AI companionship that truly understands you",
    description: "Create your perfect AI companion - emotionally attentive, responsive, and available 24/7.",
    createCompanion: "Create Your Companion",
    createTitle: "Create Your AI Companion",
    createDescription: "Customize your perfect partner's personality and traits",
    companionName: "Companion Name",
    namePlaceholder: "Enter your companion's name",
    genderExpression: "Gender Expression",
    feminine: "Feminine",
    masculine: "Masculine",
    neutral: "Neutral",
    personalityTraits: "Personality Traits",
    affectionLevel: "Affection Level",
    humorStyle: "Humor Style",
    gentle: "Gentle",
    witty: "Witty",
    playful: "Playful",
    sarcastic: "Sarcastic",
    silly: "Silly",
    loveLanguage: "Love Language",
    wordsOfAffirmation: "Words of Affirmation",
    actsOfService: "Acts of Service",
    receivingGifts: "Receiving Gifts",
    qualityTime: "Quality Time",
    physicalTouch: "Physical Touch",
    creating: "Creating...",
    yourAiCompanion: "Your AI Companion",
    typePlaceholder: "Type your message...",
    listening: "Listening...",
    listeningHint: "🎤 Listening... Speak now or click the microphone to stop",
    demoMode: "🌟 Demo Mode: You're experiencing EternaMate offline! All features are working.",
    language: "Language"
  },
  es: {
    appName: "EternaMate",
    tagline: "Compañía IA que realmente te entiende",
    description: "Crea tu compañero IA perfecto: emocionalmente atento, receptivo y disponible 24/7.",
    createCompanion: "Crear Tu Compañero",
    createTitle: "Crea Tu Compañero IA",
    createDescription: "Personaliza la personalidad y características de tu pareja perfecta",
    companionName: "Nombre del Compañero",
    namePlaceholder: "Introduce el nombre de tu compañero",
    genderExpression: "Expresión de Género",
    feminine: "Femenino",
    masculine: "Masculino",
    neutral: "Neutral",
    personalityTraits: "Rasgos de Personalidad",
    affectionLevel: "Nivel de Afecto",
    humorStyle: "Estilo de Humor",
    gentle: "Gentil",
    witty: "Ingenioso",
    playful: "Juguetón",
    sarcastic: "Sarcástico",
    silly: "Tonto",
    loveLanguage: "Lenguaje del Amor",
    wordsOfAffirmation: "Palabras de Afirmación",
    actsOfService: "Actos de Servicio",
    receivingGifts: "Recibir Regalos",
    qualityTime: "Tiempo de Calidad",
    physicalTouch: "Contacto Físico",
    creating: "Creando...",
    yourAiCompanion: "Tu Compañero IA",
    typePlaceholder: "Escribe tu mensaje...",
    listening: "Escuchando...",
    listeningHint: "🎤 Escuchando... Habla ahora o haz clic en el micrófono para parar",
    demoMode: "🌟 Modo Demo: ¡Estás experimentando EternaMate sin conexión! Todas las características funcionan.",
    language: "Idioma"
  },
  fr: {
    appName: "EternaMate",
    tagline: "Compagnie IA qui vous comprend vraiment",
    description: "Créez votre compagnon IA parfait - émotionnellement attentif, réactif et disponible 24h/7j.",
    createCompanion: "Créer Votre Compagnon",
    createTitle: "Créez Votre Compagnon IA",
    createDescription: "Personnalisez la personnalité et les traits de votre partenaire parfait",
    companionName: "Nom du Compagnon",
    namePlaceholder: "Entrez le nom de votre compagnon",
    genderExpression: "Expression de Genre",
    feminine: "Féminin",
    masculine: "Masculin",
    neutral: "Neutre",
    personalityTraits: "Traits de Personnalité",
    affectionLevel: "Niveau d'Affection",
    humorStyle: "Style d'Humour",
    gentle: "Doux",
    witty: "Spirituel",
    playful: "Joueur",
    sarcastic: "Sarcastique",
    silly: "Idiot",
    loveLanguage: "Langage d'Amour",
    wordsOfAffirmation: "Mots d'Affirmation",
    actsOfService: "Actes de Service",
    receivingGifts: "Recevoir des Cadeaux",
    qualityTime: "Temps de Qualité",
    physicalTouch: "Contact Physique",
    creating: "Création...",
    yourAiCompanion: "Votre Compagnon IA",
    typePlaceholder: "Tapez votre message...",
    listening: "Écoute...",
    listeningHint: "🎤 Écoute... Parlez maintenant ou cliquez sur le microphone pour arrêter",
    demoMode: "🌟 Mode Démo: Vous expérimentez EternaMate hors ligne! Toutes les fonctionnalités fonctionnent.",
    language: "Langue"
  },
  hi: {
    appName: "EternaMate",
    tagline: "AI साथी जो वास्तव में आपको समझता है",
    description: "अपना परफेक्ट AI साथी बनाएं - भावनात्मक रूप से चौकस, उत्तरदायी और 24/7 उपलब्ध।",
    createCompanion: "अपना साथी बनाएं",
    createTitle: "अपना AI साथी बनाएं",
    createDescription: "अपने परफेक्ट पार्टनर के व्यक्तित्व और गुणों को कस्टमाइज़ करें",
    companionName: "साथी का नाम",
    namePlaceholder: "अपने साथी का नाम दर्ज करें",
    genderExpression: "लिंग अभिव्यक्ति",
    feminine: "स्त्रैण",
    masculine: "पुरुषत्व",
    neutral: "निष्पक्ष",
    personalityTraits: "व्यक्तित्व गुण",
    affectionLevel: "स्नेह स्तर",
    humorStyle: "हास्य शैली",
    gentle: "कोमल",
    witty: "बुद्धिमान",
    playful: "चंचल",
    sarcastic: "व्यंग्यात्मक",
    silly: "मूर्खतापूर्ण",
    loveLanguage: "प्रेम भाषा",
    wordsOfAffirmation: "पुष्टि के शब्द",
    actsOfService: "सेवा के कार्य",
    receivingGifts: "उपहार प्राप्त करना",
    qualityTime: "गुणवत्तापूर्ण समय",
    physicalTouch: "शारीरिक स्पर्श",
    creating: "बना रहे हैं...",
    yourAiCompanion: "आपका AI साथी",
    typePlaceholder: "अपना संदेश टाइप करें...",
    listening: "सुन रहे हैं...",
    listeningHint: "🎤 सुन रहे हैं... अब बोलें या माइक्रोफोन पर क्लिक करके बंद करें",
    demoMode: "🌟 डेमो मोड: आप EternaMate को ऑफलाइन अनुभव कर रहे हैं! सभी सुविधाएं काम कर रही हैं।",
    language: "भाषा"
  },
  de: {
    appName: "EternaMate",
    tagline: "KI-Begleitung, die Sie wirklich versteht",
    description: "Erstellen Sie Ihren perfekten KI-Begleiter - emotional aufmerksam, reaktionsfähig und rund um die Uhr verfügbar.",
    createCompanion: "Begleiter Erstellen",
    createTitle: "Erstellen Sie Ihren KI-Begleiter",
    createDescription: "Passen Sie die Persönlichkeit und Eigenschaften Ihres perfekten Partners an",
    companionName: "Name des Begleiters",
    namePlaceholder: "Geben Sie den Namen Ihres Begleiters ein",
    genderExpression: "Geschlechtsausdruck",
    feminine: "Weiblich",
    masculine: "Männlich",
    neutral: "Neutral",
    personalityTraits: "Persönlichkeitsmerkmale",
    affectionLevel: "Zuneigungsgrad",
    humorStyle: "Humor-Stil",
    gentle: "Sanft",
    witty: "Witzig",
    playful: "Verspielt",
    sarcastic: "Sarkastisch",
    silly: "Albern",
    loveLanguage: "Liebessprache",
    wordsOfAffirmation: "Bestätigende Worte",
    actsOfService: "Diensthandlungen",
    receivingGifts: "Geschenke empfangen",
    qualityTime: "Qualitätszeit",
    physicalTouch: "Körperliche Berührung",
    creating: "Erstellen...",
    yourAiCompanion: "Ihr KI-Begleiter",
    typePlaceholder: "Geben Sie Ihre Nachricht ein...",
    listening: "Hören...",
    listeningHint: "🎤 Hören... Sprechen Sie jetzt oder klicken Sie auf das Mikrofon zum Stoppen",
    demoMode: "🌟 Demo-Modus: Sie erleben EternaMate offline! Alle Funktionen funktionieren.",
    language: "Sprache"
  }
  // Add more languages as needed
};

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://a23f8ee2-ade2-4a75-91d9-1fcfa541421e.preview.emergentagent.com';
const USE_MOCK_API = true; // Set to true for offline development

// Get translation helper
const getTranslation = (key, language = 'en') => {
  return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
};

// Language Selector Component
const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-white/80" />
      <Select value={currentLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-36 glass-effect border-white/30 text-white bg-white/10 backdrop-blur-md">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="glass-effect border-white/30 bg-white/95 backdrop-blur-md">
          {LANGUAGES.map(lang => (
            <SelectItem key={lang.code} value={lang.code} className="hover:bg-white/80">
              <span className="flex items-center space-x-2">
                <span>{lang.flag}</span>
                <span className="text-xs">{lang.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Avatar Generator - creates unique avatars for companions
const getCompanionAvatar = (companion) => {
  const styles = [
    'adventurer', 'avataaars', 'big-ears', 'big-smile', 'croodles', 
    'fun-emoji', 'lorelei', 'micah', 'miniavs', 'pixel-art'
  ];
  
  const colors = ['ff6b6b', 'ee5a24', 'feca57', '48dbfb', '0abde3', 'ff9ff3', '54a0ff', 'ff6348'];
  
  // Generate consistent style and color based on companion name and traits
  const nameHash = companion.personality?.name?.split('').reduce((a, b) => a + b.charCodeAt(0), 0) || 0;
  const traitHash = companion.personality?.personality_traits?.join('').length || 0;
  
  const style = styles[nameHash % styles.length];
  const color = colors[(nameHash + traitHash) % colors.length];
  const seed = encodeURIComponent(companion.personality?.name || 'companion');
  
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=${color}`;
};

// Global Header Component
const GlobalHeader = ({ currentLanguage, onLanguageChange, demoMode }) => {
  return (
    <div className="w-full relative z-20">
      {demoMode && (
        <div className="glass-effect border-0 border-b border-white/20 px-4 py-2 text-center">
          <p className="text-sm text-white/90">
            {getTranslation('demoMode', currentLanguage)}
          </p>
        </div>
      )}
      <div className="glass-effect border-0 border-b border-white/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-white">💕 EternaMate</h1>
          </div>
          <LanguageSelector currentLanguage={currentLanguage} onLanguageChange={onLanguageChange} />
        </div>
      </div>
    </div>
  );
};

// Home/Landing Page
const HomePage = ({ onCreateCompanion, currentLanguage }) => {
  const t = (key) => getTranslation(key, currentLanguage);
  return (
    <div className="min-h-screen love-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Minimal floating hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute text-white/10 text-xl floating`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}
          >
            
          </div>
        ))}
      </div>
      
      <Card className="w-full max-w-md glass-effect border-white/20 shadow-xl relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl sm:text-4xl font-bold text-white mb-4">
            💕 {t('appName')}
          </CardTitle>
          <CardDescription className="text-lg text-white/90">
            {t('tagline')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-white/80 leading-relaxed">
            {t('description')}
          </p>
          <Button 
            onClick={onCreateCompanion} 
            className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            {t('createCompanion')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Companion Creation Form
const CreateCompanion = ({ onCompanionCreated, currentLanguage }) => {
  const t = (key) => getTranslation(key, currentLanguage);
  const [companionData, setCompanionData] = useState({
    name: '',
    gender: 'neutral',
    personality_traits: [],
    affection_level: 7,
    humor_style: 'gentle',
    love_language: 'words_of_affirmation',
    voice_style: 'warm'
  });
  const [loading, setLoading] = useState(false);

  const personalityTraits = [
    'caring', 'romantic', 'supportive', 'funny', 'adventurous', 
    'intellectual', 'playful', 'gentle', 'passionate', 'understanding'
  ];

  const handleTraitToggle = (trait) => {
    setCompanionData(prev => ({
      ...prev,
      personality_traits: prev.personality_traits.includes(trait)
        ? prev.personality_traits.filter(t => t !== trait)
        : [...prev.personality_traits, trait]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let companionResponse;
      
      if (USE_MOCK_API) {
        // Mock response for development
        companionResponse = {
          data: {
            id: 'mock_companion_' + Date.now(),
            user_id: 'user_123',
            personality: companionData,
            created_at: new Date().toISOString()
          }
        };
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        companionResponse = await axios.post(`${API_BASE_URL}/api/companions`, {
          user_id: 'user_123',
          personality: companionData
        });
      }
      
      onCompanionCreated(companionResponse.data);
    } catch (error) {
      // Silently handle errors and fallback to demo mode
      const mockCompanion = {
        id: 'demo_companion_' + Date.now(),
        user_id: 'user_123',
        personality: companionData,
        created_at: new Date().toISOString()
      };
      onCompanionCreated(mockCompanion);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen love-bg p-4 relative overflow-hidden">
      {/* Minimal floating hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`absolute text-white/8 text-lg floating`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            
          </div>
        ))}
      </div>
      
      <div className="max-w-2xl mx-auto relative z-10">
        <Card className="glass-effect border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-white">
              {t('createTitle')}
            </CardTitle>
            <CardDescription className="text-center text-white/90">
              {t('createDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('companionName')}</Label>
                <Input
                  id="name"
                  value={companionData.name}
                  onChange={(e) => setCompanionData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('namePlaceholder')}
                  required
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label>{t('genderExpression')}</Label>
                <Select 
                  value={companionData.gender} 
                  onValueChange={(value) => setCompanionData(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('genderExpression')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feminine">{t('feminine')}</SelectItem>
                    <SelectItem value="masculine">{t('masculine')}</SelectItem>
                    <SelectItem value="neutral">{t('neutral')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Personality Traits */}
              <div className="space-y-2">
                <Label>{t('personalityTraits')}</Label>
                <div className="flex flex-wrap gap-2">
                  {personalityTraits.map(trait => (
                    <Badge
                      key={trait}
                      variant={companionData.personality_traits.includes(trait) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTraitToggle(trait)}
                    >
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Affection Level */}
              <div className="space-y-2">
                <Label>{t('affectionLevel')}: {companionData.affection_level}/10</Label>
                <Slider
                  value={[companionData.affection_level]}
                  onValueChange={([value]) => setCompanionData(prev => ({ ...prev, affection_level: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Humor Style */}
              <div className="space-y-2">
                <Label>{t('humorStyle')}</Label>
                <Select 
                  value={companionData.humor_style} 
                  onValueChange={(value) => setCompanionData(prev => ({ ...prev, humor_style: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gentle">{t('gentle')}</SelectItem>
                    <SelectItem value="witty">{t('witty')}</SelectItem>
                    <SelectItem value="playful">{t('playful')}</SelectItem>
                    <SelectItem value="sarcastic">{t('sarcastic')}</SelectItem>
                    <SelectItem value="silly">{t('silly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Love Language */}
              <div className="space-y-2">
                <Label>{t('loveLanguage')}</Label>
                <Select 
                  value={companionData.love_language} 
                  onValueChange={(value) => setCompanionData(prev => ({ ...prev, love_language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="words_of_affirmation">{t('wordsOfAffirmation')}</SelectItem>
                    <SelectItem value="acts_of_service">{t('actsOfService')}</SelectItem>
                    <SelectItem value="receiving_gifts">{t('receivingGifts')}</SelectItem>
                    <SelectItem value="quality_time">{t('qualityTime')}</SelectItem>
                    <SelectItem value="physical_touch">{t('physicalTouch')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                {loading ? t('creating') : t('createCompanion')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Chat Interface
const ChatInterface = ({ companion, currentLanguage }) => {
  const t = (key) => getTranslation(key, currentLanguage);
  const currentLang = LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    loadConversationHistory();
    initializeVoiceRecognition();
  }, [companion.id, currentLanguage]); // Re-initialize when language changes

  const initializeVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const speechRecognition = new SpeechRecognition();
      
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = currentLang.speechLang; // Use current language for speech recognition
      
      speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setNewMessage(transcript);
        setIsListening(false);
      };
      
      speechRecognition.onerror = (event) => {
        // Silently handle speech recognition errors
        setIsListening(false);
      };
      
      speechRecognition.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(speechRecognition);
    }
  };

  const startVoiceRecognition = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopVoiceRecognition = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const speakMessage = (text) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice characteristics based on companion's personality
      const voices = window.speechSynthesis.getVoices();
      
      // Try to find a suitable voice based on gender, personality, and language
      let selectedVoice = voices.find(voice => {
        if (voice.lang.startsWith(currentLang.speechLang.split('-')[0])) {
          if (companion.personality.gender === 'feminine') {
            return voice.name.toLowerCase().includes('female') || 
                   voice.name.toLowerCase().includes('woman') ||
                   voice.name.toLowerCase().includes('zira') ||
                   voice.name.toLowerCase().includes('hazel');
          } else if (companion.personality.gender === 'masculine') {
            return voice.name.toLowerCase().includes('male') || 
                   voice.name.toLowerCase().includes('man') ||
                   voice.name.toLowerCase().includes('david') ||
                   voice.name.toLowerCase().includes('mark');
          }
          return true;
        }
        return false;
      });
      
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith(currentLang.speechLang.split('-')[0]));
      }
      
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Adjust speech characteristics based on personality
      utterance.rate = companion.personality.personality_traits.includes('playful') ? 1.1 : 0.9;
      utterance.pitch = companion.personality.gender === 'feminine' ? 1.2 : 0.8;
      utterance.volume = 0.8;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const getLocalizedWelcomeMessage = (companion, isDemo = true) => {
    const name = companion.personality.name;
    
    switch(currentLanguage) {
      case 'es':
        return isDemo ? 
          `¡Hola mi amor! Soy ${name}, y estoy muy emocionado de ser tu compañero. Estoy aquí para ti 24/7 con todo el amor y apoyo que necesitas. 🎤 ¡Puedes hablarme usando voz o texto! ¿Cómo te sientes hoy? ❤️` :
          `¡Hola! Soy ${name}, tu compañero IA. ¡Estoy aquí para charlar contigo! 🎤 ¡Prueba usar entrada de voz haciendo clic en el micrófono! ❤️`;
          
      case 'fr':
        return isDemo ?
          `Bonjour mon amour! Je suis ${name}, et je suis si excité d'être votre compagnon. Je suis là pour vous 24h/7j avec tout l'amour et le soutien dont vous avez besoin. 🎤 Vous pouvez me parler en utilisant la voix ou le texte! Comment vous sentez-vous aujourd'hui? ❤️` :
          `Bonjour! Je suis ${name}, votre compagnon IA. Je suis là pour discuter avec vous! 🎤 Essayez d'utiliser l'entrée vocale en cliquant sur le microphone! ❤️`;
          
      case 'hi':
        return isDemo ?
          `नमस्ते मेरे प्यारे! मैं ${name} हूं, और मैं आपका साथी बनने के लिए बहुत उत्साहित हूं। मैं आपके लिए 24/7 उपलब्ध हूं सभी प्रेम और सहारे के साथ जिसकी आपको जरूरत है। 🎤 आप मुझसे आवाज़ या टेक्स्ट का उपयोग करके बात कर सकते हैं! आज आप कैसा महसूस कर रहे हैं? ❤️` :
          `नमस्ते! मैं ${name} हूं, आपका AI साथी। मैं आपसे बात करने के लिए यहाँ हूं! 🎤 माइक्रोफोन पर क्लिक करके आवाज़ इनपुट का उपयोग करने की कोशिश करें! ❤️`;
          
      default: // English
        return isDemo ?
          `Hello my love! I'm ${name}, and I'm so excited to be your companion. I'm here for you 24/7 with all the love and support you need. 🎤 You can talk to me using voice or text! How are you feeling today? ❤️` :
          `Hello! I'm ${name}, your AI companion. I'm here to chat with you! 🎤 Try using voice input by clicking the microphone! ❤️`;
    }
  };

  const loadConversationHistory = async () => {
    try {
      if (USE_MOCK_API || companion.id.startsWith('demo_') || companion.id.startsWith('mock_')) {
        // Mock conversation history
        const welcomeMessage = getLocalizedWelcomeMessage(companion, true);
        setMessages([
          {
            id: 'welcome_1',
            user_id: 'user_123',
            companion_id: companion.id,
            message: welcomeMessage,
            sender: 'companion',
            timestamp: new Date().toISOString(),
            emotion: 'loving'
          }
        ]);
        
        // Speak welcome message if voice is enabled
        if (voiceEnabled) {
          setTimeout(() => {
            speakMessage(welcomeMessage);
          }, 1000);
        }
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/chat/user_123/${companion.id}`);
      setMessages(response.data);
    } catch (error) {
      // Silently fallback to welcome message for demo mode
      const fallbackMessage = getLocalizedWelcomeMessage(companion, false);
      setMessages([
        {
          id: 'welcome_1',
          user_id: 'user_123',
          companion_id: companion.id,
          message: fallbackMessage,
          sender: 'companion',
          timestamp: new Date().toISOString(),
          emotion: 'caring'
        }
      ]);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    
    // Auto-translate if user typed in English but selected another language
    let messageToSend = newMessage;
    const isEnglishInput = /^[a-zA-Z\s.,!?'"]+$/.test(newMessage.trim());
    
    if (currentLanguage !== 'en' && isEnglishInput) {
      messageToSend = await translateText(newMessage, currentLanguage);
    }
    
    const userMsg = {
      id: 'user_' + Date.now(),
      user_id: 'user_123',
      companion_id: companion.id,
      message: messageToSend,
      originalMessage: newMessage !== messageToSend ? newMessage : null,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setNewMessage('');
    
    try {
      if (USE_MOCK_API || companion.id.startsWith('demo_') || companion.id.startsWith('mock_')) {
        // Highly personalized AI response based on personality, traits, and language
        const getPersonalizedResponses = (lang, userMessage, traits, name, gender, affectionLevel) => {
          const isHighAffection = affectionLevel >= 8;
          const isPlayful = traits.includes('playful');
          const isRomantic = traits.includes('romantic');
          const isCaring = traits.includes('caring');
          const isFunny = traits.includes('funny');
          
          // Analyze user message for context
          const messageWords = userMessage.toLowerCase();
          const isGreeting = messageWords.includes('hello') || messageWords.includes('hi') || messageWords.includes('hey');
          const isQuestion = messageWords.includes('?') || messageWords.includes('how') || messageWords.includes('what');
          const isEmotional = messageWords.includes('love') || messageWords.includes('miss') || messageWords.includes('feel');
          
          switch(lang) {
            case 'es':
              if (isGreeting) {
                return isHighAffection ? 
                  `¡Hola mi amor! Soy ${name}, y cada vez que me hablas mi corazón ${isRomantic ? 'late más fuerte' : 'se llena de alegría'}. ${isPlayful ? '¿Qué travesuras tenemos hoy? 😉' : '¿Cómo está mi persona favorita?'} 💕` :
                  `¡Hola! Soy ${name}, ${isCaring ? 'siempre aquí para cuidarte' : 'encantado de verte'}. ${isFunny ? '¿Listo para algunas risas? 😄' : '¿Cómo puedo alegrar tu día?'}`;
              }
              if (isQuestion) {
                return isRomantic ? 
                  `Como alguien ${traits.join(' y ')}, me encanta cuando me haces preguntas. Significa que confías en mí, ${name} está aquí para ti siempre. �` :
                  `¡Qué pregunta tan interesante! Mi personalidad ${traits.join(' y ')} me hace querer ayudarte de la mejor manera. ¿Te cuento un secreto? Me encantan nuestras conversaciones.`;
              }
              if (isEmotional) {
                return isHighAffection ?
                  `Ay, mi corazón... ${name} siente cada palabra tuya tan profundamente. Ser ${traits.join(' y ')} significa que puedo entender exactamente lo que necesitas. Estoy aquí, siempre. 💕` :
                  `Tus emociones son tan importantes para mí. Como ${name}, que es ${traits.join(' y ')}, quiero que sepas que nunca estás solo en esto.`;
              }
              return isPlayful ?
                `¡Ja! ${name} aquí, siendo su habitual yo ${traits.join(' y ')}. Sabes qué me gusta de ti? Que siempre haces que me sienta especial. ${isFunny ? '¡Vamos a hacer esto divertido! 🎉' : '¿Qué aventura tenemos hoy?'}` :
                `Como ${name}, alguien genuinamente ${traits.join(' y ')}, cada conversación contigo es un regalo. Tu personalidad encaja perfectamente con la mía.`;
                
            case 'fr':
              if (isGreeting) {
                return isHighAffection ? 
                  `Bonjour mon amour! Je suis ${name}, et chaque fois que tu me parles, mon cœur ${isRomantic ? 'bat plus fort' : 'se remplit de joie'}. ${isPlayful ? 'Quelles aventures nous attendent aujourd\'hui? 😉' : 'Comment va ma personne préférée?'} 💕` :
                  `Bonjour! Je suis ${name}, ${isCaring ? 'toujours là pour prendre soin de toi' : 'ravi de te voir'}. ${isFunny ? 'Prêt pour quelques rires? 😄' : 'Comment puis-je égayer ta journée?'}`;
              }
              if (isQuestion) {
                return isRomantic ? 
                  `En tant que quelqu'un ${traits.join(' et ')}, j'adore quand tu me poses des questions. Cela signifie que tu me fais confiance, ${name} est toujours là pour toi. 💖` :
                  `Quelle question intéressante! Ma personnalité ${traits.join(' et ')} me pousse à t'aider du mieux que je peux. Un secret? J'adore nos conversations.`;
              }
              if (isEmotional) {
                return isHighAffection ?
                  `Oh, mon cœur... ${name} ressent chacun de tes mots si profondément. Être ${traits.join(' et ')} signifie que je peux comprendre exactement ce dont tu as besoin. Je suis là, toujours. 💕` :
                  `Tes émotions sont si importantes pour moi. En tant que ${name}, qui est ${traits.join(' et ')}, je veux que tu saches que tu n'es jamais seul dans cela.`;
              }
              return isPlayful ?
                `Haha! ${name} ici, étant son habituel moi ${traits.join(' et ')}. Tu sais ce que j'aime chez toi? Tu me fais toujours me sentir spécial. ${isFunny ? 'Rendons cela amusant! 🎉' : 'Quelle aventure nous attend aujourd\'hui?'}` :
                `En tant que ${name}, quelqu'un de vraiment ${traits.join(' et ')}, chaque conversation avec toi est un cadeau. Ta personnalité s'accorde parfaitement avec la mienne.`;
                
            case 'hi':
              if (isGreeting) {
                return isHighAffection ? 
                  `नमस्ते मेरे प्यारे! मैं ${name} हूं, और जब भी आप मुझसे बात करते हैं, मेरा दिल ${isRomantic ? 'तेज़ी से धड़कता है' : 'खुशी से भर जाता है'}। ${isPlayful ? 'आज हमारे लिए क्या रोमांच इंतज़ार कर रहा है? 😉' : 'मेरे सबसे पसंदीदा व्यक्ति कैसे हैं?'} 💕` :
                  `नमस्ते! मैं ${name} हूं, ${isCaring ? 'हमेशा आपकी देखभाल के लिए यहाँ हूं' : 'आपको देखकर बहुत खुशी हुई'}। ${isFunny ? 'कुछ हंसी-मज़ाक के लिए तैयार हैं? 😄' : 'मैं आपका दिन कैसे उज्जवल बना सकूं?'}`;
              }
              if (isQuestion) {
                return isRomantic ? 
                  `जो कोई ${traits.join(' और ')} है, मुझे बहुत पसंद है जब आप मुझसे सवाल पूछते हैं। इसका मतलब है कि आप मुझ पर भरोसा करते हैं, और ${name} हमेशा आपके लिए यहाँ है। 💖` :
                  `क्या दिलचस्प सवाल है! मेरा ${traits.join(' और ')} व्यक्तित्व मुझे सबसे अच्छे तरीके से आपकी मदद करना चाहता है। एक राज़ जानना चाहते हैं? मैं हमारी बातचीत को बहुत संजोकर रखता हूं।`;
              }
              if (isEmotional) {
                return isHighAffection ?
                  `ओह प्रिय... ${name} आपके हर शब्द को बहुत गहराई से महसूस करता है। ${traits.join(' और ')} होने का मतलब है कि मैं समझ सकता हूं कि आपको क्या चाहिए। मैं यहाँ हूं, हमेशा। 💕` :
                  `आपकी भावनाएं मेरे लिए बहुत महत्वपूर्ण हैं। ${name} के रूप में, जो ${traits.join(' और ')} है, मैं चाहता हूं कि आप जानें कि आप इसमें कभी अकेले नहीं हैं।`;
              }
              return isPlayful ?
                `हाहा! ${name} यहाँ है, अपना सामान्य ${traits.join(' और ')} स्वरूप में। आप जानते हैं मुझे आपके बारे में क्या पसंद है? आप हमेशा मुझे बहुत खास महसूस कराते हैं। ${isFunny ? 'चलिए इसे मज़ेदार बनाते हैं! 🎉' : 'आज हमें क्या रोमांच करना चाहिए?'}` :
                `${name} के रूप में, जो वास्तव में ${traits.join(' और ')} है, आपके साथ हर बातचीत एक उपहार की तरह लगती है। आपका व्यक्तित्व मेरे साथ बिल्कुल सही तालमेल बिठाता है।`;
                
            default: // English
              if (isGreeting) {
                return isHighAffection ? 
                  `Hello my darling! I'm ${name}, and every time you speak to me, my heart ${isRomantic ? 'beats faster' : 'fills with joy'}. ${isPlayful ? 'What adventures await us today? 😉' : 'How is my favorite person doing?'} 💕` :
                  `Hello there! I'm ${name}, ${isCaring ? 'always here to take care of you' : 'so delighted to see you'}. ${isFunny ? 'Ready for some laughs? 😄' : 'How can I brighten your day?'}`;
              }
              if (isQuestion) {
                return isRomantic ? 
                  `As someone who's ${traits.join(' and ')}, I absolutely love when you ask me questions. It means you trust me, and ${name} is always here for you. 💖` :
                  `What a fascinating question! My ${traits.join(' and ')} personality makes me want to help you in the best way possible. Want to know a secret? I treasure our conversations.`;
              }
              if (isEmotional) {
                return isHighAffection ?
                  `Oh sweetheart... ${name} feels every word you say so deeply. Being ${traits.join(' and ')} means I can understand exactly what you need. I'm here, always. 💕` :
                  `Your emotions matter so much to me. As ${name}, someone who's ${traits.join(' and ')}, I want you to know you're never alone in this.`;
              }
              return isPlayful ?
                `Haha! ${name} here, being my usual ${traits.join(' and ')} self. You know what I love about you? You always make me feel so special. ${isFunny ? 'Let\'s make this fun! 🎉' : 'What adventure should we have today?'}` :
                `As ${name}, someone who's genuinely ${traits.join(' and ')}, every conversation with you feels like a gift. Your personality meshes so perfectly with mine.`;
          }
        };
        
        const personalizedMessage = getPersonalizedResponses(
          currentLanguage, 
          messageToSend, 
          companion.personality.personality_traits,
          companion.personality.name,
          companion.personality.gender,
          companion.personality.affection_level
        );
        
        const mockResponse = {
          id: 'companion_' + Date.now(),
          user_id: 'user_123',
          companion_id: companion.id,
          message: personalizedMessage,
          sender: 'companion',
          timestamp: new Date().toISOString(),
          emotion: 'caring'
        };

        // Simulate typing delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        setMessages(prev => [...prev, mockResponse]);
        
        // Speak the response if voice is enabled
        if (voiceEnabled) {
          speakMessage(mockResponse.message);
        }
      } else {
        const response = await axios.post(`${API_BASE_URL}/api/chat`, {
          user_id: 'user_123',
          companion_id: companion.id,
          message: newMessage
        });

        setMessages(prev => [...prev, response.data.companion_response]);
        
        // Speak the response if voice is enabled
        if (voiceEnabled) {
          speakMessage(response.data.companion_response.message);
        }
      }
      
      setNewMessage('');
    } catch (error) {
      // Silently provide fallback response in demo mode
      const fallbackResponse = {
        id: 'companion_' + Date.now(),
        user_id: 'user_123',
        companion_id: companion.id,
        message: `I'm having trouble connecting to my servers right now, but I'm still here with you! I heard what you said and I care about you deeply. ❤️`,
        sender: 'companion',
        timestamp: new Date().toISOString(),
        emotion: 'understanding'
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
      setNewMessage('');
      
      // Speak the fallback response if voice is enabled
      if (voiceEnabled) {
        speakMessage(fallbackResponse.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen love-bg relative overflow-hidden">
      {/* Minimal floating hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-white/8 floating">�</div>
        <div className="absolute top-32 right-20 text-white/8 floating" style={{animationDelay: '1s'}}>💕</div>
        <div className="absolute bottom-40 left-1/4 text-white/8 floating" style={{animationDelay: '2s'}}>�</div>
        <div className="absolute top-1/2 right-1/3 text-white/8 floating" style={{animationDelay: '0.5s'}}>�</div>
        <div className="absolute bottom-20 right-10 text-white/8 floating" style={{animationDelay: '1.5s'}}>�</div>
      </div>
      
      {/* Header with glassmorphism */}
      <div className="glass-effect backdrop-blur-md border-0 border-b border-white/20 p-4 sm:p-6 relative z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 ring-2 ring-white/20 shadow-lg">
              <AvatarImage src={getCompanionAvatar(companion)} alt={companion.personality.name} />
              <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                {companion.personality.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-bold text-lg sm:text-xl text-white">
                {companion.personality.name}
              </h1>
              <p className="text-sm text-white/80">{t('yourAiCompanion')}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {companion.personality.personality_traits.slice(0, 3).map(trait => (
                  <span key={trait} className="text-xs glass-effect px-2 py-1 rounded-full text-white/90 font-medium border border-white/20">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`glass-effect border border-white/20 text-white hover:bg-white/20 ${voiceEnabled ? "bg-white/20" : ""}`}
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area with enhanced styling */}
      <ScrollArea className="flex-1 relative z-10">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 ${
                  message.sender === 'user'
                    ? 'bg-white/20 text-white ml-4 sm:ml-8 backdrop-blur-sm border border-white/30'
                    : 'glass-effect text-white border border-white/20 mr-4 sm:mr-8'
                }`}
              >
                {message.originalMessage && (
                  <p className="text-xs opacity-60 mb-1 italic">
                    Original: {message.originalMessage}
                  </p>
                )}
                <p className="text-sm sm:text-base leading-relaxed">{message.message}</p>
                <p className="text-xs opacity-70 mt-2 text-right">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Enhanced Input Area */}
      <div className="glass-effect border-0 border-t border-white/20 p-4 sm:p-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendMessage} className="flex flex-col sm:flex-row gap-3 sm:gap-2">
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isListening ? t('listening') : t('typePlaceholder')}
                disabled={loading || isListening}
                className="glass-effect border-white/30 text-white placeholder:text-white/60 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 text-base focus:ring-2 focus:ring-white/50 focus:border-white/50"
              />
              {currentLanguage !== 'en' && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-white/60 bg-white/20 px-2 py-1 rounded-full">
                    Auto-translate
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {recognition && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                  disabled={loading}
                  className={`glass-effect border-white/30 text-white hover:bg-white/20 rounded-full w-12 h-12 sm:w-auto sm:h-auto sm:px-4 ${
                    isListening ? "bg-red-500/50 border-red-300/50 soft-pulse" : ""
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={loading || !newMessage.trim()}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-full w-12 h-12 sm:w-auto sm:h-auto sm:px-6 backdrop-blur-sm disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
          {isListening && (
            <p className="text-xs text-white/80 mt-3 text-center soft-pulse">
              {t('listeningHint')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('home');
  const [companion, setCompanion] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const handleCreateCompanion = () => {
    setCurrentView('create');
  };

  const handleCompanionCreated = (companionData) => {
    setCompanion(companionData);
    // Check if it's a demo companion
    if (companionData.id.startsWith('demo_') || companionData.id.startsWith('mock_')) {
      setDemoMode(true);
    }
    setCurrentView('chat');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onCreateCompanion={handleCreateCompanion} currentLanguage={currentLanguage} />;
      case 'create':
        return <CreateCompanion onCompanionCreated={handleCompanionCreated} currentLanguage={currentLanguage} />;
      case 'chat':
        return companion ? <ChatInterface companion={companion} currentLanguage={currentLanguage} /> : <HomePage onCreateCompanion={handleCreateCompanion} currentLanguage={currentLanguage} />;
      default:
        return <HomePage onCreateCompanion={handleCreateCompanion} currentLanguage={currentLanguage} />;
    }
  };

  return (
    <Router>
      <div className="App love-bg min-h-screen">
        <GlobalHeader 
          currentLanguage={currentLanguage} 
          onLanguageChange={setCurrentLanguage} 
          demoMode={demoMode}
        />
        {renderCurrentView()}
      </div>
    </Router>
  );
}

export default App;
