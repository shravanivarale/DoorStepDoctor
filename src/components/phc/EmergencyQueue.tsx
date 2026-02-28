/**
 * PHC Emergency Queue Component
 * 
 * Displays emergency cases that need immediate attention
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, Phone, MapPin, Clock, User } from 'lucide-react';
import { apiService } from '../../services/api';
import { EmergencyCase } from '../../services/types';
import { useAuth } from '../../contexts/AuthContext';

const EmergencyQueue: React.FC = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEmergencyCases();
    // Refresh every 30 seconds
    const interval = setInterval(loadEmergencyCases, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadEmergencyCases = async () => {
    try {
      const emergencyCases = await apiService.getEmergencyCases();
      setCases(emergencyCases);
      setError(null);
    } catch (err) {
      setError('Failed to load emergency cases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (caseId: string, status: 'pending' | 'contacted' | 'resolved') => {
    try {
      await apiService.updateEmergencyStatus(caseId, status);
      await loadEmergencyCases();
    } catch (err) {
      alert('Failed to update case status');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'high':
        return 'bg-orange-100 border-orange-500 text-orange-900';
      default:
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <AlertCircle className="text-red-600 mr-3" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Emergency Queue</h2>
              <p className="text-gray-600">Cases requiring immediate attention</p>
            </div>
          </div>
          <button
            onClick={loadEmergencyCases}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {cases.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No emergency cases at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((emergencyCase) => (
              <div
                key={emergencyCase.caseId}
                className={`border-l-4 rounded-lg p-4 ${getUrgencyColor(emergencyCase.urgencyLevel)}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl font-bold uppercase">
                        {emergencyCase.urgencyLevel}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(emergencyCase.status)}`}>
                        {emergencyCase.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700 gap-4">
                      <span className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        {new Date(emergencyCase.timestamp).toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <User size={16} className="mr-1" />
                        ASHA Worker: {emergencyCase.ashaWorkerId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white bg-opacity-50 rounded p-3">
                    <p className="text-sm font-medium mb-1">Patient Demographics:</p>
                    <p className="text-sm">
                      {emergencyCase.patientAge && `Age: ${emergencyCase.patientAge}, `}
                      Gender: {emergencyCase.patientGender}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-50 rounded p-3">
                    <p className="text-sm font-medium mb-1">Location:</p>
                    <p className="text-sm flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {emergencyCase.location.district}, {emergencyCase.location.state}
                    </p>
                  </div>
                </div>

                <div className="bg-white bg-opacity-50 rounded p-3 mb-4">
                  <p className="text-sm font-medium mb-1">Symptoms:</p>
                  <p className="text-sm">{emergencyCase.symptoms}</p>
                </div>

                {emergencyCase.referralNote && (
                  <div className="bg-white bg-opacity-50 rounded p-3 mb-4">
                    <p className="text-sm font-medium mb-1">Referral Note:</p>
                    <p className="text-sm">{emergencyCase.referralNote}</p>
                  </div>
                )}

                {emergencyCase.nearestPhc && (
                  <div className="bg-white bg-opacity-50 rounded p-3 mb-4">
                    <p className="text-sm font-medium mb-1">Nearest PHC:</p>
                    <p className="text-sm">
                      {emergencyCase.nearestPhc.name} - {emergencyCase.nearestPhc.distance.toFixed(1)} km
                    </p>
                    <p className="text-sm flex items-center mt-1">
                      <Phone size={14} className="mr-1" />
                      {emergencyCase.nearestPhc.phone}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {emergencyCase.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(emergencyCase.caseId, 'contacted')}
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                    >
                      Mark as Contacted
                    </button>
                  )}
                  {emergencyCase.status === 'contacted' && (
                    <button
                      onClick={() => handleUpdateStatus(emergencyCase.caseId, 'resolved')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Mark as Resolved
                    </button>
                  )}
                  <a
                    href={`tel:${emergencyCase.nearestPhc?.phone}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center"
                  >
                    <Phone size={16} className="mr-1" />
                    Call PHC
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyQueue;
