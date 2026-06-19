import { cloudinary } from "../config/cloudinary.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../../public/uploads");
const IMAGE_EXTENSIONS = {
  "image/avif": ".avif",
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/svg+xml": ".svg",
  "image/webp": ".webp",
};
const ALLOWED_EXTENSIONS = new Set(Object.values(IMAGE_EXTENSIONS));

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Check if Cloudinary is properly configured (not using placeholder values)
const isConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name" &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== "your_api_key"
  );
};

function normalizeFolder(folder = "stitchora") {
  return (
    String(folder)
      .split(/[\\/]+/)
      .map((part) => part.replace(/[^a-zA-Z0-9_-]/g, "-"))
      .filter(Boolean)
      .join("/") || "stitchora"
  );
}

function getImageExtension(file = {}) {
  const mimeExtension = IMAGE_EXTENSIONS[file.mimetype];
  const nameExtension = path.extname(file.originalname || "").toLowerCase();

  if (mimeExtension) return mimeExtension;
  if (ALLOWED_EXTENSIONS.has(nameExtension)) return nameExtension;
  return ".jpg";
}

async function uploadLocalFile(buffer, folder = "stitchora", file = {}) {
  const safeFolder = normalizeFolder(folder);
  const folderPath = path.join(uploadsDir, safeFolder);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const filename = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${getImageExtension(file)}`;
  const filePath = path.join(folderPath, filename);

  fs.writeFileSync(filePath, buffer);

  return { url: `/uploads/${safeFolder}/${filename}`, publicId: filename };
}

export async function uploadToCloudinary(
  buffer,
  folder = "stitchora",
  file = {},
) {
  const safeFolder = normalizeFolder(folder);

  if (!isConfigured()) {
    console.log("Cloudinary not configured - saving to local storage");
    return uploadLocalFile(buffer, safeFolder, file);
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: safeFolder, resource_type: "auto" },
      (err, result) => {
        if (err) reject(err);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}
