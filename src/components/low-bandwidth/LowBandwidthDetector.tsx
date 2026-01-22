import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Settings } from 'lucide-react';

interface Props {
  onModeChange: (isLowBandwidth: boolean) => void;
}

const LowBandwidthDetector: React.FC<Props> = ({ onModeChange }) => {
  const [connectionSpeed, setConnectionSpeed] = useState<number | null>(null);
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  const [manualMode, setManualMode] = useState<boolean | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Network speed detection
  const detectNetworkSpeed = async () => {
    try {
      const startTime = Date.now();
      const response = await fetch('/favicon.ico?' + Math.random(), {
        method: 'GET',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const bytes = parseInt(response.headers.get('content-length') || '1000');
        const bitsLoaded = bytes * 8;
        const speedBps = bitsLoaded / (duration / 1000);
        const speedMbps = speedBps / (1024 * 1024);
        
        setConnectionSpeed(speedMbps);
        
        // Auto-enable low bandwidth mode if speed is below 2 Mbps
        const shouldUseLowBandwidth = speedMbps < 2;
        if (manualMode === null) {
          setIsLowBandwidth(shouldUseLowBandwidth);
          onModeChange(shouldUseLowBandwidth);
        }
      }
    } catch (error) {
      console.error('Network speed detection failed:', error);
      // Assume low bandwidth on error
      if (manualMode === null) {
        setIsLowBandwidth(true);
        onModeChange(true);
      }
    }
  };

  // Connection type detection
  const getConnectionType = () => {
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      };
    }
    return null;
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initial speed detection
  useEffect(() => {
    if (isOnline) {
      detectNetworkSpeed();
      
      // Re-check speed every 30 seconds
      const interval = setInterval(detectNetworkSpeed, 30000);
      return () => clearInterval(interval);
    }
  }, [isOnline, manualMode]);

  // Handle manual mode toggle
  const toggleManualMode = (enabled: boolean) => {
    setManualMode(enabled);
    setIsLowBandwidth(enabled);
    onModeChange(enabled);
    
    // Store preference in localStorage
    localStorage.setItem('lowBandwidthMode', enabled.toString());
  };

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('lowBandwidthMode');
    if (saved !== null) {
      const enabled = saved === 'true';
      setManualMode(enabled);
      setIsLowBandwidth(enabled);
      onModeChange(enabled);
    }
  }, [onModeChange]);

  const connectionInfo = getConnectionType();
  const finalMode = manualMode !== null ? manualMode : isLowBandwidth;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2">
        {/* Connection Status Indicator */}
        <div 
          className={`px-3 py-2 rounded-lg shadow-lg backdrop-filter backdrop-blur-sm ${
            finalMode 
              ? 'bg-orange-100 border border-orange-200' 
              : 'bg-green-100 border border-green-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi 
                className={finalMode ? 'text-orange-600' : 'text-green-600'} 
                size={16} 
              />
            ) : (
              <WifiOff className="text-red-600" size={16} />
            )}
            
            <div className="text-xs">
              <div className={`font-medium ${
                finalMode ? 'text-orange-700' : 'text-green-700'
              }`}>
                {!isOnline ? 'Offline' : finalMode ? 'Low Bandwidth' : 'High Speed'}
              </div>
              
              {isOnline && connectionSpeed && (
                <div className="text-gray-600">
                  {connectionSpeed.toFixed(1)} Mbps
                </div>
              )}
              
              {connectionInfo && (
                <div className="text-gray-600">
                  {connectionInfo.effectiveType?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Settings size={16} className="text-gray-600" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
          <h3 className="font-bold mb-3">Bandwidth Settings</h3>
          
          {/* Connection Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h4 className="font-medium text-sm mb-2">Connection Status</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              {connectionSpeed && (
                <div className="flex justify-between">
                  <span>Speed:</span>
                  <span>{connectionSpeed.toFixed(2)} Mbps</span>
                </div>
              )}
              
              {connectionInfo && (
                <>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span>{connectionInfo.effectiveType?.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Latency:</span>
                    <span>{connectionInfo.rtt}ms</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Manual Controls */}
          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="bandwidthMode"
                  checked={manualMode === null}
                  onChange={() => {
                    setManualMode(null);
                    detectNetworkSpeed();
                  }}
                />
                <span className="text-sm">Auto-detect (Recommended)</span>
              </label>
              <p className="text-xs text-gray-600 ml-6">
                Automatically switch based on connection speed
              </p>
            </div>
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="bandwidthMode"
                  checked={manualMode === false}
                  onChange={() => toggleManualMode(false)}
                />
                <span className="text-sm">High Speed Mode</span>
              </label>
              <p className="text-xs text-gray-600 ml-6">
                Full features, 3D graphics, video calls
              </p>
            </div>
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="bandwidthMode"
                  checked={manualMode === true}
                  onChange={() => toggleManualMode(true)}
                />
                <span className="text-sm">Low Bandwidth Mode</span>
              </label>
              <p className="text-xs text-gray-600 ml-6">
                Text-first UI, compressed images, voice-only calls
              </p>
            </div>
          </div>

          {/* Features affected */}
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <h4 className="font-medium text-sm text-blue-800 mb-2">
              {finalMode ? 'Low Bandwidth Features:' : 'High Speed Features:'}
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              {finalMode ? (
                <>
                  <li>• Text-based interface</li>
                  <li>• Compressed images</li>
                  <li>• Voice-only consultations</li>
                  <li>• Offline data caching</li>
                  <li>• Minimal data usage</li>
                </>
              ) : (
                <>
                  <li>• 3D health dashboard</li>
                  <li>• HD video consultations</li>
                  <li>• Interactive animations</li>
                  <li>• Real-time features</li>
                  <li>• Full image quality</li>
                </>
              )}
            </ul>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            Close Settings
          </button>
        </div>
      )}
    </div>
  );
};

export default LowBandwidthDetector;