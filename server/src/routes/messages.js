import express from 'express';
import Message from '../models/Message.js';
import Order from '../models/Order.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const canAccessOrder = async (orderId, user) => {
  const order = await Order.findById(orderId);
  if (!order) return null;
  const ok =
    order.customer.toString() === user._id.toString() ||
    (order.designer && order.designer.toString() === user._id.toString());
  return ok ? order : null;
};

router.get('/order/:orderId', protect, async (req, res) => {
  try {
    const order = await canAccessOrder(req.params.orderId, req.user);
    if (!order) return res.status(403).json({ message: 'Access denied' });

    const messages = await Message.find({ order: order._id })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { orderId, content, imageUrl } = req.body;
    const order = await canAccessOrder(orderId, req.user);
    if (!order) return res.status(403).json({ message: 'Access denied' });

    const message = await Message.create({
      order: order._id,
      sender: req.user._id,
      content: content || '',
      imageUrl: imageUrl || '',
    });

    const populated = await Message.findById(message._id).populate(
      'sender',
      'name avatar role'
    );
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
