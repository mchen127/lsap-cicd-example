// server.js
const app = require("./app");
const PORT = process.env.PORT || 80;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
