/** Minimale lengte voor volledige helpcenter-artikeltekst. */
export const ARTICLE_CONTENT_MIN_LENGTH = 400;

/** Vaste structuur die de AI moet volgen bij helpcenter-artikelen. */
export const ARTICLE_STRUCTURE_TEMPLATE = `## Probleem
Beschrijf wat de gebruiker ervaart.

## Oplossing (kort)
1–2 zinnen met de kernoplossing.

## Stappen
1. Eerste concrete actie
2. Tweede concrete actie
3. Derde concrete actie (voeg meer stappen toe indien nodig)

## Veelgestelde vragen
- Vraag → kort antwoord

## Neem contact op met support wanneer
Wanneer de gebruiker extra hulp nodig heeft.`;

const PLACEHOLDER_PATTERNS = [
  /raadpleeg (?:de |het )?handleiding/i,
  /zie (?:de |het )?documentatie/i,
  /in de handleiding vind/i,
  /meer informatie in de/i,
];

/** Controleert of content actionable stappen of secties bevat (niet alleen verwijzingen). */
export function hasActionableArticleContent(content: string): boolean {
  if (content.length < ARTICLE_CONTENT_MIN_LENGTH) return false;

  const hasNumberedSteps = /^\s*\d+\.\s/m.test(content);
  const hasBulletSteps = /^\s*[-*]\s/m.test(content);
  const hasSections = /##\s+\S+/m.test(content);

  if (!hasNumberedSteps && !hasBulletSteps && !hasSections) return false;

  const isPlaceholderOnly = PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(content));
  if (isPlaceholderOnly && !hasNumberedSteps) return false;

  return true;
}

export function articleContentValidationMessage(content: string): string | null {
  if (content.length < ARTICLE_CONTENT_MIN_LENGTH) {
    return `Artikeltekst moet minimaal ${ARTICLE_CONTENT_MIN_LENGTH} tekens bevatten.`;
  }

  if (!hasActionableArticleContent(content)) {
    return "Artikeltekst moet concrete stappen of markdown-secties (##) bevatten, niet alleen verwijzingen naar documentatie.";
  }

  return null;
}
