const express = require('express');
const router = express.Router();
const { employees, orders } = require('../data/mockData');

// Get all employees
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: employees,
      count: employees.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employees'
    });
  }
});

// Get employee by ID
router.get('/:id', (req, res) => {
  try {
    const employee = employees.find(emp => emp.id === req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Get employee's assigned orders
    const employeeOrders = orders.filter(order => order.assignedEmployeeId === req.params.id);
    
    res.json({
      success: true,
      data: {
        ...employee,
        orders: employeeOrders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employee'
    });
  }
});

// Employee login
router.post('/login', (req, res) => {
  try {
    const { employeeId, password } = req.body;
    
    const employee = employees.find(emp => emp.id === employeeId && emp.password === password);
    
    if (!employee) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Remove password from response
    const { password: _, ...employeeData } = employee;
    
    res.json({
      success: true,
      data: employeeData,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Update employee status
router.put('/:id/status', (req, res) => {
  try {
    const { status, onBreak } = req.body;
    const employeeIndex = employees.findIndex(emp => emp.id === req.params.id);
    
    if (employeeIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    if (status !== undefined) {
      employees[employeeIndex].status = status;
    }
    
    if (onBreak !== undefined) {
      employees[employeeIndex].onBreak = onBreak;
    }

    res.json({
      success: true,
      data: employees[employeeIndex],
      message: 'Employee status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update employee status'
    });
  }
});

// Get available employees for reassignment
router.get('/available/:orderId', (req, res) => {
  try {
    const currentOrder = orders.find(order => order.id === req.params.orderId);
    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const availableEmployees = employees.filter(emp => {
      const employeeOrders = orders.filter(order => order.assignedEmployeeId === emp.id);
      return (
        emp.id !== currentOrder.assignedEmployeeId && // Not current employee
        emp.status === 'active' && // Active employee
        !emp.onBreak && // Not on break
        employeeOrders.length < emp.maxOrders && // Not overloaded
        emp.skills.includes(currentOrder.priority) // Has required skills
      );
    });

    res.json({
      success: true,
      data: availableEmployees,
      count: availableEmployees.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available employees'
    });
  }
});

module.exports = router;
