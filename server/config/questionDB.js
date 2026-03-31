const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

/**
 * Separate MongoDB connection for Questions database
 * This keeps questions isolated from user/submission data
 * 
 * Environment Variable: QUESTION_DB_URI
 * Falls back to: mongodb://localhost/goalnow-questions
 */

const QUESTION_DB_URI =
  process.env.QUESTION_DB_URI || "mongodb://localhost/goalnow-questions";

// Create a separate mongoose instance for questions
const questionDBConnection = mongoose.createConnection(QUESTION_DB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

// Connection event listeners
questionDBConnection.on("connected", () => {
  console.log("✅ Question DB Connected");
});

questionDBConnection.on("error", (err) => {
  console.error("❌ Question DB Connection Error:", err.message);
});

questionDBConnection.on("disconnected", () => {
  console.log("⚠️  Question DB Disconnected");
});

module.exports = questionDBConnection;
