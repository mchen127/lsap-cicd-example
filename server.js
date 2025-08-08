// server.js
// This file's only job is to start the server.

const app = require("./app"); // Import the configured app
const PORT = 3000;

// Start the server and export the instance
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = server;
