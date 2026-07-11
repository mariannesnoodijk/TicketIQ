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
| **W1** | `/dashboard` | Hoog | open | Meer analytics: trends per datum, drukke dagen/seizoenen, top-organisaties per periode |
| **W2** | `/dashboard` | Hoog | **done** | Donut: betere tooltip + klik → tickets van die categorie |
| **W3** | `/dashboard/analyze` → `/dashboard` | Hoog | open | Chat op dashboard, prominenter; stappen inklapbaar; user/AI onderscheid; limiet 50–500–alles |
| **W4** | `/dashboard` + registratie | Normaal | open | Welkom met naam; korte intro op aparte regel; naamveld bij registratie |
| **W5** | `/dashboard/tickets` | Laag | open | Paginering / “toon meer” i.p.v. alle tickets |

### W1 – Analytics (detail)

- **Periode default:** laatste 30 dagen
- **Periode-opties:** dag · week · 90 dagen · jaar · complete periode
- Alle analytics-widgets filteren op dezelfde geselecteerde periode
- Organisaties via `raw_payload.organisatie_naam` (JSONB)

### W3 – Analyze / chat (detail)

- Chat **altijd zichtbaar** op dashboard (niet inklapbaar panel)
- AI-tool-stappen standaard ingeklapt na voltooiing, uitklapbaar
- Duidelijker onderscheid user vs AI in chat
- Ticketlimiet: **50 · 100 · 200 · 500 · alle geïmporteerde tickets**
- “Alle geïmporteerde tickets” vereist agent-tool uitbreiding (Supabase, niet alleen DummyJSON)

### W4 – Welkom (detail)

- Naamveld bij registratie → `user_metadata.full_name`
- Dashboard toont naam i.p.v. e-mail
- Welkom prominenter; uitleg korter op aparte regel

---

## Voortgang & volgorde

```
W2 ✓ → W4 → W1 → W3 (chat UX) → W3 (dashboard-integratie) → W3 (limieten) → W5
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

**Wacht op:** akkoord Marianne → door naar W4

---

## Fase 0 – Inventaris (11 jul 2026)

### Routes en huidige staat

| Route | Component | Demo-prio | Opmerkingen |
|-------|-----------|-----------|-------------|
| `/` | `page.tsx` | Hoog | Basic hero |
| `/dashboard` | `dashboard-content.tsx` | Hoog | Stats + charts; W2 donut klikbaar |
| `/dashboard/tickets` | `tickets-page-content.tsx` | Midden | URL-filter categoryId; paginering W5 |
| `/dashboard/analyze` | `analyze-page-content.tsx` | Hoog | Wordt geïntegreerd in dashboard (W3) |
| `/dashboard/suggestions` | `suggestions-page-content.tsx` | Hoog | |
| Overige | auth, categories, labels | Laag | |

### Guidelines-audit (referentie)

Quick wins (ellipsis, loading-teksten, aria-hidden) staan in backlog fase 4. Zie eerdere audit in git history indien nodig.

---

## Backlog – audit & polish (secundair)

| # | Taak | Status |
|---|------|--------|
| A1 | Mobile navigatie | open |
| A2 | PageHeader component | open |
| A3 | Loading skeletons | open |
| A4 | Gestileerde Select | open |
| A5 | Guidelines quick wins | open |

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
| 11 jul 2026 | Analyze limiet | 50, 100, 200, 500, alle geïmporteerd | Marianne |
| 11 jul 2026 | W2 donut | Geïmplementeerd | Agent |

---

## Volgende stap

**W4** – welkomsttekst + naamveld registratie (na akkoord op W2)
