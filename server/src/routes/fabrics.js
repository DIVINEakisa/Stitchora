import express from 'express';
import Fabric from '../models/Fabric.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const fabrics = await Fabric.find().sort({ featured: -1, name: 1 });
    res.json(fabrics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/featured', async (_req, res) => {
  try {
    const fabrics = await Fabric.find({ featured: true }).limit(8);
    res.json(fabrics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
