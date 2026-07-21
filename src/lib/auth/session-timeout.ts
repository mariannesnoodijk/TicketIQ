/** Client idle timeout: 30 minuten zonder activiteit → uitloggen. */
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

/** Waarschuwing 1 minuut vóór automatische logout. */
export const IDLE_WARNING_BEFORE_MS = 60 * 1000;

/** Throttle voor activiteits-events (mousemove e.d.). */
export const IDLE_ACTIVITY_THROTTLE_MS = 1_000;

export const SESSION_EXPIRED_LOGIN_PATH = "/login?reason=session_expired";
