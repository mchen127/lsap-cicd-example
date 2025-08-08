// Basic tests for the server endpoints using Jest and Supertest.
const request = require("supertest");
const { app, server } = require("./app"); // Import the Express app and server

describe("Server Endpoints", () => {
  // This block runs after all tests are finished.
  // It's crucial for ensuring the server shuts down properly and doesn't leave open handles.
  afterAll((done) => {
    server.close(done);
  });

  // Test case for the root ('/') endpoint.
  it("should return a 200 OK status and the correct welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("Welcome to the CI/CD Workshop App!");
  });
});
