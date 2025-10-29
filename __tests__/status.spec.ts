import { describe, expect, it } from "vitest";

describe("Status API", () => {
  it("GET /api/v1/status", async () => {
    const response = await fetch("http://localhost:3001/api/v1/status");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "ok" });
  });
});
