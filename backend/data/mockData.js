// Mock data for Smart Logistics System

// Employees with different scenarios
const employees = [
  {
    id: 'EMP001',
    name: 'Rajesh Kumar',
    email: 'rajesh.k@smartlogistics.com',
    phone: '+91-9876543210',
    password: 'password123',
    status: 'active',
    currentLocation: { lat: 28.6692, lng: 77.4538 }, // Ghaziabad
    vehicleType: 'motorcycle',
    maxOrders: 8,
    currentOrders: 3,
    onBreak: false,
    skills: ['express', 'standard'],
    rating: 4.8
  },
  {
    id: 'EMP002',
    name: 'Priya Sharma',
    email: 'priya.s@smartlogistics.com',
    phone: '+91-9876543211',
    password: 'password123',
    status: 'active',
    currentLocation: { lat: 28.6139, lng: 77.2090 }, // Delhi
    vehicleType: 'van',
    maxOrders: 6,
    currentOrders: 6, // Overloaded employee
    onBreak: false,
    skills: ['standard', 'bulk'],
    rating: 4.6
  },
  {
    id: 'EMP003',
    name: 'Amit Patel',
    email: 'amit.p@smartlogistics.com',
    phone: '+91-9876543212',
    password: 'password123',
    status: 'active',
    currentLocation: { lat: 28.5355, lng: 77.3910 }, // Noida
    vehicleType: 'motorcycle',
    maxOrders: 8,
    currentOrders: 2,
    onBreak: true, // Employee on break
    skills: ['express'],
    rating: 4.9
  },
  {
    id: 'EMP004',
    name: 'Sunita Reddy',
    email: 'sunita.r@smartlogistics.com',
    phone: '+91-9876543213',
    password: 'password123',
    status: 'active',
    currentLocation: { lat: 28.7041, lng: 77.1025 }, // Delhi North
    vehicleType: 'van',
    maxOrders: 6,
    currentOrders: 4,
    onBreak: false,
    skills: ['standard', 'bulk'],
    rating: 4.7
  },
  {
    id: 'EMP005',
    name: 'Vikram Singh',
    email: 'vikram.s@smartlogistics.com',
    phone: '+91-9876543214',
    password: 'password123',
    status: 'active',
    currentLocation: { lat: 28.4595, lng: 77.0266 }, // Gurugram
    vehicleType: 'motorcycle',
    maxOrders: 8,
    currentOrders: 3,
    onBreak: false,
    skills: ['express', 'standard'],
    rating: 4.5
  }
];

// Orders with different scenarios
const orders = [
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
    orderTime: new Date('2026-04-26T09:00:00'),
    estimatedDeliveryTime: new Date('2026-04-26T14:00:00'),
    actualDeliveryTime: null,
    delayStatus: 'none',
    delayReason: null,
    weatherImpact: false,
    trafficImpact: false,
    items: [
      { name: 'Electronics Package', weight: '2kg', dimensions: '30x20x10cm' }
    ],
    value: 15000,
    paymentMethod: 'cod'
  },
  {
    id: 'ORD002',
    customerId: 'CUST002',
    customerName: 'Rohit Gupta',
    customerPhone: '+91-9876543202',
    address: 'Connaught Place, New Delhi 110001',
    coordinates: { lat: 28.6304, lng: 77.2177 },
    assignedEmployeeId: 'EMP002',
    status: 'in_transit',
    priority: 'express',
    orderTime: new Date('2026-04-26T10:00:00'),
    estimatedDeliveryTime: new Date('2026-04-26T13:00:00'),
    actualDeliveryTime: null,
    delayStatus: 'delayed',
    delayReason: 'Heavy traffic on NH-24',
    weatherImpact: false,
    trafficImpact: true, // Heavy traffic scenario
    items: [
      { name: 'Documents', weight: '0.5kg', dimensions: '25x20x5cm' }
    ],
    value: 5000,
    paymentMethod: 'prepaid'
  },
  {
    id: 'ORD003',
    customerId: 'CUST003',
    customerName: 'Meera Joshi',
    customerPhone: '+91-9876543203',
    address: 'Golf Course Road, Gurugram, Haryana 122002',
    coordinates: { lat: 28.4259, lng: 77.0933 },
    assignedEmployeeId: 'EMP003',
    status: 'pending',
    priority: 'standard',
    orderTime: new Date('2026-04-26T11:00:00'),
    estimatedDeliveryTime: new Date('2026-04-26T16:00:00'),
    actualDeliveryTime: null,
    delayStatus: 'delayed',
    delayReason: 'Employee on break - heavy rain',
    weatherImpact: true, // Bad weather scenario
    trafficImpact: false,
    items: [
      { name: 'Clothing Package', weight: '1.5kg', dimensions: '40x30x15cm' }
    ],
    value: 8000,
    paymentMethod: 'cod'
  },
  {
    id: 'ORD004',
    customerId: 'CUST004',
    customerName: 'Karthik Nair',
    customerPhone: '+91-9876543204',
    address: 'Indirapuram, Ghaziabad, Uttar Pradesh 201014',
    coordinates: { lat: 28.6375, lng: 77.3788 },
    assignedEmployeeId: 'EMP004',
    status: 'delivered',
    priority: 'standard',
    orderTime: new Date('2026-04-26T08:00:00'),
    estimatedDeliveryTime: new Date('2026-04-26T12:00:00'),
    actualDeliveryTime: new Date('2026-04-26T11:45:00'),
    delayStatus: 'none',
    delayReason: null,
    weatherImpact: false,
    trafficImpact: false,
    items: [
      { name: 'Home Appliances', weight: '5kg', dimensions: '50x40x30cm' }
    ],
    value: 25000,
    paymentMethod: 'prepaid'
  },
  {
    id: 'ORD005',
    customerId: 'CUST005',
    customerName: 'Divya Agarwal',
    customerPhone: '+91-9876543205',
    address: 'Saket, New Delhi 110017',
    coordinates: { lat: 28.5295, lng: 77.2069 },
    assignedEmployeeId: 'EMP005',
    status: 'in_transit',
    priority: 'express',
    orderTime: new Date('2026-04-26T09:30:00'),
    estimatedDeliveryTime: new Date('2026-04-26T13:30:00'),
    actualDeliveryTime: null,
    delayStatus: 'none',
    delayReason: null,
    weatherImpact: false,
    trafficImpact: false,
    items: [
      { name: 'Medical Supplies', weight: '1kg', dimensions: '20x15x10cm' }
    ],
    value: 12000,
    paymentMethod: 'prepaid'
  },
  {
    id: 'ORD006',
    customerId: 'CUST006',
    customerName: 'Arjun Malhotra',
    customerPhone: '+91-9876543206',
    address: 'Dwarka, New Delhi 110075',
    coordinates: { lat: 28.5712, lng: 77.0536 },
    assignedEmployeeId: 'EMP002',
    status: 'pending',
    priority: 'standard',
    orderTime: new Date('2026-04-26T11:30:00'),
    estimatedDeliveryTime: new Date('2026-04-26T17:00:00'),
    actualDeliveryTime: null,
    delayStatus: 'none',
    delayReason: null,
    weatherImpact: false,
    trafficImpact: false,
    items: [
      { name: 'Books Package', weight: '3kg', dimensions: '35x25x20cm' }
    ],
    value: 6000,
    paymentMethod: 'cod'
  }
];

// Route information for optimization
const routes = [
  {
    id: 'ROUTE001',
    employeeId: 'EMP001',
    orderId: 'ORD001',
    startPoint: { lat: 28.6692, lng: 77.4538 },
    endPoint: { lat: 28.5846, lng: 77.3695 },
    mainRoute: {
      distance: 15.2,
      duration: 35,
      geometry: 'encoded_polyline_here'
    },
    optimizedRoute: {
      distance: 14.8,
      duration: 32,
      geometry: 'optimized_polyline_here'
    },
    trafficLevel: 'low',
    lastUpdated: new Date()
  },
  {
    id: 'ROUTE002',
    employeeId: 'EMP002',
    orderId: 'ORD002',
    startPoint: { lat: 28.6139, lng: 77.2090 },
    endPoint: { lat: 28.6304, lng: 77.2177 },
    mainRoute: {
      distance: 8.5,
      duration: 45,
      geometry: 'encoded_polyline_here'
    },
    optimizedRoute: {
      distance: 9.2,
      duration: 38,
      geometry: 'optimized_polyline_here'
    },
    trafficLevel: 'high', // Heavy traffic
    lastUpdated: new Date()
  }
];

// Weather data for different locations
const weatherData = {
  'delhi': {
    location: 'Delhi',
    temperature: 28,
    condition: 'partly_cloudy',
    humidity: 65,
    windSpeed: 12,
    visibility: 8,
    forecast: [
      { time: '12:00', temp: 30, condition: 'sunny' },
      { time: '13:00', temp: 32, condition: 'sunny' },
      { time: '14:00', temp: 31, condition: 'partly_cloudy' },
      { time: '15:00', temp: 29, condition: 'cloudy' },
      { time: '16:00', temp: 27, condition: 'light_rain' }
    ]
  },
  'noida': {
    location: 'Noida',
    temperature: 26,
    condition: 'heavy_rain',
    humidity: 85,
    windSpeed: 20,
    visibility: 4,
    forecast: [
      { time: '12:00', temp: 26, condition: 'heavy_rain' },
      { time: '13:00', temp: 25, condition: 'heavy_rain' },
      { time: '14:00', temp: 24, condition: 'moderate_rain' },
      { time: '15:00', temp: 25, condition: 'light_rain' },
      { time: '16:00', temp: 26, condition: 'cloudy' }
    ]
  }
};

module.exports = {
  employees,
  orders,
  routes,
  weatherData
};
