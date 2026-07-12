type JsonErrorBody = { error?: string };

/** Parseert een fetch-response veilig als JSON; valt terug op tekst bij parse-fouten. */
export async function parseFetchJson<T extends JsonErrorBody>(
  response: Response
): Promise<T> {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    if (!response.ok) {
      throw new Error(response.statusText || "Verzoek mislukt");
    }

    throw new Error("Ongeldig antwoord van de server");
  }
}
