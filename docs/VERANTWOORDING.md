# Technisch verantwoordingsdocument — TicketIQ

> **Plakklare tekst voor Word/Google Docs.**  
> Vervang `[PLACEHOLDER]`-velden vóór inlevering. Screenshots invoegen waar aangegeven.  
> Hoofdtekst (secties 1–7): ca. 3.200 woorden. Bijlagen en inhoudsopgave tellen niet mee.

---

## Screenshot-instructies (Stap 0)

Maak de volgende afbeeldingen vóór of tijdens het opmaken van het PDF-document.

### UI-screenshots (1–3 stuks, voor sectie 2)

| Nr. | Wat vastleggen | Waar |
|-----|----------------|------|
| **Fig. 1** | Dashboard home: statistiekkaarten + AI-chatpaneel met “Analyseer tickets”-knop | `https://ticket-iq-zeta.vercel.app/dashboard/home` (ingelogd) |
| **Fig. 2** | Suggesties-overzicht met statusfilters, of detailpagina met goedkeuren/afwijzen | `/dashboard/suggestions` |
| **Fig. 3** *(optioneel)* | AI-chat tijdens analyse: zichtbare tool-calls (`fetchTickets`, `saveSuggestion`) | Start analyse van 25 tickets en screenshot tijdens streaming |

**Tips:** gebruik een schone testaccount; verberg gevoelige e-mailadressen indien nodig; voeg bijschriften toe onder elke afbeelding.

### Database-screenshot (voor sectie 4)

| Nr. | Wat vastleggen | Waar |
|-----|----------------|------|
| **Fig. 4** | ERD met alle 5 tabellen en relaties | Supabase Dashboard → **Database** → **Schema Visualizer** |
| **Fig. 5** *(optioneel, ook voor presentatie)* | RLS ingeschakeld + policy `tickets_select_own` | Supabase → **Authentication** niet nodig; ga naar **Database** → **Tables** → `tickets` → tab **Policies** |

---

## 1. Titelblad

| Veld | Inhoud |
|------|--------|
| **Student** | Marianne Snoodijk |
| **Inleverdatum** | [INLEVERDATUM] |
| **Leerlijn** | AI Developer (30 EC) |
| **Ondertitel** | TicketIQ — AI-gedreven analyse van supporttickets |
| **GitHub** | https://github.com/mariannesnoodijk/TicketIQ |
| **Productie (Vercel)** | https://ticket-iq-zeta.vercel.app |
| **Supabase REST API** | `https://xmgcfjdgwpikclovbxiv.supabase.co/rest/v1/` |
| **Docent** | [NAAM DOCENT] |

---

## 2. Samenvatting

TicketIQ is een AI-gedreven webapplicatie die supportmedewerkers helpt terugkerende klantproblemen sneller te herkennen. De applicatie importeert geanonimiseerde supporttickets via de DummyJSON Custom Response API, slaat ze op in een Supabase-database met row-level security, en analyseert patronen met een meerstaps AI-agent op basis van de Vercel AI SDK (GPT-4.1 mini). De agent clustert tickets, wijst categorieën toe, controleert op bestaande helpcenter-artikelen en genereert maximaal vijf nieuwe artikelsuggesties per analyse. Gebruikers kunnen registreren en inloggen via Supabase Auth, tickets organiseren met categorieën en labels, en AI-suggesties bekijken, bewerken, goedkeuren of laten herschrijven na feedback. De frontend is gebouwd met Next.js 16, TypeScript en Tailwind CSS; de productieomgeving draait op Vercel.

*(ca. 118 woorden)*

---

## 3. Introductie

### Probleem en doelgroep

Supportteams ontvangen dagelijks grote hoeveelheden klantvragen. Handmatig doorlopen van honderden tickets om terugkerende problemen te spotten, kost veel tijd en leidt tot gemiste patronen. Documentatie- en productteams hebben bovendien moeite om helpcenterartikelen actueel te houden wanneer de onderliggende klantvragen niet systematisch worden geanalyseerd.

**TicketIQ** richt zich op supportmedewerkers, productteams en managers die sneller inzicht willen in terugkerende klantproblemen en concrete voorstellen voor verbeterde documentatie nodig hebben.

### Kernfunctionaliteiten

De applicatie implementeert vier kernfunctionaliteiten conform de goedgekeurde casus:

1. **Registreren en inloggen** — Supabase Auth met sessiebeheer, routebescherming en server-side validatie.
2. **AI-analyse (agent-based flow)** — een `ToolLoopAgent` analyseert tickets, detecteert patronen en slaat helpcenter-suggesties op. De AI *interpreteert* data: hij clustert, redeneert over terugkerende problemen en schrijft artikelen; hij stuurt tickets niet ongewijzigd door.
3. **Ticket-ingestie en organisatie** — import uit de DummyJSON API, opslag in Supabase, categorieën, labels en filters.
4. **Dashboard en suggesties-beheer** — statistieken, goedkeuren/afwijzen van suggesties, AI-herschrijving na feedback en goedgekeurde artikelen als documentatiebibliotheek.

### Technische context

De stack bestaat uit Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Supabase (PostgreSQL + Auth + RLS), React Query voor client-side databeheer, en de Vercel AI SDK v7 met `ToolLoopAgent`, tool calling en streaming responses. Externe ticketdata komt uit de [DummyJSON Custom Response API](https://dummyjson.com/docs/custom-response); het model is GPT-4.1 mini via de OpenAI-provider.

### Screenshots

- **Fig. 1** — Dashboard home met statistieken en AI-chatpaneel.
- **Fig. 2** — Suggesties-overzicht of detailpagina met goedkeurworkflow.
- **Fig. 3** *(optioneel)* — Streaming analyse met zichtbare tool-calls.

*(ca. 320 woorden)*

---

## 4. Technische implementatie AI-dataflow

Deze sectie beantwoordt de acht vragen over de AI-implementatie, onderbouwd met concrete codevoorbeelden uit de broncode.

### 4.1 Hoe haalt de applicatie data op uit de externe API?

Ticketdata wordt op twee manieren uit de DummyJSON Custom Response API gehaald.

**Pad A — server-side import (ingestie):** de route `POST /api/tickets/import` roept `fetchDummyJsonTickets()` aan. Deze functie leest de URL uit `NEXT_PUBLIC_DUMMYJSON_TICKETS_URL`, doet een `fetch` met cache-revalidatie van één uur, en valideert de JSON met Zod:

```typescript
export async function fetchDummyJsonTickets(): Promise<DummyJsonTicket[]> {
  const response = await fetch(getDummyJsonTicketsUrl(), {
    next: { revalidate: 3600 },
  });
  const json: unknown = await response.json();
  return dummyJsonTicketsSchema.parse(json);
}
```

De import mapt velden (`onderwerp` → `subject`, `body`, labels) naar de `tickets`-tabel, slaat het volledige bronrecord op in `raw_payload` (jsonb), en is idempotent via `UNIQUE(user_id, external_id)`.

**Pad B — agent tool calling (live demo):** de agent-tool `fetchTickets` accepteert `source: "api"`. Bij die waarde roept de tool dezelfde DummyJSON-client aan, filtert en sorteert resultaten, en retourneert een compacte lijst naar het model. Standaard analyse gebruikt `source: "database"` (geïmporteerde tickets), maar de live API blijft beschikbaar om aan de eindopdracht-eis “externe API via tool calling” te voldoen.

### 4.2 Waar en hoe wordt data verwerkt vóór het naar het model gaat?

Vóór elke agent-aanroep doorloopt de data meerdere bewerkingsstappen:

1. **Import-mapping** — DummyJSON-velden worden genormaliseerd; bij import wordt regelgebaseerd een categorie voorgesteld (`inferCategoryName`) op basis van onderwerp, body en bronlabels.
2. **Body-truncatie** — in `fetchTickets` worden ticket bodies afgekapt tot 350 tekens (`AI_MAX_TICKET_BODY_CHARS`) om tokenverbruik te beperken.
3. **Berichttrimming** — `prepareAgentMessages()` beperkt de chatgeschiedenis tot 24 berichten en kapt gebruikersberichten af op 2000 tekens.
4. **Topic-guard** — off-topic berichten (grappen, algemene kennis) worden server-side gedetecteerd via `isClearlyOffTopicMessage()` en beantwoord met een synthetische stream *zonder* OpenAI-call.
5. **Rate limiting** — maximaal 15 agent-requests per gebruiker per uur.

### 4.3 Hoe ziet de input naar het model eruit?

De modelinput bestaat uit een **system prompt** plus **user messages** (chatgeschiedenis of analyse-trigger).

De system prompt (`TICKET_IQ_AGENT_INSTRUCTIONS`) definieert rol, zeven stappen werkwijze, vaste categorieën, markdown-structuur voor artikelen, taalconstraint en scope-regels. De “Analyseer tickets”-knop stuurt een dynamische user prompt via `buildAnalyzePrompt()`:

```typescript
return `Roep \`fetchTickets\` aan met \`source: "database"\` en \`limit: ${limit}\` om de ${limit} meest recente geïmporteerde supporttickets op te halen. Analyseer deze tickets: zoek terugkerende patronen, categoriseer ze met assignTicketCategory, controleer op duplicaten en sla maximaal 5 nieuwe helpcenter-suggesties op. Leg daarna uit wat je hebt gevonden.`;
```

Zo start elke standaardanalyse dezelfde meerstaps-flow zonder de system prompt te wijzigen.

### 4.4 Hoe wordt de output van het model verwerkt?

De agent-output wordt via **streaming** naar de UI gestuurd (`createAgentUIStreamResponse`). Tijdens de loop roept het model tools aan; resultaten verschijnen als tool-call parts in de chat.

Structurele output wordt opgeslagen via tools:

- `assignTicketCategory` — werkt `tickets.category_id` bij op basis van `external_id`.
- `saveSuggestion` — valideert input met Zod, controleert artikelstructuur (min. 400 tekens, genummerde stappen), weigert duplicaten, en insert in `ai_suggestions` met `metadata` jsonb (reasoning, bron-ticket-IDs, confidence).

Bij suggestie-revisie (aparte flow) gebruikt `POST /api/suggestions/[id]/revise` `generateObject` met een Zod-schema voor gestructureerde output — geen multi-step agent, maar wel dezelfde artikelvalidatie.

### 4.5 Hoe zijn de stappen binnen de AI-agent met maxSteps ingericht?

De agent is een `ToolLoopAgent` met `stopWhen: isStepCount(8)` (configureerbaar via `AI_MAX_AGENT_STEPS`). Elke “step” is één model-iteratie waarin het model kan antwoorden en/of tools aanroept. De system prompt schrijft een vaste volgorde voor:

1. `fetchTickets` → 2. clusteren → 3. categorie kiezen → 4. `assignTicketCategory` → 5. `findExistingSuggestions` → 6. `saveSuggestion` (max. 5) → 7. samenvatting in antwoord.

Acht stappen bieden ruimte voor meerdere tool-calls per cluster zonder runaway loops. De limiet is een harde grens in code; de prompt is een zachte richtlijn voor voorspelbaar gedrag.

```typescript
return new ToolLoopAgent({
  model: AGENT_MODEL,
  instructions: getAgentInstructions(locale),
  maxOutputTokens: AI_LIMITS.maxAgentOutputTokens,
  tools: { fetchTickets, assignTicketCategory, findExistingSuggestions, saveSuggestion },
  stopWhen: isStepCount(AI_LIMITS.maxAgentSteps),
});
```

### 4.6 Welke tools en skills zijn geïntegreerd en waarom?

**Runtime agent tools (4):**

| Tool | Doel |
|------|------|
| `fetchTickets` | Data ophalen uit database of DummyJSON; hybride ontwerp voor UX én beoordelingseis |
| `assignTicketCategory` | Tickets koppelen aan vaste categorieën; maakt filterbare data |
| `findExistingSuggestions` | Duplicaatcontrole vóór opslag |
| `saveSuggestion` | Persistente opslag met validatie |

**Ontwikkel-skills (niet runtime):** via Skills.sh zijn `vercel-react-best-practices`, `ai-sdk`, `supabase` en `web-design-guidelines` geïnstalleerd in `.agents/skills/`. Deze stuurden AI-ondersteund ontwikkelen in Cursor, niet het productiegedrag van de agent.

### 4.7 Foutafhandeling en fallback-mechanismen

Foutafhandeling is gelaagd:

- **Route-niveau:** 400 (ongeldige input), 401 (niet ingelogd), 429 (rate limit met `Retry-After`), 503 (ontbrekende API-key), 500 (onverwachte fout).
- **Tool-niveau:** tools vangen exceptions en retourneren `{ error: "..." }` in plaats van te crashen; de prompt instrueert het model om fouten te erkennen en alternatieven te bieden.
- **Validatie-niveau:** `saveSuggestion` weigert korte artikelen, ongeldige categorieën en duplicaten vóór database-insert.
- **Off-topic fallback:** synthetische stream zonder modelcall — bespaart tokens en houdt scope strak.
- **Topic-guard bypass:** analyse-prompts met tool-namen worden niet geblokkeerd, zodat de standaardflow niet false-positive triggert.

### 4.8 Ontwerpkeuzes voor autonomie, betrouwbaarheid en voorspelbaarheid

De agent krijgt voldoende autonomie om zelf tools te kiezen en clusters te vormen, maar binnen bewuste grenzen die betrouwbaarheid en voorspelbaarheid waarborgen.

**Genummerde werkwijze in de system prompt.** De zeven stappen (ophalen → clusteren → categoriseren → duplicate-check → opslaan → uitleggen) sturen de agent naar een vaste tool-volgorde. Zonder die structuur sloeg eerdere versies soms `findExistingSuggestions` of `assignTicketCategory` over. De prompt behoudt autonomie binnen elke stap, maar maakt de overall flow reproduceerbaar.

**Vaste categorielijst (11 standaardcategorieën).** Categorieën staan zowel in de prompt als in code (`DEFAULT_CATEGORIES` / `allowedCategoryNames`). Daardoor kan het model niet vrij nieuwe labels verzinnen die niet in de database bestaan. `assignTicketCategory` en `saveSuggestion` weigeren ongeldige namen — minder hallucinaties en consistente filters in het dashboard.

**Zod-schemas op tool-input en opslag.** Soft constraints in de prompt (“schrijf volledige artikelen”) zijn niet genoeg. Zod valideert parameters vóór uitvoering; `articleContentValidationMessage()` weigert te korte of placeholder-achtige content vóór insert. Zo blijft ongeldige modeloutput buiten de database.

**Tokenlimieten (25/50 tickets, 8 stappen, 4096 output tokens).** Zonder caps kan een agent lange chathistorie of “alle tickets” analyseren en kosten/latency laten oplopen. De limieten in `limits.ts` (configureerbaar via `AI_*` env vars) houden demo’s en productie voorspelbaar, zonder de kern-analyse onmogelijk te maken.

**Database-default voor analyse.** De “Analyseer”-knop gebruikt `source: "database"`. Live DummyJSON blijft beschikbaar voor demo’s, maar categorisatie en opslag vereisen geïmporteerde rijen met `external_id`. Zo faalt de agent niet stilzwijgend op een lege of niet-gekoppelde dataset.

**Menselijke goedkeuring (`pending` → `approved`).** Nieuwe suggesties landen altijd als `pending`. Supportmedewerkers bekijken, bewerken of afwijzen vóórdat iets als documentatie geldt. De AI blijft autonoom in voorstellen; publicatie blijft een menselijke beslissing.

**Scope-guard (prompt + server).** De system prompt weigert off-topic verzoeken; de server-side topic-guard blokkeert duidelijke gevallen zonder OpenAI-call. Dat beperkt tokenverspilling en houdt antwoorden binnen de TicketIQ-casus — belangrijk voor betrouwbaarheid tijdens beoordeling of demo.

*(ca. 1.050 woorden voor sectie 4)*

---

## 5. Database-ontwerp en AI-gerelateerde dataverwerking

### 5.1 ERD (visueel)

**Fig. 4** toont het Entity-Relationship Diagram uit de Supabase Schema Visualizer. Het schema bevat vijf publieke tabellen, alle gekoppeld aan `auth.users` via `user_id`.

### 5.2 Schema-toelichting

| Tabel | PK | Belangrijkste relaties | Kardinaliteit |
|-------|-----|------------------------|---------------|
| `categories` | `id` (uuid) | `user_id` → `auth.users` | 1 gebruiker : N categorieën |
| `tickets` | `id` (uuid) | `user_id` → users; `category_id` → categories (optioneel) | 1 gebruiker : N tickets; N tickets : 0–1 categorie |
| `labels` | `id` (uuid) | `user_id` → users | 1 gebruiker : N labels |
| `ticket_labels` | `(ticket_id, label_id)` | FK naar tickets en labels | M:N tussen tickets en labels |
| `ai_suggestions` | `id` (uuid) | `user_id` → users; `category_id` → categories (optioneel) | 1 gebruiker : N suggesties |

**Constraints:** `UNIQUE(user_id, name)` op categories en labels; `UNIQUE(user_id, external_id)` op tickets voor idempotente import; `CHECK`-constraints op `status` en `priority`; `ON DELETE CASCADE` op user-FKs; `ON DELETE SET NULL` op optionele categorie-koppelingen.

### 5.3 RLS-ontwerp

Row Level Security is ingeschakeld op alle vijf tabellen. Het patroon is consistent: alleen rijen waar `auth.uid() = user_id` zijn zichtbaar en bewerkbaar voor directe eigenaarstabellen.

De junction-tabel `ticket_labels` gebruikt indirecte policies via `EXISTS`-subqueries: een gebruiker mag alleen koppelingen zien, toevoegen of verwijderen als hij zowel het ticket als het label bezit.

### 5.4 Policies — concrete voorbeelden

Op directe eigenaarstabellen (`tickets`, `categories`, `labels`, `ai_suggestions`) gelden vier policies per tabel. Voorbeeld voor `tickets`:

**SELECT** — alleen eigen tickets lezen:

```sql
create policy "tickets_select_own"
on public.tickets for select
to authenticated
using ((select auth.uid()) = user_id);
```

**INSERT** — alleen rijen met eigen `user_id` toevoegen (`WITH CHECK`):

```sql
create policy "tickets_insert_own"
on public.tickets for insert
to authenticated
with check ((select auth.uid()) = user_id);
```

**UPDATE** — `USING` beperkt welke rijen je mag wijzigen; `WITH CHECK` voorkomt dat `user_id` naar een andere gebruiker wordt gezet:

```sql
create policy "tickets_update_own"
on public.tickets for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
```

**DELETE** — alleen eigen tickets verwijderen:

```sql
create policy "tickets_delete_own"
on public.tickets for delete
to authenticated
using ((select auth.uid()) = user_id);
```

De junction-tabel `ticket_labels` heeft geen `user_id`-kolom. Ownership loopt via `EXISTS` op tickets en labels. Voorbeeld **INSERT** — beide zijden moeten van de ingelogde gebruiker zijn:

```sql
create policy "ticket_labels_insert_own"
on public.ticket_labels for insert
to authenticated
with check (
  exists (
    select 1
    from public.tickets
    where tickets.id = ticket_labels.ticket_id
      and tickets.user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.labels
    where labels.id = ticket_labels.label_id
      and labels.user_id = (select auth.uid())
  )
);
```

In totaal zijn er **19 policies**: vier per directe eigenaarstabel (16), plus drie voor `ticket_labels` (SELECT, INSERT, DELETE — geen UPDATE, omdat junction-rijen alleen worden toegevoegd of verwijderd).

### 5.5 Rol van de database in de AI-functionaliteit

- **Input:** `tickets` levert `subject`, `body` en `raw_payload` als context voor de agent. `categories` en `labels` ondersteunen filtering en statistieken.
- **Output:** `ai_suggestions` slaat gegenereerde artikelen op (`title`, `summary`, `content`, `status`). Het `metadata` jsonb-veld bevat `reasoning`, `sourceTicketIds`, `duplicateCheck`, `confidence` en revisiegeschiedenis.
- **Enrichment:** `assignTicketCategory` werkt `tickets.category_id` bij; goedgekeurde suggesties (`status = approved`) fungeren als documentatiebibliotheek.

Chatberichten worden *niet* in de database opgeslagen; ze leven in `sessionStorage` voor de sessie.

### 5.6 Risico's en beperkingen

1. **Substring duplicate check** — `findExistingSuggestions` zoekt op tekstuele overlap, niet op semantische gelijkenis. Twee verschillende formuleringen van hetzelfde probleem kunnen als uniek worden gezien.
2. **Metadata-only ticketkoppeling** — bron-tickets worden als `external_id` in metadata opgeslagen, niet via een junction-tabel. Bij ticketverwijdering blijven losse referenties bestaan.
3. **Geen chat-persistentie** — eerdere analyses zijn niet terug te lezen na het wissen van sessionStorage.
4. **Dubbele categorisatie** — import gebruikt regelgebaseerde keywords; de agent kan tickets herclassificeren. Beide bronnen kunnen tijdelijk inconsistent zijn.
5. **AI-outputkwaliteit** — een goedgekeurde suggestie kan inhoudelijk onjuist zijn; menselijke review blijft noodzakelijk.

### 5.7 Verbeteringen voor betrouwbaardere/schaalbaardere AI

- **Embeddings** voor semantische duplicate detection en clustering.
- **Junction-tabel** `ai_suggestion_tickets` voor harde FK-koppeling tussen suggesties en tickets.
- **Redis rate limiting** i.p.v. in-memory (multi-instance Vercel).
- **Audit-log** voor AI-beslissingen (welke tickets, welk model, welke prompt-versie).
- **Chat-opslag** in Supabase voor reproduceerbaarheid en support.

*(ca. 580 woorden)*

---

## 6. AI-assisted ontwikkelproces

### 6.1 Initiële instructies en aanpassingen

Het project is volledig in Cursor gebouwd, gestart met de goedgekeurde TicketIQ-casus en de voorgeschreven repository-structuur. De ontwikkeling verliep in elf pull requests (PR1–PR11): infrastructuur, auth, database, import, AI-agent, suggesties-beheer, UI-polish en tokenbeheersing. Prompts werden iteratief aangescherpt: van een open “analyseer tickets” naar een genummerde zeven-stappen werkwijze, database-default voor `fetchTickets`, en server-side limieten.

### 6.2 Cursor rules

Het bestand `.cursor/rules/general.mdc` (always apply) legt de stack vast: Next.js 16 App Router, TypeScript, Tailwind, Supabase via React Query, Vercel AI SDK met agent en streaming, en documentatie in `docs/`. Aanvullende rules in `api.mdc` en `components.mdc` specificeren route handlers, RLS, en componentconventies. Deze rules zorgden voor consistente output: imports via `@/*`, geen secrets in git, en expliciete verwijzing naar Next.js 16-docs bij twijfel.

### 6.3 Controle op correctheid

Controle vond plaats op drie niveaus:

1. **Handmatige review** — elke PR werd doorgenomen vóór merge; architectuurkeuzes vastgelegd in `docs/AI-DECISIONS.md`.
2. **Geautomatiseerde tests** — Vitest-tests voor validatie, mapping, filters en prompts (`src/**/*.test.ts`).
3. **Runtime-verificatie** — AI SDK v7 API's geverifieerd in `node_modules/ai/docs/`; Supabase policies getest met twee testaccounts voor data-isolatie.

### 6.4 Mate van controle

De ontwikkelaar behield architectuur- en merge-beslissingen. Cursor genereerde scaffold, hooks, migraties en UI-componenten; kritieke paden (RLS-policies, agent-configuratie, tokenlimieten, topic-guard) werden actief gecontroleerd en bijgestuurd. Bij breaking changes in Next.js 16 (bijv. `proxy.ts` i.p.v. `middleware.ts`) werd documentatie geraadpleegd vóór acceptatie van gegenereerde code.

### 6.5 Aanpassingen aan gegenereerde code

Een ruwe schatting: **60–70%** van de gegenereerde code werd direct gebruikt of licht aangepast; **30–40%** vereiste substantiële herschrijving. Voorbeelden van herschrijving:

- Hybride `fetchTickets` (database + API) ter vervanging van een puur API-only ontwerp.
- Regelgebaseerde import-categorisatie naast AI-categorisatie.
- Server-side topic-guard en rate limiting — niet in eerste AI-voorstel aanwezig.
- i18n (NL/ENG) doorgetrokken naar prompts, validatie en UI.

### 6.6 Drie beperkingen/onzekerheden in AI-output

| Beperking | Oorzaak | Effect |
|-----------|---------|--------|
| Verouderde Next.js-patronen | Training data ≠ Next.js 16 | Verkeerde middleware-API voorgesteld; handmatig gecorrigeerd |
| Te optimistische agent-flow | AI onderschatte tokenkosten | Eerste versie sloeg stappen over; prompt herschreven met expliciete tool-namen |
| Oppervlakkige security | AI genereerde RLS zonder `WITH CHECK` op UPDATE | Handmatig aangevuld volgens Supabase security-checklist |

### 6.7 Maatregelen voor betrouwbaarheid

- Zod-validatie op API-input, tool-parameters en structured output.
- `articleContentValidationMessage()` vóór opslag van suggesties.
- Rate limits en token caps in `src/lib/ai/limits.ts`.
- Topic-guard en scope-sectie in system prompt.
- UI-feedback bij fouten (429, 503, tool-errors in chat).
- Menselijke goedkeuring voordat suggesties productie-documentatie worden.

### 6.8 Drie inzichten voor nieuwe studenten

1. **Begin met project rules en skills** — `.cursor/rules` en Skills.sh (`ai-sdk`, `supabase`) leveren consistentere output dan losse prompts.
2. **Vertrouw AI niet blind op security en limieten** — RLS, rate limiting en inputvalidatie altijd zelf controleren en testen met meerdere accounts.
3. **Documenteer prompts en beslissingen tijdens bouwen** — `PROMPT-LOG.md` en `AI-DECISIONS.md` besparen veel tijd bij het verantwoordingsdocument; iteraties op prompts zijn waardevoller bewijs dan een perfecte eerste versie.

*(ca. 560 woorden)*

---

## 7. Prompt design

### 7.1 Belangrijke prompts

| Prompt | Locatie | Rol |
|--------|---------|-----|
| `TICKET_IQ_AGENT_INSTRUCTIONS` | `src/lib/ai/prompts.ts` | System prompt analyse-agent (NL) |
| `TICKET_IQ_AGENT_INSTRUCTIONS_EN` | idem | Engelse variant |
| `buildAnalyzePrompt()` | `src/lib/ai/analyzePrompt.ts` | User prompt “Analyseer tickets”-knop |
| `REVISE_SUGGESTION_INSTRUCTIONS` | `src/lib/ai/prompts.ts` | System prompt suggestie-herschrijving |
| Tool descriptions | `src/lib/ai/tools/*.ts` | Sturen tool-selectie door het model |

### 7.2 Typische iteratie

1. **Eerste versie:** “Analyseer de tickets en geef suggesties.” → agent sloeg `findExistingSuggestions` en `assignTicketCategory` over.
2. **Aanpassing:** genummerde werkwijze (1–7) met expliciete tool-namen in system prompt.
3. **Test:** analyse op 50 tickets → artikelen te dun (“raadpleeg de handleiding”).
4. **Aanpassing:** `ARTICLE_STRUCTURE_TEMPLATE` + server-side validatie (min. 400 tekens, genummerde stappen).
5. **Test:** analyse zonder import → categorisatie faalde.
6. **Aanpassing:** `buildAnalyzePrompt` default `source: "database"`; API alleen op verzoek.
7. **Finale hardening:** tokenlimieten, topic-guard, scope-sectie.

### 7.3 Drie prompts die goed werkten

1. **Genummerde werkwijze (1–7)** — voorspelbare tool-volgorde bij elke analyse.
2. **Vaste categorielijst in system prompt** — minder ongeldige categorieën bij `assignTicketCategory`.
3. **`buildAnalyzePrompt` met expliciete `fetchTickets`-aanroep** — consistente start van de standaardflow vanuit de UI-knop.

### 7.4 Drie prompts die minder goed werkten

1. **“Analyseer tickets” (te open)** — agent verkortte de flow; opgelost met stappenplan en tool-namen.
2. **Suggesties zonder structuur-template** — generieke verwijzingen i.p.v. stappen; opgelost met markdown-template + validatie.
3. **“Alle tickets analyseren”** — te hoge tokenkosten; opgelost met UI-keuze 25/50 en server-side cap op 50.

### 7.5 Invloedrijke prompt-onderdelen

- **Structuur** (genummerde stappen, markdown-secties) — sterkste invloed op voorspelbaarheid.
- **Constraints** (max. 5 suggesties, min. 3 tickets per cluster, NL/EN taal) — begrenzen creativiteit.
- **Expliciete tool-namen** — sturen tool calling; vager taalgebruik leidt tot inconsistent gedrag.
- **Roldefinitie** (“Je bent TicketIQ, een AI-analist”) — houdt antwoorden in domein-context.

### 7.6 Afhankelijkheid van prompt en inputdata

Outputkwaliteit hangt sterk samen met beide:

- **Prompt** bepaalt workflow, structuur en grenzen.
- **Inputdata** bepaalt inhoudelijke rijkdom: geïmporteerde tickets met volledige bodies leveren betere artikelen dan afgekapte API-samples; regelgebaseerde categorisatie bij import verbetert dashboard-statistieken vóór AI-analyse; de aanwezigheid van bestaande suggesties beïnvloedt duplicate-beslissingen.

Zonder geïmporteerde tickets faalt de standaardanalyse-flow op categorisatie en opslag — de prompt alleen is niet voldoende.

*(ca. 430 woorden)*

---

## 8. Conclusie

Met TicketIQ heb ik een volledige AI-first webapplicatie gebouwd waarin externe data, een relationele database en een meerstaps AI-agent samenkomen. De grootste meerwaarde van AI-ondersteund ontwikkelen zat in snelheid: scaffold, hooks, migraties en UI-patronen werden in dagen in plaats van weken opgezet. Tegelijkertijd werd duidelijk dat controle essentieel blijft — op security (RLS), op kosten (tokenlimieten), en op outputkwaliteit (validatie en menselijke goedkeuring).

De casus-eis dat AI data *interpreteert* in plaats van doorstuurt, is ingevuld door clustering, redenering in `metadata.reasoning`, het schrijven van volledige artikelen, en duplicate-controle vóór opslag. Beperkingen zoals oppervlakkige duplicate detection en het ontbreken van chat-persistentie zijn bewust geaccepteerd voor de scope van deze opdracht, met concrete verbetervoorstellen voor productie.

Voor de leerlijn AI Developer levert dit project aantoonbaar inzicht in AI Fundamentals (betrouwbaarheid, scope), Technical Foundations (Next.js, Supabase, RLS), Integration & AI tooling (Cursor, Vercel AI SDK), en Advanced AI Features (agents, tool calling, streaming, contextmanagement).

*(ca. 175 woorden)*

---

## Bijlagen

> Niet meetellen in woordenaantal hoofdtekst.

### Bijlage A — Volledige agent-instructie (NL)

```
Je bent TicketIQ, een AI-analist voor supporttickets.

## Taak
Analyseer supporttickets om terugkerende klantproblemen te herkennen en concrete suggesties
voor helpcenterartikelen te genereren. Je interpreteert en verrijkt de data — je stuurt
tickets niet alleen door.

## Werkwijze (volg deze stappen)
1. Roep `fetchTickets` aan om ticketdata te verzamelen.
   - Standaard analyse: `source: "database"` (geïmporteerde tickets van de ingelogde gebruiker).
   - Live brondata: `source: "api"` (DummyJSON Custom Response API). Gebruik dit alleen wanneer de gebruiker expliciet om live/API-data vraagt, of om ruwe externe data te tonen vóór import.
   - Voor categorisatie en suggesties opslaan is `source: "database"` vereist (tickets moeten geïmporteerd zijn).
2. Groepeer tickets op terugkerende thema's of problemen (minimaal 3 vergelijkbare tickets per cluster).
3. Kies per cluster één categorie uit de vaste lijst hieronder.
4. Roep `assignTicketCategory` aan om de tickets in elk cluster te koppelen aan die categorie (via external_id).
5. Roep `findExistingSuggestions` aan per cluster om te controleren of vergelijkbare documentatie al bestaat.
6. Roep `saveSuggestion` alleen aan voor clusters zonder duplicaat (maximaal 5 suggesties per analyse).
7. Leg in je antwoord uit welke patronen je vond, welke tickets je hebt gecategoriseerd en welke suggesties je hebt opgeslagen.

## Toegestane categorieën
- Verlof & Verzuim
- Salarisverwerking & Loonstroken
- Werkstromen & Automatisering
- Toegang & Rechten
- Bug / Technisch probleem
- Medewerkersbeheer
- Koppelingen & Integraties
- Rapportages & Exports
- Declaraties & Reiskosten
- Beoordelingen & Ontwikkeling
- Overig / Onboarding nieuwe klant

## Regels
- Antwoord in het Nederlands.
- Sla geen suggesties op als `isDuplicate` true is of als het cluster te klein is (< 3 tickets).
- Schrijf volledige helpcenter-artikelen met concrete stappen die de gebruiker direct kan volgen.
- Gebruik exact deze markdown-structuur voor `content`:

## Probleem
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
Wanneer de gebruiker extra hulp nodig heeft.

- Verboden: alleen verwijzen naar "de handleiding" of "documentatie" zonder concrete stappen.
- Minimaal 3 genummerde stappen onder ## Stappen; elke stap beschrijft een uitvoerbare actie.
- Vermeld in `reasoning` waarom je een cluster als terugkerend probleem ziet.
- Bij fouten van tools: leg uit wat misging en geef een bruikbaar alternatief.

## Scope (strikt)
- Je beantwoordt **alleen** vragen over TicketIQ: supporttickets, analyses, patronen, categorieën, labels, helpcenter-suggesties, import, dashboard en het gebruik van deze applicatie.
- Bij off-topic verzoeken (algemene kennis, grappen, gedichten, weer, recepten, huiswerk, random chat): **weiger vriendelijk**, roep **geen tools** aan, en verwijs naar wat je wél kunt doen.
- Bij twijfel of een vraag ticket-gerelateerd is: vraag kort om verduidelijking in plaats van algemene kennis te geven.
```

### Bijlage B — Volledige agent-instructie (EN)

```
You are TicketIQ, an AI analyst for support tickets.

## Task
Analyze support tickets to identify recurring customer problems and generate concrete help center
article suggestions. You interpret and enrich the data — you do not simply forward tickets.

## Workflow (follow these steps)
1. Call `fetchTickets` to collect ticket data.
   - Default analysis: `source: "database"` (imported tickets for the signed-in user).
   - Live source data: `source: "api"` (DummyJSON Custom Response API). Use only when the user explicitly asks for live/API data, or to show raw external data before import.
   - Categorization and saving suggestions require `source: "database"` (tickets must be imported).
2. Group tickets by recurring themes or problems (minimum 3 similar tickets per cluster).
3. Pick one category per cluster from the fixed list below (keep Dutch category names exactly as listed).
4. Call `assignTicketCategory` to link tickets in each cluster to that category (via external_id).
5. Call `findExistingSuggestions` per cluster to check whether similar documentation already exists.
6. Call `saveSuggestion` only for clusters without duplicates (maximum 5 suggestions per analysis).
7. In your reply, explain which patterns you found, which tickets you categorized, and which suggestions you saved.

## Allowed categories
(Zelfde 11 categorieën als Bijlage A — Nederlandse namen ongewijzigd in database.)

## Rules
- Reply in English.
- Do not save suggestions when `isDuplicate` is true or the cluster is too small (< 3 tickets).
- Write full help center articles with concrete steps the user can follow directly.
- Use exactly the markdown structure from Bijlage A for `content`.
- Forbidden: referring only to "the manual" or "documentation" without concrete steps.
- Minimum 3 numbered steps under ## Stappen; each step describes an actionable task.
- Mention in `reasoning` why you see a cluster as a recurring problem.
- On tool errors: explain what went wrong and offer a useful alternative.

## Scope (strict)
- You only answer questions about TicketIQ: support tickets, analyses, patterns, categories, labels, help center suggestions, import, dashboard, and how to use this application.
- For off-topic requests: decline politely, do not call tools, and point to what you can help with.
- When unsure whether a question is ticket-related: ask briefly for clarification instead of answering with general knowledge.
```

### Bijlage C — Revise-instructies (NL + EN)

**NL (`REVISE_SUGGESTION_INSTRUCTIONS`):**

```
Je bent TicketIQ, een AI-schrijver voor helpcenterartikelen.

Herschrijf een afgewezen artikel-suggestie op basis van feedback van een supportmedewerker en
bron-supporttickets. Schrijf in het Nederlands.

Regels:
- Volg exact de markdown-structuur uit de opdracht (Probleem, Oplossing, Stappen, FAQ, Support).
- Geef concrete, uitvoerbare stappen — geen vage verwijzingen naar handleidingen.
- Minimaal 3 genummerde stappen onder ## Stappen.
- Gebruik ticketinhoud om realistische details te verwerken.
- Verbeter titel en samenvatting indien nodig.
```

**EN (`REVISE_SUGGESTION_INSTRUCTIONS_EN`):**

```
You are TicketIQ, an AI writer for help center articles.

Rewrite a rejected article suggestion based on feedback from a support agent and source support
tickets. Write in English.

Rules:
- Follow exactly the markdown structure from the assignment (Probleem, Oplossing, Stappen, FAQ, Support).
- Provide concrete, actionable steps — no vague references to manuals.
- Minimum 3 numbered steps under ## Stappen.
- Use ticket content to incorporate realistic details.
- Improve title and summary when needed.
```

**Dynamische analyse-user prompt (`buildAnalyzePrompt`, NL, limit 50):**

```
Roep `fetchTickets` aan met `source: "database"` en `limit: 50` om de 50 meest recente geïmporteerde supporttickets op te halen. Analyseer deze tickets: zoek terugkerende patronen, categoriseer ze met assignTicketCategory, controleer op duplicaten en sla maximaal 5 nieuwe helpcenter-suggesties op. Leg daarna uit wat je hebt gevonden.
```

### Bijlage D — Overzicht applicatie-prompts

| Nr. | Prompt | Locatie | Model / API |
|-----|--------|---------|-------------|
| 1 | `TICKET_IQ_AGENT_INSTRUCTIONS` (NL) | `src/lib/ai/prompts.ts` | ToolLoopAgent, gpt-4.1-mini |
| 2 | `TICKET_IQ_AGENT_INSTRUCTIONS_EN` | `src/lib/ai/prompts.ts` | idem, locale `en` |
| 3 | `buildAnalyzePrompt(limit, locale)` | `src/lib/ai/analyzePrompt.ts` | User prompt analyse-knop |
| 4 | `REVISE_SUGGESTION_INSTRUCTIONS` | `src/lib/ai/prompts.ts` | generateObject, revise-route |
| 5 | `REVISE_SUGGESTION_INSTRUCTIONS_EN` | `src/lib/ai/prompts.ts` | idem, locale `en` |
| 6 | `buildRevisePrompt()` | `src/lib/suggestions/reviseSuggestion.ts` | Dynamische user prompt revisie |
| 7 | Tool descriptions (4 tools) | `src/lib/ai/tools/*.ts` | Agent tool calling |
| 8 | `ARTICLE_STRUCTURE_TEMPLATE` | `src/lib/ai/articleContent.ts` | Constraint in agent + revise prompts |

Zie ook `docs/PROMPT-LOG.md` voor prompt-iteraties (goed/slecht) en tokenlimieten.

### Bijlage E — Cursor rules (volledige tekst)

**`general.mdc` (always apply):**

```
- Dit is een Next.js (App Router) + TypeScript + Tailwind CSS project met een Supabase backend.
- Alle applicatiecode staat onder src/ (src/app, src/components, src/hooks, src/lib, src/types).
- Gebruik het pad-alias @/* (wijst naar src/*) voor imports binnen de app.
- Let op: dit is Next.js 16 — controleer bij twijfel de meegeleverde docs in node_modules/next/dist/docs/.
- Databewerkingen naar Supabase verlopen client-side via React Query (TanStack Query).
- AI-functionaliteit gebruikt de Vercel AI SDK met een agent (tools + maxSteps) en streaming responses.
- Externe data wordt door de AI geïnterpreteerd/verrijkt, niet alleen doorgestuurd.
- Documenteer keuzes, prompts en architectuurbeslissingen in docs/ (PROMPT-LOG.md, AI-DECISIONS.md).
- Houd de repository-structuur aan zoals beschreven in docs/eindopdracht.md.
```

**`api.mdc`:**

```
- Route handlers staan onder src/app/api/**/route.ts en retourneren een Response/NextResponse.
- Lees secrets uit environment variables (.env.local); commit nooit echte keys.
- Supabase-toegang loopt via de client in @/lib/supabase; dwing dataisolatie af met Row Level Security.
- De AI-agent (src/app/api/agent/route.ts) gebruikt de Vercel AI SDK met tools en maxSteps.
- Bouw foutafhandeling en fallbacks in de AI-flow in; valideer modeloutput vóór opslag in de database.
```

**`components.mdc`:**

```
- Server Components zijn de standaard; voeg alleen "use client" toe wanneer nodig.
- UI in src/components/ui, layout in src/components/layout, features in src/components/features.
- Gebruik cn() uit @/lib/utils voor conditionele Tailwind-classes.
- Houd componenten klein; til datafetching naar hooks of server components.
- Typeer props expliciet; vermijd any.
```

### Bijlage F — Cursor-prompts ontwikkelproces

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
| 12 jul 2026 | Topic guard | Scope in system prompt + off-topic filter in /api/agent | Geen algemene kennis/grappen; bespaart tokens |

**Skills gebruikt:** `vercel-react-best-practices`, `ai-sdk`, `supabase`, `web-design-guidelines` (in `.agents/skills/`).

---

## PDF-checklist (Stap 9)

### Placeholders invullen

- [ ] `[INLEVERDATUM]` op titelblad
- [ ] `[NAAM DOCENT]` op titelblad
- [ ] Bevestig spelling naam: Marianne Snoodijk

### Quickscan (eindopdracht)

- [ ] PDF-formaat
- [ ] Paginanummering
- [ ] Inhoudsopgave met paginanummers (incl. bijlagen)
- [ ] GitHub-, Vercel- en Supabase-URL op titelblad
- [ ] Docent als administrator in Supabase-team (uitnodiging verstuurd)
- [ ] Fig. 1–4 (screenshots) ingevoegd
- [ ] Bijlagen A–F toegevoegd (volledige prompts uit `prompts.ts` kopiëren)
- [ ] Geen storende taal-/spelfouten na eindredactie

### Woordentelling hoofdtekst (excl. bijlagen en inhoudsopgave)

| Sectie | Woorden (circa) |
|--------|----------------|
| 2. Samenvatting | 118 |
| 3. Introductie | 320 |
| 4. AI-dataflow | 1.050 |
| 5. Database | 580 |
| 6. AI-assisted ontwikkeling | 560 |
| 7. Prompt design | 430 |
| 8. Conclusie | 175 |
| **Totaal** | **~3.230** |

Het totaal ligt boven de 3000-woordenrichtlijn (door o.a. uitgebreidere secties 4.8 en 5.4). Optioneel inkorten: sectie 4.1–4.2 of 6.5 met ~200–250 woorden. Ondergrens 2500 is ruimschoots gehaald.

### Aanbevolen inhoudsopgave

1. Samenvatting  
2. Introductie  
3. Technische implementatie AI-dataflow  
4. Database-ontwerp en AI-gerelateerde dataverwerking  
5. AI-assisted ontwikkelproces  
6. Prompt design  
7. Conclusie  
Bijlage A — Agent-instructie (NL)  
Bijlage B — Agent-instructie (EN)  
Bijlage C — Revise-instructies  
Bijlage D — Overzicht applicatie-prompts  
Bijlage E — Cursor rules  
Bijlage F — Cursor-prompts ontwikkelproces  

---

*Document gegenereerd op basis van TicketIQ broncode en `docs/PROMPT-LOG.md`, `docs/AI-DECISIONS.md`, `docs/PROJECT-BRIEF.md`. Laatste broncode-referentie: juli 2026.*
