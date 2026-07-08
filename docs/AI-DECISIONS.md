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
