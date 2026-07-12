import { describe, expect, it } from "vitest";

import { sanitizeRedirect } from "@/lib/safe-redirect";

describe("sanitizeRedirect", () => {
  it("accepteert geldige interne paden", () => {
    expect(sanitizeRedirect("/dashboard/home")).toBe("/dashboard/home");
    expect(sanitizeRedirect("/dashboard/tickets?status=open")).toBe(
      "/dashboard/tickets?status=open"
    );
  });

  it("blokkeert open redirects", () => {
    expect(sanitizeRedirect("//evil.com")).toBe("/dashboard/home");
    expect(sanitizeRedirect("https://evil.com")).toBe("/dashboard/home");
  });

  it("valt terug op fallback bij lege of externe paden", () => {
    expect(sanitizeRedirect("")).toBe("/dashboard/home");
    expect(sanitizeRedirect("dashboard")).toBe("/dashboard/home");
    expect(sanitizeRedirect("/login", "/login")).toBe("/login");
  });
});
