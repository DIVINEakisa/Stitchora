import mongoose from 'mongoose';

const fabricSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, required: true },
    color: { type: String, default: '' },
    material: { type: String, default: '' },
    pricePerMeter: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Fabric', fabricSchema);
