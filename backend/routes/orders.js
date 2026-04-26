const express = require('express');
const router = express.Router();
const { orders, employees } = require('../data/mockData');

// Get all orders
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// Get order by ID
router.get('/:id', (req, res) => {
  try {
    const order = orders.find(ord => ord.id === req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Get assigned employee details
    const assignedEmployee = employees.find(emp => emp.id === order.assignedEmployeeId);
    
    res.json({
      success: true,
      data: {
        ...order,
        assignedEmployee
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
});

// Get orders by customer ID
router.get('/customer/:customerId', (req, res) => {
  try {
    const customerOrders = orders.filter(order => order.customerId === req.params.customerId);
    
    res.json({
      success: true,
      data: customerOrders,
      count: customerOrders.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer orders'
    });
  }
});

// Get orders by employee ID
router.get('/employee/:employeeId', (req, res) => {
  try {
    const employeeOrders = orders.filter(order => order.assignedEmployeeId === req.params.employeeId);
    
    res.json({
      success: true,
      data: employeeOrders,
      count: employeeOrders.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employee orders'
    });
  }
});

// Update order status
router.put('/:id/status', (req, res) => {
  try {
    const { status, delayStatus, delayReason } = req.body;
    const orderIndex = orders.findIndex(ord => ord.id === req.params.id);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (status !== undefined) {
      orders[orderIndex].status = status;
    }
    
    if (delayStatus !== undefined) {
      orders[orderIndex].delayStatus = delayStatus;
    }
    
    if (delayReason !== undefined) {
      orders[orderIndex].delayReason = delayReason;
    }

    res.json({
      success: true,
      data: orders[orderIndex],
      message: 'Order status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
});

// Reassign order to different employee
router.put('/:id/reassign', (req, res) => {
  try {
    const { newEmployeeId } = req.body;
    const orderIndex = orders.findIndex(ord => ord.id === req.params.id);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const newEmployee = employees.find(emp => emp.id === newEmployeeId);
    if (!newEmployee) {
      return res.status(404).json({
        success: false,
        error: 'New employee not found'
      });
    }

    const oldEmployeeId = orders[orderIndex].assignedEmployeeId;
    orders[orderIndex].assignedEmployeeId = newEmployeeId;
    
    // Update delay status if reassigning due to issues
    if (orders[orderIndex].delayStatus === 'none') {
      orders[orderIndex].delayStatus = 'reassigned';
      orders[orderIndex].delayReason = 'Reassigned to optimize delivery';
    }

    res.json({
      success: true,
      data: {
        order: orders[orderIndex],
        oldEmployeeId,
        newEmployee
      },
      message: 'Order reassigned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reassign order'
    });
  }
});

// Customer actions (reschedule, update address)
router.put('/:id/customer-action', (req, res) => {
  try {
    const { action, newDeliveryTime, newAddress } = req.body;
    const orderIndex = orders.findIndex(ord => ord.id === req.params.id);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const order = orders[orderIndex];
    const now = new Date();
    const deliveryTime = new Date(order.estimatedDeliveryTime);
    const timeDiff = deliveryTime.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    // Check 45-minute rule
    if (minutesDiff < 45) {
      return res.status(400).json({
        success: false,
        error: 'This action is not possible within 45 minutes of delivery.',
        canPerformAction: false
      });
    }

    let updatedOrder = { ...order };

    switch (action) {
      case 'reschedule':
        if (newDeliveryTime) {
          updatedOrder.estimatedDeliveryTime = new Date(newDeliveryTime);
          updatedOrder.delayStatus = 'rescheduled';
          updatedOrder.delayReason = 'Customer requested reschedule';
        }
        break;
      
      case 'update_address':
        if (newAddress) {
          updatedOrder.address = newAddress.address;
          updatedOrder.coordinates = newAddress.coordinates;
          updatedOrder.delayStatus = 'address_updated';
          updatedOrder.delayReason = 'Customer updated address';
        }
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }

    orders[orderIndex] = updatedOrder;

    res.json({
      success: true,
      data: updatedOrder,
      message: `Order ${action}d successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to ${req.body.action} order`
    });
  }
});

// Get recommended order IDs for customers
router.get('/recommendations/list', (req, res) => {
  try {
    const activeOrders = orders.filter(order => 
      order.status !== 'delivered' && order.status !== 'cancelled'
    );
    
    const recommendedOrders = activeOrders.slice(0, 5).map(order => ({
      id: order.id,
      customerName: order.customerName,
      status: order.status,
      estimatedDeliveryTime: order.estimatedDeliveryTime
    }));

    res.json({
      success: true,
      data: recommendedOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order recommendations'
    });
  }
});

module.exports = router;
