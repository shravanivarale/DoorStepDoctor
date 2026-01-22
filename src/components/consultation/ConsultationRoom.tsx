import React, { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, Send, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderRole: 'patient' | 'doctor';
  content: string;
  timestamp: Date;
}

interface Props {
  user: any;
}

const ConsultationRoom: React.FC<Props> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [consultationTimer, setConsultationTimer] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate consultation connection
  useEffect(() => {
    if (user) {
      // Simulate initial messages
      const initialMessages: Message[] = [
        {
          id: '1',
          senderId: 'doctor-1',
          senderRole: 'doctor',
          content: 'Hello! I\'m Dr. Sharma. How can I help you today?',
          timestamp: new Date(Date.now() - 60000)
        },
        {
          id: '2',
          senderId: user.id || 'patient-1',
          senderRole: 'patient',
          content: 'Hi Doctor, I\'ve been having headaches for the past few days.',
          timestamp: new Date(Date.now() - 30000)
        }
      ];
      setMessages(initialMessages);
    }
  }, [user]);

  // Timer for consultation duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setConsultationTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && user) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: user.id || 'patient-1',
        senderRole: user.role || 'patient',
        content: newMessage,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate doctor response
      setTimeout(() => {
        const doctorResponse: Message = {
          id: (Date.now() + 1).toString(),
          senderId: 'doctor-1',
          senderRole: 'doctor',
          content: 'I understand. Can you tell me more about the intensity and frequency of these headaches?',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, doctorResponse]);
      }, 2000);
    }
  };

  const toggleVideo = async () => {
    try {
      if (!isVideoEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: isAudioEnabled 
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } else {
        const stream = localVideoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(track => {
          if (track.kind === 'video') {
            track.stop();
          }
        });
      }
      setIsVideoEnabled(!isVideoEnabled);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const toggleAudio = async () => {
    try {
      if (!isAudioEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: isVideoEnabled, 
          audio: true 
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } else {
        const stream = localVideoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(track => {
          if (track.kind === 'audio') {
            track.stop();
          }
        });
      }
      setIsAudioEnabled(!isAudioEnabled);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const startConsultation = () => {
    setIsConnected(true);
    setConsultationTimer(0);
  };

  const endConsultation = () => {
    setIsConnected(false);
    // Stop all media tracks
    const stream = localVideoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="card text-center">
        <h2 className="text-xl font-bold mb-4">Please log in to access consultation</h2>
        <p>You need to be logged in to start a consultation with a doctor.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Consultation Room</h1>
          <div className="flex items-center gap-4">
            {isConnected && (
              <div className="bg-green-50 px-3 py-1 rounded">
                <span className="text-green-600 font-medium">
                  ⏱️ {formatTime(consultationTimer)}
                </span>
              </div>
            )}
            <div className={`px-3 py-1 rounded ${isConnected ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Call Section */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Video Consultation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Local Video */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  You ({user.role || 'Patient'})
                </div>
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <VideoOff className="text-white" size={48} />
                  </div>
                )}
              </div>

              {/* Remote Video */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  Dr. Sharma
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                  <div className="text-center text-white">
                    <Video className="mx-auto mb-2" size={48} />
                    <p>Waiting for doctor...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Controls */}
            <div className="flex justify-center gap-4">
              <button
                onClick={toggleVideo}
                className={`button ${isVideoEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
              
              <button
                onClick={toggleAudio}
                className={`button ${isAudioEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              
              {!isConnected ? (
                <button onClick={startConsultation} className="button bg-green-600">
                  <Phone size={20} />
                  Start Call
                </button>
              ) : (
                <button onClick={endConsultation} className="button bg-red-600">
                  <Phone size={20} />
                  End Call
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">Chat</h2>
          </div>
          
          {/* Messages */}
          <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${
                  message.senderRole === (user.role || 'patient') ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderRole === (user.role || 'patient')
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="text-left mb-4">
                <div className="inline-block bg-gray-200 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-600">Doctor is typing...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="input flex-1"
            />
            <button onClick={handleSendMessage} className="button">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Consultation Info */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Consultation Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-bold text-blue-600">Doctor</h3>
            <p>Dr. Rajesh Sharma</p>
            <p className="text-sm text-gray-600">General Medicine</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-bold text-green-600">Appointment</h3>
            <p>{new Date().toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">{new Date().toLocaleTimeString()}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded">
            <h3 className="font-bold text-purple-600">Status</h3>
            <p>{isConnected ? 'In Progress' : 'Waiting'}</p>
            <p className="text-sm text-gray-600">
              Duration: {formatTime(consultationTimer)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRoom;