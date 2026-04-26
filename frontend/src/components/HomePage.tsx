import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Route, 
  Cloud, 
  Zap, 
  Users, 
  RefreshCw, 
  Package, 
  TrendingUp,
  Clock,
  Truck,
  Phone,
  Mail,
  Map,
  ChevronRight,
  Star,
  ArrowRight
} from 'lucide-react';

const HomePage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [counters, setCounters] = useState({
    onTime: 0,
    deliveryTime: 0,
    dailyOrders: 0,
    partners: 0
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const timer = setInterval(() => {
      setCounters(prev => {
        const newCounters = { ...prev };
        if (newCounters.onTime < 95) newCounters.onTime = Math.min(95, newCounters.onTime + 95 / steps);
        if (newCounters.deliveryTime < 30) newCounters.deliveryTime = Math.min(30, newCounters.deliveryTime + 30 / steps);
        if (newCounters.dailyOrders < 500) newCounters.dailyOrders = Math.min(500, newCounters.dailyOrders + 500 / steps);
        if (newCounters.partners < 50) newCounters.partners = Math.min(50, newCounters.partners + 50 / steps);
        return newCounters;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: MapPin,
      title: "Real-time Tracking",
      description: "Track your orders in real-time with live location updates and accurate delivery estimates.",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: Route,
      title: "Route Optimization",
      description: "AI-powered route optimization reduces delivery time and fuel costs with intelligent traffic analysis.",
      gradient: "from-orange-500 to-amber-500"
    },
    {
      icon: Cloud,
      title: "Weather Integration",
      description: "Real-time weather data helps predict delays and optimize delivery schedules accordingly.",
      gradient: "from-yellow-500 to-warm-500"
    },
    {
      icon: Zap,
      title: "Delay Prediction",
      description: "Advanced algorithms predict potential delays before they happen, enabling proactive solutions.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "Dual Portals",
      description: "Separate customer and employee portals provide tailored experiences for all stakeholders.",
      gradient: "from-primary-500 to-secondary-500"
    },
    {
      icon: RefreshCw,
      title: "Smart Reassignment",
      description: "Automatic order reassignment based on employee availability, workload, and location.",
      gradient: "from-accent-500 to-warm-500"
    }
  ];

  const stats = [
    { value: `${Math.round(counters.onTime)}%`, label: "On-time Delivery", icon: TrendingUp },
    { value: `${Math.round(counters.deliveryTime)}min`, label: "Avg Delivery Time", icon: Clock },
    { value: `${Math.round(counters.dailyOrders)}+`, label: "Daily Orders", icon: Package },
    { value: `${Math.round(counters.partners)}+`, label: "Delivery Partners", icon: Truck }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-pink-50 to-orange-50">
      {/* Premium Navigation */}
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'nav-glass shadow-medium' : 'bg-transparent'
        }`}
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
              <span className="text-sm font-medium text-gray-700">AI-Powered Logistics Platform</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="block text-gray-900 mb-2">Smart Logistics</span>
              <span className="block text-gray-800">Solution</span>
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

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/customer" 
                  className="premium-button group"
                >
                  Track Your Order
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/employee" 
                  className="premium-button-secondary group"
                >
                  Employee Login
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

                      </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="premium-gradient-text">Our Solution</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge features designed to revolutionize your logistics operations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="premium-card p-8 feature-glow group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
      {/* CTA Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            className="premium-card p-12 lg:p-16 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-secondary-600/10"></div>
            
            <div className="relative z-10">
              <motion.h2 
                className="text-4xl md:text-6xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <span className="premium-gradient-text">Get Started Today</span>
              </motion.h2>
              
              <motion.p 
                className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Experience the future of logistics management with our comprehensive platform.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/customer" 
                    className="premium-button group"
                  >
                    Customer Portal
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/employee" 
                    className="premium-button-secondary group"
                  >
                    Employee Portal
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-pink-100 via-orange-100 to-yellow-100 text-gray-800 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Smart Logistics</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Revolutionizing delivery management with AI-powered solutions for the modern supply chain.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/customer" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center">
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Customer Portal
                  </Link>
                </li>
                <li>
                  <Link to="/employee" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center">
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Employee Portal
                  </Link>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-3 text-primary-500" />
                  support@smartlogistics.com
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-3 text-primary-500" />
                  +91-1800-123-4567
                </div>
                <div className="flex items-center text-gray-600">
                  <Map className="w-5 h-5 mr-3 text-primary-500" />
                  Delhi NCR, India
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <h4 className="text-lg font-semibold mb-6">Newsletter</h4>
              <p className="text-gray-600 mb-4">
                Subscribe to get updates on new features and logistics insights.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-l-lg focus:outline-none focus:border-primary-500 text-gray-800 placeholder-gray-500"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-r-lg hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 font-semibold">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="border-t border-gray-300 pt-8 text-center text-gray-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <p>&copy; 2026 Smart Logistics System. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
