# Smart Logistics System

A comprehensive full-stack web application for intelligent logistics management with real-time tracking, route optimization, and delay prediction.

## 🚀 Features

### Core Functionality
- **Real-time Order Tracking**: Live tracking of delivery orders with status updates
- **Route Optimization**: AI-powered route calculation and traffic avoidance
- **Delay Prediction**: Advanced algorithms predict potential delays before they occur
- **Weather Integration**: Real-time weather data impacts delivery planning
- **Smart Reassignment**: Automatic order reassignment based on employee availability

### Dual Portal System
- **Customer Portal**: Track orders, reschedule deliveries, update addresses
- **Employee Portal**: Manage orders, view routes, handle logistics operations

### Business Rules
- **45-Minute Rule**: Customer actions restricted within 45 minutes of delivery
- **Employee Permissions**: Employees can reassign orders and notify customers
- **Workload Management**: Automatic detection of overloaded employees

## 🛠️ Tech Stack

### Frontend
- **React.js** with TypeScript
- **React Router** for navigation
- **Axios** for API calls
- **Leaflet.js** + OpenStreetMap for mapping
- **CSS** with clean white/blue design

### Backend
- **Node.js** + Express.js
- **RESTful APIs** for all operations
- **Mock Data** with realistic scenarios
- **CORS** enabled for frontend communication

### External APIs
- **OSRM** for routing and optimization
- **OpenWeatherMap** for weather data

## 📁 Project Structure

```
windsurf-project-2/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.tsx         # Main app component
│   │   └── index.tsx       # Entry point
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── backend/                  # Node.js backend
│   ├── data/
│   │   └── mockData.js     # Mock data for employees/orders
│   ├── routes/              # API routes
│   │   ├── employees.js
│   │   ├── orders.js
│   │   └── logistics.js
│   ├── services/            # Business logic services
│   ├── server.js           # Express server
│   ├── .env                # Environment variables
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. **Start Backend Server** (Port 5000)
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend Development Server** (Port 3000)
   ```bash
   cd frontend
   npm start
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 📊 Mock Data Scenarios

The system includes 5 realistic scenarios:

### Employees
- **EMP001 (Rajesh)**: Normal workload, active
- **EMP002 (Priya)**: **Overloaded** (6/6 orders)
- **EMP003 (Amit)**: **On break** with weather delay
- **EMP004 (Sunita)**: Normal workload
- **EMP005 (Vikram)**: Normal workload

### Orders
- **ORD001**: Normal delivery in transit
- **ORD002**: **Heavy traffic** delay scenario
- **ORD003**: **Weather delay** (heavy rain)
- **ORD004**: Successfully delivered
- **ORD005**: Express delivery in progress
- **ORD006**: Pending assignment

## 🔑 Default Credentials

### Employee Login
- **Employee IDs**: EMP001, EMP002, EMP003, EMP004, EMP005
- **Password**: password123 (same for all employees)

### Customer Access
- **Order IDs**: ORD001, ORD002, ORD003, ORD004, ORD005, ORD006
- No login required - just enter order ID

## 🌐 API Endpoints

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees/login` - Employee login
- `GET /api/employees/available/:orderId` - Get available employees for reassignment

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/reassign` - Reassign order to different employee
- `PUT /api/orders/:id/customer-action` - Customer actions (reschedule/update address)
- `GET /api/orders/recommendations/list` - Get recommended order IDs

### Logistics
- `GET /api/logistics/routes/:orderId` - Get route information
- `GET /api/logistics/route/optimize` - Get optimized route
- `GET /api/logistics/weather/:location` - Get weather data
- `POST /api/logistics/predict-delay` - Predict delivery delays
- `GET /api/logistics/dashboard` - Get dashboard analytics

## 🎨 Design Principles

- **Clean & Professional**: White and blue color scheme
- **Minimal UI**: Inspired by TVS Supply Chain and Amazon Logistics
- **Responsive**: Works on desktop and mobile
- **Accessible**: Semantic HTML and ARIA labels

## 📱 Features by Portal

### Customer Portal
- ✅ Order tracking with real-time status
- ✅ Weather information (if delay is weather-related)
- ✅ Route visualization
- ✅ Reschedule delivery (45-minute rule applies)
- ✅ Update address (45-minute rule applies)
- ✅ Recommended order IDs for easy testing

### Employee Portal
- ✅ Login with employee credentials
- ✅ Dashboard with assigned orders
- ✅ Order management (notify, reassign)
- ✅ Weather information for delivery window
- ✅ Route optimization suggestions
- ✅ Solutions for detected issues
- ✅ Real-time workload monitoring

## 🔧 Configuration

### Backend Environment Variables (.env)
```
PORT=5000
NODE_ENV=development
WEATHER_API_KEY=your_openweather_api_key_here
OSRM_API_URL=http://router.project-osrm.org
FRONTEND_URL=http://localhost:3000
```

## 🚦 Scenarios Included

1. **Normal Delivery**: Standard delivery process
2. **Overloaded Employee**: Employee with maximum orders
3. **Heavy Traffic**: Route with traffic congestion
4. **Weather Delay**: Delivery impacted by rain
5. **Employee on Break**: Unavailable employee scenario

## 📈 Real-time Features

- **Live Order Status**: Updates reflect across both portals
- **Dynamic Reassignment**: Changes sync immediately
- **Weather Integration**: Real-time weather conditions
- **Route Optimization**: Traffic-aware routing

## 🛠️ Development Notes

- Frontend uses TypeScript for type safety
- Backend uses Express.js with middleware
- Mock data provides realistic test scenarios
- All CRUD operations fully functional
- Error handling implemented throughout
- CORS configured for development

## 📞 Support

For any issues or questions:
- Check the console for error messages
- Verify both servers are running
- Ensure correct API endpoints
- Test with provided mock credentials

---

**Smart Logistics System** - Transforming delivery management with intelligent solutions! 🚚✨
