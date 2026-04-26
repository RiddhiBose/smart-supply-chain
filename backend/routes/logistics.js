const express = require('express');
const router = express.Router();
const axios = require('axios');
const { routes, weatherData, employees, orders } = require('../data/mockData');

// Get route information for a specific order
router.get('/routes/:orderId', (req, res) => {
  try {
    const route = routes.find(r => r.orderId === req.params.orderId);
    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch route'
    });
  }
});

// Get optimized route using OSRM API
router.get('/route/optimize', async (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng } = req.query;
    
    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({
        success: false,
        error: 'Missing coordinates'
      });
    }

    const osrmUrl = `${process.env.OSRM_API_URL}/route/v1/driving/${startLng},${startLat};${endLng},${endLat}`;
    const response = await axios.get(osrmUrl, {
      params: {
        overview: 'full',
        geometries: 'geojson',
        steps: true
      }
    });

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      res.json({
        success: true,
        data: {
          distance: route.distance / 1000, // Convert to km
          duration: route.duration / 60, // Convert to minutes
          geometry: route.geometry,
          steps: route.legs[0].steps
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'No route found'
      });
    }
  } catch (error) {
    console.error('OSRM API Error:', error);
    // Fallback to mock data if API fails
    res.json({
      success: true,
      data: {
        distance: 12.5,
        duration: 30,
        geometry: 'fallback_route_geometry',
        steps: []
      }
    });
  }
});

// Get weather information for a location
router.get('/weather/:location', (req, res) => {
  try {
    const location = req.params.location.toLowerCase();
    const weather = weatherData[location];
    
    if (!weather) {
      return res.status(404).json({
        success: false,
        error: 'Weather data not found for this location'
      });
    }

    res.json({
      success: true,
      data: weather
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data'
    });
  }
});

// Get real-time weather using OpenWeatherMap API
router.get('/weather/realtime/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const apiKey = process.env.WEATHER_API_KEY;
    
    if (!apiKey || apiKey === 'your_openweather_api_key_here') {
      // Fallback to mock data
      const mockWeather = {
        location: 'Delhi NCR',
        temperature: 28,
        condition: 'partly_cloudy',
        humidity: 65,
        windSpeed: 12,
        visibility: 8
      };
      return res.json({
        success: true,
        data: mockWeather
      });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    const response = await axios.get(weatherUrl);
    
    const weather = {
      location: response.data.name,
      temperature: response.data.main.temp,
      condition: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      visibility: response.data.visibility / 1000 // Convert to km
    };

    res.json({
      success: true,
      data: weather
    });
  } catch (error) {
    console.error('Weather API Error:', error);
    // Fallback to mock data
    res.json({
      success: true,
      data: {
        location: 'Delhi NCR',
        temperature: 28,
        condition: 'partly_cloudy',
        humidity: 65,
        windSpeed: 12,
        visibility: 8
      }
    });
  }
});

// Predict delivery delays based on various factors
router.post('/predict-delay', (req, res) => {
  try {
    const { orderId, employeeId, routeDistance, weatherCondition, trafficLevel } = req.body;
    
    // Get order and employee details
    const order = orders.find(o => o.id === orderId);
    const employee = employees.find(e => e.id === employeeId);
    
    if (!order || !employee) {
      return res.status(404).json({
        success: false,
        error: 'Order or employee not found'
      });
    }

    let delayProbability = 0;
    let estimatedDelay = 0;
    let riskFactors = [];

    // Weather impact
    if (weatherCondition === 'heavy_rain' || weatherCondition === 'storm') {
      delayProbability += 0.3;
      estimatedDelay += 20;
      riskFactors.push('Severe weather conditions');
    } else if (weatherCondition === 'moderate_rain') {
      delayProbability += 0.15;
      estimatedDelay += 10;
      riskFactors.push('Moderate rain');
    }

    // Traffic impact
    if (trafficLevel === 'high') {
      delayProbability += 0.25;
      estimatedDelay += 25;
      riskFactors.push('Heavy traffic');
    } else if (trafficLevel === 'medium') {
      delayProbability += 0.1;
      estimatedDelay += 10;
      riskFactors.push('Moderate traffic');
    }

    // Employee workload
    const employeeOrders = orders.filter(o => o.assignedEmployeeId === employeeId);
    const workloadRatio = employeeOrders.length / employee.maxOrders;
    
    if (workloadRatio > 0.8) {
      delayProbability += 0.15;
      estimatedDelay += 15;
      riskFactors.push('High employee workload');
    }

    // Employee on break
    if (employee.onBreak) {
      delayProbability += 0.2;
      estimatedDelay += 30;
      riskFactors.push('Employee currently on break');
    }

    // Route distance impact
    if (routeDistance > 20) {
      delayProbability += 0.1;
      estimatedDelay += 10;
      riskFactors.push('Long delivery distance');
    }

    // Calculate risk level
    let riskLevel = 'low';
    if (delayProbability > 0.6) {
      riskLevel = 'high';
    } else if (delayProbability > 0.3) {
      riskLevel = 'medium';
    }

    res.json({
      success: true,
      data: {
        delayProbability: Math.min(delayProbability, 0.9),
        estimatedDelay,
        riskLevel,
        riskFactors,
        recommendations: generateRecommendations(riskFactors, employeeId, orderId)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to predict delay'
    });
  }
});

// Generate optimization recommendations
function generateRecommendations(riskFactors, employeeId, orderId) {
  const recommendations = [];
  
  if (riskFactors.includes('High employee workload')) {
    recommendations.push({
      type: 'reassign',
      action: 'Reassign to available employee',
      priority: 'high',
      description: 'Current employee is overloaded. Consider reassigning to optimize delivery time.'
    });
  }
  
  if (riskFactors.includes('Heavy traffic')) {
    recommendations.push({
      type: 'reroute',
      action: 'Optimize route',
      priority: 'medium',
      description: 'Alternative routes may avoid traffic congestion.'
    });
  }
  
  if (riskFactors.includes('Severe weather conditions')) {
    recommendations.push({
      type: 'delay',
      action: 'Delay delivery',
      priority: 'high',
      description: 'Weather conditions are unsafe. Consider delaying delivery.'
    });
  }
  
  if (riskFactors.includes('Employee currently on break')) {
    recommendations.push({
      type: 'reassign',
      action: 'Reassign immediately',
      priority: 'high',
      description: 'Employee is unavailable. Immediate reassignment required.'
    });
  }
  
  return recommendations;
}

// Get logistics dashboard data
router.get('/dashboard', (req, res) => {
  try {
    const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
    const delayedOrders = activeOrders.filter(o => o.delayStatus !== 'none');
    const activeEmployees = employees.filter(e => e.status === 'active');
    const employeesOnBreak = employees.filter(e => e.onBreak);
    const overloadedEmployees = employees.filter(e => {
      const employeeOrders = orders.filter(o => o.assignedEmployeeId === e.id);
      return employeeOrders.length >= e.maxOrders;
    });

    const dashboardData = {
      overview: {
        totalOrders: orders.length,
        activeOrders: activeOrders.length,
        delayedOrders: delayedOrders.length,
        onTimeDeliveryRate: ((orders.filter(o => o.status === 'delivered' && o.delayStatus === 'none').length / orders.filter(o => o.status === 'delivered').length) * 100).toFixed(1)
      },
      employees: {
        total: employees.length,
        active: activeEmployees.length,
        onBreak: employeesOnBreak.length,
        overloaded: overloadedEmployees.length
      },
      alerts: {
        weatherIssues: activeOrders.filter(o => o.weatherImpact).length,
        trafficIssues: activeOrders.filter(o => o.trafficImpact).length,
        employeeIssues: employeesOnBreak.length + overloadedEmployees.length
      },
      recentActivity: activeOrders.slice(0, 5).map(order => ({
        orderId: order.id,
        status: order.status,
        delayStatus: order.delayStatus,
        assignedEmployee: order.assignedEmployeeId,
        estimatedDelivery: order.estimatedDeliveryTime
      }))
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

module.exports = router;
