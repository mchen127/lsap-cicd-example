// app.js
const express = require("express");
const app = express();

// All middleware and routes are defined here
app.get("/", (req, res) => {
  res
    .status(200)
    .send("<h1>Welcome to the CI/CD Workshop App! Version: 1.0.0</h1>");
});

// Note: we do NOT call app.listen() here.
// We only export the configured app.
module.exports = app;
