# Eindopdracht – Leerlijn AI Developer (30 EC)

> Versie 1.3. Gestructureerde markdown-versie van `AI_Developer_eindopdracht_v1.3_(30_EC).pdf`, bedoeld als referentie om de applicatie tegen de eisen te toetsen. Zie `docs/voortgang.md` voor de levende checklist.

## Inhoud

- [Integrale eindopdracht](#integrale-eindopdracht)
- [Op te leveren producten](#op-te-leveren-producten)
- [Casus (vooraf inleveren)](#casus-vooraf-inleveren)
- [Voorbeeldcasussen & API's](#voorbeeldcasussen--apis)
- [Deelopdracht 1 – Broncode Next.js project](#deelopdracht-1--broncode-nextjs-project)
- [Deelopdracht 2 – Supabase cloud-backend met authenticatie](#deelopdracht-2--supabase-cloud-backend-met-authenticatie)
- [Deelopdracht 3 – Verantwoordingsdocument](#deelopdracht-3--verantwoordingsdocument)
- [Deelopdracht 4 – (Video)presentatie](#deelopdracht-4--videopresentatie)
- [Quickscan (inlevereisen)](#quickscan-inlevereisen)
- [Structuur verantwoordingsdocument](#structuur-verantwoordingsdocument)
- [Beoordelingscriteria & weging](#beoordelingscriteria--weging)

---

## Integrale eindopdracht

Bouw zelfstandig een professionele, volwaardige AI-powered webapplicatie waarin je alle geleerde technieken samenbrengt. Aan te tonen leeruitkomsten:

1. **AI Fundamentals** – generatieve AI doelgericht inzetten en kritisch reflecteren op betrouwbaarheid, ethiek en effectiviteit.
2. **Technical Foundations** – schaalbare, professionele full-stack webapplicaties bouwen die modern getypeerd, goed gestileerd, gebruiksvriendelijk en veilig zijn.
3. **Integration & AI tooling** – full-stack webapplicatie in Cursor, integratie van de Vercel AI SDK, iteratief werken aan werkende prototypes.
4. **Advanced AI Features & Production** – professionele AI-first webapplicatie met complexe AI-features (agents, multi-step taken, contextmanagement), gekoppeld aan externe bronnen, en het hele ontwikkelproces kunnen overzien en uitdragen.

> Een voldoende voor de **integrale eindopdracht** is nodig om de leerlijn af te ronden; deelopdrachten ronden geen losse cursussen af.

## Op te leveren producten

- Broncode van een **Next.js** webapplicatie (gedeployed via **Vercel**).
- Een ingerichte **Supabase** backend.
- **Technisch verantwoordingsdocument** (PDF).
- **Demo** van de werkende applicatie (live of videopresentatie).

## Casus (vooraf inleveren)

Vóór deelopdracht 1 lever je je casus ter goedkeuring in bij de docent. Beschrijf in **max. 250 woorden**:

- Welk probleem je applicatie oplost.
- Wat de AI-interpretatie is (wat doet de AI concreet met de data?).
- Welke API je gebruikt (incl. link naar documentatie).
- De **4 belangrijkste functionaliteiten**. Eén is al vergeven aan registreren/inloggen; minimaal één moet een AI-integratie bevatten.

> Kernregel: de applicatie moet **AI combineren met externe data via een gratis API**. De AI moet de data **interpreteren en analyseren, niet alleen doorsturen**.

## Voorbeeldcasussen & API's

Voorbeelden ter inspiratie: Cocktail Sommelier (TheCocktailDB), Recipe Remix (TheMealDB), Quiz Master AI (Open Trivia DB).

| API | Data | URL |
| --- | --- | --- |
| TheCocktailDB | Cocktails & recepten | thecocktaildb.com/api.php |
| TheMealDB | Maaltijden & recepten | themealdb.com/api.php |
| Open Trivia DB | Quizvragen | opentdb.com/api_config.php |
| REST Countries | Landeninformatie | restcountries.com |
| Open Library | Boekendata | openlibrary.org/developers |

Eigen casus met een andere gratis API mag, mits aan alle technische eisen van deelopdracht 1 wordt voldaan.

---

## Deelopdracht 1 – Broncode Next.js project

Ontwikkel een AI-gedreven webapplicatie waarin externe data intelligent wordt verwerkt en gepresenteerd. Flow: data ophalen uit externe API → op basis van gebruikersinput naar een LLM via de Vercel AI SDK → model analyseert/combineert/structureert → resultaat terug naar UI → verrijkte data waar nodig opslaan in eigen database. Documenteer keuzes, prompts en instructies (input voor deelopdracht 3).

**Minimale eigenschappen:**

- Full-stack webapplicatie gebouwd met Cursor. Frontend in **Next.js + TypeScript + Tailwind CSS**, backend in **Supabase**.
- Externe data die met AI wordt verrijkt; opgehaald via netwerkrequests naar een API; resultaten opgeslagen in eigen database.
- Minimaal **4 kernfunctionaliteiten**: registreren/inloggen, minimaal één AI-gedreven functionaliteit (**agent-based flow**) en twee aanvullende functionaliteiten passend bij de casus.
- Repository volgens de voorgeschreven structuur (zie hoofdstuk Structuur).
- Gedeployed naar productie via **Vercel**.
- **Git**-beheer met GitHub: eerste commit = initiële opzet/configuratie; kleine beschrijvende commits; pull requests per feature; regelmatig mergen naar `main`.

**Op te leveren:** projectmap met broncode + `README.md` met installatie-instructies; link naar GitHub-repo en live productie-URL in het verantwoordingsdocument.

## Deelopdracht 2 – Supabase cloud-backend met authenticatie

Ontwerp een logisch datamodel (entiteiten + relaties), met oog voor uitbreidbaarheid, dataconsistentie en performance. Implementeer het in Supabase (tabellen, relaties, constraints). Haal data op in Next.js via **React Query (TanStack Query)**. Regel registratie/login via **Supabase Auth** en beveilig data met **Row Level Security (RLS)** en policies (koppeling data ↔ ingelogde gebruiker, bijv. via `user_id`).

**Minimale eigenschappen:**

- Databaseschema met **minimaal 4 tabellen**.
- Logisch opgebouwde tabellen met passende relaties (foreign keys) en constraints (primary keys, not null, unique).
- Werkende **CRUD-operaties met React Query** voor alle tabellen.
- **Supabase Auth** (registreren, inloggen, correcte sessieafhandeling).
- **RLS** ingeschakeld op relevante tabellen met policies zodat gebruikers alleen hun eigen data kunnen benaderen/aanpassen.

**Op te leveren:** persoonlijke base URL van de Supabase REST API in `README.md`; schemarepresentatie (Schema Visualizer) in het verantwoordingsdocument.

## Deelopdracht 3 – Verantwoordingsdocument

Technisch document waarin je laat zien dat je begrijpt wat je hebt gebouwd, hoe het werkt en welke keuzes je maakte. Onderbouw met concrete voorbeelden (code snippets, prompts, configuraties). Begin al tijdens het ontwikkelen met documenteren.

**Minimaal te beantwoorden vragen:**

### Technische implementatie AI-functionaliteit (tekst + codevoorbeelden)
1. Hoe haalt de applicatie data op uit de externe API?
2. Waar en hoe wordt deze data verwerkt vóór het naar het model gaat?
3. Hoe ziet de input naar het model eruit (prompt + data)?
4. Hoe wordt de output van het model verwerkt in de applicatie?
5. Hoe zijn de stappen binnen de AI-agent met `maxSteps` ingericht?
6. Welke tools en skills zijn geïntegreerd binnen de agent en waarom?
7. Hoe zijn foutafhandeling en fallback-mechanismen in de AI-flow ingericht?
8. Welke ontwerpkeuzes waarborgen autonomie, betrouwbaarheid en voorspelbaarheid van de AI-functionaliteit?

### Database-ontwerp en AI-gerelateerde dataverwerking
1. Toon visueel het ERD (leesbaar screenshot).
2. Licht het schema toe: relaties, primaire sleutels, foreign keys, kardinaliteiten.
3. Hoe is RLS ingericht?
4. Welke policies zijn geschreven en wat doen ze (concrete voorbeelden)?
5. Welke rol speelt de database in de AI-functionaliteit (data als input voor het model; opslag van modeloutput)?
6. Welke risico's/beperkingen in de combinatie AI + datamodel (inconsistente data, foutieve opgeslagen AI-output, afhankelijkheid van datakwaliteit)?
7. Hoe zou je het ontwerp aanpassen voor betrouwbaardere/schaalbaardere AI?

### AI-assisted ontwikkelproces
1. Initiële instructies aan Cursor; hoe aangepast/verbeterd; concrete invloed op output.
2. Welke `.cursorrules` werkten goed en waarom?
3. Hoe gecontroleerd dat de gegenereerde code correct was en werkte?
4. Mate van controle over gegenereerde code en proces.
5. Hoeveel gegenereerde code zelf aangepast/herschreven?
6. Minimaal **3 concrete beperkingen/onzekerheden** in AI-output: oorzaak + effect.
7. Maatregelen voor betrouwbaarheid van AI-output (validatie, filtering, fallback, UI-feedback).
8. Drie belangrijkste inzichten/richtlijnen voor een nieuwe student die Cursor gebruikt.

### Prompt design (tekst + concrete prompts uit de applicatie, niet Cursor-prompts)
1. Belangrijke prompts voor je kern-features.
2. Hoe zag een typische iteratie eruit (prompt → output → aanpassing → nieuwe prompt)?
3. Drie prompts die heel goed werkten — waarom?
4. Drie prompts die minder goed werkten — oorzaak + verbetering?
5. Welke prompt-onderdelen hadden de grootste invloed op modelgedrag (structuur, rol, constraints, voorbeelden)?
6. In hoeverre hangt outputkwaliteit af van prompt en inputdata?

> Voeg in de bijlage een overzicht van alle gebruikte prompts en de uitgewerkte agent-instructie toe. Blijf concreet, vermijd algemeenheden.

**Op te leveren:** technisch verantwoordingsdocument (`.pdf`).

## Deelopdracht 4 – (Video)presentatie

Live of vooraf opgenomen; **circa 8–12 minuten**. Nadruk op aantoonbaar demonstreren dat alles werkt (database, AI, beveiliging). Je bent zelf verantwoordelijk voor de codekwaliteit en moet kunnen uitleggen hoe je code werkt.

**Opbouw:**
1. Start project lokaal + globale projectstructuur (max 30–60 sec).
2. Toon de koppeling met de Supabase database.
3. Toon het Supabase-dashboard: tabellen; relaties; RLS ingeschakeld; één tabel met `user_id` + voorbeeldpolicy; aantonen dat gebruiker A's record niet zichtbaar/aanpasbaar is voor gebruiker B.
4. Toon de applicatie op de productie-URL.
5. Demonstreer alle vier kernfunctionaliteiten: registreren/inloggen; de AI-functionaliteit (zichtbaar: input → reactie → resultaat); twee overige functionaliteiten. Toon ook niet-happy-flow (verkeerde input/keuzes).

**Op te leveren:** (video)presentatie van max. 12 minuten (live, `.mp4` of `.mov`).

---

## Quickscan (inlevereisen)

> De beoordelaar kan de opdracht op basis hiervan teruggeven zonder verder na te kijken.

### Algemene eisen
- Naam student, inleverdatum en leerlijntitel op titelpagina van het verantwoordingsdocument.
- Verantwoordingsdocument digitaal ingeleverd als PDF.
- GitHub repository-URL bijgevoegd in het document.
- Vercel productie-URL bijgevoegd in het document.
- Supabase API base URL bijgevoegd + betrokken docent toegevoegd als administrator in Supabase-team.
- Alle deelopdrachten uitgewerkt en gevraagde deelproducten aanwezig.
- Document goed leesbaar zonder storende grammatica-/spelfouten.
- Omvang document **2500–3000 woorden** (excl. inhoudsopgave en bijlagen).
- Presentatie duurt maximaal 12 minuten.
- Eventuele videopresentatie ingeleverd als `.mp4` of `.mov`.
- Pagina's genummerd en gerefereerd in de inhoudsopgave.

### Inhoudelijke eisen
- Project op **public** GitHub repository.
- **Skills.sh** geïnstalleerd met minimaal 2 actieve skills (waaronder `vercel-react-best-practices`).
- `README.md` met heldere installatie-instructies (collega kan project zelfstandig draaien).
- **Next.js (App Router) + TypeScript + Tailwind CSS**.
- Gekoppeld aan Supabase database met **minimaal 4 tabellen**.
- Schema bevat relaties en authenticatie.
- CRUD-operaties met **React Query**.
- **Vercel AI SDK** met werkende AI Agent.
- Minimaal 1 externe API geïntegreerd via **Tool Calling**.
- AI **interpreteert/combineert** data (niet alleen doorsturen).
- **Streaming responses** in de chat-interface.
- Gedeployed op Vercel met vier werkende functionaliteiten.

### AI-gebruik
- Gebruik van AI is toegestaan en verwacht.
- Alle AI-prompts en uitgewerkte agent-instructie als bijlage in het document.
- Architectuurbeslissingen met AI-hulp gedocumenteerd.

---

## Structuur verantwoordingsdocument

Aanbevolen opbouw:

- **Titelblad** – naam, inleverdatum, titel leerlijn (+ ondertitel), GitHub URL, Vercel URL, Supabase API base URL.
- **Samenvatting** – max 150 woorden over wat je hebt gebouwd.
- **Inhoudsopgave** – met correcte paginanummering, incl. bijlagen.
- **Introductie** – probleem, doelgroep, belangrijkste features (tip: 1–3 UI-screenshots).
- **Technische implementatie AI-dataflow** – vragen uit deelopdracht, tekst + code.
- **Database-ontwerp** – ERD-screenshot + vragen uit deelopdracht.
- **AI-assisted development proces** – vragen over proces + prompts, tekst + concrete prompts.
- **Conclusie** – wat geleerd over werken met AI; toevoeging vs. kritiekpunten.
- **Bijlagen** – alle prompts binnen de applicatie (system prompts, model-input); volledige uiteindelijke agent-instructie; gebruikte Cursor-instructies (`.cursorrules` / Cursor-prompts).

### Repository structuur

Je project-repository moet de volgende structuur hebben:

```text
project-naam/
├── .cursor/
│   └── rules/
│       ├── general.mdc        # Algemene project regels
│       ├── components.mdc     # Component conventies (optioneel)
│       └── api.mdc            # API/Supabase regels (optioneel)
├── .skills/                   # Skills.sh configuratie
├── docs/
│   ├── PROJECT-BRIEF.md       # Project beschrijving
│   ├── PROMPT-LOG.md          # Gedocumenteerde prompts
│   └── AI-DECISIONS.md        # Architectuur beslissingen
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/
│   │   │   └── agent/
│   │   │       └── route.ts   # AI Agent API route (met tools)
│   │   ├── (auth)/            # Auth route group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                # Basis UI components
│   │   ├── layout/            # Layout components
│   │   └── features/          # Feature-specifieke components
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── [custom hooks]
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client
│   │   ├── utils.ts
│   │   └── queryClient.ts     # React Query client
│   └── types/
│       ├── database.ts        # Supabase types
│       └── index.ts
├── .env.example               # Template voor env vars
├── .env.local                 # Lokale env vars (NIET committen)
├── .gitignore
├── next.config.js
├── package.json
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

---

## Beoordelingscriteria & weging

### 1. Broncode Next.js project — 25%
- **1.1 (5%)** Correct gestructureerd Next.js-project met TypeScript en Tailwind; werkt in development én productie (Vercel) zonder kritieke runtime errors.
- **1.2 (5%)** Externe data correct opgehaald via netwerkrequests; via LLM geïnterpreteerd/verrijkt in combinatie met gebruikersinput.
- **1.3 (5%)** Agent-based flow met werkende meerstaps-aanpak (`maxSteps`); agent voert zelfstandig meerdere stappen uit tot een betekenisvol resultaat.
- **1.4 (5%)** Schone, gestructureerde, onderhoudbare TS/Next.js-code; logische scheiding van componenten, server-/clientlogica, utilities en databewerkingen; clean code-principes.
- **1.5 (5%)** Correct Git-gebruik: minimaal **20 kleine commits** met zinvolle messages en minimaal **5 pull requests** gemerged naar `main`.

### 2. Database Design & Supabase — 15%
- **2.1 (5%)** Logisch schema met minimaal 4 tabellen, passende relaties en correcte constraints (PK, FK, not null, unique).
- **2.2 (5%)** Werkende CRUD-operaties met correct gebruik van React Query (databeheer, caching, UI-synchronisatie).
- **2.3 (5%)** Correcte Supabase Auth; RLS correct toegepast op relevante tabellen; werkende policies (alleen eigen data lezen/toevoegen/aanpassen/verwijderen).

### 3. Verantwoording — 45%
- **3.1 (10%)** Inhoudelijk correcte, gestructureerde, diepgaande beschrijving van de technische AI-flow, onderbouwd met concrete voorbeelden.
- **3.2 (10%)** Onderbouwing databaseontwerp + beveiliging met correcte ERD; reflectie op risico's/beperkingen van AI + dataopslag.
- **3.3 (10%)** Zorgvuldig ontworpen agentgedrag (`maxSteps`, system prompts, foutafhandeling); bewuste keuzes voor autonomie, betrouwbaarheid en voorspelbaarheid.
- **3.4 (10%)** Kritische, iteratieve analyse van promptgebruik; inzicht in invloed van promptstructuur, context en specificiteit op modelgedrag.
- **3.5 (10%)** Kritische, zelfbewuste reflectie op AI-tools; concrete leerpunten en verbeterstrategieën om overmatig vertrouwen in gegenereerde code te beperken.

### 4. Presentatie — 10%
- **4.1 (10%)** Vier kernfunctionaliteiten correct geïmplementeerd: authenticatie (registreren/inloggen), minimaal één complete AI-use case, en twee aanvullende zelfbedachte, volledig uitgewerkte use cases passend bij de casus.

**Totaal: 100%**
