const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const sheetRoutes = require("./routes/sheetRoutes");
const itemRoutes = require("./routes/itemRoutes");
const competitorRoutes = require("./routes/competitorRoutes");
const colorRoutes = require("./routes/colorRoutes");
const uploadRoutes = require("./routes/upload");
const { v2: cloudinary } = require("cloudinary");

// Load environment variables
dotenv.config();

// Validate environment variables
const requiredEnvVars = [
  "MONGODB_URI",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Initialize Express app
const app = express();

// CORS configuration
app.use(cors({
  origin: ["https://your-app.vercel.app", "http://localhost:3000", "http://localhost:3001"], // Replace with your Vercel domain
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Sales Summary Report API",
    status: "OK",
    endpoints: {
      health: "/api/health",
      sheets: "/api/sheets",
      items: "/api/items",
      competitors: "/api/competitors",
      colors: "/api/colors",
      upload: "/api/upload",
    },
  });
});

// API Routes
app.use("/api/sheets", sheetRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/competitors", competitorRoutes);
app.use("/api/colors", colorRoutes);
app.use("/api/upload", uploadRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    retryWrites: true,
    w: "majority",
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Cloudinary configured for cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
});

// Export the app for Vercel
module.exports = app;