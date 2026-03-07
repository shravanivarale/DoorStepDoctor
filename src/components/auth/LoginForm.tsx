import React, { useState } from 'react';
import { User, Lock, UserCheck, Stethoscope, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [userType, setUserType] = useState<'asha' | 'phc'>('asha');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.username, formData.password);
      navigate(userType === 'asha' ? '/triage' : '/emergency-queue');
    } catch (error) {
      console.error('Login failed:', error);
      alert(t('login.error') || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <Heart className="text-green-600" size={48} />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-green-800">
              {t('app.title')}
            </h1>
            <p className="text-gray-600">
              {t('app.subtitle')}
            </p>
          </div>

          {/* User Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-gray-700">
              {t('login.selectRole') || 'Select Your Role'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('asha')}
                className={`flex flex-col items-center justify-center gap-3 p-6 border-2 rounded-xl transition-all ${
                  userType === 'asha' 
                    ? 'border-green-500 bg-green-50 shadow-md' 
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <UserCheck size={32} className={userType === 'asha' ? 'text-green-600' : 'text-gray-400'} />
                <span className={`font-semibold ${userType === 'asha' ? 'text-green-700' : 'text-gray-600'}`}>
                  {t('login.asha')}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('phc')}
                className={`flex flex-col items-center justify-center gap-3 p-6 border-2 rounded-xl transition-all ${
                  userType === 'phc' 
                    ? 'border-green-500 bg-green-50 shadow-md' 
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <Stethoscope size={32} className={userType === 'phc' ? 'text-green-600' : 'text-gray-400'} />
                <span className={`font-semibold ${userType === 'phc' ? 'text-green-700' : 'text-gray-600'}`}>
                  {t('login.phc')}
                </span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t('login.username')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder={t('login.usernamePlaceholder') || 'Enter username'}
                  className="input pl-10"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={t('login.passwordPlaceholder') || 'Enter password'}
                  className="input pl-10"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`button w-full text-lg py-4 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t('login.processing') || 'Processing...'}
                </span>
              ) : (
                t('login.signin')
              )}
            </button>
          </form>

          {/* Demo Login */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-3">
              {t('login.demoAccess') || 'Quick Demo Access:'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setFormData({ username: 'asha_worker_001', password: 'demo123' });
                  setUserType('asha');
                }}
                className="button secondary flex items-center justify-center gap-2 text-sm py-3"
                disabled={isLoading}
              >
                <UserCheck size={16} />
                {t('login.asha')}
              </button>
              <button
                onClick={() => {
                  setFormData({ username: 'phc_doctor_001', password: 'demo123' });
                  setUserType('phc');
                }}
                className="button secondary flex items-center justify-center gap-2 text-sm py-3"
                disabled={isLoading}
              >
                <Stethoscope size={16} />
                {t('login.phc')}
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <UserCheck className="text-green-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-green-800 text-sm mb-1">
                  {t('login.secureTitle') || 'Secure & Private'}
                </h3>
                <p className="text-green-700 text-xs leading-relaxed">
                  {t('login.secureDesc') || 'Your data is protected with end-to-end encryption and complies with DPDP Act 2023.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;