import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { Activity, Heart, Thermometer, Droplets } from 'lucide-react';

interface HealthData {
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  temperature: number;
  consultations: number;
}

interface Props {
  user: any;
  lowBandwidthMode: boolean;
}

const ThreeJSHealthDashboard: React.FC<Props> = ({ user, lowBandwidthMode }) => {
  const [healthData, setHealthData] = useState<HealthData>({
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    temperature: 98.6,
    consultations: 5
  });

  const [selectedMetric, setSelectedMetric] = useState<string>('overview');

  // Simulate real-time health data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthData(prev => ({
        ...prev,
        heartRate: 70 + Math.random() * 10,
        bloodPressure: {
          systolic: 115 + Math.random() * 10,
          diastolic: 75 + Math.random() * 10
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (lowBandwidthMode) {
    return <StaticHealthDashboard healthData={healthData} user={user} />;
  }

  return (
    <div>
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">
          3D Health Dashboard
        </h1>
        {user && (
          <p className="mb-4">Welcome back, {user.name}!</p>
        )}
      </div>

      <div className="grid">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Interactive 3D Visualization</h2>
          <div style={{ height: '400px', background: '#f8f9fa', borderRadius: '8px' }}>
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
              
              <HealthVisualization 
                healthData={healthData} 
                onMetricSelect={setSelectedMetric}
              />
            </Canvas>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Health Metrics</h2>
          <HealthMetricsPanel healthData={healthData} selectedMetric={selectedMetric} />
        </div>
      </div>

      <VillageHospitalMap />
    </div>
  );
};
// 3D Health Visualization Component
const HealthVisualization: React.FC<{
  healthData: HealthData;
  onMetricSelect: (metric: string) => void;
}> = ({ healthData, onMetricSelect }) => {
  return (
    <group>
      {/* Heart Rate Visualization */}
      <HeartRateVisualization 
        heartRate={healthData.heartRate} 
        position={[-4, 2, 0]}
        onClick={() => onMetricSelect('heartRate')}
      />
      
      {/* Blood Pressure Gauge */}
      <BloodPressureGauge 
        bloodPressure={healthData.bloodPressure}
        position={[4, 2, 0]}
        onClick={() => onMetricSelect('bloodPressure')}
      />
      
      {/* Temperature Indicator */}
      <TemperatureIndicator 
        temperature={healthData.temperature}
        position={[-4, -2, 0]}
        onClick={() => onMetricSelect('temperature')}
      />
      
      {/* Consultation History */}
      <ConsultationHistory 
        consultations={healthData.consultations}
        position={[4, -2, 0]}
        onClick={() => onMetricSelect('consultations')}
      />
    </group>
  );
};

// Heart Rate 3D Component
const HeartRateVisualization: React.FC<{
  heartRate: number;
  position: [number, number, number];
  onClick: () => void;
}> = ({ heartRate, position, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * (heartRate / 10)) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[0.8, 32, 32]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={hovered ? "#ff6b6b" : "#e74c3c"} 
          emissive={hovered ? "#ff0000" : "#000000"}
          emissiveIntensity={0.2}
        />
      </Sphere>
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color="#333"
        anchorX="center"
        anchorY="middle"
      >
        Heart Rate: {Math.round(heartRate)} BPM
      </Text>
    </group>
  );
};

// Blood Pressure Gauge Component
const BloodPressureGauge: React.FC<{
  bloodPressure: { systolic: number; diastolic: number };
  position: [number, number, number];
  onClick: () => void;
}> = ({ bloodPressure, position, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <Cylinder
        args={[0.6, 0.8, 1.5, 32]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={hovered ? "#4ecdc4" : "#3498db"} 
          emissive={hovered ? "#00ffff" : "#000000"}
          emissiveIntensity={0.1}
        />
      </Cylinder>
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.25}
        color="#333"
        anchorX="center"
        anchorY="middle"
      >
        BP: {Math.round(bloodPressure.systolic)}/{Math.round(bloodPressure.diastolic)}
      </Text>
    </group>
  );
};
// Temperature Indicator Component
const TemperatureIndicator: React.FC<{
  temperature: number;
  position: [number, number, number];
  onClick: () => void;
}> = ({ temperature, position, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const height = (temperature - 95) / 10; // Scale temperature to height

  return (
    <group position={position}>
      <Cylinder
        args={[0.2, 0.2, height, 16]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={hovered ? "#ff9f43" : "#f39c12"} 
          emissive={hovered ? "#ff6600" : "#000000"}
          emissiveIntensity={0.1}
        />
      </Cylinder>
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.25}
        color="#333"
        anchorX="center"
        anchorY="middle"
      >
        Temp: {temperature.toFixed(1)}°F
      </Text>
    </group>
  );
};

// Consultation History Component
const ConsultationHistory: React.FC<{
  consultations: number;
  position: [number, number, number];
  onClick: () => void;
}> = ({ consultations, position, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      {Array.from({ length: Math.min(consultations, 5) }).map((_, i) => (
        <Box
          key={i}
          args={[0.3, 0.3, 0.3]}
          position={[i * 0.4 - 0.8, 0, 0]}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <meshStandardMaterial 
            color={hovered ? "#a29bfe" : "#6c5ce7"} 
            emissive={hovered ? "#5500ff" : "#000000"}
            emissiveIntensity={0.1}
          />
        </Box>
      ))}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.25}
        color="#333"
        anchorX="center"
        anchorY="middle"
      >
        Consultations: {consultations}
      </Text>
    </group>
  );
};

// Health Metrics Panel Component
const HealthMetricsPanel: React.FC<{
  healthData: HealthData;
  selectedMetric: string;
}> = ({ healthData, selectedMetric }) => {
  const getMetricDetails = () => {
    switch (selectedMetric) {
      case 'heartRate':
        return {
          title: 'Heart Rate',
          value: `${Math.round(healthData.heartRate)} BPM`,
          status: healthData.heartRate > 100 ? 'High' : healthData.heartRate < 60 ? 'Low' : 'Normal',
          color: healthData.heartRate > 100 ? 'text-red-600' : 'text-green-600'
        };
      case 'bloodPressure':
        return {
          title: 'Blood Pressure',
          value: `${Math.round(healthData.bloodPressure.systolic)}/${Math.round(healthData.bloodPressure.diastolic)}`,
          status: healthData.bloodPressure.systolic > 140 ? 'High' : 'Normal',
          color: healthData.bloodPressure.systolic > 140 ? 'text-red-600' : 'text-green-600'
        };
      case 'temperature':
        return {
          title: 'Temperature',
          value: `${healthData.temperature.toFixed(1)}°F`,
          status: healthData.temperature > 100 ? 'Fever' : 'Normal',
          color: healthData.temperature > 100 ? 'text-red-600' : 'text-green-600'
        };
      case 'consultations':
        return {
          title: 'Consultations',
          value: `${healthData.consultations} total`,
          status: 'Active',
          color: 'text-blue-600'
        };
      default:
        return {
          title: 'Health Overview',
          value: 'All Systems',
          status: 'Monitoring',
          color: 'text-green-600'
        };
    }
  };

  const metric = getMetricDetails();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Activity className="text-blue-600" size={24} />
        <div>
          <h3 className="font-bold">{metric.title}</h3>
          <p className="text-2xl font-bold">{metric.value}</p>
          <p className={`text-sm ${metric.color}`}>{metric.status}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded">
          <Heart className="text-red-600 mb-2" size={20} />
          <p className="text-sm font-medium">Heart Rate</p>
          <p className="text-lg font-bold">{Math.round(healthData.heartRate)}</p>
        </div>
        
        <div className="bg-green-50 p-3 rounded">
          <Droplets className="text-blue-600 mb-2" size={20} />
          <p className="text-sm font-medium">Blood Pressure</p>
          <p className="text-lg font-bold">
            {Math.round(healthData.bloodPressure.systolic)}/{Math.round(healthData.bloodPressure.diastolic)}
          </p>
        </div>
      </div>
    </div>
  );
};
// Village Hospital Map Component
const VillageHospitalMap: React.FC = () => {
  const [selectedHospital, setSelectedHospital] = useState<string>('');

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">3D Village Hospital Map</h2>
      <div style={{ height: '400px', background: '#f8f9fa', borderRadius: '8px' }}>
        <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          
          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#90EE90" />
          </mesh>
          
          {/* Hospitals */}
          <HospitalBuilding 
            position={[-4, 0, -2]} 
            name="Rural Health Center"
            onClick={() => setSelectedHospital('Rural Health Center')}
          />
          
          <HospitalBuilding 
            position={[4, 0, -2]} 
            name="District Hospital"
            onClick={() => setSelectedHospital('District Hospital')}
          />
          
          <HospitalBuilding 
            position={[0, 0, 4]} 
            name="Community Clinic"
            onClick={() => setSelectedHospital('Community Clinic')}
          />
          
          {/* Trees for village atmosphere */}
          <Tree position={[-6, 0, 2]} />
          <Tree position={[6, 0, 2]} />
          <Tree position={[-2, 0, -6]} />
          <Tree position={[2, 0, -6]} />
        </Canvas>
      </div>
      
      {selectedHospital && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h3 className="font-bold text-blue-600">{selectedHospital}</h3>
          <p>Distance: {Math.floor(Math.random() * 5 + 1)} km</p>
          <p>Available Doctors: {Math.floor(Math.random() * 3 + 1)}</p>
          <button className="button mt-2">Book Consultation</button>
        </div>
      )}
    </div>
  );
};

// Hospital Building Component
const HospitalBuilding: React.FC<{
  position: [number, number, number];
  name: string;
  onClick: () => void;
}> = ({ position, name, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      {/* Main building */}
      <Box
        args={[2, 2, 2]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={hovered ? "#ff6b6b" : "#e74c3c"} 
          emissive={hovered ? "#ff0000" : "#000000"}
          emissiveIntensity={0.1}
        />
      </Box>
      
      {/* Roof */}
      <Box args={[2.2, 0.2, 2.2]} position={[0, 1.1, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* Cross symbol */}
      <Box args={[0.1, 0.8, 0.1]} position={[0, 0.5, 1.01]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      <Box args={[0.6, 0.1, 0.1]} position={[0, 0.5, 1.01]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      
      {/* Label */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color="#333"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
};

// Tree Component
const Tree: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Trunk */}
      <Cylinder args={[0.1, 0.15, 1]} position={[0, -1, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Cylinder>
      
      {/* Leaves */}
      <Sphere args={[0.8]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#228B22" />
      </Sphere>
    </group>
  );
};

// Static Dashboard for Low Bandwidth Mode
const StaticHealthDashboard: React.FC<{
  healthData: HealthData;
  user: any;
}> = ({ healthData, user }) => {
  return (
    <div>
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">Health Dashboard (Text Mode)</h1>
        {user && <p className="mb-4">Welcome back, {user.name}!</p>}
        <div className="bg-blue-50 p-4 rounded mb-4">
          <p className="text-blue-600">📱 Low bandwidth mode - 3D features disabled for better performance</p>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="text-red-600" size={24} />
            <div>
              <h3 className="font-bold">Heart Rate</h3>
              <p className="text-2xl font-bold">{Math.round(healthData.heartRate)} BPM</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Droplets className="text-blue-600" size={24} />
            <div>
              <h3 className="font-bold">Blood Pressure</h3>
              <p className="text-2xl font-bold">
                {Math.round(healthData.bloodPressure.systolic)}/{Math.round(healthData.bloodPressure.diastolic)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Thermometer className="text-orange-600" size={24} />
            <div>
              <h3 className="font-bold">Temperature</h3>
              <p className="text-2xl font-bold">{healthData.temperature.toFixed(1)}°F</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-purple-600" size={24} />
            <div>
              <h3 className="font-bold">Consultations</h3>
              <p className="text-2xl font-bold">{healthData.consultations}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeJSHealthDashboard;