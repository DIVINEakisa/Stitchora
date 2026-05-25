import express from 'express';
import Order, { ORDER_STATUSES } from '../models/Order.js';
import { protect, authorize } from '../middleware/auth.js';

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

router.post('/:id/pay-deposit', protect, authorize('customer'), async (req, res) => {
  try {
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

    order.paymentStatus = 'partially_paid';
    order.status = 'deposit_paid';
    order.depositPaidAt = new Date();
    await order.save();

    const populated = await populateOrder(Order.findById(order._id));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/pay-remaining', protect, authorize('customer'), async (req, res) => {
  try {
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

    order.paymentStatus = 'fully_paid';
    order.finalPaidAt = new Date();
    await order.save();

    const populated = await populateOrder(Order.findById(order._id));
    res.json(populated);
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
