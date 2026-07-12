export async function parseJsonBody<T extends Record<string, unknown>>(
  request: Request
): Promise<{ ok: true; body: T } | { ok: false; status: 400 }> {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { ok: false, status: 400 };
    }

    return { ok: true, body: body as T };
  } catch {
    return { ok: false, status: 400 };
  }
}
