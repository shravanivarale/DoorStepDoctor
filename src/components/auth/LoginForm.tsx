import React, { useState } from 'react';
import { User, Lock, Phone, UserCheck, Stethoscope } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    age: '',
    location: '',
    medicalLicense: '',
    specialization: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'patient' | 'doctor' | 'asha') => {
    const demoCredentials = {
      patient: { email: 'patient@demo.com', password: 'demo123' },
      doctor: { email: 'doctor@demo.com', password: 'demo123' },
      asha: { email: 'asha@demo.com', password: 'demo123' }
    };

    setIsLoading(true);
    try {
      const creds = demoCredentials[role];
      await login(creds.email, creds.password);
      navigate('/');
    } catch (error) {
      console.error('Demo login failed:', error);
      alert('Demo login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Join DoorStepDoctor today'}
          </p>
        </div>

        {/* User Type Selection */}
        {!isLogin && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">I am a:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUserType('patient')}
                className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-all ${
                  userType === 'patient' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <User size={20} />
                Patient
              </button>
              <button
                type="button"
                onClick={() => setUserType('doctor')}
                className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-all ${
                  userType === 'doctor' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Stethoscope size={20} />
                Doctor
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (Registration only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="input pl-10"
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="input"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="input pl-10"
                required
              />
            </div>
          </div>

          {/* Phone (Registration only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91-9876543210"
                  className="input pl-10"
                  required
                />
              </div>
            </div>
          )}

          {/* Patient-specific fields */}
          {!isLogin && userType === 'patient' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="25"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Village, State"
                    className="input"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Doctor-specific fields */}
          {!isLogin && userType === 'doctor' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Medical License Number</label>
                <input
                  type="text"
                  name="medicalLicense"
                  value={formData.medicalLicense}
                  onChange={handleInputChange}
                  placeholder="MH12345"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Specialization</label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  <option value="">Select specialization</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Gynecology">Gynecology</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Orthopedics">Orthopedics</option>
                </select>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`button w-full ${isLoading ? 'bg-gray-400' : ''}`}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700 ml-1 font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Demo Login */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-center text-sm text-gray-600 mb-3">Quick Demo Access:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin('asha')}
              className="button secondary flex items-center justify-center gap-1 text-sm"
              disabled={isLoading}
            >
              <UserCheck size={16} />
              ASHA
            </button>
            <button
              onClick={() => handleDemoLogin('doctor')}
              className="button secondary flex items-center justify-center gap-1 text-sm"
              disabled={isLoading}
            >
              <Stethoscope size={16} />
              Doctor
            </button>
            <button
              onClick={() => handleDemoLogin('patient')}
              className="button secondary flex items-center justify-center gap-1 text-sm"
              disabled={isLoading}
            >
              <User size={16} />
              Patient
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <UserCheck className="text-blue-600 mt-1" size={20} />
            <div>
              <h3 className="font-bold text-blue-800 text-sm">Secure & Private</h3>
              <p className="text-blue-700 text-xs">
                Your data is protected with end-to-end encryption and HIPAA compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;