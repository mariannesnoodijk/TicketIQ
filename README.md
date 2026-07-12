# TicketIQ

AI-gedreven analyse van supporttickets voor supportmedewerkers, productteams en managers. TicketIQ importeert tickets via een externe API, analyseert patronen met een AI-agent (Vercel AI SDK) en genereert suggesties voor helpcenter-artikelen. Data wordt opgeslagen in Supabase met row-level security per gebruiker.

## Links

| | URL |
|---|---|
| **GitHub** | https://github.com/mariannesnoodijk/TicketIQ |
| **Productie (Vercel)** | https://ticket-iq-zeta.vercel.app |
| **Supabase REST API** | `https://xmgcfjdgwpikclovbxiv.supabase.co/rest/v1/` |

> De Supabase project-URL (zonder `/rest/v1/`) is: `https://xmgcfjdgwpikclovbxiv.supabase.co`

## Vereisten

- **Node.js** 20 of hoger
- **npm** (meegeleverd met Node)
- Een [Supabase](https://supabase.com)-project (TicketIQ)
- Een **OpenAI API-sleutel** voor de AI-agent
- Optioneel: [Vercel](https://vercel.com)-account voor productie-deploy

## Lokaal opstarten

### 1. Repository clonen en dependencies installeren

```bash
git clone https://github.com/mariannesnoodijk/TicketIQ.git
cd TicketIQ
npm install
```

### 2. Environment variables

Kopieer het voorbeeldbestand en vul de waarden in:

```bash
cp .env.example .env.local
```

| Variabele | Beschrijving |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project-URL (`https://xmgcfjdgwpikclovbxiv.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key (Dashboard → Project Settings → API) |
| `NEXT_PUBLIC_SITE_URL` | Basis-URL van de app (`http://localhost:3000` lokaal) |
| `NEXT_PUBLIC_DUMMYJSON_TICKETS_URL` | DummyJSON Custom Response endpoint voor ticket-import |
| `OPENAI_API_KEY` | OpenAI API-sleutel voor `/api/agent` |

### 3. Supabase configureren

1. Voer de migraties uit uit `supabase/migrations/` op je Supabase-project (via Supabase CLI of SQL Editor).
2. Onder **Authentication → URL Configuration**:
   - **Site URL (lokaal):** `http://localhost:3000`
   - **Redirect URLs:** `http://localhost:3000/auth/callback`
3. Voor productie voeg je de Vercel-URL toe (zie hieronder).

### 4. Development server starten

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Registreer een account, importeer tickets via het dashboard en start een analyse op **Home**.

### 5. Productie-build testen (optioneel)

```bash
npm run build
npm start
```

## Deploy op Vercel

Live: **https://ticket-iq-zeta.vercel.app**

### Stappen

1. Importeer de GitHub-repository `mariannesnoodijk/TicketIQ` op [vercel.com](https://vercel.com).
2. Voeg onder **Environment Variables** (Production + Preview) toe:

   | Variabele | Waarde |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xmgcfjdgwpikclovbxiv.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | _(uit Supabase Dashboard)_ |
   | `NEXT_PUBLIC_SITE_URL` | `https://ticket-iq-zeta.vercel.app` |
   | `NEXT_PUBLIC_DUMMYJSON_TICKETS_URL` | _(zelfde als lokaal)_ |
   | `OPENAI_API_KEY` | _(jouw OpenAI-sleutel)_ |

3. **Redeploy** na het toevoegen of wijzigen van env vars (Deployments → ⋮ → Redeploy).
4. In **Supabase → Authentication → URL Configuration**:
   - **Site URL:** `https://ticket-iq-zeta.vercel.app`
   - **Redirect URLs:** `https://ticket-iq-zeta.vercel.app/auth/callback`

### Diagnose

- `GET /api/health` — controleert of Supabase-, site- en OpenAI-env vars geladen zijn (geen secrets in de response).

### Na deploy controleren

- [ ] `/login` en `/register` laden
- [ ] Inloggen en redirect naar `/dashboard/home`
- [ ] Ticket-import op dashboard
- [ ] AI-analyse starten op Home (vereist `OPENAI_API_KEY`)

## Scripts

| Commando | Beschrijving |
|---|---|
| `npm run dev` | Development server (poort 3000) |
| `npm run build` | Productie-build |
| `npm start` | Productie-server (na `build`) |
| `npm run lint` | ESLint |

## Tech stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS**
- **Supabase** — Auth, PostgreSQL, RLS
- **TanStack Query** — client-side data fetching
- **Vercel AI SDK** — AI-agent met tool calling, streaming en meerstaps-flow
- **DummyJSON Custom Response API** — externe ticket-data

## Projectstructuur

```text
src/
├── app/              # Routes (App Router), API routes
├── components/       # ui/, layout/, features/
├── hooks/            # React Query hooks
├── lib/              # Supabase clients, utilities, AI helpers
└── types/            # TypeScript types (o.a. database)
docs/                 # Casus, voortgang, AI-beslissingen
supabase/migrations/  # Databaseschema en RLS policies
```

Meer context: `docs/PROJECT-BRIEF.md` en `docs/eindopdracht.md`.

## Documentatie

- `docs/PROJECT-BRIEF.md` — casusbeschrijving
- `docs/voortgang.md` — checklist eindopdracht
- `docs/AI-DECISIONS.md` — architectuurbeslissingen
- `docs/PROMPT-LOG.md` — gedocumenteerde prompts
