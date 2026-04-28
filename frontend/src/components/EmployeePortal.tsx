import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Package, 
  Clock, 
  Truck, 
  Map, 
  Cloud,
  AlertTriangle,
  UserCheck,
  X,
  CheckCircle,
  AlertCircle,
  Star,
  ArrowRight,
  Phone,
  RefreshCw,
  Zap,
  BarChart3,
  Activity
} from 'lucide-react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  status: string;
  currentLocation: { lat: number; lng: number };
  vehicleType: string;
  maxOrders: number;
  currentOrders: number;
  onBreak: boolean;
  skills: string[];
  rating: number;
  orders?: Order[];
  notifications: Notification[];
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  coordinates: { lat: number; lng: number };
  assignedEmployeeId: string;
  status: string;
  priority: string;
  orderTime: string;
  estimatedDeliveryTime: string;
  actualDeliveryTime: string | null;
  delayStatus: string;
  delayReason: string | null;
  weatherImpact: boolean;
  trafficImpact: boolean;
  items: Array<{ name: string; weight: string; dimensions: string }>;
  value: number;
  paymentMethod: string;
  pickupAddress: string;
  customerAbsence: boolean;
  absenceHistory: Array<{
    date: string;
    reason: string;
    notified: boolean;
  }>;
  routeOptimization: RouteOptimization;
  trafficZones: Array<{
    lat: number;
    lng: number;
    severity: 'low' | 'medium' | 'high';
  }>;
}

interface Notification {
  id: string;
  orderId: string;
  message: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'success';
}

interface RouteData {
  distance: number;
  duration: number;
  geometry: string;
  waypoints: Array<{ lat: number; lng: number }>;
}

interface RouteOptimization {
  mainRoute: RouteData;
  optimizedRoute: RouteData;
  isOptimized: boolean;
}

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  forecast?: Array<{ time: string; temp: number; condition: string }>;
}

interface Recommendation {
  type: string;
  action: string;
  priority: string;
  description: string;
}

const EmployeePortal: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [selectedOrderForWorkspace, setSelectedOrderForWorkspace] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [useLocalSimulation, setUseLocalSimulation] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const workspaceMapRef = useRef<HTMLDivElement>(null);
  const workspaceMapInstanceRef = useRef<L.Map | null>(null);

  // Enhanced mock data with new fields
  const mockEmployees: Employee[] = [
    {
      id: 'EMP001',
      name: 'Rajesh Kumar',
      email: 'rajesh.k@smartlogistics.com',
      phone: '+91-9876543210',
      password: 'password123',
      status: 'active',
      currentLocation: { lat: 28.6692, lng: 77.4538 },
      vehicleType: 'motorcycle',
      maxOrders: 8,
      currentOrders: 4,
      onBreak: false,
      skills: ['express', 'standard'],
      rating: 4.8,
      notifications: []
    },
    {
      id: 'EMP002',
      name: 'Priya Sharma',
      email: 'priya.s@smartlogistics.com',
      phone: '+91-9876543211',
      password: 'password123',
      status: 'active',
      currentLocation: { lat: 28.6139, lng: 77.2090 },
      vehicleType: 'van',
      maxOrders: 5,
      currentOrders: 2,
      onBreak: false,
      skills: ['standard', 'bulk'],
      rating: 4.6,
      notifications: []
    },
    {
      id: 'EMP003',
      name: 'Amit Patel',
      email: 'amit.p@smartlogistics.com',
      phone: '+91-9876543212',
      password: 'password123',
      status: 'active',
      currentLocation: { lat: 28.5355, lng: 77.3910 },
      vehicleType: 'motorcycle',
      maxOrders: 8,
      currentOrders: 6,
      onBreak: true,
      skills: ['express'],
      rating: 4.9,
      notifications: []
    },
    {
      id: 'EMP004',
      name: 'Pakhi Dubey',
      email: 'pakhi.d@smartlogistics.com',
      phone: '+917380729261',
      password: 'password1234',
      status: 'active',
      currentLocation: { lat: 28.6082, lng: 77.3689 },
      vehicleType: 'motorcycle',
      maxOrders: 10,
      currentOrders: 1,
      onBreak: false,
      skills: ['express', 'standard', 'bulk'],
      rating: 4.9,
      notifications: []
    }
  ];

  const mockOrders: Order[] = [
    {
      id: 'ORD003',
      customerId: 'CUST003',
      customerName: 'Riddhi Bose',
      customerPhone: '+919205413301',
      address: 'ABES Engineering College, NH-24 Highway, Ghaziabad, Uttar Pradesh 201009',
      coordinates: { lat: 28.6789, lng: 77.4567 },
      assignedEmployeeId: 'EMP004',
      status: 'in_transit',
      priority: 'express',
      orderTime: new Date('2026-04-26T14:00:00').toISOString(),
      estimatedDeliveryTime: new Date('2026-04-26T16:30:00').toISOString(),
      actualDeliveryTime: null,
      delayStatus: 'delayed',
      delayReason: 'Heavy traffic congestion on NH-24 near Ghaziabad',
      weatherImpact: false,
      trafficImpact: true,
      items: [{ name: 'Priority Documents', weight: '0.5kg', dimensions: '25x20x5cm' }],
      value: 2500,
      paymentMethod: 'cod',
      pickupAddress: 'Gaur City Mall, Greater Noida, Uttar Pradesh 201308',
      customerAbsence: true,
      absenceHistory: [
        { date: '2026-04-25', reason: 'Customer not available at delivery address', notified: false },
        { date: '2026-04-24', reason: 'Customer requested delayed delivery', notified: true }
      ],
      routeOptimization: {
        mainRoute: {
          distance: 18.5,
          duration: 65,
          geometry: 'main_route_polyline_3',
          waypoints: [
            { lat: 28.6082, lng: 77.3689 },
            { lat: 28.6789, lng: 77.4567 }
          ]
        },
        optimizedRoute: {
          distance: 22.1,
          duration: 78,
          geometry: 'optimized_route_polyline_3',
          waypoints: [
            { lat: 28.6082, lng: 77.3689 },
            { lat: 28.6350, lng: 77.4200 },
            { lat: 28.6789, lng: 77.4567 }
          ]
        },
        isOptimized: false
      },
      trafficZones: [
        { lat: 28.6350, lng: 77.4200, severity: 'high' },
        { lat: 28.6500, lng: 77.4350, severity: 'medium' },
        { lat: 28.6600, lng: 77.4450, severity: 'high' }
      ]
    },
    {
      id: 'ORD001',
      customerId: 'CUST001',
      customerName: 'Anjali Verma',
      customerPhone: '+91-9876543201',
      address: 'Sector 62, Noida, Uttar Pradesh 201309',
      coordinates: { lat: 28.5846, lng: 77.3695 },
      assignedEmployeeId: 'EMP001',
      status: 'in_transit',
      priority: 'standard',
      orderTime: new Date('2026-04-26T09:00:00').toISOString(),
      estimatedDeliveryTime: new Date('2026-04-26T14:00:00').toISOString(),
      actualDeliveryTime: null,
      delayStatus: 'none',
      delayReason: null,
      weatherImpact: false,
      trafficImpact: true,
      items: [{ name: 'Electronics Package', weight: '2kg', dimensions: '30x20x10cm' }],
      value: 15000,
      paymentMethod: 'cod',
      pickupAddress: 'Warehouse A, Delhi',
      customerAbsence: false,
      absenceHistory: [],
      routeOptimization: {
        mainRoute: {
          distance: 15.2,
          duration: 35,
          geometry: 'main_route_polyline',
          waypoints: [
            { lat: 28.6692, lng: 77.4538 },
            { lat: 28.5846, lng: 77.3695 }
          ]
        },
        optimizedRoute: {
          distance: 14.8,
          duration: 32,
          geometry: 'optimized_route_polyline',
          waypoints: [
            { lat: 28.6692, lng: 77.4538 },
            { lat: 28.6200, lng: 77.3800 },
            { lat: 28.5846, lng: 77.3695 }
          ]
        },
        isOptimized: false
      },
      trafficZones: [
        { lat: 28.6300, lng: 77.4000, severity: 'high' },
        { lat: 28.6000, lng: 77.3800, severity: 'medium' }
      ]
    },
    {
      id: 'ORD002',
      customerId: 'CUST002',
      customerName: 'Rohit Gupta',
      customerPhone: '+91-9876543202',
      address: 'Connaught Place, New Delhi 110001',
      coordinates: { lat: 28.6304, lng: 77.2177 },
      assignedEmployeeId: 'EMP001',
      status: 'pending',
      priority: 'express',
      orderTime: new Date('2026-04-26T10:00:00').toISOString(),
      estimatedDeliveryTime: new Date('2026-04-26T13:00:00').toISOString(),
      actualDeliveryTime: null,
      delayStatus: 'delayed',
      delayReason: 'Heavy traffic on NH-24',
      weatherImpact: true,
      trafficImpact: false,
      items: [{ name: 'Documents', weight: '0.5kg', dimensions: '25x20x5cm' }],
      value: 5000,
      paymentMethod: 'prepaid',
      pickupAddress: 'Office Complex, Gurgaon',
      customerAbsence: true,
      absenceHistory: [
        { date: '2026-04-25', reason: 'Customer not available', notified: false }
      ],
      routeOptimization: {
        mainRoute: {
          distance: 8.5,
          duration: 45,
          geometry: 'main_route_polyline_2',
          waypoints: [
            { lat: 28.6692, lng: 77.4538 },
            { lat: 28.6304, lng: 77.2177 }
          ]
        },
        optimizedRoute: {
          distance: 9.2,
          duration: 38,
          geometry: 'optimized_route_polyline_2',
          waypoints: [
            { lat: 28.6692, lng: 77.4538 },
            { lat: 28.6500, lng: 77.3500 },
            { lat: 28.6304, lng: 77.2177 }
          ]
        },
        isOptimized: false
      },
      trafficZones: []
    },
    // Additional orders for Overloaded Employee Scenario (EMP002)
    {
      id: 'ORD004',
      customerId: 'CUST004',
      customerName: 'Vikram Singh',
      customerPhone: '+91-9876543204',
      address: 'Sector 18, Noida, Uttar Pradesh 201301',
      coordinates: { lat: 28.5708, lng: 77.3261 },
      assignedEmployeeId: 'EMP001',
      status: 'in_transit',
      priority: 'standard',
      orderTime: new Date('2026-04-26T08:00:00').toISOString(),
      estimatedDeliveryTime: new Date('2026-04-26T12:00:00').toISOString(),
      actualDeliveryTime: null,
      delayStatus: 'none',
      delayReason: null,
      weatherImpact: false,
      trafficImpact: false,
      items: [{ name: 'Grocery Package', weight: '3kg', dimensions: '40x30x20cm' }],
      value: 2500,
      paymentMethod: 'cod',
      pickupAddress: 'SuperMart Warehouse, Noida',
      customerAbsence: false,
      absenceHistory: [],
      routeOptimization: {
        mainRoute: { distance: 8.2, duration: 25, geometry: 'route_4_main', waypoints: [] },
        optimizedRoute: { distance: 7.8, duration: 22, geometry: 'route_4_opt', waypoints: [] },
        isOptimized: false
      },
      trafficZones: []
    },
    {
      id: 'ORD005',
      customerId: 'CUST005',
      customerName: 'Neha Gupta',
      customerPhone: '+91-9876543205',
      address: 'Greater Noida West, Uttar Pradesh 201306',
      coordinates: { lat: 28.6082, lng: 77.3689 },
      assignedEmployeeId: 'EMP002',
      status: 'pending',
      priority: 'express',
      orderTime: new Date('2026-04-26T11:00:00').toISOString(),
      estimatedDeliveryTime: new Date('2026-04-26T15:00:00').toISOString(),
      actualDeliveryTime: null,
      delayStatus: 'none',
      delayReason: null,
      weatherImpact: false,
      trafficImpact: true,
      items: [{ name: 'Smartphone', weight: '0.5kg', dimensions: '20x15x10cm' }],
      value: 45000,
      paymentMethod: 'prepaid',
      pickupAddress: 'Electronics Hub, Delhi',
      customerAbsence: false,
      absenceHistory: [],
      routeOptimization: {
        mainRoute: { distance: 12.5, duration: 35, geometry: 'route_5_main', waypoints: [] },
        optimizedRoute: { distance: 11.8, duration: 32, geometry: 'route_5_opt', waypoints: [] },
        isOptimized: false
      },
      trafficZones: [{ lat: 28.5950, lng: 77.3500, severity: 'medium' }]
    },
    {
      id: 'ORD006',
      customerId: 'CUST006',
      customerName: 'Arun Kumar',
      customerPhone: '+91-9876543206',
      address: 'Indirapuram, Ghaziabad, Uttar Pradesh 201014',
      coordinates: { lat: 28.6453, lng: 77.3545 },
      assignedEmployeeId: 'EMP002',
      status: 'in_transit',
      priority: 'standard',
      orderTime: new Date('2026-04-26T09:30:00').toISOString(),
      estimatedDeliveryTime: new Date('2026-04-26T13:30:00').toISOString(),
      actualDeliveryTime: null,
      delayStatus: 'delayed',
      delayReason: 'Vehicle breakdown - resolved',
      weatherImpact: false,
      trafficImpact: false,
      items: [{ name: 'Home Decor', weight: '5kg', dimensions: '50x40x30cm' }],
      value: 3500,
      paymentMethod: 'cod',
      pickupAddress: 'HomeStore, Ghaziabad',
      customerAbsence: false,
      absenceHistory: [],
      routeOptimization: {
        mainRoute: { distance: 6.8, duration: 20, geometry: 'route_6_main', waypoints: [] },
        optimizedRoute: { distance: 6.5, duration: 18, geometry: 'route_6_opt', waypoints: [] },
        isOptimized: false
      },
      trafficZones: []
    },
    // Additional orders for EMP003 to have 6 orders (overloaded scenario)
    {
      id: 'ORD007',
      customerId: 'CUST007',
      customerName: 'Suresh Yadav',
      customerPhone: '+91-9876543207',
      address: 'Vaishali, Ghaziabad, Uttar Pradesh 201012',
      coordinates: { lat: 28.6500, lng: 77.3400 },
      assignedEmployeeId: 'EMP003',
      status: 'in_transit',
      priority: 'express',
      orderTime: new Date('2026-04-26T09:00:00').toISOString(),
      estimatedDeliveryTime: new Date('2026-04-26T11:30:00').toISOString(),
      actualDeliveryTime: null,
      delayStatus: 'none',
      delayReason: null,
      weatherImpact: false,
      trafficImpact: false,
      items: [{ name: 'Laptop', weight: '2kg', dimensions: '35x25x5cm' }],
      value: 65000,
      paymentMethod: 'prepaid',
      pickupAddress: 'Tech Store, Delhi',
      customerAbsence: false,
      absenceHistory: [],
      routeOptimization: {
        mainRoute: { distance: 15.5, duration: 40, geometry: 'route_7_main', waypoints: [] },
        optimizedRoute: { distance: 14.8, duration: 38, geometry: 'route_7_opt', waypoints: [] },
        isOptimized: false
      },
      trafficZones: []
    },
    {
      id: 'ORD008',
      customerId: 'CUST008',
      customerName: 'Meena Sharma',
      customerPhone: '+91-9876543208',
      address: 'Raj Nagar, Ghaziabad, Uttar Pradesh 201002',
      coordinates: { lat: 28.6750, lng: 77.4350 },
      assignedEmployeeId: 'EMP003',
      status: 'pending',
      priority: 'standard',
      orderTime: new Date('2026-04-26T10:00:00').toISOString(),
      estimatedDeliveryTime: new Date('2026-04-26T14:00:00').toISOString(),
      actualDeliveryTime: null,
      delayStatus: 'none',
      delayReason: null,
      weatherImpact: false,
      trafficImpact: false,
      items: [{ name: 'Kitchen Appliances', weight: '4kg', dimensions: '40x30x25cm' }],
      value: 8500,
      paymentMethod: 'cod',
      pickupAddress: 'Home Essentials, Delhi',
      customerAbsence: false,
      absenceHistory: [],
      routeOptimization: {
        mainRoute: { distance: 12.2, duration: 32, geometry: 'route_8_main', waypoints: [] },
        optimizedRoute: { distance: 11.5, duration: 30, geometry: 'route_8_opt', waypoints: [] },
        isOptimized: false
      },
      trafficZones: []
    },
    {
      id: 'ORD009',
      customerId: 'CUST009',
      customerName: 'Ravi Kumar',
      customerPhone: '+91-9876543209',
      address: 'Crossings Republik, Ghaziabad, Uttar Pradesh 201016',
      coordinates: { lat: 28.6300, lng: 77.3200 },
      assignedEmployeeId: 'EMP003',
      status: 'in_transit',
      priority: 'express',
      orderTime: new Date('2026-04-26T08:30:00').toISOString(),
      estimatedDeliveryTime: new Date('2026-04-26T12:00:00').toISOString(),
      actualDeliveryTime: null,
      delayStatus: 'delayed',
      delayReason: 'Road construction',
      weatherImpact: false,
      trafficImpact: true,
      items: [{ name: 'Books Package', weight: '1.5kg', dimensions: '25x20x15cm' }],
      value: 1200,
      paymentMethod: 'cod',
      pickupAddress: 'Book World, Noida',
      customerAbsence: false,
      absenceHistory: [],
      routeOptimization: {
        mainRoute: { distance: 18.0, duration: 50, geometry: 'route_9_main', waypoints: [] },
        optimizedRoute: { distance: 16.5, duration: 45, geometry: 'route_9_opt', waypoints: [] },
        isOptimized: false
      },
      trafficZones: [{ lat: 28.6200, lng: 77.3100, severity: 'high' }]
    },
    {
      id: 'ORD010',
      customerId: 'CUST010',
      customerName: 'Priya Gupta',
      customerPhone: '+91-9876543210',
      address: 'Kaushambi, Ghaziabad, Uttar Pradesh 201012',
      coordinates: { lat: 28.6450, lng: 77.3250 },
      assignedEmployeeId: 'EMP003',
      status: 'pending',
      priority: 'standard',
      orderTime: new Date('2026-04-26T11:00:00').toISOString(),
      estimatedDeliveryTime: new Date('2026-04-26T15:30:00').toISOString(),
      actualDeliveryTime: null,
      delayStatus: 'none',
      delayReason: null,
      weatherImpact: false,
      trafficImpact: false,
      items: [{ name: 'Clothing Bundle', weight: '1kg', dimensions: '30x25x10cm' }],
      value: 3500,
      paymentMethod: 'prepaid',
      pickupAddress: 'Fashion Hub, Delhi',
      customerAbsence: false,
      absenceHistory: [],
      routeOptimization: {
        mainRoute: { distance: 14.5, duration: 38, geometry: 'route_10_main', waypoints: [] },
        optimizedRoute: { distance: 13.8, duration: 35, geometry: 'route_10_opt', waypoints: [] },
        isOptimized: false
      },
      trafficZones: []
    },
    {
      id: 'ORD011',
      customerId: 'CUST011',
      customerName: 'Deepak Verma',
      customerPhone: '+91-9876543211',
      address: 'Sahibabad, Ghaziabad, Uttar Pradesh 201005',
      coordinates: { lat: 28.6800, lng: 77.3800 },
      assignedEmployeeId: 'EMP003',
      status: 'in_transit',
      priority: 'express',
      orderTime: new Date('2026-04-26T09:30:00').toISOString(),
      estimatedDeliveryTime: new Date('2026-04-26T11:00:00').toISOString(),
      actualDeliveryTime: null,
      delayStatus: 'none',
      delayReason: null,
      weatherImpact: false,
      trafficImpact: false,
      items: [{ name: 'Medicines', weight: '0.5kg', dimensions: '20x15x10cm' }],
      value: 800,
      paymentMethod: 'cod',
      pickupAddress: 'Health Plus Pharmacy, Noida',
      customerAbsence: false,
      absenceHistory: [],
      routeOptimization: {
        mainRoute: { distance: 10.5, duration: 28, geometry: 'route_11_main', waypoints: [] },
        optimizedRoute: { distance: 9.8, duration: 26, geometry: 'route_11_opt', waypoints: [] },
        isOptimized: false
      },
      trafficZones: []
    },
    {
      id: 'ORD012',
      customerId: 'CUST012',
      customerName: 'Anita Sharma',
      customerPhone: '+91-9876543212',
      address: 'Vasundhara, Ghaziabad, Uttar Pradesh 201012',
      coordinates: { lat: 28.6650, lng: 77.3650 },
      assignedEmployeeId: 'EMP003',
      status: 'pending',
      priority: 'standard',
      orderTime: new Date('2026-04-26T10:30:00').toISOString(),
      estimatedDeliveryTime: new Date('2026-04-26T14:30:00').toISOString(),
      actualDeliveryTime: null,
      delayStatus: 'none',
      delayReason: null,
      weatherImpact: false,
      trafficImpact: false,
      items: [{ name: 'Grocery Items', weight: '3.5kg', dimensions: '35x25x20cm' }],
      value: 2200,
      paymentMethod: 'cod',
      pickupAddress: 'Fresh Mart, Delhi',
      customerAbsence: false,
      absenceHistory: [],
      routeOptimization: {
        mainRoute: { distance: 16.2, duration: 42, geometry: 'route_12_main', waypoints: [] },
        optimizedRoute: { distance: 15.5, duration: 40, geometry: 'route_12_opt', waypoints: [] },
        isOptimized: false
      },
      trafficZones: []
    },
    // Additional order for EMP001 to have 4 orders
    {
      id: 'ORD013',
      customerId: 'CUST013',
      customerName: 'Kiran Reddy',
      customerPhone: '+91-9876543213',
      address: 'Sector 15, Noida, Uttar Pradesh 201301',
      coordinates: { lat: 28.5900, lng: 77.3100 },
      assignedEmployeeId: 'EMP001',
      status: 'pending',
      priority: 'express',
      orderTime: new Date('2026-04-26T12:00:00').toISOString(),
      estimatedDeliveryTime: new Date('2026-04-26T16:00:00').toISOString(),
      actualDeliveryTime: null,
      delayStatus: 'none',
      delayReason: null,
      weatherImpact: false,
      trafficImpact: false,
      items: [{ name: 'Tablet Device', weight: '1kg', dimensions: '30x20x5cm' }],
      value: 25000,
      paymentMethod: 'prepaid',
      pickupAddress: 'Electronics Store, Delhi',
      customerAbsence: false,
      absenceHistory: [],
      routeOptimization: {
        mainRoute: { distance: 20.5, duration: 55, geometry: 'route_13_main', waypoints: [] },
        optimizedRoute: { distance: 19.2, duration: 52, geometry: 'route_13_opt', waypoints: [] },
        isOptimized: false
      },
      trafficZones: []
    }
  ];

  // Local simulation functions
  const simulateAuth = (employeeId: string, password: string) => {
    console.log('SimulateAuth called with:', { employeeId, password });
    console.log('Available employees:', mockEmployees.map(e => ({ id: e.id, password: e.password })));
    
    const employee = mockEmployees.find(emp => 
      emp.id === employeeId && emp.password === password
    );
    
    if (employee) {
      console.log('Employee found:', employee.name);
      // Show only orders assigned to this employee
      const employeeOrders = mockOrders.filter(order => 
        order.assignedEmployeeId === employeeId
      );
      return { 
        success: true, 
        data: { ...employee, orders: employeeOrders, notifications: [] }
      };
    }
    
    console.log('Employee not found or password mismatch');
    return { success: false, error: 'Invalid credentials - Employee ID or password is incorrect' };
  };

  const simulateOrderUpdate = (orderId: string, updates: Partial<Order>) => {
    setLocalOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    ));
    
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    ));

    if (selectedOrderForWorkspace?.id === orderId) {
      setSelectedOrderForWorkspace(prev => 
        prev ? { ...prev, ...updates } : null
      );
    }

    addNotification({
      id: `notif_${Date.now()}`,
      orderId,
      message: `Order ${orderId} updated successfully`,
      timestamp: new Date(),
      type: 'success'
    });
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const syncOrderState = (orderId: string, updates: Partial<Order>) => {
    simulateOrderUpdate(orderId, updates);
  };

  const fetchEmployeeData = useCallback(async () => {
    if (!employee) return;

    try {
      const response = await axios.get(`http://localhost:5000/api/employees/${employee.id}`);
      const employeeData = response.data.data;
      setEmployee(employeeData);
      setOrders(employeeData.orders || []);
      generateRecommendations(employeeData, employeeData.orders || []);
    } catch (err) {
      console.error('Failed to fetch employee data:', err);
    }
  }, [employee]);

  useEffect(() => {
    if (isLoggedIn && employee) {
      fetchEmployeeData();
      
      const fetchWeather = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/logistics/weather/delhi');
          setWeather(response.data.data);
        } catch (err) {
          console.error('Failed to fetch weather:', err);
        }
      };
      
      fetchWeather();
    }
  }, [isLoggedIn, employee, fetchEmployeeData]);

  const handleLogin = async () => {
    if (!employeeId.trim() || !password.trim()) {
      setError('Please enter both Employee ID and Password');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting login with:', { employeeId, password: '***' });
      
      // Try backend first
      const response = await axios.post('http://localhost:5000/api/employees/login', {
        employeeId,
        password
      });
      
      console.log('Login response:', response.data);

      if (response.data.success) {
        setEmployee(response.data.data);
        setIsLoggedIn(true);
        setUseLocalSimulation(false);
      } else {
        setError(response.data.error || 'Login failed');
      }
    } catch (err: any) {
      console.error('Backend login failed, trying local simulation:', err);
      
      // Fallback to local simulation
      const simResult = simulateAuth(employeeId, password);
      
      if (simResult.success && simResult.data) {
        setEmployee(simResult.data);
        setOrders(simResult.data.orders || []);
        setIsLoggedIn(true);
        setUseLocalSimulation(true);
        addNotification({
          id: `login_${Date.now()}`,
          orderId: '',
          message: 'Using offline mode - Backend unavailable',
          timestamp: new Date(),
          type: 'info'
        });
      } else {
        setError(simResult.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableEmployees = async (orderId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/employees/available/${orderId}`);
      setAvailableEmployees(response.data.data);
    } catch (err) {
      console.error('Failed to fetch available employees:', err);
    }
  };

  const handleReassign = async () => {
    if (!selectedOrder || !selectedEmployee) return;

    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:5000/api/orders/${selectedOrder.id}/reassign`, {
        newEmployeeId: selectedEmployee
      });

      if (response.data.success) {
        await fetchEmployeeData();
        setShowReassignModal(false);
        setSelectedOrder(null);
        setSelectedEmployee('');
        alert('Order reassigned successfully!');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reassign order');
    } finally {
      setLoading(false);
    }
  };

  const sendRealSMS = async (phoneNumber: string, message: string) => {
    try {
      // Using Fast2SMS API for India - FREE tier available
      const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
        route: 'q',
        message: message,
        language: 'english',
        flash: 0,
        numbers: phoneNumber.replace('+91', '')
      }, {
        headers: {
          'authorization': 'YOUR_FAST2SMS_API_KEY', // Replace with your actual API key
          'Content-Type': 'application/json'
        }
      });
      
      console.log('SMS sent successfully:', response.data);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Failed to send SMS:', err);
      // Fallback to console notification for demo
      return { success: false, error: err };
    }
  };

  const getRealTimeTraffic = async (origin: string, destination: string) => {
    try {
      // Using Google Maps Distance Matrix API for real-time traffic
      const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
          origins: origin,
          destinations: destination,
          mode: 'driving',
          departure_time: 'now',
          traffic_model: 'best_guess',
          key: 'YOUR_GOOGLE_MAPS_API_KEY' // Replace with your actual API key
        }
      });
      
      if (response.data.rows[0].elements[0].status === 'OK') {
        const element = response.data.rows[0].elements[0];
        return {
          distance: element.distance.text,
          duration: element.duration.text,
          durationInTraffic: element.duration_in_traffic?.text || element.duration.text,
          trafficDelay: element.duration_in_traffic ? 
            Math.round((element.duration_in_traffic.value - element.duration.value) / 60) : 0
        };
      }
      return null;
    } catch (err) {
      console.error('Failed to get traffic data:', err);
      return null;
    }
  };

  const notifyCustomer = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const currentEmployee = employee || { 
      name: 'Pakhi Dubey', 
      phone: '+917380729261',
      currentLocation: { lat: 28.6082, lng: 77.3689 }
    };
    
    // Calculate real-time traffic for accurate ETA
    const trafficData = await getRealTimeTraffic(
      'Gaur City Mall, Greater Noida',
      'ABES Engineering College, NH-24, Ghaziabad'
    );

    const eta = trafficData ? trafficData.durationInTraffic : '45-60 minutes';
    const delay = trafficData?.trafficDelay || 15;

    const smsMessage = `Hi ${order.customerName}, your delivery from Smart Logistics is on the way! Your delivery partner ${currentEmployee?.name || 'Pakhi Dubey'} (${currentEmployee?.phone || '+917380729261'}) will arrive in approximately ${eta}. Current location: ${currentEmployee?.currentLocation ? 'En route via NH-24' : 'Greater Noida area'}. Traffic delay: ~${delay} mins. Track: smartlogistics.app/tracking/${orderId}`;

    try {
      // Send real SMS
      const smsResult = await sendRealSMS(order.customerPhone, smsMessage);
      
      if (smsResult.success) {
        addNotification({
          id: `notify_${Date.now()}`,
          orderId,
          message: `SMS sent successfully to ${order.customerName} (${order.customerPhone})`,
          timestamp: new Date(),
          type: 'success'
        });
      } else {
        // For demo: Show message in notification instead
        addNotification({
          id: `notify_${Date.now()}`,
          orderId,
          message: `[DEMO MODE] SMS would be sent to ${order.customerName}: ${order.customerPhone}`,
          timestamp: new Date(),
          type: 'success'
        });
      }
      
      // Update absence history
      if (order?.customerAbsence) {
        simulateOrderUpdate(orderId, {
          customerAbsence: false,
          absenceHistory: [
            ...order.absenceHistory,
            { date: new Date().toISOString(), reason: `Customer notified by SMS at ${new Date().toLocaleTimeString()}`, notified: true }
          ]
        });
      }
      
      // Save notification to backend (localStorage) for customer to see
      const customerNotifications = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
      const notification = {
        id: `notify_${Date.now()}`,
        orderId: orderId,
        message: 'Please ensure your availability during delivery for smooth handover of your order.',
        timestamp: new Date().toISOString(),
        type: 'info',
        status: 'sent',
        sender: currentEmployee?.name || 'Pakhi Dubey',
        senderPhone: currentEmployee?.phone || '+917380729261'
      };
      customerNotifications.push(notification);
      localStorage.setItem('customerNotifications', JSON.stringify(customerNotifications));
      
      console.log('Customer notification saved to backend:', notification);
    } catch (err) {
      console.error('Failed to notify customer:', err);
      addNotification({
        id: `notify_error_${Date.now()}`,
        orderId,
        message: 'Failed to send notification. Please try again.',
        timestamp: new Date(),
        type: 'warning'
      });
    }
  };

  // AI-based smart solution functions
  const handleTrafficOptimization = (order: Order) => {
    if (order.trafficImpact && !order.routeOptimization.isOptimized) {
      const newEta = new Date(order.estimatedDeliveryTime);
      newEta.setMinutes(newEta.getMinutes() - 15); // Reduce ETA by 15 minutes
      
      simulateOrderUpdate(order.id, {
        routeOptimization: {
          ...order.routeOptimization,
          isOptimized: true
        },
        estimatedDeliveryTime: newEta.toISOString(),
        delayStatus: 'none',
        delayReason: null
      });
      
      addNotification({
        id: `traffic_${Date.now()}`,
        orderId: order.id,
        message: `Route optimized for ${order.id} - ETA reduced by 15 minutes`,
        timestamp: new Date(),
        type: 'success'
      });
    }
  };

  const handleWeatherImpact = (order: Order) => {
    if (order.weatherImpact) {
      const newEta = new Date(order.estimatedDeliveryTime);
      newEta.setMinutes(newEta.getMinutes() + 30); // Increase ETA by 30 minutes
      
      simulateOrderUpdate(order.id, {
        estimatedDeliveryTime: newEta.toISOString(),
        delayStatus: 'delayed',
        delayReason: 'Adverse weather conditions'
      });
      
      addNotification({
        id: `weather_${Date.now()}`,
        orderId: order.id,
        message: `Weather impact handled for ${order.id} - Route adjusted`,
        timestamp: new Date(),
        type: 'warning'
      });
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (loc1: { lat: number; lng: number }, loc2: { lat: number; lng: number }): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Find best nearby employee for reassignment
  const findBestNearbyEmployee = (order: Order, currentEmployee: Employee): Employee | null => {
    const candidates = mockEmployees.filter(emp => 
      emp.id !== currentEmployee.id && 
      emp.status === 'active' && 
      !emp.onBreak && 
      emp.currentOrders < emp.maxOrders &&
      emp.skills.includes(order.priority)
    );
    
    if (candidates.length === 0) return null;
    
    // Sort by distance to order location
    const sorted = candidates.map(emp => ({
      employee: emp,
      distance: calculateDistance(emp.currentLocation, order.coordinates)
    })).sort((a, b) => a.distance - b.distance);
    
    return sorted[0]?.employee || null;
  };

  // Get reassignment recommendation with reason
  const getReassignmentRecommendation = (order: Order, employee: Employee): { 
    recommendedEmployee: Employee | null; 
    reason: string;
    timeSaved: number;
  } | null => {
    const recommendedEmployee = findBestNearbyEmployee(order, employee);
    if (!recommendedEmployee) return null;
    
    const currentDistance = calculateDistance(employee.currentLocation, order.coordinates);
    const newDistance = calculateDistance(recommendedEmployee.currentLocation, order.coordinates);
    const timeSaved = Math.round((currentDistance - newDistance) / 0.5); // assuming 0.5 km/min avg speed
    
    let reason = '';
    if (employee.currentOrders > 5) {
      reason = `Employee overloaded (${employee.currentOrders} orders). ${recommendedEmployee.name} is closer and can deliver ${timeSaved > 0 ? timeSaved + ' min faster' : 'efficiently'}.`;
    } else if (employee.onBreak) {
      reason = `Employee on break. ${recommendedEmployee.name} is available and nearby.`;
    } else if (timeSaved > 5) {
      reason = `${recommendedEmployee.name} can complete delivery ${timeSaved} minutes faster due to better proximity.`;
    } else {
      return null;
    }
    
    return { recommendedEmployee, reason, timeSaved };
  };

  const handleOverloadReassignment = (order: Order, employee: Employee, targetEmployee?: Employee) => {
    const recommendation = getReassignmentRecommendation(order, employee);
    const newEmployee = targetEmployee || recommendation?.recommendedEmployee;
    
    if (newEmployee) {
      // Update order assignment
      simulateOrderUpdate(order.id, {
        assignedEmployeeId: newEmployee.id
      });
      
      // Update employee order counts
      const updatedCurrentEmployee = { ...employee, currentOrders: employee.currentOrders - 1 };
      setEmployee(updatedCurrentEmployee);
      
      // Update target employee count in mockEmployees
      const targetEmpIndex = mockEmployees.findIndex(emp => emp.id === newEmployee.id);
      if (targetEmpIndex !== -1) {
        mockEmployees[targetEmpIndex].currentOrders += 1;
      }
      
      // Save updated order to backend (localStorage) for CustomerPortal to see
      const backendOrders = JSON.parse(localStorage.getItem('backendOrders') || '[]');
      const existingIndex = backendOrders.findIndex((o: any) => o.id === order.id);
      const updatedOrder = {
        id: order.id,
        assignedEmployee: {
          id: newEmployee.id,
          name: newEmployee.name,
          phone: newEmployee.phone
        },
        estimatedDelivery: order.estimatedDeliveryTime ? new Date(order.estimatedDeliveryTime).toLocaleString() : 'N/A',
        status: order.status
      };
      if (existingIndex >= 0) {
        backendOrders[existingIndex] = { ...backendOrders[existingIndex], ...updatedOrder };
      } else {
        backendOrders.push(updatedOrder);
      }
      localStorage.setItem('backendOrders', JSON.stringify(backendOrders));
      
      // Add notification for employee
      addNotification({
        id: `reassign_${Date.now()}`,
        orderId: order.id,
        message: `Order ${order.id} reassigned from ${employee.name} to ${newEmployee.name}`,
        timestamp: new Date(),
        type: 'info'
      });
      
      // Save notification for customer about reassignment
      const customerNotifications = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
      customerNotifications.push({
        id: `reassign_customer_${Date.now()}`,
        orderId: order.id,
        message: `Your order has been reassigned to a new delivery agent: ${newEmployee.name} (Phone: ${newEmployee.phone}). ${recommendation?.reason || 'This change optimizes delivery time.'}`,
        timestamp: new Date().toISOString(),
        type: 'info',
        sender: newEmployee.name,
        senderPhone: newEmployee.phone,
        status: 'sent'
      });
      localStorage.setItem('customerNotifications', JSON.stringify(customerNotifications));
      
      return true;
    }
    return false;
  };

  const handleBreakCondition = (employee: Employee) => {
    if (employee.onBreak) {
      addNotification({
        id: `break_${Date.now()}`,
        orderId: '',
        message: `Employee ${employee.name} is on break - Orders will be redistributed`,
        timestamp: new Date(),
        type: 'warning'
      });
      
      // Redistribute orders to other employees
      const employeeOrders = orders.filter(order => order.assignedEmployeeId === employee.id);
      employeeOrders.forEach(order => {
        handleOverloadReassignment(order, employee);
      });
    }
  };

  const openOrderWorkspace = (order: Order) => {
    setSelectedOrderForWorkspace(order);
    setShowWorkspaceModal(true);
  };

  const closeOrderWorkspace = () => {
    setShowWorkspaceModal(false);
    setSelectedOrderForWorkspace(null);
    
    // Clean up workspace map
    if (workspaceMapInstanceRef.current) {
      workspaceMapInstanceRef.current.remove();
      workspaceMapInstanceRef.current = null;
    }
  };

  const generateRecommendations = (employee: Employee, orders: Order[]) => {
    const recs: Recommendation[] = [];

    // Check for overload
    if (orders.length >= employee.maxOrders) {
      recs.push({
        type: 'overload',
        action: 'Reassign orders',
        priority: 'high',
        description: 'Employee is overloaded. Consider reassigning some orders to optimize delivery times.'
      });
    }

    // Check for weather-impacted orders
    const weatherImpactedOrders = orders.filter(order => order.weatherImpact);
    if (weatherImpactedOrders.length > 0) {
      recs.push({
        type: 'weather',
        action: 'Delay or reroute',
        priority: 'high',
        description: 'Weather conditions are impacting deliveries. Consider delaying or rerouting affected orders.'
      });
    }

    // Check for traffic-impacted orders
    const trafficImpactedOrders = orders.filter(order => order.trafficImpact);
    if (trafficImpactedOrders.length > 0) {
      recs.push({
        type: 'traffic',
        action: 'Optimize routes',
        priority: 'medium',
        description: 'Heavy traffic detected. Consider optimizing routes to avoid congestion.'
      });
    }

    setRecommendations(recs);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'status-on-time';
      case 'in_transit': return 'status-in-progress';
      case 'delayed': return 'status-delayed';
      case 'pending': return 'status-in-progress';
      default: return 'status-in-progress';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (employee && orders.length > 0 && mapRef.current && !mapInstanceRef.current) {
      // Initialize map centered on employee location
      const map = L.map(mapRef.current).setView([employee.currentLocation.lat, employee.currentLocation.lng], 12);
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add employee location marker
      const employeeIcon = L.divIcon({
        html: '🚚',
        iconSize: [30, 30],
        className: 'custom-div-icon'
      });
      
      L.marker([employee.currentLocation.lat, employee.currentLocation.lng], { icon: employeeIcon })
        .addTo(map)
        .bindPopup(`<b>Your Location</b><br>${employee.name}`)
        .openPopup();

      // Add routes and markers for all assigned orders
      orders.forEach((order, index) => {
        // Draw route line from pickup to delivery using routeOptimization waypoints
        const routeWaypoints = order.routeOptimization?.mainRoute?.waypoints || [];
        if (routeWaypoints.length >= 2) {
          const routeCoordinates = routeWaypoints.map((wp: { lat: number; lng: number }) => [wp.lat, wp.lng]);
          
          const routeColor = '#3b82f6'; // Blue for all routes
          
          (L.polyline as any)(routeCoordinates, {
            color: routeColor,
            weight: 4,
            opacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);
          
          // Add pickup marker
          const pickupIcon = L.divIcon({
            html: '📍',
            iconSize: [25, 25],
            className: 'custom-div-icon'
          });
          
          const pickupPoint = routeWaypoints[0];
          L.marker([pickupPoint.lat, pickupPoint.lng], { icon: pickupIcon })
            .addTo(map)
            .bindPopup(`<b>Pickup: ${order.id}</b><br>${order.pickupAddress}`);
          
          // Add delivery marker
          const deliveryIcon = L.divIcon({
            html: order.priority === 'express' ? '⚡' : '📦',
            iconSize: [30, 30],
            className: 'custom-div-icon'
          });
          
          const deliveryPoint = routeWaypoints[routeWaypoints.length - 1];
          L.marker([deliveryPoint.lat, deliveryPoint.lng], { icon: deliveryIcon })
            .addTo(map)
            .bindPopup(`
              <b>${order.id}</b><br>
              Customer: ${order.customerName}<br>
              Status: ${order.status.replace('_', ' ').toUpperCase()}<br>
              Priority: ${order.priority.toUpperCase()}<br>
              Address: ${order.address}
            `);
        } else {
          // Fallback: draw direct line from employee to order
          const routeCoordinates = [
            [employee.currentLocation.lat, employee.currentLocation.lng],
            [order.coordinates.lat, order.coordinates.lng]
          ];
          
          const routeColor = '#3b82f6'; // Blue for all routes
          
          (L.polyline as any)(routeCoordinates, {
            color: routeColor,
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
          }).addTo(map);
          
          // Add order marker
          const orderIcon = L.divIcon({
            html: order.priority === 'express' ? '⚡' : '📦',
            iconSize: [30, 30],
            className: 'custom-div-icon'
          });
          
          L.marker([order.coordinates.lat, order.coordinates.lng], { icon: orderIcon })
            .addTo(map)
            .bindPopup(`
              <b>${order.id}</b><br>
              Customer: ${order.customerName}<br>
              Status: ${order.status.replace('_', ' ').toUpperCase()}<br>
              Priority: ${order.priority.toUpperCase()}<br>
              Address: ${order.address}
            `);
        }
      });

      mapInstanceRef.current = map;

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, [employee, orders]);

  // Workspace map initialization
  useEffect(() => {
    if (showWorkspaceModal && selectedOrderForWorkspace && employee && workspaceMapRef.current && !workspaceMapInstanceRef.current) {
      // Initialize map centered on the selected order route
      const map = L.map(workspaceMapRef.current).setView([
        (employee.currentLocation.lat + selectedOrderForWorkspace.coordinates.lat) / 2,
        (employee.currentLocation.lng + selectedOrderForWorkspace.coordinates.lng) / 2
      ], 11);
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add employee location marker
      const employeeIcon = L.divIcon({
        html: '🚚',
        iconSize: [30, 30],
        className: 'custom-div-icon'
      });
      
      L.marker([employee.currentLocation.lat, employee.currentLocation.lng], { icon: employeeIcon })
        .addTo(map)
        .bindPopup(`<b>Your Location</b><br>${employee.name}`);

      // Add order location marker
      const orderIcon = L.divIcon({
        html: selectedOrderForWorkspace.priority === 'express' ? '⚡' : '📦',
        iconSize: [30, 30],
        className: 'custom-div-icon'
      });
      
      L.marker([selectedOrderForWorkspace.coordinates.lat, selectedOrderForWorkspace.coordinates.lng], { icon: orderIcon })
        .addTo(map)
        .bindPopup(`
          <b>${selectedOrderForWorkspace.id}</b><br>
          Customer: ${selectedOrderForWorkspace.customerName}<br>
          Status: ${selectedOrderForWorkspace.status.replace('_', ' ').toUpperCase()}
        `);

      // Draw main route (blue)
      const mainRouteCoords = selectedOrderForWorkspace.routeOptimization.mainRoute.waypoints;
      (L.polyline as any)(mainRouteCoords, {
        color: 'blue',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(map);

      // Draw optimized route (green) if available
      if (selectedOrderForWorkspace.routeOptimization.isOptimized) {
        const optimizedRouteCoords = selectedOrderForWorkspace.routeOptimization.optimizedRoute.waypoints;
        (L.polyline as any)(optimizedRouteCoords, {
          color: 'green',
          weight: 4,
          opacity: 0.7,
          dashArray: '5, 5'
        }).addTo(map);
      }

      // Add traffic zones (red circles)
      selectedOrderForWorkspace.trafficZones.forEach(zone => {
        L.circle([zone.lat, zone.lng], {
          color: 'red',
          fillColor: '#ff0000',
          fillOpacity: zone.severity === 'high' ? 0.4 : zone.severity === 'medium' ? 0.3 : 0.2,
          radius: zone.severity === 'high' ? 1000 : zone.severity === 'medium' ? 800 : 500
        }).addTo(map).bindPopup('Traffic Zone');
      });

      workspaceMapInstanceRef.current = map;
    }

    return () => {
      if (workspaceMapInstanceRef.current && !showWorkspaceModal) {
        workspaceMapInstanceRef.current.remove();
        workspaceMapInstanceRef.current = null;
      }
    };
  }, [showWorkspaceModal, selectedOrderForWorkspace, employee]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 via-pink-50 to-orange-50">
        {/* Navigation */}
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="nav-glass shadow-medium fixed top-0 left-0 right-0 z-50"
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
                    to="/customer" 
                    className="premium-button-secondary text-sm px-6 py-2.5"
                  >
                    Track Order
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/employee" 
                    className="premium-button text-sm px-6 py-2.5"
                  >
                    Employee Portal
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section with Animated Background */}
        <section className="relative min-h-[480px] flex items-center justify-center overflow-hidden pt-20 pb-8">
          {/* Professional Background with Color Transition */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 hero-gradient-bg opacity-20 animate-gradient"></div>
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
              <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl animate-pulse-slow transform -translate-x-1/2" style={{ animationDelay: '4s' }}></div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-lg px-4"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Login</h2>
                <p className="text-gray-600">Access your delivery dashboard</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="Enter your Employee ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center"
                  >
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin} 
                  disabled={loading} 
                  className="premium-button w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-5 h-5 mr-2" />
                      Login
                    </>
                  )}
                </motion.button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-3">Demo Login Credentials:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">EMP001-EMP003:</span>
                    <code className="bg-gray-200 px-2 py-0.5 rounded text-xs">password123</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">EMP004 (Pakhi Dubey):</span>
                    <code className="bg-blue-100 px-2 py-0.5 rounded text-xs">password1234</code>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {mockEmployees.map((emp) => (
                    <motion.button
                      key={emp.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEmployeeId(emp.id);
                        setPassword(emp.password || '');
                      }}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-blue-50 hover:border-blue-300 transition-all"
                      title={`${emp.name} - ${emp.password}`}
                    >
                      {emp.id}
                    </motion.button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Click any ID to auto-fill credentials</p>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-pink-50 to-orange-50">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="nav-glass shadow-medium fixed top-0 left-0 right-0 z-50"
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
              {/* Notifications */}
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="relative">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </div>
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && notifications.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-12 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
                  >
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">Notifications</h4>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {notifications.slice(0, 5).map((notif) => (
                        <div key={notif.id} className="p-3 hover:bg-gray-50">
                          <div className="flex items-start">
                            <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                              notif.type === 'success' ? 'bg-green-500' :
                              notif.type === 'warning' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notif.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/customer" 
                  className="premium-button-secondary text-sm px-6 py-2.5"
                >
                  Track Order
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsLoggedIn(false);
                    setEmployee(null);
                    setOrders([]);
                    setEmployeeId('');
                    setPassword('');
                    setNotifications([]);
                  }}
                  className="premium-button text-sm px-6 py-2.5"
                >
                  Logout
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Employee Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-12"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mr-4">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Employee Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <UserCheck className="w-4 h-4 mr-2 text-blue-600" />
                  Personal Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Name</span>
                    <span className="font-medium text-gray-900">{employee?.name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">ID</span>
                    <span className="font-medium text-gray-900">{employee?.id}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Phone</span>
                    <span className="font-medium text-gray-900">{employee?.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Truck className="w-4 h-4 mr-2 text-green-600" />
                  Work Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Vehicle</span>
                    <span className="font-medium text-gray-900">{employee?.vehicleType}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      employee?.status === 'active' ? 'bg-green-100 text-green-700' :
                      employee?.status === 'busy' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {employee?.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">On Break</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      employee?.onBreak ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {employee?.onBreak ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2 text-purple-600" />
                  Performance
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Orders</span>
                    <span className="font-medium text-gray-900">
                      {(employee?.currentOrders || 0) > 5 ? `${employee?.currentOrders || 0} (overloaded)` : employee?.currentOrders || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Rating</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="font-medium text-gray-900">{employee?.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Skills</span>
                    <span className="font-medium text-gray-900 text-sm">{employee?.skills?.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Orders List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="py-12"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mr-4">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Assigned Orders</h2>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {orders.length} Active
                </span>
              </div>
            </div>
            
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders assigned</h3>
                <p className="text-gray-600">You'll see your assigned orders here when they become available.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {orders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border border-gray-200 rounded-xl p-6 mb-4 hover:shadow-lg transition-all cursor-pointer hover:border-primary-300"
                      onClick={() => openOrderWorkspace(order)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                              order.priority === 'express' ? 'bg-red-100' :
                              order.priority === 'premium' ? 'bg-purple-100' :
                              'bg-gray-100'
                            }`}>
                              {order.priority === 'express' ? '⚡' : 
                               order.priority === 'premium' ? '🔥' : '📦'}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{order.id}</h4>
                              <p className="text-sm text-gray-600">{order.customerName}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center text-sm">
                              <Clock className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-gray-600">Est. Delivery: </span>
                              <span className="font-medium text-gray-900 ml-1">
                                {formatDateTime(order.estimatedDeliveryTime)}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-gray-600 truncate max-w-xs">{order.address}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Package className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-gray-600">{order.items?.length || 0} items</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'delayed' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.priority === 'express' ? 'bg-red-100 text-red-700' :
                              order.priority === 'premium' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {order.priority.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openOrderWorkspace(order);
                            }}
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            title="View Details"
                          >
                            <MapPin className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              notifyCustomer(order.id);
                            }}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Notify Customer"
                          >
                            <Phone className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                              setShowReassignModal(true);
                              fetchAvailableEmployees(order.id);
                            }}
                            className="p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                            title="Reassign Order"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* Weather Information */}
        {weather && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="py-12"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mr-4">
                  <Cloud className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Weather Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">Location</span>
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{weather.location}</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{weather.temperature}°C</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">Condition</span>
                    <Cloud className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{weather.condition}</p>
                  <p className="text-sm text-gray-600 mt-2">Humidity: {weather.humidity}%</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">Wind & Visibility</span>
                    <Activity className="w-4 h-4 text-orange-600" />
                  </div>
                  <p className="text-sm text-gray-600">Wind: {weather.windSpeed} km/h</p>
                  <p className="text-sm text-gray-600 mt-1">Visibility: {weather.visibility} km</p>
                </div>
              </div>
              
              {weather.forecast && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                    Hourly Forecast
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {weather.forecast.map((hour, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex-shrink-0 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 text-center min-w-[100px]"
                      >
                        <p className="text-xs text-gray-600 mb-2">{hour.time}</p>
                        <p className="text-lg font-bold text-blue-600 mb-1">{hour.temp}°C</p>
                        <p className="text-xs text-gray-600">{hour.condition}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* Map Container */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="py-12"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mr-4">
                <Map className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Route Map</h2>
            </div>
            
            <div 
              ref={mapRef} 
              className="rounded-xl overflow-hidden relative"
              style={{ height: '400px', width: '100%', position: 'relative', zIndex: 0 }}
            >
              {(!employee || orders.length === 0) && (
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center">
                    <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Route Data</h3>
                    <p className="text-gray-600">Login and check assigned orders to see route map</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Solutions Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="py-12"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Solutions & Recommendations</h2>
            </div>
            
            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                {/* Personalized Demo Content for Each Employee - replaces 'All Systems Optimal' */}
                {employee && (
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <UserCheck className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    {(() => {
                      const personalizedContent: Record<string, { icon: string; title: string; message: string; stat: string; color: string }> = {
                        'EMP001': { 
                          icon: '🌟', 
                          title: 'Top Performer', 
                          message: 'You have maintained a 98% on-time delivery rate this month. Keep up the excellent work!', 
                          stat: '156 deliveries completed',
                          color: 'from-yellow-400 to-orange-500'
                        },
                        'EMP002': { 
                          icon: '📈', 
                          title: 'Rising Star', 
                          message: 'Your efficiency has improved by 15% this week. You are handling express orders exceptionally well.', 
                          stat: '42 express deliveries this month',
                          color: 'from-green-400 to-blue-500'
                        },
                        'EMP003': { 
                          icon: '🏆', 
                          title: 'Customer Favorite', 
                          message: 'You received 5 five-star ratings this week. Customers appreciate your professionalism!', 
                          stat: '4.9 average rating',
                          color: 'from-purple-400 to-pink-500'
                        },
                        'EMP004': { 
                          icon: '⚡', 
                          title: 'Speed Champion', 
                          message: 'Pakhi, you have the fastest average delivery time in your zone. Your route optimization skills are exceptional!', 
                          stat: 'Avg 28 min per delivery',
                          color: 'from-red-400 to-orange-500'
                        }
                      };
                      const content = personalizedContent[employee.id] || { 
                        icon: '👋', 
                        title: 'Welcome Back', 
                        message: 'Your dashboard is ready. Check your assigned orders and optimize your routes.', 
                        stat: `${employee.currentOrders} active orders`,
                        color: 'from-blue-400 to-purple-500'
                      };
                      return (
                        <div className="text-center space-y-3">
                          <div className="text-4xl mb-2">{content.icon}</div>
                          <h3 className="text-xl font-bold bg-gradient-to-r {content.color} bg-clip-text text-transparent">
                            {content.title}
                          </h3>
                          <p className="text-gray-700">{content.message}</p>
                          <div className="inline-block px-4 py-2 bg-white rounded-full shadow-sm mt-2">
                            <p className="text-sm font-semibold text-blue-600">📊 {content.stat}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`p-6 rounded-xl border-l-4 ${
                      rec.priority === 'high' 
                        ? 'bg-red-50 border-red-500' 
                        : 'bg-yellow-50 border-yellow-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          {rec.priority === 'high' ? (
                            <Zap className="w-4 h-4 mr-2 text-red-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
                          )}
                          {rec.action}
                        </h4>
                        <p className="text-gray-700 mb-3">{rec.description}</p>
                        <div className="flex items-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            rec.priority === 'high' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {rec.priority.toUpperCase()} PRIORITY
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.section>
      </div>

      {/* Reassign Modal */}
      {showReassignModal && selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowReassignModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Reassign Order</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowReassignModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            </div>

            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-900">{selectedOrder.id}</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">{selectedOrder.customerName}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Available Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Choose an employee...</option>
                {availableEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.id}) - {emp.currentOrders}/{emp.maxOrders} orders
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowReassignModal(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReassign} 
                disabled={loading || !selectedEmployee}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reassign Order
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Order Workspace Modal */}
      {showWorkspaceModal && selectedOrderForWorkspace && employee && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeOrderWorkspace}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Order Workspace - {selectedOrderForWorkspace.id}</h2>
                  <p className="text-primary-100 mt-1">{selectedOrderForWorkspace.customerName}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeOrderWorkspace}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Three-Panel Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              
              {/* Order Info Panel */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-primary-600" />
                  Order Information
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                    <p className="text-sm text-gray-600">{selectedOrderForWorkspace.customerName}</p>
                    <p className="text-sm text-gray-600">{selectedOrderForWorkspace.customerPhone}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Addresses</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Pickup:</p>
                        <p className="text-sm text-gray-700">{selectedOrderForWorkspace.pickupAddress}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Delivery:</p>
                        <p className="text-sm text-gray-700">{selectedOrderForWorkspace.address}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Delivery Timeline</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Est. Delivery:</span>
                        <span className="text-sm font-medium">{formatDateTime(selectedOrderForWorkspace.estimatedDeliveryTime)}</span>
                      </div>
                      {selectedOrderForWorkspace.delayStatus !== 'none' && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Delay:</span>
                          <span className="text-sm font-medium text-red-600">{selectedOrderForWorkspace.delayReason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedOrderForWorkspace.customerAbsence && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-medium text-orange-900 mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Customer Absence
                      </h4>
                      <p className="text-sm text-orange-700 mb-2">Customer was previously unavailable</p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => notifyCustomer(selectedOrderForWorkspace.id)}
                        className="w-full bg-orange-600 text-white rounded-lg py-2 px-4 text-sm font-medium hover:bg-orange-700 transition-colors"
                      >
                        Notify Customer
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>

              {/* Map Panel */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Map className="w-5 h-5 mr-2 text-primary-600" />
                  Route Map
                </h3>
                
                <div 
                  ref={workspaceMapRef}
                  className="bg-white rounded-lg overflow-hidden relative"
                  style={{ height: '400px', width: '100%', position: 'relative', zIndex: 1 }}
                />
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Main Route</span>
                    </div>
                    <span className="text-sm font-medium">{selectedOrderForWorkspace.routeOptimization.mainRoute.distance} km</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Optimized Route</span>
                    </div>
                    <span className="text-sm font-medium">{selectedOrderForWorkspace.routeOptimization.optimizedRoute.distance} km</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Traffic Zones</span>
                    </div>
                    <span className="text-sm font-medium">{selectedOrderForWorkspace.trafficZones.length} zones</span>
                  </div>
                </div>
              </div>

              {/* Smart Solutions Panel */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-primary-600" />
                  Smart Solutions
                </h3>
                
                <div className="space-y-4">
                  {/* Traffic Optimization */}
                  {selectedOrderForWorkspace.trafficImpact && (
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-orange-600" />
                        Traffic Detected
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Heavy traffic detected on route. Optimized route available.
                      </p>
                      {!selectedOrderForWorkspace.routeOptimization.isOptimized ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTrafficOptimization(selectedOrderForWorkspace)}
                          className="w-full bg-green-600 text-white rounded-lg py-2 px-4 text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Select Optimized Route
                        </motion.button>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                          <p className="text-sm text-green-700 font-medium">✓ Route Optimized</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Weather Impact */}
                  {selectedOrderForWorkspace.weatherImpact && (
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Cloud className="w-4 h-4 mr-2 text-blue-600" />
                        Weather Impact
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Adverse weather conditions may affect delivery time.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleWeatherImpact(selectedOrderForWorkspace)}
                        className="w-full bg-blue-600 text-white rounded-lg py-2 px-4 text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Adjust for Weather
                      </motion.button>
                    </div>
                  )}

                  {/* Reassignment Recommendation - Shows when overload, break, or faster delivery possible */}
                  {(() => {
                    const recommendation = getReassignmentRecommendation(selectedOrderForWorkspace, employee);
                    const canReassign = recommendation !== null || employee.currentOrders > 5 || employee.onBreak;
                    const rec = recommendation || (employee.currentOrders > 5 ? {
                      recommendedEmployee: findBestNearbyEmployee(selectedOrderForWorkspace, employee),
                      reason: `Employee overloaded (${employee.currentOrders} orders). Consider reassigning to optimize delivery.`,
                      timeSaved: 0
                    } : null);
                    
                    return canReassign && rec?.recommendedEmployee ? (
                      <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                          Reassign Order Recommendation
                        </h4>
                        <div className="space-y-2 mb-3">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Recommended:</span> {rec.recommendedEmployee.name} ({rec.recommendedEmployee.id})
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Reason:</span> {rec.reason}
                          </p>
                          {rec.timeSaved > 0 && (
                            <p className="text-sm text-green-600">
                              <span className="font-semibold">Time Saved:</span> {rec.timeSaved} minutes
                            </p>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => rec.recommendedEmployee && handleOverloadReassignment(selectedOrderForWorkspace, employee, rec.recommendedEmployee)}
                          className="w-full bg-orange-600 text-white rounded-lg py-2 px-4 text-sm font-medium hover:bg-orange-700 transition-colors"
                        >
                          Reassign Order to {rec.recommendedEmployee.name}
                        </motion.button>
                      </div>
                    ) : null;
                  })()}

                  {/* Notify Customer - Shows when customer has absence history */}
                  {selectedOrderForWorkspace.absenceHistory && selectedOrderForWorkspace.absenceHistory.length > 0 && (
                    <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <UserCheck className="w-4 h-4 mr-2 text-blue-600" />
                        Customer Absence History
                      </h4>
                      <div className="space-y-1 mb-3">
                        {selectedOrderForWorkspace.absenceHistory.slice(0, 2).map((absence, idx) => (
                          <p key={idx} className="text-xs text-gray-600">
                            {absence.date}: {absence.reason} {absence.notified ? '(✓ Notified)' : '(✗ Not notified)'}
                          </p>
                        ))}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          // Save notification to localStorage for customer to see
                          const customerNotifications = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
                          const newNotification = {
                            id: `notify_${Date.now()}`,
                            orderId: selectedOrderForWorkspace.id,
                            message: `Delivery team is trying to reach you. Please ensure you are available at ${selectedOrderForWorkspace.address} for order delivery.`,
                            timestamp: new Date().toISOString(),
                            type: 'info'
                          };
                          customerNotifications.push(newNotification);
                          localStorage.setItem('customerNotifications', JSON.stringify(customerNotifications));
                          
                          // Also add to employee notifications
                          addNotification({
                            id: `notify_${Date.now()}`,
                            orderId: selectedOrderForWorkspace.id,
                            message: `Customer notified for order ${selectedOrderForWorkspace.id}`,
                            timestamp: new Date(),
                            type: 'info'
                          });
                          
                          // Backend call would go here in production
                          console.log('Customer notified for order', selectedOrderForWorkspace.id);
                        }}
                        className="w-full bg-blue-600 text-white rounded-lg py-2 px-4 text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Notify Customer
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default EmployeePortal;
