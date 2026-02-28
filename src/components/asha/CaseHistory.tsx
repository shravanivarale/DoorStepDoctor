/**
 * ASHA Worker Case History Component
 * 
 * Displays past triage cases submitted by the ASHA worker
 */

import React, { useState, useEffect } from 'react';
import { Clock, User, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HistoryCase {
  caseId: string;
  timestamp: string;
  symptoms: string;
  urgencyLevel: string;
  riskScore: number;
  recommendedAction: string;
  patientAge?: number;
  patientGender: string;
}

const CaseHistory: React.FC = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<HistoryCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<HistoryCase | null>(null);

  useEffect(() => {
    // TODO: Fetch actual case history from API
    // For now, using mock data
    setTimeout(() => {
      const mockCases: HistoryCase[] = [
        {
          caseId: 'CASE-001',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          symptoms: 'High fever, body ache, headache for 3 days',
          urgencyLevel: 'medium',
          riskScore: 0.65,
          recommendedAction: 'Monitor temperature, ensure hydration, visit PHC if fever persists',
          patientAge: 35,
          patientGender: 'female',
        },
        {
          caseId: 'CASE-002',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          symptoms: 'Severe chest pain, difficulty breathing',
          urgencyLevel: 'emergency',
          riskScore: 0.92,
          recommendedAction: 'Immediate referral to PHC or hospital',
          patientAge: 58,
          patientGender: 'male',
        },
      ];
      setCases(mockCases);
      setLoading(false);
    }, 1000);
  }, [user]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'high':
        return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'low':
        return 'bg-green-100 border-green-500 text-green-900';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900';
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
        <div className="flex items-center mb-6">
          <FileText className="text-blue-600 mr-3" size={32} />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Case History</h2>
            <p className="text-gray-600">Your past triage assessments</p>
          </div>
        </div>

        {cases.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No cases found</p>
            <p className="text-gray-500 text-sm mt-2">Your submitted triage cases will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Case List */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 mb-3">Recent Cases ({cases.length})</h3>
              {cases.map((caseItem) => (
                <div
                  key={caseItem.caseId}
                  onClick={() => setSelectedCase(caseItem)}
                  className={`border-l-4 rounded-lg p-4 cursor-pointer transition-all ${
                    getUrgencyColor(caseItem.urgencyLevel)
                  } ${
                    selectedCase?.caseId === caseItem.caseId
                      ? 'ring-2 ring-blue-500'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm">{caseItem.caseId}</span>
                    <span className="text-xs uppercase font-semibold">
                      {caseItem.urgencyLevel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                    {caseItem.symptoms}
                  </p>
                  <div className="flex items-center text-xs text-gray-600">
                    <Clock size={12} className="mr-1" />
                    {new Date(caseItem.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Case Details */}
            <div>
              {selectedCase ? (
                <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
                  <h3 className="font-semibold text-gray-700 mb-4">Case Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Case ID:</p>
                      <p className="text-gray-800">{selectedCase.caseId}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Date & Time:</p>
                      <p className="text-gray-800">
                        {new Date(selectedCase.timestamp).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Patient Info:</p>
                      <p className="text-gray-800">
                        {selectedCase.patientAge && `Age: ${selectedCase.patientAge}, `}
                        Gender: {selectedCase.patientGender}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Symptoms:</p>
                      <p className="text-gray-800">{selectedCase.symptoms}</p>
                    </div>

                    <div className={`border-l-4 rounded p-3 ${getUrgencyColor(selectedCase.urgencyLevel)}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Urgency Level:</span>
                        <span className="text-lg font-bold uppercase">
                          {selectedCase.urgencyLevel}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Risk Score:</span>
                        <span className="text-lg font-bold">
                          {(selectedCase.riskScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-sm font-medium text-blue-900 mb-2">
                        Recommended Action:
                      </p>
                      <p className="text-sm text-blue-800">
                        {selectedCase.recommendedAction}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Select a case to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseHistory;
