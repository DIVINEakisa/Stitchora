import express from 'express';
import Order, { ORDER_STATUSES } from '../models/Order.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { initiatePayment, verifyPayment } from '../config/payment.js';

const router = express.Router();

const populateOrder = (q) =>
  q
    .populate('customer', 'name email avatar')
    .populate('designer', 'name email avatar specialty')
    .populate('fabric', 'name image material color');

router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const {
      designImage,
      measurements,
      fabric,
      designerChoosesFabric,
      preferredCompletionDate,
      designerId,
    } = req.body;

    const order = await Order.create({
      customer: req.user._id,
      designer: designerId || undefined,
      designImage,
      measurements,
      fabric: designerChoosesFabric ? undefined : fabric,
      designerChoosesFabric: !!designerChoosesFabric,
      preferredCompletionDate,
      status: 'requested',
    });

    const populated = await populateOrder(Order.findById(order._id));
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const filter =
      req.user.role === 'designer'
        ? { $or: [{ designer: req.user._id }, { designer: null, status: 'requested' }] }
        : { customer: req.user._id };

    const orders = await populateOrder(Order.find(filter).sort({ updatedAt: -1 }));
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/incoming', protect, authorize('designer'), async (req, res) => {
  try {
    const orders = await populateOrder(
      Order.find({ status: 'requested' }).sort({ createdAt: -1 })
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await populateOrder(Order.findById(req.params.id));
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isParty =
      order.customer._id.toString() === req.user._id.toString() ||
      (order.designer && order.designer._id.toString() === req.user._id.toString()) ||
      (req.user.role === 'designer' && order.status === 'requested');

    if (!isParty) return res.status(403).json({ message: 'Access denied' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/accept', protect, authorize('designer'), async (req, res) => {
  try {
    const { totalPrice, estimatedCompletionDate } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order || order.status !== 'requested') {
      return res.status(400).json({ message: 'Order cannot be accepted' });
    }

    order.designer = req.user._id;
    order.status = 'reviewed';
    order.totalPrice = totalPrice || 500;
    order.depositAmount = order.totalPrice * 0.5;
    order.remainingAmount = order.totalPrice - order.depositAmount;
    if (estimatedCompletionDate) order.estimatedCompletionDate = estimatedCompletionDate;

    await order.save();
    const populated = await populateOrder(Order.findById(order._id));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/reject', protect, authorize('designer'), async (req, res) => {
  try {
    const { rejectReason, rejectSuggestions } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order || order.status !== 'requested') {
      return res.status(400).json({ message: 'Order cannot be rejected' });
    }

    order.status = 'rejected';
    order.rejectReason = rejectReason || '';
    order.rejectSuggestions = rejectSuggestions || '';
    await order.save();

    const populated = await populateOrder(Order.findById(order._id));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/status', protect, authorize('designer'), async (req, res) => {
  try {
    const { status, estimatedCompletionDate } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order || order.designer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your order' });
    }

    const flow = ['reviewed', 'deposit_paid', 'in_production', 'ready', 'delivered'];
    const currentIdx = flow.indexOf(order.status);
    const newIdx = flow.indexOf(status);
    if (newIdx === -1 || (newIdx > 0 && newIdx < currentIdx)) {
      return res.status(400).json({ message: 'Invalid status transition' });
    }

    order.status = status;
    if (estimatedCompletionDate) order.estimatedCompletionDate = estimatedCompletionDate;
    await order.save();

    const populated = await populateOrder(Order.findById(order._id));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/pay-deposit-initiate', protect, authorize('customer'), async (req, res) => {
  try {
    const { paymentMethod, phoneNumber } = req.body;

    if (!paymentMethod || !['mtn', 'airtel'].includes(paymentMethod.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }
    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order || order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (order.status !== 'reviewed') {
      return res.status(400).json({ message: 'Deposit not available yet' });
    }
    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({ message: 'Deposit already paid' });
    }

    // Initiate payment with provider
    const transactionRef = `deposit-${order._id}-${Date.now()}`;
    const paymentData = {
      amount: order.depositAmount,
      email: req.user.email,
      phoneNumber,
      paymentMethod,
      orderRef: transactionRef,
      customerName: req.user.name,
    };

    const paymentResponse = await initiatePayment(paymentData);

    // Store payment transaction
    order.depositTransaction = {
      type: 'deposit',
      amount: order.depositAmount,
      paymentMethod: paymentMethod.toLowerCase(),
      phoneNumber,
      status: 'processing',
      transactionRef,
      transactionId: paymentResponse.transactionId,
      initiatedAt: new Date(),
    };

    await order.save();

    res.json({
      success: true,
      transactionRef,
      transactionId: paymentResponse.transactionId,
      authUrl: paymentResponse.authUrl,
      message: 'Payment initiated. Please complete payment on your phone.',
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/:id/pay-deposit-confirm', protect, authorize('customer'), async (req, res) => {
  try {
    const { transactionRef } = req.body;

    if (!transactionRef) {
      return res.status(400).json({ message: 'Transaction reference is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order || order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!order.depositTransaction || order.depositTransaction.transactionRef !== transactionRef) {
      return res.status(400).json({ message: 'Invalid transaction reference' });
    }

    // Verify payment with provider
    const verification = await verifyPayment(transactionRef);

    if (!verification.isSuccessful) {
      order.depositTransaction.status = 'failed';
      order.depositTransaction.failureReason = 'Payment verification failed';
      await order.save();
      return res.status(400).json({ message: 'Payment was not successful. Please try again.' });
    }

    // Mark payment as successful
    order.depositTransaction.status = 'success';
    order.depositTransaction.confirmedAt = new Date();
    order.paymentStatus = 'partially_paid';
    order.status = 'deposit_paid';
    order.depositPaidAt = new Date();

    await order.save();

    // Notify designer that deposit was paid
    // TODO: Send notification/email to designer

    const populated = await populateOrder(Order.findById(order._id));
    res.json({
      success: true,
      message: 'Deposit payment confirmed! Production will begin soon.',
      order: populated,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/:id/pay-remaining-initiate', protect, authorize('customer'), async (req, res) => {
  try {
    const { paymentMethod, phoneNumber } = req.body;

    if (!paymentMethod || !['mtn', 'airtel'].includes(paymentMethod.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }
    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order || order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (order.status !== 'ready') {
      return res.status(400).json({ message: 'Final payment available when order is ready' });
    }
    if (order.paymentStatus === 'fully_paid') {
      return res.status(400).json({ message: 'Already fully paid' });
    }

    // Initiate payment
    const transactionRef = `remaining-${order._id}-${Date.now()}`;
    const paymentData = {
      amount: order.remainingAmount,
      email: req.user.email,
      phoneNumber,
      paymentMethod,
      orderRef: transactionRef,
      customerName: req.user.name,
    };

    const paymentResponse = await initiatePayment(paymentData);

    // Store payment transaction
    order.remainingTransaction = {
      type: 'remaining',
      amount: order.remainingAmount,
      paymentMethod: paymentMethod.toLowerCase(),
      phoneNumber,
      status: 'processing',
      transactionRef,
      transactionId: paymentResponse.transactionId,
      initiatedAt: new Date(),
    };

    await order.save();

    res.json({
      success: true,
      transactionRef,
      transactionId: paymentResponse.transactionId,
      authUrl: paymentResponse.authUrl,
      message: 'Payment initiated. Please complete payment on your phone.',
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/:id/pay-remaining-confirm', protect, authorize('customer'), async (req, res) => {
  try {
    const { transactionRef } = req.body;

    if (!transactionRef) {
      return res.status(400).json({ message: 'Transaction reference is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order || order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!order.remainingTransaction || order.remainingTransaction.transactionRef !== transactionRef) {
      return res.status(400).json({ message: 'Invalid transaction reference' });
    }

    // Verify payment
    const verification = await verifyPayment(transactionRef);

    if (!verification.isSuccessful) {
      order.remainingTransaction.status = 'failed';
      order.remainingTransaction.failureReason = 'Payment verification failed';
      await order.save();
      return res.status(400).json({ message: 'Payment was not successful. Please try again.' });
    }

    // Mark payment as successful
    order.remainingTransaction.status = 'success';
    order.remainingTransaction.confirmedAt = new Date();
    order.paymentStatus = 'fully_paid';
    order.finalPaidAt = new Date();

    await order.save();

    // TODO: Transfer funds to designer's account
    // Transfer logic based on designer's payment preference

    const populated = await populateOrder(Order.findById(order._id));
    res.json({
      success: true,
      message: 'Final payment confirmed! Your order will be delivered soon.',
      order: populated,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Keep old endpoints for backward compatibility (but they now do nothing)
router.post('/:id/pay-deposit', protect, authorize('customer'), async (req, res) => {
  try {
    return res.status(400).json({
      message: 'Payment method has been updated. Please use the new payment flow.',
      useNewFlow: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/pay-remaining', protect, authorize('customer'), async (req, res) => {
  try {
    return res.status(400).json({
      message: 'Payment method has been updated. Please use the new payment flow.',
      useNewFlow: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/mark-delivered', protect, authorize('customer'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (order.paymentStatus !== 'fully_paid') {
      return res.status(400).json({ message: 'Complete final payment first' });
    }

    order.status = 'delivered';
    await order.save();

    const populated = await populateOrder(Order.findById(order._id));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
