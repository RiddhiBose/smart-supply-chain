import React, { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Package, 
  Clock, 
  Truck, 
  Navigation, 
  Map, 
  Route,
  Brain,
  Cloud,
  Users,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  X,
  CheckCircle,
  AlertCircle,
  Star,
  ArrowRight
} from 'lucide-react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface OrderStatus {
  id: string;
  status: string;
  estimatedDelivery: string;
  items: { name: string; quantity: number }[];
  currentLocation: string;
  lastUpdate: string;
  trackingNumber: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  pickupAddress?: string;
  priority: string;
  assignedEmployee?: {
    id: string;
    name: string;
    phone: string;
    currentLocation?: { lat: number; lng: number };
  };
  coordinates: { lat: number; lng: number };
  delayStatus?: string;
  delayReason?: string;
  trafficImpact?: boolean;
  weatherImpact?: boolean;
  customerAbsence?: boolean;
  absenceHistory?: { date: string; reason: string; notified: boolean }[];
  routeOptimization?: {
    mainRoute: { distance: number; duration: number };
    optimizedRoute: { distance: number; duration: number };
    isOptimized: boolean;
  };
  trafficZones?: { lat: number; lng: number; severity: 'low' | 'medium' | 'high' }[];
}

const CustomerPortal: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLocation, setShowLocation] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Generate dynamic AI Analysis data based on order
  const generateAIAnalysis = (order: OrderStatus) => {
    const hash = order.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Weather conditions based on order hash
    const temperature = 20 + (hash % 15); // 20-35°C
    const humidity = 40 + (hash % 40); // 40-80%
    const windSpeed = 5 + (hash % 20); // 5-25 km/h
    const visibility = 5 + (hash % 10); // 5-15 km
    const weatherConditions = ['Clear skies', 'Partly cloudy', 'Overcast', 'Light rain expected'][hash % 4];
    
    // Route analysis based on order properties
    const baseTime = order.priority === 'express' ? 1 : order.priority === 'premium' ? 2 : 3;
    const minTime = baseTime + (hash % 2);
    const maxTime = minTime + 2 + (hash % 3);
    const trafficLevels = ['Light', 'Moderate', 'Heavy', 'Very Heavy'];
    const trafficLevel = trafficLevels[hash % 4];
    const efficiency = 70 + (hash % 25); // 70-95%
    const distance = 5 + (hash % 25) + (hash % 10) * 0.1; // 5-30 km with decimal
    
    // Generate delivery partners based on order
    const partnerCount = 2 + (hash % 3); // 2-4 partners
    const partners = [];
    const names = ['Rahul Verma', 'Sneha Patel', 'Amit Singh', 'Priya Sharma', 'Karan Malhotra', 'Neha Gupta'];
    const baseIndex = hash % names.length;
    
    for (let i = 0; i < partnerCount; i++) {
      const nameIndex = (baseIndex + i) % names.length;
      partners.push({
        name: names[nameIndex],
        rating: (4.5 + (hash % 5) * 0.1).toFixed(1),
        distance: `${0.5 + (hash % 20) * 0.1} km`,
        capacity: `${25 + (hash % 75) * 5}kg`,
        phone: `+91-98765-${10000 + (hash + i) * 111}`
      });
    }
    
    return {
      weather: {
        temperature: `${temperature}°C`,
        humidity: `${humidity}%`,
        windSpeed: `${windSpeed} km/h`,
        visibility: `${visibility} km`,
        condition: weatherConditions
      },
      route: {
        minTime: `${minTime} hours`,
        maxTime: `${maxTime} hours`,
        traffic: trafficLevel,
        efficiency: `${efficiency}%`,
        distance: `${distance.toFixed(1)} km`
      },
      partners
    };
  };

  // Check if actions are allowed (>45 minutes remaining until delivery)
  const canPerformActions = (order: OrderStatus): boolean => {
    if (!order.estimatedDelivery) return false;
    const deliveryTime = new Date(order.estimatedDelivery).getTime();
    const now = new Date().getTime();
    const diffMinutes = (deliveryTime - now) / (1000 * 60);
    return diffMinutes > 45;
  };

  // Initialize map when showLocation changes and orderStatus exists
  useEffect(() => {
    if (showLocation && orderStatus && mapRef.current) {
      // Clear any existing map first
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      
      // Initialize map immediately
      const timer = setTimeout(() => {
        initializeMap();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [showLocation, orderStatus]);

  // Mock order data
  const mockOrders: { [key: string]: OrderStatus } = {
    'ORD12345': {
      id: 'ORD12345',
      status: 'shipped',
      estimatedDelivery: '2024-05-01',
      items: [{ name: 'Premium Package', quantity: 2 }],
      currentLocation: 'Distribution Center, Delhi',
      lastUpdate: '2024-04-26 10:30 AM',
      trackingNumber: 'TRK-78945612',
      customerName: 'Rahul Sharma',
      deliveryAddress: '123 Main Street, Delhi, 110001',
      priority: 'express',
      assignedEmployee: {
        id: 'EMP001',
        name: 'Rajesh Kumar',
        phone: '+91-98765-43210',
        currentLocation: { lat: 28.6139, lng: 77.2090 }
      },
      coordinates: { lat: 28.6139, lng: 77.2090 }
    },
    'ORD67890': {
      id: 'ORD67890',
      status: 'delivered',
      estimatedDelivery: '2024-04-20',
      items: [{ name: 'Standard Package', quantity: 1 }],
      currentLocation: 'Delivered',
      lastUpdate: '2024-04-20 02:15 PM',
      trackingNumber: 'TRK-45678901',
      customerName: 'Priya Patel',
      deliveryAddress: '456 Park Avenue, Mumbai, 400001',
      priority: 'standard',
      assignedEmployee: {
        id: 'EMP002',
        name: 'Anita Singh',
        phone: '+91-98765-54321',
        currentLocation: { lat: 19.0760, lng: 72.8777 }
      },
      coordinates: { lat: 19.0760, lng: 72.8777 }
    },
    'ORD11223': {
      id: 'ORD11223',
      status: 'processing',
      estimatedDelivery: '2024-04-28',
      items: [{ name: 'Premium Package', quantity: 1 }],
      currentLocation: 'Processing Center',
      lastUpdate: '2024-04-26 09:15 AM',
      trackingNumber: 'TRK-34511223',
      customerName: 'Amit Kumar',
      deliveryAddress: '789 Business Hub, Bangalore, 560001',
      priority: 'premium',
      assignedEmployee: {
        id: 'EMP003',
        name: 'Vikram Reddy',
        phone: '+91-98765-67890',
        currentLocation: { lat: 12.9716, lng: 77.5946 }
      },
      coordinates: { lat: 12.9716, lng: 77.5946 }
    },
    'ORD003': {
      id: 'ORD003',
      status: 'in_transit',
      estimatedDelivery: '2026-04-26',
      items: [{ name: 'Priority Documents', quantity: 1 }],
      currentLocation: 'En route via NH-24, Ghaziabad',
      lastUpdate: '2026-04-26 14:30 PM',
      trackingNumber: 'TRK-RIDHI003',
      customerName: 'Riddhi Bose',
      deliveryAddress: 'ABES Engineering College, NH-24 Highway, Ghaziabad, Uttar Pradesh 201009',
      priority: 'express',
      assignedEmployee: {
        id: 'EMP004',
        name: 'Pakhi Dubey',
        phone: '+917380729261',
        currentLocation: { lat: 28.6082, lng: 77.3689 }
      },
      coordinates: { lat: 28.6789, lng: 77.4567 },
      customerPhone: '+919205413301',
      pickupAddress: 'Gaur City Mall, Greater Noida, Uttar Pradesh 201308',
      delayStatus: 'delayed',
      delayReason: 'Heavy traffic congestion on NH-24 near Ghaziabad',
      trafficImpact: true,
      weatherImpact: false,
      customerAbsence: true,
      absenceHistory: [
        { date: '2026-04-25', reason: 'Customer not available at delivery address', notified: false },
        { date: '2026-04-24', reason: 'Customer requested delayed delivery', notified: true }
      ],
      routeOptimization: {
        mainRoute: { distance: 18.5, duration: 65 },
        optimizedRoute: { distance: 22.1, duration: 78 },
        isOptimized: false
      },
      trafficZones: [
        { lat: 28.6350, lng: 77.4200, severity: 'high' },
        { lat: 28.6500, lng: 77.4350, severity: 'medium' },
        { lat: 28.6600, lng: 77.4450, severity: 'high' }
      ]
    },
    // Orders for Overloaded Employee Scenario (assigned to EMP002 - Priya Sharma)
    'ORD004': {
      id: 'ORD004',
      status: 'in_transit',
      estimatedDelivery: '2026-04-26, 12:00 pm',
      items: [{ name: 'Grocery Package', quantity: 1 }],
      currentLocation: 'Sector 18, Noida',
      lastUpdate: '2026-04-26 11:30 AM',
      trackingNumber: 'TRK-ORD004',
      customerName: 'Vikram Singh',
      deliveryAddress: 'Sector 18, Noida, Uttar Pradesh 201301',
      priority: 'standard',
      assignedEmployee: {
        id: 'EMP002',
        name: 'Priya Sharma',
        phone: '+91-9876543211',
        currentLocation: { lat: 28.6139, lng: 77.2090 }
      },
      coordinates: { lat: 28.5708, lng: 77.3261 },
      customerPhone: '+91-9876543204',
      pickupAddress: 'SuperMart Warehouse, Noida',
      delayStatus: 'none',
      delayReason: undefined,
      trafficImpact: false,
      weatherImpact: false,
      customerAbsence: false,
      absenceHistory: []
    },
    'ORD005': {
      id: 'ORD005',
      status: 'pending',
      estimatedDelivery: '2026-04-26, 15:00 pm',
      items: [{ name: 'Smartphone', quantity: 1 }],
      currentLocation: 'Electronics Hub, Delhi',
      lastUpdate: '2026-04-26 11:00 AM',
      trackingNumber: 'TRK-ORD005',
      customerName: 'Neha Gupta',
      deliveryAddress: 'Greater Noida West, Uttar Pradesh 201306',
      priority: 'express',
      assignedEmployee: {
        id: 'EMP002',
        name: 'Priya Sharma',
        phone: '+91-9876543211',
        currentLocation: { lat: 28.6139, lng: 77.2090 }
      },
      coordinates: { lat: 28.6082, lng: 77.3689 },
      customerPhone: '+91-9876543205',
      pickupAddress: 'Electronics Hub, Delhi',
      delayStatus: 'none',
      delayReason: undefined,
      trafficImpact: true,
      weatherImpact: false,
      customerAbsence: false,
      absenceHistory: []
    },
    'ORD006': {
      id: 'ORD006',
      status: 'in_transit',
      estimatedDelivery: '2026-04-26, 13:30 pm',
      items: [{ name: 'Home Decor', quantity: 1 }],
      currentLocation: 'Indirapuram, Ghaziabad',
      lastUpdate: '2026-04-26 10:30 AM',
      trackingNumber: 'TRK-ORD006',
      customerName: 'Arun Kumar',
      deliveryAddress: 'Indirapuram, Ghaziabad, Uttar Pradesh 201014',
      priority: 'standard',
      assignedEmployee: {
        id: 'EMP002',
        name: 'Priya Sharma',
        phone: '+91-9876543211',
        currentLocation: { lat: 28.6139, lng: 77.2090 }
      },
      coordinates: { lat: 28.6453, lng: 77.3545 },
      customerPhone: '+91-9876543206',
      pickupAddress: 'HomeStore, Ghaziabad',
      delayStatus: 'delayed',
      delayReason: 'Vehicle breakdown - resolved',
      trafficImpact: false,
      weatherImpact: false,
      customerAbsence: false,
      absenceHistory: []
    }
  };

  const handleTrackOrder = async () => {
    if (!orderId.trim()) {
      setError('Please enter an order ID');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      let foundOrder = mockOrders[orderId.toUpperCase()];
      
      // Check backend (localStorage) for updated order data (reassignment, etc.)
      const backendOrders = JSON.parse(localStorage.getItem('backendOrders') || '[]');
      const backendOrder = backendOrders.find((o: any) => o.id === orderId.toUpperCase());
      
      if (backendOrder && foundOrder) {
        // Merge backend updates with local order data
        foundOrder = {
          ...foundOrder,
          assignedEmployee: backendOrder.assignedEmployee || foundOrder.assignedEmployee,
          estimatedDelivery: backendOrder.estimatedDelivery || foundOrder.estimatedDelivery,
          status: backendOrder.status || foundOrder.status,
          currentLocation: backendOrder.currentLocation || foundOrder.currentLocation
        };
      }
      
      if (foundOrder) {
        setOrderStatus(foundOrder);
        // Initialize map after a short delay to ensure DOM is ready
        setTimeout(() => {
          initializeMap();
        }, 500);
      } else {
        setError('Order not found. Please check your order ID and try again.');
      }
      setLoading(false);
    }, 1500);
  };

  // Initialize map
  const initializeMap = () => {
    if (!orderStatus || !mapRef.current) {
      console.log('Map initialization failed: missing orderStatus or mapRef');
      return;
    }

    // Clear existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const container = mapRef.current;
    
    container.style.height = '450px';
    container.style.width = '100%';
    container.style.border = '2px solid #e5e7eb';
    container.style.borderRadius = '12px';
    container.style.backgroundColor = '#f9fafb';

    try {
      // Force map to initialize on the container directly
      const map = L.map(container, {
        center: [orderStatus.coordinates.lat, orderStatus.coordinates.lng],
        zoom: 13,
        zoomControl: true,
        attributionControl: true
      }).setView([orderStatus.coordinates.lat, orderStatus.coordinates.lng], 13);
      
      console.log('Map initialized successfully', [orderStatus.coordinates.lat, orderStatus.coordinates.lng]);

      // Add real OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      // Create custom icons
      const deliveryIcon = L.divIcon({
        html: '<div style="background: #10b981; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold;">📍</div>',
        iconSize: [30, 30],
        className: 'custom-div-icon'
      });

      const driverIcon = L.divIcon({
        html: '<div style="background: #3b82f6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold;">🚚</div>',
        iconSize: [30, 30],
        className: 'custom-div-icon'
      });

      // Add delivery marker
      L.marker([orderStatus.coordinates.lat, orderStatus.coordinates.lng], { icon: deliveryIcon })
        .addTo(map)
        .bindPopup(`<b>Delivery Location</b><br>${orderStatus.deliveryAddress}`);

      // Add driver and route if available
      if (orderStatus.assignedEmployee?.currentLocation) {
        const driverLoc = orderStatus.assignedEmployee.currentLocation;
        
        // Add driver marker
        L.marker([driverLoc.lat, driverLoc.lng], { icon: driverIcon })
          .addTo(map)
          .bindPopup(`<b>Driver: ${orderStatus.assignedEmployee.name}</b><br>📱 ${orderStatus.assignedEmployee.phone}`);

        // Create route
        const routePoints: [number, number][] = [
          [driverLoc.lat, driverLoc.lng],
          [driverLoc.lat + 0.01, driverLoc.lng + 0.01],
          [orderStatus.coordinates.lat - 0.01, orderStatus.coordinates.lng - 0.01],
          [orderStatus.coordinates.lat, orderStatus.coordinates.lng]
        ];
        
        // Add route line
        L.polyline(routePoints, {
          color: '#3b82f6',
          weight: 5,
          opacity: 0.8,
          smoothFactor: 1
        }).addTo(map);

        // Fit map to show route
        const bounds = L.latLngBounds(routePoints);
        map.fitBounds(bounds, { padding: [50, 50] });
      }

      mapInstanceRef.current = map;
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'processing': return 'text-blue-600';
      case 'shipped': return 'text-purple-600';
      case 'delivered': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100';
      case 'processing': return 'bg-blue-100';
      case 'shipped': return 'bg-purple-100';
      case 'delivered': return 'bg-green-100';
      case 'cancelled': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'processing': return Package;
      case 'shipped': return Truck;
      case 'delivered': return CheckCircle;
      case 'cancelled': return AlertCircle;
      default: return Package;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-pink-50 to-orange-50">
      {/* Premium Navigation */}
      <motion.header 
        className="nav-glass shadow-medium fixed top-0 left-0 right-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl lg:text-2xl font-bold text-gray-800">
                Smart Logistics
              </span>
            </motion.div>

            <nav className="hidden md:flex items-center space-x-8">
              {['Home', 'Customer Portal', 'Employee Portal'].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    to={item === 'Home' ? '/' : item === 'Customer Portal' ? '/customer' : '/employee'}
                    className="relative text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/"
                  className="premium-button-secondary text-sm px-6 py-2.5"
                >
                  Back to Home
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Professional Background with Color Transition */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 hero-gradient-bg opacity-20 animate-gradient"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl animate-pulse-slow transform -translate-x-1/2" style={{ animationDelay: '4s' }}></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative z-10 bg-white/85 backdrop-blur-md rounded-3xl p-8 lg:p-12 shadow-large border border-white/50">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/50 rounded-full shadow-soft mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">AI-Powered Order Tracking</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="block text-gray-900 mb-2">Track Your</span>
                <span className="block text-gray-800">Package</span>
              </h1>

              <motion.p 
                className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Real-time delivery tracking, route optimization, and intelligent logistics management
                for the modern supply chain.
              </motion.p>

              {/* Order Tracking Form */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <input
                    type="text"
                    placeholder="Enter Order ID (e.g., ORD12345)"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                    className="flex-1 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:border-primary-500 text-gray-800 placeholder-gray-500 shadow-soft"
                  />
                  <motion.button
                    onClick={handleTrackOrder}
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.05 }}
                    whileTap={{ scale: loading ? 1 : 0.95 }}
                    className="premium-button group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Tracking...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Track Order
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </motion.button>
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-100 border border-red-200 rounded-xl text-red-700 flex items-center"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </motion.div>
              )}

              <div className="mt-6 text-sm text-gray-600">
                <p className="mb-2">Try these sample order IDs:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['ORD12345', 'ORD67890', 'ORD11223', 'ORD003'].map((id) => (
                    <button
                      key={id}
                      onClick={() => setOrderId(id)}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-xs font-medium"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Order Status Results */}
      {orderStatus && (
        <motion.section
          className="py-20 lg:py-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="premium-card p-8 lg:p-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  <span className="premium-gradient-text">Order Details</span>
                </h2>
                <p className="text-gray-600">Real-time tracking information for your order</p>
              </div>

              {/* 🧾 Order Info */}
              <div className="space-y-6 mb-8">
                <div className="flex items-center mb-4">
                  <Package className="w-6 h-6 text-primary-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Order Information</h3>
                </div>

                {/* Customer Notification Banner - Shows notification from delivery team */}
                {(() => {
                  // Check for notifications from backend (localStorage for demo)
                  const notifications = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
                  const orderNotifications = notifications.filter((n: any) => n.orderId === orderStatus?.id);
                  const latestNotification = orderNotifications[orderNotifications.length - 1];
                  
                  return latestNotification ? (
                    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-xl p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                        </div>
                        <div className="ml-3 flex-1">
                          <h4 className="text-sm font-semibold text-blue-900">
                            Notification from Delivery Team
                          </h4>
                          <p className="mt-1 text-sm text-blue-700">
                            {latestNotification.message}
                          </p>
                          {latestNotification.sender && (
                            <p className="mt-1 text-xs text-blue-600">
                              From: {latestNotification.sender} {latestNotification.senderPhone && `(${latestNotification.senderPhone})`}
                            </p>
                          )}
                          {latestNotification.status === 'sent' && (
                            <p className="mt-1 text-xs text-green-600 font-medium">
                              ✓ Message delivered
                            </p>
                          )}
                          <p className="mt-1 text-xs text-blue-500">
                            {new Date(latestNotification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-semibold text-gray-900">{orderStatus?.id || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Tracking Number:</span>
                      <span className="font-semibold text-gray-900">{orderStatus?.trackingNumber || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-semibold text-gray-900">{orderStatus?.customerName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-semibold text-gray-900 text-sm">{orderStatus?.deliveryAddress || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Estimated Delivery:</span>
                      <span className="font-semibold text-gray-900">{orderStatus?.estimatedDelivery || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Priority:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        orderStatus?.priority === 'premium' ? 'bg-purple-100 text-purple-700' :
                        orderStatus?.priority === 'express' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {orderStatus?.priority ? orderStatus.priority.charAt(0).toUpperCase() + orderStatus.priority.slice(1) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${orderStatus ? getStatusBg(orderStatus.status) : 'bg-gray-100'} ${orderStatus ? getStatusColor(orderStatus.status) : 'text-gray-700'}`}>
                        {orderStatus?.status ? orderStatus.status.charAt(0).toUpperCase() + orderStatus.status.slice(1) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Current Location:</span>
                      <span className="font-semibold text-gray-900">{orderStatus?.currentLocation || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* See Location Button */}
                {orderStatus && (
                  <div className="mt-6">
                    <motion.button
                      onClick={() => setShowLocation(!showLocation)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full premium-button flex items-center justify-center"
                    >
                      <MapPin className="w-5 h-5 mr-2" />
                      {showLocation ? 'Hide Location' : 'See Location'}
                    </motion.button>
                  </div>
                )}

                {/* Assigned Employee Info */}
                {orderStatus?.assignedEmployee && (
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <Truck className="w-5 h-5 text-primary-600 mr-2" />
                      <h4 className="font-semibold text-gray-900">Delivery Agent</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Name:</span>
                        <p className="font-medium text-gray-900">{orderStatus.assignedEmployee.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Phone:</span>
                        <p className="font-medium text-gray-900">{orderStatus.assignedEmployee.phone}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Employee ID:</span>
                        <p className="font-medium text-gray-900">{orderStatus.assignedEmployee.id}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions Section */}
                {orderStatus && (
                  <div className="mt-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                    <div className="flex items-center mb-4">
                      <Clock className="w-5 h-5 text-orange-600 mr-2" />
                      <h4 className="font-semibold text-gray-900">Actions</h4>
                    </div>
                    
                    {(() => {
                      const actionsAllowed = canPerformActions(orderStatus);
                      return actionsAllowed ? (
                        <div className="flex flex-wrap gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
                            onClick={() => {
                              // TODO: Connect to backend API for rescheduling
                              console.log('Reschedule delivery for', orderStatus.id);
                            }}
                          >
                            Reschedule delivery
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm"
                            onClick={() => {
                              // TODO: Connect to backend API for address update
                              console.log('Update address for', orderStatus.id);
                            }}
                          >
                            Update address
                          </motion.button>
                        </div>
                      ) : (
                        <div className="p-4 bg-orange-100 rounded-lg">
                          <p className="text-orange-800 font-medium text-sm">
                            This action is not possible within 45 minutes of delivery.
                          </p>
                          <p className="text-orange-600 text-xs mt-1">
                            Estimated delivery: {orderStatus.estimatedDelivery}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* 🗺️ Map Section */}
              {showLocation && orderStatus && (
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <Map className="w-6 h-6 text-primary-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">Live Tracking</h3>
                  </div>
                
                  <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                    {/* Map Section */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Interactive Map</h4>
                      <div 
                        ref={mapRef} 
                        className="rounded-lg overflow-hidden"
                        style={{ 
                          height: '450px', 
                          width: '100%', 
                          backgroundColor: '#f9fafb',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          position: 'relative'
                        }}
                      >
                        {/* Real OpenStreetMap will be rendered here */}
                      </div>
                    </div>
                    
                    {orderStatus?.assignedEmployee?.currentLocation && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center mb-3">
                          <Route className="w-5 h-5 text-blue-600 mr-2" />
                          <h4 className="font-semibold text-gray-900">Route Information</h4>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            <strong>Delivery Route:</strong> {orderStatus.currentLocation} → {orderStatus.deliveryAddress}
                          </p>
                          <div className="space-y-1">
                            <div className="flex items-center text-xs text-gray-600">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white mr-2">1</div>
                              <span>Warehouse - Starting Point</span>
                              <span className="ml-auto">8:00 AM</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white mr-2">2</div>
                              <span>Highway Junction</span>
                              <span className="ml-auto">8:30 AM</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white mr-2">3</div>
                              <span>City Center Checkpoint</span>
                              <span className="ml-auto">9:15 AM</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white mr-2">4</div>
                              <span>Local Distribution Hub</span>
                              <span className="ml-auto">9:45 AM</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white mr-2">5</div>
                              <span>Final Destination - {orderStatus.deliveryAddress.split(',')[0]}</span>
                              <span className="ml-auto">10:30 AM</span>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mt-2">
                            <Navigation className="w-4 h-4 mr-1" />
                            <span>Real-time tracking enabled • 5 checkpoints • 2.5 hours total</span>
                          </div>
                        </div>

                        {/* AI Analysis Button */}
                        <div className="mt-4">
                          <motion.button
                            onClick={() => setShowAIAnalysis(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center"
                          >
                            <Brain className="w-5 h-5 mr-2" />
                            AI Analysis
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 📦 Items Information */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Package className="w-6 h-6 text-primary-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Order Items</h3>
                </div>
                
                <div className="space-y-3">
                  {orderStatus?.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-primary-600 mr-3" />
                        <span className="font-medium text-gray-900">{item.name}</span>
                      </div>
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ⏰ Timeline */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 text-primary-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Order Timeline</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-green-50 rounded-xl">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-4"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Order Placed</p>
                      <p className="text-sm text-gray-600">Order successfully placed</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                    <div className={`w-4 h-4 ${orderStatus?.status ? getStatusBg(orderStatus.status).replace('bg-', 'bg-') : 'bg-gray-300'} rounded-full mr-4`}></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Current Status</p>
                      <p className="text-sm text-gray-600">{orderStatus?.currentLocation}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <div className="w-4 h-4 bg-gray-300 rounded-full mr-4"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Estimated Delivery</p>
                      <p className="text-sm text-gray-600">{orderStatus?.estimatedDelivery}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* AI Analysis Modal */}
      {showAIAnalysis && orderStatus && (() => {
        const aiData = generateAIAnalysis(orderStatus);
        return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAIAnalysis(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-purple-600" />
                AI Analysis for {orderStatus.id}
              </h2>
              <button
                onClick={() => setShowAIAnalysis(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Weather Conditions */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center mb-3">
                <Cloud className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Weather Conditions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Temperature</span>
                  <span className="font-semibold text-gray-900">{aiData.weather.temperature}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Humidity</span>
                  <span className="font-semibold text-gray-900">{aiData.weather.humidity}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Wind Speed</span>
                  <span className="font-semibold text-gray-900">{aiData.weather.windSpeed}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Visibility</span>
                  <span className="font-semibold text-gray-900">{aiData.weather.visibility}</span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-yellow-100 rounded-lg flex items-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">{aiData.weather.condition}</span>
              </div>
            </div>

            {/* Route Analysis */}
            <div className="mb-6 p-4 bg-green-50 rounded-xl">
              <div className="flex items-center mb-3">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Route Analysis</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Minimum Time</span>
                  <span className="font-semibold text-green-600">{aiData.route.minTime}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Maximum Time</span>
                  <span className="font-semibold text-orange-600">{aiData.route.maxTime}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Current Traffic</span>
                  <span className="font-semibold text-yellow-600">{aiData.route.traffic}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Route Efficiency</span>
                  <span className="font-semibold text-blue-600">{aiData.route.efficiency}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Distance</span>
                  <span className="font-semibold text-gray-900">{aiData.route.distance}</span>
                </div>
              </div>
            </div>

          </motion.div>
        </motion.div>
        );
      })()}
    </div>
  );
};

export default CustomerPortal;
