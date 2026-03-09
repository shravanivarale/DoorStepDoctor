import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Heart, Users, MessageCircle, Pill, Brain, Shield } from 'lucide-react';

// Import components
import ThreeJSHealthDashboard from './components/dashboard/ThreeJSHealthDashboard';
import ConsultationRoom from './components/consultation/ConsultationRoom';
import VoiceInterface from './components/ai-assistant/VoiceInterface';
import PharmacyFinder from './components/pharmacy/PharmacyFinder';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import LowBandwidthDetector from './components/low-bandwidth/LowBandwidthDetector';
import ImprovedTriageForm from './components/asha/ImprovedTriageForm';
import CaseHistory from './components/asha/CaseHistory';
import EmergencyQueue from './components/phc/EmergencyQueue';
import LanguageSwitcher from './components/common/LanguageSwitcher';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);

  return (
    <Router>
      <div className="App">
        <LowBandwidthDetector onModeChange={setLowBandwidthMode} />
        
        {/* Global Language Switcher - Always visible in top-right */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>
        
        {/* Debug: Show current language */}
        <div className="fixed top-4 left-4 bg-white px-3 py-1 rounded shadow text-xs">
          Current: {t('app.title')}
        </div>
        
        {/* Navigation - Only show when user is logged in */}
        {user && (
          <nav className="navbar">
            <div className="navbar-content">
              <div className="logo">
                <Heart size={24} />
                <span>{t('app.title')}</span>
              </div>
              <div className="flex items-center gap-4">
                <ul className="nav-links">
                  {user.role === 'asha_worker' && (
                    <>
                      <li><Link to="/triage">{t('nav.triage')}</Link></li>
                      <li><Link to="/history">{t('nav.history')}</Link></li>
                    </>
                  )}
                  {user.role === 'phc_doctor' && (
                    <li><Link to="/emergency-queue">{t('nav.emergency')}</Link></li>
                  )}
                  <li>
                    <button onClick={logout} className="button secondary">
                      {t('nav.logout')} ({user.name})
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        )}

        {/* Main Content */}
        <div className="container">
          <Routes>
            <Route 
              path="/" 
              element={
                user ? (
                  user.role === 'asha_worker' ? <Navigate to="/triage" /> : <Navigate to="/emergency-queue" />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" /> : <LoginForm />} 
            />
            <Route 
              path="/signup" 
              element={user ? <Navigate to="/" /> : <SignupForm />} 
            />
            <Route 
              path="/triage" 
              element={
                user && user.role === 'asha_worker' ? (
                  <ImprovedTriageForm />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/history" 
              element={
                user && user.role === 'asha_worker' ? (
                  <CaseHistory />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/emergency-queue" 
              element={
                user && user.role === 'phc_doctor' ? (
                  <EmergencyQueue />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;