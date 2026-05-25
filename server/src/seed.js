import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Fabric from './models/Fabric.js';
import { connectDB } from './config/db.js';

const fabrics = [
  {
    name: 'Midnight Silk',
    description: 'Luxurious pure silk with a deep sheen',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
    color: 'Black',
    material: 'Silk',
    pricePerMeter: 85,
    featured: true,
  },
  {
    name: 'Ivory Linen',
    description: 'Breathable European linen for summer wear',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
    color: 'Cream',
    material: 'Linen',
    pricePerMeter: 45,
    featured: true,
  },
  {
    name: 'Emerald Velvet',
    description: 'Rich cotton velvet in deep green',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
    color: 'Green',
    material: 'Velvet',
    pricePerMeter: 62,
    featured: true,
  },
  {
    name: 'Champagne Satin',
    description: 'Elegant satin for evening gowns',
    image: 'https://images.unsplash.com/photo-1558171813-4c088f5c6f0f?w=600&q=80',
    color: 'Gold',
    material: 'Satin',
    pricePerMeter: 55,
    featured: true,
  },
  {
    name: 'Charcoal Wool',
    description: 'Premium merino wool for tailored suits',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80',
    color: 'Grey',
    material: 'Wool',
    pricePerMeter: 72,
    featured: false,
  },
  {
    name: 'Rose Chiffon',
    description: 'Lightweight chiffon for flowing dresses',
    image: 'https://images.unsplash.com/photo-1528459803806-57e00dfff624?w=600&q=80',
    color: 'Pink',
    material: 'Chiffon',
    pricePerMeter: 38,
    featured: true,
  },
];

async function seed() {
  await connectDB();

  await Fabric.deleteMany({});
  await Fabric.insertMany(fabrics);

  const designers = [
    {
      name: 'Elena Vasquez',
      email: 'elena@stitchora.demo',
      password: 'designer123',
      role: 'designer',
      bio: 'Specializing in evening wear and bridal couture with 12 years of experience.',
      specialty: 'Evening & Bridal',
      rating: 4.9,
      completedOrders: 248,
      featured: true,
      avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8cd5?w=400&q=80',
    },
    {
      name: 'James Okonkwo',
      email: 'james@stitchora.demo',
      password: 'designer123',
      role: 'designer',
      bio: 'Master tailor focused on bespoke menswear and structured silhouettes.',
      specialty: 'Menswear',
      rating: 4.8,
      completedOrders: 189,
      featured: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    },
    {
      name: 'Amara Chen',
      email: 'amara@stitchora.demo',
      password: 'designer123',
      role: 'designer',
      bio: 'Contemporary designer blending traditional craftsmanship with modern aesthetics.',
      specialty: 'Contemporary',
      rating: 5,
      completedOrders: 312,
      featured: true,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    },
  ];

  for (const d of designers) {
    const exists = await User.findOne({ email: d.email });
    if (!exists) await User.create(d);
  }

  const customerExists = await User.findOne({ email: 'customer@stitchora.demo' });
  if (!customerExists) {
    await User.create({
      name: 'Demo Customer',
      email: 'customer@stitchora.demo',
      password: 'customer123',
      role: 'customer',
    });
  }

  console.log('Seed complete');
  console.log('Demo accounts:');
  console.log('  Customer: customer@stitchora.demo / customer123');
  console.log('  Designer: elena@stitchora.demo / designer123');
  await mongoose.disconnect();
}

seed().catch(console.error);
