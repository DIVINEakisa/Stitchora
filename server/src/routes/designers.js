import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/featured', async (_req, res) => {
  try {
    const designers = await User.find({ role: 'designer', featured: true })
      .select('-password')
      .limit(6);
    res.json(designers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (_req, res) => {
  try {
    const designers = await User.find({ role: 'designer' }).select('-password');
    res.json(designers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
