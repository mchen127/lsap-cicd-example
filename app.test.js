// Basic tests for the server endpoints
const request = require("supertest");
const { app, server } = require("./server"); // Import your app

describe("API Endpoints", () => {
  // After all tests are finished, close the server
  afterAll((done) => {
    server.close(done);
  });

  it("should return a 200 OK status and welcome message for the root endpoint", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("Welcome to the CI/CD App!");
  });
});
