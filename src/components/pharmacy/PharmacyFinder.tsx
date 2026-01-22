import React, { useState, useEffect } from 'react';
import { MapPin, Search, ShoppingCart, Clock, Phone, Star } from 'lucide-react';

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  isOpen: boolean;
  phone: string;
  medicines: Medicine[];
}

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  price: number;
  inStock: boolean;
  quantity: number;
}

interface Props {
  user: any;
}

const PharmacyFinder: React.FC<Props> = ({ user }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<Pharmacy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [cart, setCart] = useState<{ medicine: Medicine; quantity: number }[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Mock pharmacy data
  const mockPharmacies: Pharmacy[] = [
    {
      id: '1',
      name: 'HealthCare Pharmacy',
      address: 'Main Street, Village Center',
      distance: 0.8,
      rating: 4.5,
      isOpen: true,
      phone: '+91-9876543210',
      medicines: [
        { id: '1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', price: 25, inStock: true, quantity: 100 },
        { id: '2', name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', price: 85, inStock: true, quantity: 50 },
        { id: '3', name: 'Cetirizine 10mg', genericName: 'Cetirizine', price: 45, inStock: false, quantity: 0 },
      ]
    },
    {
      id: '2',
      name: 'Rural Medical Store',
      address: 'Hospital Road, Near PHC',
      distance: 1.2,
      rating: 4.2,
      isOpen: true,
      phone: '+91-9876543211',
      medicines: [
        { id: '1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', price: 22, inStock: true, quantity: 75 },
        { id: '2', name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', price: 80, inStock: true, quantity: 30 },
        { id: '4', name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', price: 35, inStock: true, quantity: 60 },
      ]
    },
    {
      id: '3',
      name: 'Community Pharmacy',
      address: 'Market Square, Central Area',
      distance: 2.1,
      rating: 4.0,
      isOpen: false,
      phone: '+91-9876543212',
      medicines: [
        { id: '1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', price: 28, inStock: true, quantity: 120 },
        { id: '3', name: 'Cetirizine 10mg', genericName: 'Cetirizine', price: 42, inStock: true, quantity: 40 },
        { id: '5', name: 'Omeprazole 20mg', genericName: 'Omeprazole', price: 65, inStock: true, quantity: 25 },
      ]
    }
  ];

  // Get user location
  const getUserLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setNearbyPharmacies(mockPharmacies);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use mock location for demo
          setUserLocation({ lat: 19.0760, lng: 72.8777 });
          setNearbyPharmacies(mockPharmacies);
          setIsLoadingLocation(false);
        }
      );
    } else {
      // Fallback to mock location
      setUserLocation({ lat: 19.0760, lng: 72.8777 });
      setNearbyPharmacies(mockPharmacies);
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const searchMedicines = (query: string) => {
    if (!query.trim()) return [];
    
    const results: { pharmacy: Pharmacy; medicine: Medicine }[] = [];
    nearbyPharmacies.forEach(pharmacy => {
      pharmacy.medicines.forEach(medicine => {
        if (
          medicine.name.toLowerCase().includes(query.toLowerCase()) ||
          medicine.genericName.toLowerCase().includes(query.toLowerCase())
        ) {
          results.push({ pharmacy, medicine });
        }
      });
    });
    
    return results.sort((a, b) => a.medicine.price - b.medicine.price);
  };

  const addToCart = (medicine: Medicine, pharmacy: Pharmacy) => {
    const existingItem = cart.find(item => item.medicine.id === medicine.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.medicine.id === medicine.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { medicine: { ...medicine, name: `${medicine.name} (${pharmacy.name})` }, quantity: 1 }]);
    }
  };

  const removeFromCart = (medicineId: string) => {
    setCart(cart.filter(item => item.medicine.id !== medicineId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.medicine.price * item.quantity), 0);
  };

  if (!user) {
    return (
      <div className="card text-center">
        <h2 className="text-xl font-bold mb-4">Please log in to access pharmacy services</h2>
        <p>You need to be logged in to search for pharmacies and order medicines.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">Pharmacy Finder</h1>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={getUserLocation}
            disabled={isLoadingLocation}
            className="button flex items-center gap-2"
          >
            <MapPin size={20} />
            {isLoadingLocation ? 'Getting Location...' : 'Update Location'}
          </button>
          
          {userLocation && (
            <div className="bg-green-50 px-3 py-1 rounded">
              <span className="text-green-600 text-sm">📍 Location detected</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicine Search */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Search Medicines</h2>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for medicines..."
                  className="input pl-10"
                />
              </div>
            </div>

            {searchQuery && (
              <div className="mb-6">
                <h3 className="font-bold mb-3">Search Results for "{searchQuery}"</h3>
                <div className="space-y-3">
                  {searchMedicines(searchQuery).map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold">{result.medicine.name}</h4>
                          <p className="text-sm text-gray-600">{result.medicine.genericName}</p>
                          <p className="text-sm text-blue-600">{result.pharmacy.name} - {result.pharmacy.distance}km away</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg font-bold text-green-600">₹{result.medicine.price}</span>
                            <span className={`text-sm px-2 py-1 rounded ${
                              result.medicine.inStock ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                            }`}>
                              {result.medicine.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => addToCart(result.medicine, result.pharmacy)}
                          disabled={!result.medicine.inStock}
                          className={`button ${result.medicine.inStock ? '' : 'bg-gray-400'}`}
                        >
                          <ShoppingCart size={16} />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Pharmacies */}
            <h3 className="font-bold mb-3">Nearby Pharmacies</h3>
            <div className="space-y-4">
              {nearbyPharmacies.map((pharmacy) => (
                <div
                  key={pharmacy.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPharmacy?.id === pharmacy.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPharmacy(pharmacy)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold">{pharmacy.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-500" size={16} />
                          <span className="text-sm">{pharmacy.rating}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          pharmacy.isOpen ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {pharmacy.isOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{pharmacy.address}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {pharmacy.distance}km away
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={14} />
                          {pharmacy.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedPharmacy?.id === pharmacy.id && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-bold mb-2">Available Medicines</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {pharmacy.medicines.map((medicine) => (
                          <div key={medicine.id} className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{medicine.name}</p>
                                <p className="text-xs text-gray-600">{medicine.genericName}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-bold text-green-600">₹{medicine.price}</span>
                                  <span className={`text-xs px-1 py-0.5 rounded ${
                                    medicine.inStock ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                  }`}>
                                    {medicine.inStock ? `${medicine.quantity} available` : 'Out of stock'}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(medicine, pharmacy);
                                }}
                                disabled={!medicine.inStock}
                                className={`button text-xs px-2 py-1 ${medicine.inStock ? '' : 'bg-gray-400'}`}
                              >
                                <ShoppingCart size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shopping Cart */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">Cart ({cart.length})</h2>
          </div>
          
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
          ) : (
            <div>
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.medicine.id} className="border rounded p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.medicine.name}</p>
                        <p className="text-xs text-gray-600">{item.medicine.genericName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm">Qty: {item.quantity}</span>
                          <span className="font-bold text-green-600">₹{item.medicine.price * item.quantity}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.medicine.id)}
                        className="text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold">Total:</span>
                  <span className="text-xl font-bold text-green-600">₹{getTotalPrice()}</span>
                </div>
                
                <button className="button w-full bg-green-600">
                  Place Order
                </button>
                
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Estimated delivery: 30-45 minutes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order History */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        <div className="space-y-3">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold">Order #12345</p>
                <p className="text-sm text-gray-600">Paracetamol 500mg x2, Cetirizine 10mg x1</p>
                <p className="text-sm text-gray-600">HealthCare Pharmacy</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">₹95</p>
                <p className="text-sm bg-green-50 text-green-600 px-2 py-1 rounded">Delivered</p>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold">Order #12344</p>
                <p className="text-sm text-gray-600">Amoxicillin 250mg x1</p>
                <p className="text-sm text-gray-600">Rural Medical Store</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">₹80</p>
                <p className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded">In Transit</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyFinder;