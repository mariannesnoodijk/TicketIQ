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
