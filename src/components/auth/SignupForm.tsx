import React, { useState } from 'react';
import { User, Lock, Mail, Phone, MapPin, UserCheck, Stethoscope, Heart, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const SignupForm: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [userType, setUserType] = useState<'asha' | 'phc'>('asha');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    location: '',
    registrationId: '', // For ASHA workers or PHC doctors
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (formData.username.length < 4) {
      newErrors.username = 'Username must be at least 4 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Full name validation
    if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Please enter your full name';
    }

    // Phone number validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit Indian mobile number';
    }

    // Location validation
    if (formData.location.trim().length < 3) {
      newErrors.location = 'Please enter your location';
    }

    // Registration ID validation
    if (formData.registrationId.trim().length < 5) {
      newErrors.registrationId = userType === 'asha' 
        ? 'Please enter your ASHA registration ID' 
        : 'Please enter your medical registration number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
        registrationId: formData.registrationId,
        userType: userType,
      });
      
      // Success message
      alert('✅ Account created successfully!\n\n' +
            'Please check your email for verification link.\n\n' +
            'After verification, you can login with your credentials.');
      navigate('/login');
    } catch (error: any) {
      console.error('Signup failed:', error);
      
      // User-friendly error messages
      let errorMessage = 'Signup failed. ';
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        errorMessage = '⚠️ Backend server is not available.\n\n' +
                      'This is expected if you haven\'t deployed the backend yet.\n\n' +
                      'To fix this:\n' +
                      '1. Deploy backend using AWS SAM\n' +
                      '2. Add API Gateway endpoint to .env.local\n' +
                      '3. Restart the app\n\n' +
                      'See AWS_SETUP_INSTRUCTIONS.md for details.';
      } else if (error.message?.includes('UsernameExistsException') || error.message?.includes('already exists')) {
        errorMessage = '❌ Username already exists.\n\nPlease choose a different username.';
      } else if (error.message?.includes('InvalidPasswordException')) {
        errorMessage = '❌ Password does not meet requirements.\n\n' +
                      'Password must have:\n' +
                      '- At least 8 characters\n' +
                      '- Uppercase letter\n' +
                      '- Lowercase letter\n' +
                      '- Number';
      } else if (error.message?.includes('InvalidParameterException')) {
        errorMessage = '❌ Invalid input.\n\nPlease check all fields and try again.';
      } else {
        errorMessage = `❌ ${error.message || 'An unexpected error occurred. Please try again.'}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-2xl w-full">
        <div className="card">
          {/* Back Button */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Login</span>
          </button>

          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <Heart className="text-green-600" size={48} />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-green-800">
              {t('signup.title') || 'Create Account'}
            </h1>
            <p className="text-gray-600">
              {t('signup.subtitle') || 'Join DoorStepDoctor to provide better healthcare'}
            </p>
          </div>

          {/* User Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-gray-700">
              {t('signup.selectRole') || 'I am a:'}
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
                  {t('signup.asha') || 'ASHA Worker'}
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
                  {t('signup.phc') || 'PHC Doctor'}
                </span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`input pl-10 ${errors.fullName ? 'border-red-500' : ''}`}
                  required
                />
              </div>
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Username and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose username"
                    className={`input pl-10 ${errors.username ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Min. 8 characters"
                    className={`input pl-10 ${errors.password ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter password"
                    className={`input pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Phone and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile"
                    className={`input pl-10 ${errors.phoneNumber ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Village/City, District"
                    className={`input pl-10 ${errors.location ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>
            </div>

            {/* Registration ID */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {userType === 'asha' ? 'ASHA Registration ID' : 'Medical Registration Number'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="registrationId"
                  value={formData.registrationId}
                  onChange={handleInputChange}
                  placeholder={userType === 'asha' ? 'ASHA ID' : 'Medical Council Registration No.'}
                  className={`input pl-10 ${errors.registrationId ? 'border-red-500' : ''}`}
                  required
                />
              </div>
              {errors.registrationId && <p className="text-red-500 text-xs mt-1">{errors.registrationId}</p>}
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
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Already have account */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Sign In
              </button>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <UserCheck className="text-green-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-green-800 text-sm mb-1">
                  Secure Registration
                </h3>
                <p className="text-green-700 text-xs leading-relaxed">
                  Your information is encrypted and protected. We comply with DPDP Act 2023 and healthcare data privacy standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
