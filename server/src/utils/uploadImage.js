import { cloudinary } from '../config/cloudinary.js';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1558171813-4c088f5c6f0f?w=800&q=80';

export async function uploadToCloudinary(buffer, folder = 'stitchora') {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return { url: PLACEHOLDER, publicId: 'placeholder' };
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (err, result) => {
        if (err) reject(err);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}
