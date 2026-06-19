import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, phoneNumber, password, role } = req.body;
    
    // Validate required fields
    if (!name || !password) {
      return res.status(400).json({ message: 'Name and password are required' });
    }
    
    // At least email or phone must be provided
    if (!email && !phoneNumber) {
      return res.status(400).json({ message: 'Email or phone number is required' });
    }

    // Check if email already exists
    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if phone number already exists
    if (phoneNumber) {
      const phoneExists = await User.findOne({ phoneNumber });
      if (phoneExists) return res.status(400).json({ message: 'Phone number already registered' });
    }

    const user = await User.create({
      name,
      email: email || undefined,
      phoneNumber: phoneNumber || undefined,
      password,
      role: role === 'designer' ? 'designer' : 'customer',
    });

    const token = signToken(user._id);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/phone and password are required' });
    }

    // Try to find user by email or phone number
    let user = await User.findOne({ email: identifier });
    if (!user) {
      user = await User.findOne({ phoneNumber: identifier });
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email, phone number, or password' });
    }
    
    const token = signToken(user._id);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

export default router;
