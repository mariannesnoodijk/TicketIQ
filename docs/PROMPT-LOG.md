# Prompt log

> Documenteer hier gedurende het project de belangrijke prompts: system prompts en
> model-input in de applicatie, plus relevante Cursor-prompts uit het ontwikkelproces.
> Dit vormt input voor het verantwoordingsdocument (bijlage).

## Applicatie-prompts (system prompts / model-input)

| Datum | Feature | Prompt | Waarom / effect |
| --- | --- | --- | --- |
| 11 jul 2026 | AI-agent | `TICKET_IQ_AGENT_INSTRUCTIONS` in `src/lib/ai/prompts.ts` | Definieert rol, werkwijze (fetch → cluster → duplicaatcheck → save), vaste categorieën en NL-constraints. Input voor verantwoordingsdocument sectie 3.1/3.3. |

## Cursor-prompts (ontwikkelproces)

| 11 jul 2026 | PR5-plan | Plan voor AI-agent met ToolLoopAgent, 3 tools, streaming UI | Akkoord gebruiker; implementatie op `feat/ai-agent`. |
