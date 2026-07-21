import { describe, expect, it } from "vitest";

import {
  IDLE_TIMEOUT_MS,
  IDLE_WARNING_BEFORE_MS,
  SESSION_EXPIRED_LOGIN_PATH,
} from "@/lib/auth/session-timeout";

describe("session-timeout constants", () => {
  it("uses a 30-minute idle timeout with a 1-minute warning window", () => {
    expect(IDLE_TIMEOUT_MS).toBe(30 * 60 * 1000);
    expect(IDLE_WARNING_BEFORE_MS).toBe(60 * 1000);
    expect(IDLE_WARNING_BEFORE_MS).toBeLessThan(IDLE_TIMEOUT_MS);
  });

  it("redirects idle logout to the session-expired login reason", () => {
    expect(SESSION_EXPIRED_LOGIN_PATH).toBe("/login?reason=session_expired");
  });
});
