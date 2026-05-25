import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

export const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id);
      if (!socket.user) return next(new Error('User not found'));
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_order', async (orderId) => {
      const order = await Order.findById(orderId);
      if (!order) return;
      const uid = socket.user._id.toString();
      const allowed =
        order.customer.toString() === uid ||
        (order.designer && order.designer.toString() === uid);
      if (allowed) socket.join(`order:${orderId}`);
    });

    socket.on('leave_order', (orderId) => {
      socket.leave(`order:${orderId}`);
    });

    socket.on('send_message', async (payload, callback) => {
      try {
        const { orderId, content, imageUrl } = payload;
        const order = await Order.findById(orderId);
        if (!order) return callback?.({ error: 'Order not found' });

        const uid = socket.user._id.toString();
        const allowed =
          order.customer.toString() === uid ||
          (order.designer && order.designer.toString() === uid);
        if (!allowed) return callback?.({ error: 'Access denied' });

        const message = await Message.create({
          order: order._id,
          sender: socket.user._id,
          content: content || '',
          imageUrl: imageUrl || '',
        });

        const populated = await Message.findById(message._id).populate(
          'sender',
          'name avatar role'
        );

        io.to(`order:${orderId}`).emit('new_message', populated);
        callback?.({ success: true, message: populated });
      } catch (err) {
        callback?.({ error: err.message });
      }
    });

    socket.on('typing', ({ orderId, isTyping }) => {
      socket.to(`order:${orderId}`).emit('user_typing', {
        userId: socket.user._id,
        name: socket.user.name,
        isTyping,
      });
    });
  });
};
