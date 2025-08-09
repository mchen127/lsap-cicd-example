// app.js
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res
    .status(200)
    .send("<h1>Welcome to the CI/CD Workshop App! Version: 1.0.0</h1>");
});

// Health check endpoint
// This is useful for monitoring and ensuring the app is running
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

let x; // This will trigger an 'unused-vars' linting error

module.exports = app;
