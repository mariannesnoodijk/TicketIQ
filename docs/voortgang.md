# Voortgang – eindopdracht checklist

> Levende checklist om de applicatie tegen de eisen te toetsen. Zie `docs/eindopdracht.md` voor de volledige opdracht.
> Status: `[ ]` = nog niet, `[~]` = deels, `[x]` = klaar.

## Nulmeting (8 jul 2026)

Uitgangspunt: casus **TicketIQ** goedgekeurd. Project bevat een werkende Next.js 16 +
TypeScript + Tailwind v4 opzet volgens de voorgeschreven repo-structuur (`src/`, `.cursor/rules`,
`.agents/skills`, `docs`). Auth (PR2), databaseschema met RLS (PR3), CRUD + ticket-import (PR4),
AI-agent (PR5) en suggesties-beheer (PR6) zijn gebouwd, inclusief revisie-flow na
afwijzing. Supabase-project bestaat;
GitHub (public), Vercel en Skills.sh zijn opgezet (PR1).

## Deelopdracht 1 – Broncode Next.js project (25%)

- [~] Next.js (App Router) + TypeScript + Tailwind CSS, werkend in dev (prod nog niet) zonder kritieke errors (1.1)
- [x] Externe data via netwerkrequests naar een gratis API (DummyJSON) (1.2) — import + tool calling (`fetchTickets` met `source: "api"`)
- [x] AI interpreteert/verrijkt data i.c.m. gebruikersinput — niet alleen doorsturen (1.2)
- [x] Agent-based flow met werkende `maxSteps` meerstaps-aanpak (1.3) — `stopWhen: isStepCount(8)` in AI SDK v7
- [~] Schone, gestructureerde, onderhoudbare code; logische scheiding server/client/utils/data (1.4)
- [~] Minimaal 20 kleine commits met zinvolle messages (1.5)
- [~] Minimaal 5 pull requests gemerged naar `main` (1.5) — PR1–PR5 gemerged; PR6 klaar voor merge
- [x] Repository volgens voorgeschreven structuur
- [ ] Gedeployed op Vercel
- [ ] `README.md` met heldere installatie-instructies
- [x] Minimaal 4 kernfunctionaliteiten (auth + ticket-ingestie + AI-analyse + suggesties-beheer + dashboard-statistieken)

## Deelopdracht 2 – Supabase backend (15%)

- [x] Databaseschema met minimaal 4 tabellen (2.1) — 5 tabellen: categories, tickets, labels, ticket_labels, ai_suggestions
- [x] Passende relaties (foreign keys) en constraints (PK, not null, unique) (2.1)
- [x] CRUD-operaties met React Query voor relevante entiteiten (2.2) — hooks + UI voor alle 5 tabellen
- [x] Supabase Auth: registreren, inloggen, correcte sessieafhandeling (2.3)
- [x] RLS ingeschakeld op relevante tabellen (2.3)
- [x] Werkende policies: gebruiker benadert alleen eigen data (2.3)
- [ ] Supabase REST API base URL in `README.md`
- [ ] Betrokken docent toegevoegd als administrator in Supabase-team

## Deelopdracht 3 – Verantwoordingsdocument (45%)

- [ ] Titelblad (naam, inleverdatum, leerlijntitel, GitHub/Vercel/Supabase URLs)
- [ ] Samenvatting (max 150 woorden)
- [ ] Inhoudsopgave met paginanummering
- [ ] Introductie (probleem, doelgroep, features, 1–3 screenshots)
- [ ] Technische implementatie AI-flow beantwoord + codevoorbeelden (3.1)
- [ ] Database-ontwerp + ERD-screenshot + RLS/policies + risico's (3.2)
- [ ] Agentgedrag: `maxSteps`, system prompts, foutafhandeling onderbouwd (3.3)
- [ ] Prompt design: kritische, iteratieve analyse (3.4)
- [ ] Reflectie op AI-gebruik + leerpunten (3.5)
- [ ] Conclusie
- [ ] Bijlagen: alle app-prompts, agent-instructie, Cursor-instructies
- [ ] Omvang 2500–3000 woorden (excl. inhoudsopgave/bijlagen)
- [ ] Ingeleverd als PDF, pagina's genummerd

## Deelopdracht 4 – (Video)presentatie (10%)

- [ ] Lokale start + globale structuur (max 30–60 sec)
- [ ] Koppeling met Supabase database getoond
- [ ] Supabase-dashboard: tabellen, relaties, RLS, `user_id`-tabel + policy, A/B-isolatie
- [ ] Applicatie op productie-URL getoond
- [ ] Vier kernfunctionaliteiten gedemonstreerd (incl. AI-flow zichtbaar)
- [ ] Ook niet-happy-flow getoond (verkeerde input)
- [ ] Duur max 12 minuten; `.mp4`/`.mov` indien video

## Overige inhoudelijke eisen (Quickscan)

- [x] GitHub repository op **public**
- [x] Skills.sh met minimaal 2 actieve skills (waaronder `vercel-react-best-practices`)
- [x] Vercel AI SDK met werkende AI Agent
- [x] Minimaal 1 externe API via **Tool Calling**
- [x] Streaming responses in de chat-interface
- [x] Architectuurbeslissingen met AI-hulp gedocumenteerd

## Casus (vooraf, ter goedkeuring docent)

- [x] Probleembeschrijving (max 250 woorden)
- [x] AI-interpretatie beschreven
- [x] Gekozen API + documentatielink
- [x] 4 kernfunctionaliteiten benoemd (1 = auth, ≥1 = AI)
- [x] Goedgekeurd door docent
