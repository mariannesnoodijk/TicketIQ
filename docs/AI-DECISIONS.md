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
- **Beslissing:** code onder `src/`, met `components/{ui,layout,features}`, `hooks`, `lib`, `types`; `.cursor/rules`, `.skills`, `docs`.
- **AI-rol:** structuur opgezet met Cursor op basis van het opdrachtdiagram.
- **Gevolgen:** `@/*` alias wijst naar `src/*`.
