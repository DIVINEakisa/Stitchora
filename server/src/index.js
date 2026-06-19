import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import { configureCloudinary } from "./config/cloudinary.js";
import { initSocket } from "./socket/index.js";

import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";
import fabricRoutes from "./routes/fabrics.js";
import designerRoutes from "./routes/designers.js";
import messageRoutes from "./routes/messages.js";
import uploadRoutes from "./routes/upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: { origin: clientUrl, credentials: true },
});

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json({ limit: "10mb" }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/fabrics", fabricRoutes);
app.use("/api/designers", designerRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

initSocket(io);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    configureCloudinary();
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });
