// Basic tests for the server endpoints
const request = require("supertest");
const app = require("./app"); // Import the app logic from app.js
const server = require("./server"); // Import the running server instance from server.js

describe("API Endpoints", () => {
  // After all tests are finished, this will correctly close the single server instance.
  afterAll((done) => {
    server.close(done);
  });

  it("should return a 200 OK status and welcome message for the root endpoint", async () => {
    // This now tests against the app logic without starting a new server.
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("Welcome to the CI/CD Workshop App!");
  });
});
