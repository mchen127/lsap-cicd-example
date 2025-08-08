// app.js
// This file contains all the application logic.

const express = require("express");
const app = express();

// The main endpoint for the application.
app.get("/", (req, res) => {
  res
    .status(200)
    .send("<h1>Welcome to the CI/CD Workshop App! Version: 1.0.0</h1>");
});

// We only export the app, we do not start the server here.
module.exports = app;
