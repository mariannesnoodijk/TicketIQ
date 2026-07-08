# Project brief — TicketIQ

> Goedgekeurde casus (concept akkoord bevonden door docent). Basis voor de
> introductie van het verantwoordingsdocument. Zie `docs/eindopdracht.md`.

## App
**TicketIQ** — AI-gedreven analyse van supporttickets.

## Probleem & doelgroep
TicketIQ helpt organisaties om terugkerende klantproblemen sneller te herkennen door
supporttickets automatisch met AI te analyseren. Supportmedewerkers hoeven niet langer
handmatig grote hoeveelheden tickets door te nemen, en documentatie/helpcenterartikelen
kunnen sneller worden verbeterd.

**Doelgroep:** supportmedewerkers, productteams en managers.

## Externe API
**DummyJSON Custom Response API** — https://dummyjson.com/docs/custom-response

De supporttickets zijn afkomstig uit Trengo, geanonimiseerd en via de DummyJSON Custom
Response API als REST API beschikbaar gemaakt.

## AI-interpretatie
Met de OpenAI-provider (model **GPT-4.1 mini**) via de Vercel AI SDK analyseert de AI
supporttickets: herkennen van terugkerende patronen, categoriseren van klantvragen en het
genereren van suggesties voor nieuwe of verbeterde helpcenterartikelen. De AI controleert
bovendien of vergelijkbare documentatie al bestaat vóórdat een nieuwe suggestie wordt
aangemaakt. De AI **interpreteert en verrijkt** de data dus — niet enkel doorsturen.

## Kernfunctionaliteiten
1. **Registreren & inloggen** via Supabase Auth.
2. **AI-analyse (agent-based flow):** AI analyseert supporttickets, detecteert terugkerende
   problemen en genereert suggesties voor helpcenterartikelen.
3. **Ticket-ingestie & organisatie:** supporttickets ophalen via de DummyJSON Custom
   Response API en organiseren met categorieën en labels.
4. **Dashboard:** AI-suggesties bekijken, bewerken, goedkeuren en inzicht in trends en
   statistieken.

## Technische noot
De casus noemt de "OpenAI Responses API". We benaderen deze via de **Vercel AI SDK**
(OpenAI-provider) zodat aan de eisen wordt voldaan: agent met **tool calling**,
**meerstaps-aanpak** en **streaming** responses.
