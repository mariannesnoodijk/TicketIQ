# Voortgang – eindopdracht checklist

> Levende checklist om de applicatie tegen de eisen te toetsen. Zie `docs/eindopdracht.md` voor de volledige opdracht.
> Status: `[ ]` = nog niet, `[~]` = deels, `[x]` = klaar.

## Nulmeting (8 jul 2026)

Uitgangspunt: casus **TicketIQ** goedgekeurd. Project bevat een werkende Next.js 16 +
TypeScript + Tailwind v4 opzet volgens de voorgeschreven repo-structuur (`src/`, `.cursor/rules`,
`.agents/skills`, `docs`). Auth (PR2), databaseschema met RLS (PR3), CRUD + ticket-import (PR4),
AI-agent (PR5), suggesties-beheer (PR6), instellingen/home-layout (PR9) en UI-refresh +
deploy-readiness (PR11) zijn gebouwd. Supabase-project bestaat; GitHub (public), Vercel en
Skills.sh zijn opgezet (PR1).

## Deelopdracht 1 – Broncode Next.js project (25%)

- [x] Next.js (App Router) + TypeScript + Tailwind CSS, werkend in dev én productie zonder kritieke errors (1.1) — https://ticket-iq-zeta.vercel.app
- [x] Externe data via netwerkrequests naar een gratis API (DummyJSON) (1.2) — import + tool calling (`fetchTickets` met `source: "api"`)
- [x] AI interpreteert/verrijkt data i.c.m. gebruikersinput — niet alleen doorsturen (1.2)
- [x] Agent-based flow met werkende `maxSteps` meerstaps-aanpak (1.3) — `stopWhen: isStepCount(8)` in AI SDK v7 (configureerbaar via `AI_MAX_AGENT_STEPS`)
- [x] Geautomatiseerde tests voor kernlogica (validatie, mapping, filters, prompts) — Vitest in `src/**/*.test.ts`
- [x] Schone, gestructureerde, onderhoudbare code; logische scheiding server/client/utils/data (1.4)
- [x] Minimaal 20 kleine commits met zinvolle messages (1.5)
- [x] Minimaal 5 pull requests gemerged naar `main` (1.5) — PR1–PR11 gemerged
- [x] Repository volgens voorgeschreven structuur
- [x] Gedeployed op Vercel — https://ticket-iq-zeta.vercel.app (redeploy na merge PR11 aanbevolen)
- [x] `README.md` met heldere installatie-instructies
- [x] Minimaal 4 kernfunctionaliteiten (auth + ticket-ingestie + AI-analyse + suggesties-beheer + dashboard-statistieken)

## Deelopdracht 2 – Supabase backend (15%)

- [x] Databaseschema met minimaal 4 tabellen (2.1) — 5 tabellen: categories, tickets, labels, ticket_labels, ai_suggestions
- [x] Passende relaties (foreign keys) en constraints (PK, not null, unique) (2.1)
- [x] CRUD-operaties met React Query voor relevante entiteiten (2.2) — hooks + UI voor alle 5 tabellen
- [x] Supabase Auth: registreren, inloggen, correcte sessieafhandeling (2.3)
- [x] RLS ingeschakeld op relevante tabellen (2.3)
- [x] Werkende policies: gebruiker benadert alleen eigen data (2.3)
- [x] Supabase REST API base URL in `README.md` — `https://xmgcfjdgwpikclovbxiv.supabase.co/rest/v1/`
- [x] Betrokken docent toegevoegd als administrator in Supabase-team (uitnodiging verstuurd; acceptatie door docent nog open)

## Deelopdracht 3 – Verantwoordingsdocument (45%)

- [~] Titelblad (naam, inleverdatum, leerlijntitel, GitHub/Vercel/Supabase URLs) — tekst in `docs/VERANTWOORDING.md`; vul `[INLEVERDATUM]` en `[NAAM DOCENT]` in
- [x] Samenvatting (max 150 woorden)
- [ ] Inhoudsopgave met paginanummering — aanbevolen structuur in `docs/VERANTWOORDING.md` § PDF-checklist
- [~] Introductie (probleem, doelgroep, features, 1–3 screenshots) — tekst klaar; screenshots nog invoegen (Fig. 1–3)
- [x] Technische implementatie AI-flow beantwoord + codevoorbeelden (3.1)
- [~] Database-ontwerp + ERD-screenshot + RLS/policies + risico's (3.2) — tekst klaar; Fig. 4 (ERD) nog invoegen
- [x] Agentgedrag: `maxSteps`, system prompts, foutafhandeling onderbouwd (3.3)
- [x] Prompt design: kritische, iteratieve analyse (3.4)
- [x] Reflectie op AI-gebruik + leerpunten (3.5)
- [x] Conclusie
- [x] Bijlagen: alle app-prompts, agent-instructie, Cursor-instructies
- [~] Omvang 2500–3000 woorden (excl. inhoudsopgave/bijlagen) — ca. 3.063 woorden; optioneel ~60 woorden inkorten
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
- [x] NL/ENG taalwissel volledig in UI (header, auth, dashboard, tickets, suggesties, instellingen, AI-chat) + locale-aware AI-agent prompts en server-validatie
- [x] AI-tokenlimieten: analyse 25/50 tickets, rate limits, env-config (`AI_*` in `.env.example`)
- [x] Architectuurbeslissingen met AI-hulp gedocumenteerd

## Casus (vooraf, ter goedkeuring docent)

- [x] Probleembeschrijving (max 250 woorden)
- [x] AI-interpretatie beschreven
- [x] Gekozen API + documentatielink
- [x] 4 kernfunctionaliteiten benoemd (1 = auth, ≥1 = AI)
- [x] Goedgekeurd door docent
