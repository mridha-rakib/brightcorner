import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";
import { env } from "../src/env.js";

const apiBase = env.BASE_URL === "/" ? "/" : env.BASE_URL;
const apiHealth = `${apiBase === "/" ? "" : apiBase}/health`;

describe("GET base API route", () => {
  it("responds with a base API payload", async () => {
    const response = await request(app)
      .get(apiBase)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(apiBase === "/" ? "Bright Corner API" : "API is running");
  });
});

describe("GET health route", () => {
  it("responds with health status", async () => {
    const response = await request(app)
      .get(apiHealth)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body.success).toBe(true);
    if (apiBase === "/")
      expect(response.body.message).toBe("OK");
    else
      expect(response.body.data.status).toBe("ok");
  });
});
