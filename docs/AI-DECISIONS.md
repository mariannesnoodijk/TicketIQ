# Architectuurbeslissingen

> Leg hier beslissingen vast die (mede) met AI-hulp zijn gemaakt: keuzes rond stack,
> datamodel, agent-ontwerp, foutafhandeling, etc. Input voor het verantwoordingsdocument.

## Template per beslissing

### <korte titel>
- **Context:** _waar liep je tegenaan / wat moest beslist worden?_
- **Beslissing:** _wat is gekozen?_
- **Alternatieven:** _wat is overwogen en waarom afgevallen?_
- **AI-rol:** _hoe heeft AI hierbij geholpen? Wat heb je zelf gecontroleerd/aangepast?_
- **Gevolgen:** _consequenties voor de applicatie._

---

### Projectstructuur volgens voorgeschreven repository-layout
- **Context:** de eindopdracht schrijft een vaste repo-structuur voor.
- **Beslissing:** code onder `src/`, met `components/{ui,layout,features}`, `hooks`, `lib`, `types`; `.cursor/rules`, `.agents/skills`, `docs`.
- **AI-rol:** structuur opgezet met Cursor op basis van het opdrachtdiagram.
- **Gevolgen:** `@/*` alias wijst naar `src/*`.

### Skills-locatie: `.agents/skills/` in plaats van `.skills/`
- **Context:** de opdracht noemt een `.skills/`-map voor Skills.sh, maar de huidige skills-CLI (`skills@1.5.15`) installeert skills naar de universele `.agents/skills/`-locatie die door alle ondersteunde agents (waaronder Cursor) wordt gelezen.
- **Beslissing:** skills bewust in `.agents/skills/` houden en de lege `.skills/`-placeholder verwijderd. De 4 actieve skills (`vercel-react-best-practices`, `web-design-guidelines`, `ai-sdk`, `supabase`) staan in git, met versies vastgelegd in `skills-lock.json`.
- **Alternatieven:** de opdracht letterlijk volgen met `.skills/` — afgevallen omdat de tooling die map niet meer gebruikt, waardoor de skills niet actief zouden zijn.
- **AI-rol:** skills opgezocht en geïnstalleerd via Cursor; discrepantie tussen opdracht-tekst en tooling gesignaleerd en de veilige optie gekozen.
- **Gevolgen:** reproduceerbaar te installeren met `npx skills experimental_install` (herstelt vanuit `skills-lock.json`). Voldoet aan de eis van minimaal 2 actieve skills incl. `vercel-react-best-practices`.

### Supabase Auth: middleware + server actions
- **Context:** PR2 vereist registreren, inloggen, sessiebeheer en routebescherming volgens de Supabase SSR-aanpak voor Next.js App Router.
- **Beslissing:** `@supabase/ssr` met drie clients (`client.ts`, `server.ts`, `middleware.ts`), root `proxy.ts` (Next.js 16) voor sessie-refresh en redirects, en server actions voor login/registratie/logout. Auth callback op `/auth/callback` voor PKCE/e-mailbevestiging. `(app)/layout.tsx` redirect server-side als fallback.
- **Alternatieven:** client-side-only auth — afgevallen omdat RLS en server components dan geen betrouwbare sessie hebben.
- **AI-rol:** auth-flow ontworpen en geïmplementeerd met Cursor; gebaseerd op Supabase SSR-documentatie.
- **Gevolgen:** `/dashboard` is beschermd; login/register redirecten ingelogde gebruikers. E-mailbevestiging kan later in Supabase Dashboard worden ingeschakeld zonder codewijziging (alleen UX-melding na registratie).

### E-mailbevestiging tijdelijk uit tijdens development
- **Context:** Supabase kan verplichte e-mailbevestiging afdwingen; handig voor productie, maar traag tijdens development.
- **Beslissing:** tijdens development **Confirm email = uit**; vóór inlevering **Confirm email = aan**. De callback-route en registratiemelding ondersteunen beide modi al.
- **Alternatieven:** meteen confirm aan — afgevallen voor snellere iteratie tijdens bouwen.
- **AI-rol:** keuze besproken en vastgelegd; implementatie ondersteunt beide flows via `data.session` na `signUp`.
- **Gevolgen:** bij confirm uit logt registratie direct in; bij confirm aan toont het formulier een “check je e-mail”-melding.

### TicketIQ datamodel: 5 tabellen met user-scoped RLS
- **Context:** PR3 vereist minimaal 4 tabellen met relaties, constraints en RLS. TicketIQ moet tickets organiseren (categorieën + labels), DummyJSON-import ondersteunen en AI-suggesties opslaan.
- **Beslissing:** vijf tabellen: `categories`, `tickets`, `labels`, `ticket_labels` (M:N), `ai_suggestions`. Elke entiteit heeft `user_id → auth.users`. `tickets` heeft `external_id` + `UNIQUE(user_id, external_id)` voor idempotente import, `raw_payload jsonb` voor API-data, en `ticket_created_at` naast `imported_at`. `ai_suggestions` heeft `status`, `summary` en `metadata jsonb` voor AI-redenering/duplicate-check. RLS via `auth.uid() = user_id`; `ticket_labels` via EXISTS op tickets + labels.
- **Alternatieven:** labels als `text[]` op tickets — afgevallen (geen herbruikbaar vocabulaire, lastige statistieken). Aparte `help_articles`-tabel — uitgesteld; goedgekeurde suggesties (`status = approved`) dienen als documentatiebibliotheek. `ai_suggestion_tickets` junction — uitgesteld naar PR4/5.
- **AI-rol:** schema ontworpen en gemigreerd met Cursor; security-checklist (UPDATE met WITH CHECK, geen `auth.role()`) toegepast.
- **Gevolgen:** migraties in `supabase/migrations/`; TypeScript types gegenereerd. CRUD-hooks en DummyJSON-import gebouwd in PR4.

### Ticket-import via server-side API route
- **Context:** PR4 vereist ticket-ingestie uit DummyJSON en CRUD met React Query. Import van ~500 tickets moet idempotent zijn en labels uit de bron automatisch koppelen.
- **Beslissing:** geauthenticeerde POST `/api/tickets/import` haalt DummyJSON op server-side op, mapt velden naar `tickets`, slaat bestaande `external_id`s over, insert in batches van 50, en maakt `labels` + `ticket_labels` aan voor bronlabels. Client-side `useImportTickets` mutation invalideert React Query cache.
- **Alternatieven:** client-side fetch naar DummyJSON — afgevallen (CORS-risico, zwaardere client). Overschrijven bij herimport — afgevallen (sneller overslaan, voorspelbaarder gedrag).
- **AI-rol:** import-flow en hook-structuur ontworpen en geïmplementeerd met Cursor.
- **Gevolgen:** dashboard-importknop; tickets-UI met filters; 11 standaard categorieën seedbaar via knop op `/dashboard/categories`.

### React Query hooks per entiteit
- **Context:** eindopdracht 2.2 vereist CRUD met React Query inclusief cache-invalidatie.
- **Beslissing:** één hook-bestand per domein (`useCategories`, `useLabels`, `useTickets`, `useTicketLabels` + `useAiSuggestions`), gecentraliseerde `queryKeys` in `src/lib/queryKeys.ts`, Supabase browser-client in hooks, mutations invalidates gerelateerde queries.
- **Alternatieven:** één groot `useTicketIQ`-hook — afgevallen (moeilijker te onderhouden). Server Actions voor reads — afgevallen (React Query patroon vereist client-side fetching met cache).
- **AI-rol:** hook-structuur en invalidatie-patronen opgezet met Cursor.
- **Gevolgen:** herbruikbare data-laag voor PR5 (AI-agent) en PR6 (suggesties-dashboard).
