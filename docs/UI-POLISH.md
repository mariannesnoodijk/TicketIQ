# UI polish – backlog en beslissingen

> Levend document voor branch `feat/ui-polish`. Werkwijze: **jouw wensen → bouw → jij keurt goed → volgende stap**.

## Doel

1. **Demo-klaar** – sterke schermen voor presentatie en eindopdracht-screenshots
2. **Professioneel** – consistente, verzorgde UI over alle pagina's

Leidend principe: **jouw meningen sturen de backlog**; audit/guidelines vullen aan waar nodig.

---

## Jouw wensen (prioriteit)

| ID | Scherm | Prioriteit | Status | Samenvatting |
|----|--------|------------|--------|--------------|
| **W1** | `/dashboard` | Hoog | **done** | Meer analytics: trends per datum, drukke dagen/seizoenen, top-organisaties per periode |
| **W2** | `/dashboard` | Hoog | **done** | Donut: betere tooltip + klik → tickets van die categorie |
| **W3** | `/dashboard/home` + `/dashboard` | Hoog | **done** | Home met chat-conciërge; dashboard = statistieken; analyze weg |
| **W4** | `/dashboard` + registratie | Normaal | **done** | Welkom met naam; korte intro op aparte regel; naamveld bij registratie |
| **W5** | `/dashboard/tickets` | Laag | **done** | “Toon meer” met stappen 50/100/200/500/alle + teller X van Y |

### W1 – Analytics (detail)

- **Periode default:** laatste 30 dagen
- **Periode-opties:** dag · week · 90 dagen · jaar · complete periode
- Alle analytics-widgets filteren op dezelfde geselecteerde periode
- Organisaties via `raw_payload.organisatie_naam` (JSONB)

### W3 – Home + chat (detail)

- **Home** (`/dashboard/home`): landing na login; statisch welkom + AI-chat
- **Dashboard** (`/dashboard`): alleen statistieken/import (geen chat)
- `/dashboard/analyze` → redirect naar Home
- Welkomstbericht: statisch (geen API), met knoppen naar dashboard/tickets/helpcenter + start analyse
- **Nog open (W3 vervolg):** —

### W4 – Welkom (detail)

- Naamveld bij registratie → `user_metadata.full_name`
- Dashboard toont naam i.p.v. e-mail
- Welkom prominenter; uitleg korter op aparte regel

---

## Voortgang & volgorde

```
W2 ✓ → W4 ✓ → W1 ✓ → W3 ✓ → W5 ✓
```

Audit-items (mobile nav, skeletons, …) komen **na** jouw wensen, tenzij expliciet prioriteit.

---

## W2 – Donut interactief (afgerond 11 jul 2026)

**Gedaan:**

- Tooltip toont categorienaam, aantal tickets en percentage
- Klik op donut-segment, legenda of lijst → `/dashboard/tickets?categoryId=…`
- Ongecategoriseerd via `categoryId=uncategorized`
- Tickets-pagina leest `categoryId` uit URL; filter “Ongecategoriseerd” in dropdown
- Lege filterstaat: “Geen tickets voor dit filter” + knop Filters wissen

**Bestanden:** `category-distribution-chart.tsx`, `tickets-page-content.tsx`, `useTickets.ts`, `lib/tickets/constants.ts`, `dashboard/tickets/page.tsx`

**Commit:** `d4c5ad1` — akkoord Marianne

---

## W4 – Welkomst + naam (afgerond 11 jul 2026)

**Gedaan:**

- Registratie: verplicht **Naam**-veld → opgeslagen in `user_metadata.full_name`
- Dashboard: **Welkom terug, {naam}** (groot, prominent); geen e-mail meer
- Uitleg: “Op deze pagina kun je…” op aparte regel
- Bestaande accounts zonder naam: alleen “Welkom terug”

**Bestanden:** `register-form.tsx`, `actions.ts`, `dashboard/page.tsx`, `dashboard-content.tsx`, `lib/auth/displayName.ts`

**Commit:** na akkoord Marianne (zie git log)

---

## W1 – Analytics dashboard (afgerond 11 jul 2026)

**Gedaan:**

- **Periode-selector** (default 30 dagen): dag · week · 30 dagen · 90 dagen · jaar · complete periode
- Datumbadges en concrete datumbereiken in elke grafiek + tooltips
- **Tickets over tijd**, **per weekdag**, **top-organisaties**, **categorie-donut** — klikbaar → gefilterde ticketlijst
- Stat-kaart “Tickets” + “AI-helpcenter-artikelen” tonen aantal in geselecteerde periode
- Statusdiagram verplaatst naar `/dashboard/suggestions` met duidelijke AI/helpcenter-terminologie

**Bestanden:** `lib/analytics/*`, `useTicketAnalytics.ts`, dashboard chart components, `filterUrls.ts`, `suggestions-page-content.tsx`

**Commit:** na akkoord Marianne (zie git log)

---

## W3 – Home + chat-conciërge (afgerond 11 jul 2026)

**Gedaan:**

- **`/dashboard/home`**: welkom + `AgentChatPanel` (default na login)
- **`AgentChatWelcome`**: statisch onboarding met uitleg + navigatieknoppen + start analyse
- **`/dashboard`**: analytics-only; quick link naar AI-assistent
- **`/dashboard/analyze`**: redirect naar Home
- Nav: Home · Dashboard · … (Analyse verwijderd)

**Bestanden:** `home-page-content.tsx`, `agent-chat-panel.tsx`, `agent-chat-welcome.tsx`, `lib/ai/analyzePrompt.ts`, routing + header

**Commit:** `bc51f20` — hybride fetchTickets + limieten; akkoord Marianne

> **Update 12 jul 2026:** AI-analyse-UI gebruikt nu **25 / 50 tickets** (geen 500/alle meer) voor tokenbeheersing. Ticketoverzicht “Toon meer” behoudt 50/100/200/500/alle — dat is alleen UI-weergave, geen AI-context. Zie `src/lib/ai/limits.ts` en `AI_*` env vars.

---

## W3 vervolg – Chat UX (afgerond 11 jul 2026)

**Gedaan:**

- Inklapbare AI-tool-stappen (individueel + groep); antwoord vóór stappen
- Hybride `fetchTickets`: database (standaard) + DummyJSON via `source: "api"`
- Ticketlimieten in **AI-analyse**: 25 · 50 (configureerbaar via `AI_ANALYZE_TICKET_LIMITS`)
- Ticketlimieten in **ticketoverzicht** (alleen weergave): 50 · 100 · 200 · 500 · alle geïmporteerde
- User/AI-styling: gebruiker rechts (primary bubble), AI links (muted card + bot-avatar)

**Bestanden:** `agent-chat-messages.tsx`, `agent-chat-panel.tsx`, `fetchTickets.ts`, `analyzePrompt.ts`, `prompts.ts`

**Commits:** `a7b5805` (tool collapse), `bc51f20` (hybride + limieten), user/AI-styling (deze commit)

---

## W5 – Tickets “toon meer” (afgerond 12 jul 2026)

**Gedaan:**

- Start met 50 tickets; knop **Toon meer** doorloopt 100 · 200 · 500 · alle
- Teller onder tabel: **X van Y tickets**
- Limiet reset naar 50 bij filterwijziging
- Gedeelde limiet-constants in `lib/tickets/limits.ts` (zelfde stappen als AI-analyse)

**Bestanden:** `limits.ts`, `tickets-page-content.tsx`, `analyzePrompt.ts`

**Akkoord:** Marianne (12 jul 2026)

---

## Volgende stap

**Audit & polish afgerond (12 jul 2026)** — PR `#8 feat/ui-audit` → merge naar `main`.

---

## Audit & polish (A1–A5, afgerond 12 jul 2026)

| # | Taak | Status | Commit(s) |
|---|------|--------|-----------|
| A1 | Mobile navigatie (hamburger + slide-down) | **done** | `38768d8` |
| A2 | PageHeader + eyebrows overal | **done** | `7f52186`, `1b0d576` |
| A3 | Loading skeletons (demo-pagina's) | **done** | `0104f62`, `c6eb457` |
| A4 | Select component (native wrapper) | **done** | `5d43011`, `1ca2522` |
| A5 | Guidelines quick wins | **done** | zie git log |

### A5 – Guidelines quick wins (detail)

- `…` i.p.v. `...` in loading-teksten en placeholders
- `aria-hidden` op decoratieve iconen (Loader2, Trash2, Bot, User, …)
- `touch-manipulation` op buttons; `color-scheme` voor dark mode
- `prefers-reduced-motion`: spin-animaties uitgeschakeld
- Skip link “Naar hoofdinhoud” op ingelogde layout
- `spellCheck={false}` op e-mailvelden; `text-balance` op auth-koppen

---

## Backlog – audit & polish (secundair)

| # | Taak | Status |
|---|------|--------|
| A1 | Mobile navigatie | **done** |
| A2 | PageHeader component | **done** |
| A3 | Loading skeletons | **done** |
| A4 | Gestileerde Select | **done** |
| A5 | Guidelines quick wins | **done** |

### Routes en huidige staat

| Route | Component | Demo-prio | Opmerkingen |
|-------|-----------|-----------|-------------|
| `/` | `page.tsx` | Hoog | Basic hero |
| `/dashboard/home` | `home-page-content.tsx` | Hoog | Landing + AI-chat |
| `/dashboard` | `dashboard-content.tsx` | Hoog | Stats + charts |
| `/dashboard/tickets` | `tickets-page-content.tsx` | Midden | URL-filter categoryId; “toon meer” + teller |
| `/dashboard/analyze` | redirect | — | → `/dashboard/home` |
| `/dashboard/suggestions` | `suggestions-page-content.tsx` | Hoog | |
| Overige | auth, categories, labels | Laag | |

### Guidelines-audit (referentie)

Quick wins uitgevoerd in A5 — zie sectie “Audit & polish (A1–A5)” hierboven.

---

## Beslissingenlog

| Datum | Onderwerp | Keuze | Door |
|-------|-----------|-------|------|
| 11 jul 2026 | Werkwijze | Stap voor stap; akkoord per stap | Marianne |
| 11 jul 2026 | Doel | Demo-klaar + professioneel | Marianne |
| 11 jul 2026 | Backlog | Jouw wensen leidend | Marianne |
| 11 jul 2026 | Analytics periode | Default 30 dagen; dag/week/90d/jaar/complete | Marianne |
| 11 jul 2026 | Naam dashboard | Naamveld bij registratie | Marianne |
| 11 jul 2026 | Chat op dashboard | Altijd zichtbaar | Marianne |
| 11 jul 2026 | Home vs dashboard | Home = chat; dashboard = statistieken; analyze redirect | Marianne |
| 11 jul 2026 | Analyze limiet | 50, 100, 200, 500, alle geïmporteerd | Marianne |
| 11 jul 2026 | W3 chat UX | Inklapbare stappen, hybride fetch, limieten, user/AI bubbles | Marianne + Agent |
| 12 jul 2026 | AI-limieten | Analyse 25/50; env-config; rate limits; crash-hardening | Marianne + Agent |
| 12 jul 2026 | Audit A1–A5 | Hamburger nav; PageHeader B; Select native; skeletons demo-only | Marianne |

---

## Volgende stap (project)

- PR `#8 feat/ui-audit` mergen
- Vercel deploy + README
- Verantwoordingsdocument + presentatie
