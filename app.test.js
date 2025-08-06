// app.test.js

const request = require("supertest");
const app = require("./server"); // Import your app

describe("API Endpoints", () => {
  it("should return a 200 OK status for the root endpoint", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("Welcome to the CI/CD App!");
  });

  it("should return a 200 OK status for the /health endpoint", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe("OK");
  });
});
