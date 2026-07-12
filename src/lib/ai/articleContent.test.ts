import { describe, expect, it } from "vitest";

import {
  ARTICLE_CONTENT_MIN_LENGTH,
  articleContentValidationMessage,
  hasActionableArticleContent,
} from "@/lib/ai/articleContent";

const validArticle = `# Titel

## Probleem
Gebruikers kunnen niet inloggen na wachtwoord reset.

## Oplossing (kort)
Reset het wachtwoord opnieuw via de instellingenpagina.

## Stappen
1. Open Instellingen en kies Beveiliging.
2. Klik op Wachtwoord wijzigen en volg de stappen.
3. Log opnieuw in met het nieuwe wachtwoord.

## Veelgestelde vragen
- Werkt het nog niet? → Neem contact op met support.

## Neem contact op met support wanneer
Je account geblokkeerd blijft na drie pogingen.`.padEnd(
  ARTICLE_CONTENT_MIN_LENGTH + 20,
  "."
);

describe("hasActionableArticleContent", () => {
  it("accepts markdown with numbered steps", () => {
    expect(hasActionableArticleContent(validArticle)).toBe(true);
  });

  it("rejects short placeholder-only text", () => {
    expect(hasActionableArticleContent("Raadpleeg de handleiding voor meer info.")).toBe(false);
  });

  it("rejects text without steps or sections", () => {
    const longText = "a".repeat(ARTICLE_CONTENT_MIN_LENGTH + 1);
    expect(hasActionableArticleContent(longText)).toBe(false);
  });
});

describe("articleContentValidationMessage", () => {
  it("returns null for valid article content", () => {
    expect(articleContentValidationMessage(validArticle)).toBeNull();
  });

  it("returns length error for short content", () => {
    expect(articleContentValidationMessage("Te kort")).toMatch(/minimaal/);
  });

  it("returns structure error for placeholder-only long text", () => {
    const placeholder = "Zie de documentatie voor details. ".repeat(30);
    expect(articleContentValidationMessage(placeholder)).toMatch(/concrete stappen/);
  });
});
