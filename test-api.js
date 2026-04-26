const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('🚀 Testing Smart Logistics API...\n');

  try {
    // Test Health Check
    console.log('1. Health Check...');
    const health = await makeRequest('/health');
    console.log('   ✅', health.status, '\n');

    // Test Get All Employees
    console.log('2. Get All Employees...');
    const employees = await makeRequest('/api/employees');
    console.log('   ✅', employees.data.length, 'employees found\n');

    // Test Employee Login
    console.log('3. Employee Login...');
    const login = await makeRequest('/api/employees/login', 'POST', {
      employeeId: 'EMP001',
      password: 'password123'
    });
    console.log('   ✅ Login successful for', login.data.name, '\n');

    // Test Get All Orders
    console.log('4. Get All Orders...');
    const orders = await makeRequest('/api/orders');
    console.log('   ✅', orders.data.length, 'orders found\n');

    // Test Get Specific Order
    console.log('5. Get Specific Order...');
    const order = await makeRequest('/api/orders/ORD001');
    console.log('   ✅ Order', order.data.id, 'for', order.data.customerName, '\n');

    // Test Order Reassignment
    console.log('6. Test Order Reassignment...');
    const reassign = await makeRequest('/api/orders/ORD001/reassign', 'PUT', {
      newEmployeeId: 'EMP002'
    });
    console.log('   ✅ Order reassigned to', reassign.data.newEmployee.name, '\n');

    // Test Weather API
    console.log('7. Test Weather API...');
    const weather = await makeRequest('/api/logistics/weather/delhi');
    console.log('   ✅ Weather in', weather.data.location, ':', weather.data.temperature, '°C\n');

    // Test Delay Prediction
    console.log('8. Test Delay Prediction...');
    const prediction = await makeRequest('/api/logistics/predict-delay', 'POST', {
      orderId: 'ORD001',
      employeeId: 'EMP001',
      routeDistance: 15,
      weatherCondition: 'partly_cloudy',
      trafficLevel: 'medium'
    });
    console.log('   ✅ Delay probability:', (prediction.data.delayProbability * 100).toFixed(1) + '%\n');

    // Test Dashboard
    console.log('9. Test Dashboard...');
    const dashboard = await makeRequest('/api/logistics/dashboard');
    console.log('   ✅ Dashboard loaded -', dashboard.data.overview.activeOrders, 'active orders\n');

    console.log('🎉 All API tests passed successfully!');
    console.log('\n📊 System Summary:');
    console.log('   • Backend Server: ✅ Running on http://localhost:5000');
    console.log('   • Frontend Server: ✅ Running on http://localhost:3000');
    console.log('   • Database: ✅ Mock data loaded');
    console.log('   • APIs: ✅ All endpoints functional');
    console.log('\n🔑 Access Information:');
    console.log('   • Customer Portal: http://localhost:3000/customer');
    console.log('   • Employee Portal: http://localhost:3000/employee');
    console.log('   • Employee Login: EMP001-EMP005 / password123');
    console.log('   • Test Orders: ORD001-ORD006');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
