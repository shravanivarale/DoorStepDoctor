import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Heart, Users, MessageCircle, Pill, Brain, Shield } from 'lucide-react';

// Import components
import ThreeJSHealthDashboard from './components/dashboard/ThreeJSHealthDashboard';
import ConsultationRoom from './components/consultation/ConsultationRoom';
import VoiceInterface from './components/ai-assistant/VoiceInterface';
import PharmacyFinder from './components/pharmacy/PharmacyFinder';
import LoginForm from './components/auth/LoginForm';
import LowBandwidthDetector from './components/low-bandwidth/LowBandwidthDetector';
import TriageForm from './components/asha/TriageForm';
import CaseHistory from './components/asha/CaseHistory';
import EmergencyQueue from './components/phc/EmergencyQueue';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);

  return (
    <Router>
      <div className="App">
        <LowBandwidthDetector onModeChange={setLowBandwidthMode} />
        
        {/* Navigation */}
        <nav className="navbar">
          <div className="navbar-content">
            <div className="logo">
              <Heart className="inline mr-2" size={24} />
              DoorStepDoctor
            </div>
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              {user && user.role === 'asha' && (
                <>
                  <li><Link to="/triage">Triage</Link></li>
                  <li><Link to="/history">History</Link></li>
                </>
              )}
              {user && user.role === 'phc' && (
                <li><Link to="/emergency-queue">Emergency Queue</Link></li>
              )}
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/consultation">Consultation</Link></li>
              <li><Link to="/ai-assistant">AI Assistant</Link></li>
              <li><Link to="/pharmacy">Pharmacy</Link></li>
              {user ? (
                <li>
                  <button onClick={logout} className="button secondary">
                    Logout ({user.name})
                  </button>
                </li>
              ) : (
                <li><Link to="/login">Login</Link></li>
              )}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage lowBandwidthMode={lowBandwidthMode} />} />
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" /> : <LoginForm />} 
            />
            <Route 
              path="/triage" 
              element={
                user && user.role === 'asha' ? (
                  <TriageForm />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/history" 
              element={
                user && user.role === 'asha' ? (
                  <CaseHistory />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/emergency-queue" 
              element={
                user && user.role === 'phc' ? (
                  <EmergencyQueue />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ThreeJSHealthDashboard 
                  user={user} 
                  lowBandwidthMode={lowBandwidthMode} 
                />
              } 
            />
            <Route 
              path="/consultation" 
              element={<ConsultationRoom user={user} />} 
            />
            <Route 
              path="/ai-assistant" 
              element={
                <VoiceInterface 
                  user={user} 
                  lowBandwidthMode={lowBandwidthMode} 
                />
              } 
            />
            <Route path="/pharmacy" element={<PharmacyFinder user={user} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

// Home Page Component
const HomePage: React.FC<{ lowBandwidthMode: boolean }> = ({ lowBandwidthMode }) => {
  return (
    <div>
      <div className="card text-center">
        <h1 className="text-2xl font-bold mb-4">
          Welcome to DoorStepDoctor
        </h1>
        <p className="text-lg mb-4">
          Rural Healthcare Access Platform for India
        </p>
        {lowBandwidthMode && (
          <div className="bg-blue-50 p-4 rounded mb-4">
            <p className="text-blue-600">
              🌐 Low bandwidth mode is active for optimal performance
            </p>
          </div>
        )}
      </div>

      <div className="grid">
        <FeatureCard
          icon={<Heart />}
          title="3D Health Dashboard"
          description="Interactive visualization of your health metrics with Three.js"
          link="/dashboard"
        />
        
        <FeatureCard
          icon={<MessageCircle />}
          title="Video Consultation"
          description="Real-time chat and video calls with doctors"
          link="/consultation"
        />
        
        <FeatureCard
          icon={<Brain />}
          title="AI Medical Assistant"
          description="Voice-powered AI guidance in local languages"
          link="/ai-assistant"
        />
        
        <FeatureCard
          icon={<Pill />}
          title="Pharmacy Integration"
          description="Find nearby pharmacies and order medicines"
          link="/pharmacy"
        />
        
        <FeatureCard
          icon={<Users />}
          title="Patient Records"
          description="Secure medical history and document management"
          link="/dashboard"
        />
        
        <FeatureCard
          icon={<Shield />}
          title="Privacy & Security"
          description="End-to-end encryption and HIPAA compliance"
          link="/dashboard"
        />
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Platform Features</h2>
        <div className="grid">
          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-bold text-green-600">Multi-Language Support</h3>
            <p>Hindi, Marathi, Tamil, Telugu, Bengali, Kannada</p>
          </div>
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-bold text-blue-600">Low-Bandwidth Optimized</h3>
            <p>Works seamlessly on 2G/3G connections</p>
          </div>
          <div className="bg-red-50 p-4 rounded">
            <h3 className="font-bold text-red-600">Voice-First Design</h3>
            <p>Accessible for users with limited digital literacy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}> = ({ icon, title, description, link }) => {
  return (
    <div className="card">
      <div className="flex mb-4">
        <div className="text-blue-600 mr-3">
          {icon}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="mb-4">{description}</p>
      <Link to={link}>
        <button className="button">
          Explore Feature
        </button>
      </Link>
    </div>
  );
};

export default App;