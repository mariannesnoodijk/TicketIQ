# Prompt log

> Documentatie van prompts in de applicatie en relevante Cursor-prompts uit het
> ontwikkelproces. Input voor het verantwoordingsdocument (secties 3.1, 3.3, 3.4 en bijlagen).

---

## Applicatie-prompts (system prompts / model-input)

### 1. AI-analyse-agent — system prompt (NL)

| | |
|---|---|
| **Datum** | 11 jul 2026 (laatste uitbreiding 12 jul 2026) |
| **Feature** | Ticket-analyse via `/api/agent` |
| **Locatie** | `src/lib/ai/prompts.ts` → `TICKET_IQ_AGENT_INSTRUCTIONS` |
| **Model** | `gpt-4.1-mini` via `ToolLoopAgent` (`maxSteps`: 8, configureerbaar via `AI_MAX_AGENT_STEPS`) |

**Doel:** Definieert rol (TicketIQ-analist), werkwijze in 7 stappen, vaste categorieën, markdown-structuur voor artikelen, NL-taalconstraint en foutafhandeling.

**Kernstappen in prompt:**
1. `fetchTickets` (`database` standaard, `api` op verzoek)
2. Clusteren (min. 3 tickets)
3. Categorie kiezen uit vaste lijst
4. `assignTicketCategory`
5. `findExistingSuggestions`
6. `saveSuggestion` (max. 5, geen duplicaten)
7. Samenvatting in antwoord

**Effect:** Agent volgt voorspelbare multi-step flow; tool-keuzes zijn beperkt tot de casus. Off-topic verzoeken worden geweigerd (scope-sectie in prompt + server-side topic-guard zonder OpenAI-call).

---

### 2. AI-analyse-agent — system prompt (EN)

| | |
|---|---|
| **Datum** | 12 jul 2026 |
| **Feature** | Zelfde agent, locale `en` |
| **Locatie** | `src/lib/ai/prompts.ts` → `TICKET_IQ_AGENT_INSTRUCTIONS_EN` |
| **Selectie** | `getAgentInstructions(locale)` in `src/lib/ai/agent.ts` |

**Doel:** Engelse variant; categorienamen blijven Nederlands (database-waarden). Antwoordtaal Engels.

---

### 3. Analyse-knop — dynamische user prompt

| | |
|---|---|
| **Datum** | 11 jul 2026 (locale 12 jul 2026) |
| **Feature** | “Analyseer tickets”-knop op home/dashboard |
| **Locatie** | `src/lib/ai/analyzePrompt.ts` → `buildAnalyzePrompt(limit, locale)` |

**Voorbeeld (NL, limit 50):**
```
Roep `fetchTickets` aan met `source: "database"` en `limit: 50` om de 50 meest recente geïmporteerde supporttickets op te halen. Analyseer deze tickets: zoek terugkerende patronen, categoriseer ze met assignTicketCategory, controleer op duplicaten en sla maximaal 5 nieuwe helpcenter-suggesties op. Leg daarna uit wat je hebt gevonden.
```

**Effect:** Eenduidige trigger voor de standaard analyse-flow; limit (25 of 50 tickets) en taal zijn configureerbaar zonder system prompt te wijzigen. Geen `fetchAll` — tokenbeheersing via `src/lib/ai/limits.ts`.

---

### 4. Suggestie revisie — system prompt (NL + EN)

| | |
|---|---|
| **Datum** | 11–12 jul 2026 |
| **Feature** | `POST /api/suggestions/[id]/revise` |
| **Locatie** | `REVISE_SUGGESTION_INSTRUCTIONS` / `_EN` in `src/lib/ai/prompts.ts` |
| **API** | `generateObject` (niet de analyse-agent) |

**Doel:** Herschrijven van afgewezen suggesties op basis van feedback + brontickets; zelfde markdown-structuur als analyse-agent.

---

### 5. Suggestie revisie — dynamische user prompt

| | |
|---|---|
| **Locatie** | `buildRevisePrompt()` in `src/lib/suggestions/reviseSuggestion.ts` |

**Structuur:**
- Feedback van supportmedewerker
- Huidige titel, samenvatting, inhoud
- Bron-supporttickets (external_id + subject + body)
- Vereiste markdown-structuur (`ARTICLE_STRUCTURE_TEMPLATE`)

**Effect:** Gestructureerde input voor betrouwbare structured output (Zod-schema).

---

### 6. Tool descriptions (agent tools)

| Tool | Locatie | Beschrijving |
|------|---------|--------------|
| `fetchTickets` | `src/lib/ai/tools/fetchTickets.ts` | Haalt tickets op uit database of DummyJSON API |
| `assignTicketCategory` | `src/lib/ai/tools/assignTicketCategory.ts` | Koppelt tickets aan categorie via external_id |
| `findExistingSuggestions` | `src/lib/ai/tools/findExistingSuggestions.ts` | Zoekt vergelijkbare bestaande suggesties |
| `saveSuggestion` | `src/lib/ai/tools/saveSuggestion.ts` | Slaat helpcenter-suggestie op na validatie |

Tool descriptions sturen modelgedrag bij tool selectie; input schemas (Zod) beperken parameters.

---

### 7. Artikelstructuur-template (constraint in prompts)

| | |
|---|---|
| **Locatie** | `src/lib/ai/articleContent.ts` → `ARTICLE_STRUCTURE_TEMPLATE` |

Vaste markdown-secties: Probleem, Oplossing, Stappen, FAQ, Support. Gecombineerd met `articleContentValidationMessage()` vóór opslag.

---

### 8. AI-tokenlimieten (geen model-prompt, wel gedrag)

| | |
|---|---|
| **Datum** | 12 jul 2026 |
| **Feature** | Kostenbeheersing `/api/agent` + `/api/suggestions/[id]/revise` |
| **Locatie** | `src/lib/ai/limits.ts`, `trim-messages.ts`, `rate-limit.ts` |
| **Config** | Optionele `AI_*` env vars in `.env.example` |

**Defaults (streng):**
- Analyse-UI: 25 / 50 tickets (geen “alle”)
- Max tickets per tool: 50
- Chatgeschiedenis: 24 berichten
- Gebruikersbericht: 2000 tekens
- Agent-stappen: 8; output max 4096 tokens/stap
- Rate limit: 15 agent + 15 revise requests/uur per gebruiker

**Effect:** Voorspelbare OpenAI-kosten; minder risico op runaway prompts bij demo of misbruik.

---

## Prompt-iteraties (good / bad — voor verantwoording 3.4)

### Goed werkte

1. **Expliciete stap-voor-stap werkwijze (1–7)** in system prompt → agent roept tools in voorspelbare volgorde aan.
2. **Vaste categorielijst in prompt** → minder hallucinaties bij `assignTicketCategory`.
3. **Markdown-structuur + min. 400 tekens + validatie in code** → minder lege/placeholder-artikelen.
4. **`buildAnalyzePrompt` met vaste tool-aanroep-instructie** → “Analyseer”-knop start consistent de flow.
5. **Hybride `fetchTickets` met `source: database \| api`** → scheiding import vs. live demo zonder dubbele tools.

### Minder goed / verbeterd

1. **Te open eerste versie (“analyseer tickets”)** → agent sloeg stappen over; **oplossing:** genummerde werkwijze + expliciete tool-namen.
2. **Suggesties zonder concrete stappen (“raadpleeg handleiding”)** → **oplossing:** `ARTICLE_STRUCTURE_TEMPLATE` + `hasActionableArticleContent()`.
3. **Alleen live API in analyse** → categorisatie/save faalde zonder import; **oplossing:** default `source: "database"`, API optioneel.
4. **Te korte ticket bodies in tool output (400 tekens)** → trade-off performance vs. context; bewust afgekapt op 350 tekens (`AI_MAX_TICKET_BODY_CHARS`), max 50 tickets per fetch.
5. **Substring duplicate check** → snel maar oppervlakkig; prompt vraagt wel `findExistingSuggestions` aan te roepen vóór save.
6. **“Alle tickets”-analyse** → te duur in tokens; **oplossing:** analyse-UI beperkt tot 25/50, server-side cap op `fetchAll`.

---

## Cursor-prompts (ontwikkelproces)

| Datum | Context | Prompt / instructie | Effect |
|-------|---------|---------------------|--------|
| 8 jul 2026 | Projectstart | Casus TicketIQ + repo-structuur volgens eindopdracht | Basis Next.js + docs-layout |
| 8 jul 2026 | PR1 | GitHub public, Vercel, Skills.sh setup | Deploy-pipeline |
| 9 jul 2026 | PR2 | Supabase Auth SSR: middleware, server actions, route protection | Werkende login/register |
| 9 jul 2026 | PR3 | 5 tabellen + RLS policies volgens security-checklist | Datamodel + beveiliging |
| 10 jul 2026 | PR4 | DummyJSON import idempotent, React Query hooks per entiteit | Ticket-ingestie + CRUD |
| 11 jul 2026 | PR5 | Plan AI-agent: ToolLoopAgent, 4 tools, streaming UI, maxSteps | Agent-based analyse |
| 11 jul 2026 | Import | Regelgebaseerde categorisatie i.p.v. DummyJSON aanpassen | Direct categoriseerbare tickets |
| 11 jul 2026 | PR6 | Suggesties-beheer: goedkeuren, afkeuren, revisie-flow | Kernfunctionaliteit 4 |
| 11 jul 2026 | PR9 | Home split layout + instellingen-pagina | UX-structuur dashboard |
| 12 jul 2026 | PR11 | UI refresh violet theme, dashboard stat cards, deploy README | Productie-polish |
| 12 jul 2026 | Grading feedback | Tests, maxSteps-doc, PROMPT-LOG, NL/ENG toggle | Kwaliteit + i18n-basis |
| 12 jul 2026 | Tokenbeheersing | AI-limieten, rate limits, crash-hardening, env-config | Lagere kosten + stabielere demo |
| 12 jul 2026 | Topic guard | Scope in system prompt + off-topic filter in `/api/agent` | Geen algemene kennis/grappen; bespaart tokens |

**Cursor rules:** `.cursor/rules/general.mdc` — Next.js 16, Supabase via React Query, AI SDK agent, docs in `docs/`.

**Skills gebruikt:** `vercel-react-best-practices`, `ai-sdk`, `supabase`, `web-design-guidelines` (in `.agents/skills/`).

---

## Bijlage: volledige agent-instructie (NL)

Zie bronbestand `src/lib/ai/prompts.ts` → `TICKET_IQ_AGENT_INSTRUCTIONS` (inclusief dynamische categorielijst uit `DEFAULT_CATEGORIES`).

Engelse variant: `TICKET_IQ_AGENT_INSTRUCTIONS_EN`.

---

## Bijlage: volledige revise-instructie (NL)

Zie `src/lib/ai/prompts.ts` → `REVISE_SUGGESTION_INSTRUCTIONS`.

Engelse variant: `REVISE_SUGGESTION_INSTRUCTIONS_EN`.
