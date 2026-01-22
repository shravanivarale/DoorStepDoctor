import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, AlertTriangle, Phone } from 'lucide-react';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'emergency';
}

interface Props {
  user: any;
  lowBandwidthMode: boolean;
}

const VoiceInterface: React.FC<Props> = ({ user, lowBandwidthMode }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en-IN', name: 'English (India)', flag: '🇮🇳' },
    { code: 'hi-IN', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'mr-IN', name: 'मराठी (Marathi)', flag: '🇮🇳' },
    { code: 'ta-IN', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'te-IN', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    { code: 'bn-IN', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
  ];

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: AIMessage = {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI medical assistant. I can help with basic health questions and guidance. Please note that I cannot provide diagnoses - for serious concerns, please consult a doctor.',
      timestamp: new Date(),
      urgencyLevel: 'low'
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    // Simulate speech-to-text processing
    setTimeout(() => {
      const simulatedTranscription = "I have been having headaches for the past few days. Should I be worried?";
      
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: simulatedTranscription,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Simulate AI processing and response
      setTimeout(() => {
        generateAIResponse(simulatedTranscription);
      }, 1000);
    }, 2000);
  };

  const generateAIResponse = (userInput: string) => {
    // Simulate AI response based on input
    let response = '';
    let urgencyLevel: 'low' | 'medium' | 'high' | 'emergency' = 'low';
    
    if (userInput.toLowerCase().includes('headache')) {
      response = 'Headaches can have various causes. If they persist for more than a few days or are severe, I recommend consulting a doctor. In the meantime, ensure you\'re staying hydrated, getting enough rest, and managing stress. If you experience sudden severe headaches, vision changes, or fever, please seek immediate medical attention.';
      urgencyLevel = 'medium';
    } else if (userInput.toLowerCase().includes('chest pain')) {
      response = 'Chest pain can be serious. Please seek immediate medical attention or call emergency services. Do not delay - this could be a medical emergency.';
      urgencyLevel = 'emergency';
    } else {
      response = 'I understand your concern. For any persistent or concerning symptoms, I recommend consulting with a qualified doctor who can properly examine you and provide appropriate medical advice. Is there anything specific about your symptoms you\'d like to discuss?';
      urgencyLevel = 'low';
    }

    const aiMessage: AIMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      urgencyLevel
    };

    setMessages(prev => [...prev, aiMessage]);
    
    // Simulate text-to-speech
    if (!lowBandwidthMode) {
      playAudioResponse(response);
    }
    
    setIsProcessing(false);
  };

  const playAudioResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage;
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: textInput,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      generateAIResponse(textInput);
      setTextInput('');
    }
  };

  const getUrgencyColor = (level?: string) => {
    switch (level) {
      case 'emergency': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getUrgencyIcon = (level?: string) => {
    switch (level) {
      case 'emergency': return <AlertTriangle className="text-red-600" size={16} />;
      case 'high': return <AlertTriangle className="text-orange-600" size={16} />;
      case 'medium': return <AlertTriangle className="text-yellow-600" size={16} />;
      default: return null;
    }
  };

  if (!user) {
    return (
      <div className="card text-center">
        <h2 className="text-xl font-bold mb-4">Please log in to access AI Assistant</h2>
        <p>You need to be logged in to use the AI medical assistant.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">AI Medical Assistant</h1>
          <div className="flex items-center gap-4">
            {lowBandwidthMode && (
              <div className="bg-blue-50 px-3 py-1 rounded">
                <span className="text-blue-600 text-sm">📱 Text Mode</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Language Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Language:</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="input max-w-xs"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Safety Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="text-yellow-600 mt-1" size={20} />
            <div>
              <h3 className="font-bold text-yellow-800">Important Medical Disclaimer</h3>
              <p className="text-yellow-700 text-sm">
                This AI assistant provides general health information only and cannot diagnose medical conditions. 
                Always consult qualified healthcare professionals for medical advice, diagnosis, or treatment.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voice Interface */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Voice Interaction</h2>
            
            {!lowBandwidthMode ? (
              <div className="text-center mb-6">
                <div className="mb-4">
                  <div 
                    className={`inline-flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ${
                      isRecording 
                        ? 'bg-red-500 animate-pulse' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isProcessing}
                      className="text-white"
                    >
                      {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
                    </button>
                  </div>
                </div>
                
                <p className="text-lg font-medium mb-2">
                  {isRecording ? 'Listening...' : isProcessing ? 'Processing...' : 'Tap to speak'}
                </p>
                
                <div className="flex justify-center gap-4">
                  <button
                    onClick={isPlaying ? stopAudio : undefined}
                    disabled={!isPlaying}
                    className={`button ${isPlaying ? 'bg-red-600' : 'bg-gray-400'}`}
                  >
                    {isPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    {isPlaying ? 'Stop Audio' : 'Audio Ready'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-blue-600 text-center">
                  📱 Voice features disabled in low-bandwidth mode. Use text chat below.
                </p>
              </div>
            )}

            {/* Text Input Alternative */}
            <div className="border-t pt-4">
              <h3 className="font-bold mb-2">Or type your question:</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                  placeholder="Type your health question here..."
                  className="input flex-1"
                />
                <button onClick={handleTextSubmit} className="button">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">Conversation</h2>
          </div>
          
          <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block max-w-full px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border'
                  }`}
                >
                  {message.role === 'assistant' && message.urgencyLevel && (
                    <div className={`flex items-center gap-1 mb-2 px-2 py-1 rounded text-xs ${getUrgencyColor(message.urgencyLevel)}`}>
                      {getUrgencyIcon(message.urgencyLevel)}
                      <span className="font-medium">
                        {message.urgencyLevel.charAt(0).toUpperCase() + message.urgencyLevel.slice(1)} Priority
                      </span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="text-left mb-4">
                <div className="inline-block bg-gray-200 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-600">AI is thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setTextInput("I need to speak with a doctor")}
            className="button bg-green-600 flex items-center gap-2"
          >
            <Phone size={20} />
            Connect to Doctor
          </button>
          
          <button 
            onClick={() => setTextInput("What are the symptoms of fever?")}
            className="button secondary"
          >
            Common Symptoms
          </button>
          
          <button 
            onClick={() => setTextInput("First aid for minor cuts")}
            className="button secondary"
          >
            First Aid Tips
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;