// A simple Express web server for the CI/CD lab
const express = require("express");
const app = express();
// CHANGE: Use a non-privileged port (greater than 1024)
const PORT = 3000;

// The main endpoint for the application.
// We include a version number to make it easy to see deployment changes later.
app.get("/", (req, res) => {
  res
    .status(200)
    .send("<h1>Welcome to the CI/CD Workshop App! Version: 1.0.0</h1>");
});

// Start the server and listen for requests.
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app and server. This is important for our tests to work correctly.
module.exports = { app, server };
