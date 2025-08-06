// server.js

const express = require("express");
const app = express();
const PORT = 80;

// Main endpoint
app.get("/", (req, res) => {
  // We add a version number to easily see deployment changes
  res.send("<h1>Welcome to the CI/CD example app! Version: 1.0.0</h1>");
});

// Health check endpoint for Lab 2
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app;
