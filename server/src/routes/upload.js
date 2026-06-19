import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import { uploadToCloudinary } from "../utils/uploadImage.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    if (!req.file.mimetype?.startsWith("image/")) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      req.body.folder || "stitchora",
      {
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
      },
    );

    // Convert relative URLs to absolute URLs for local uploads
    if (result.url.startsWith("/")) {
      const origin = `${req.protocol}://${req.get("host")}`;
      result.url = `${origin}${result.url}`;
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
