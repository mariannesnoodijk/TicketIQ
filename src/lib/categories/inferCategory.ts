import { DEFAULT_CATEGORIES } from "@/lib/categories/defaultCategories";

export type CategoryName = (typeof DEFAULT_CATEGORIES)[number]["name"];

const FALLBACK_CATEGORY: CategoryName = "Overig / Onboarding nieuwe klant";

type CategoryRule = {
  categoryName: CategoryName;
  keywords: string[];
  sourceLabels?: string[];
};

/** Regels in prioriteitsvolgorde — eerste match wint. */
const CATEGORY_RULES: CategoryRule[] = [
  {
    categoryName: "Koppelingen & Integraties",
    keywords: [
      "koppeling",
      "integratie",
      "synchronisatie",
      "sync",
      "api koppeling",
      "extern systeem",
      "nmbrs",
      "afas",
      "exact online",
      "shiftbase",
      "koppelen",
    ],
    sourceLabels: ["shiftbase"],
  },
  {
    categoryName: "Salarisverwerking & Loonstroken",
    keywords: [
      "salaris",
      "loonstrook",
      "payroll",
      "uitbetaling",
      "loon",
      "salarisadministratie",
      "salarisronde",
      "jaaropgave",
      "loonheffing",
      "brutoloon",
      "nettoloon",
      "salarisverwerking",
    ],
    sourceLabels: ["payroll"],
  },
  {
    categoryName: "Verlof & Verzuim",
    keywords: [
      "verlof",
      "vakantie",
      "ziekte",
      "verzuim",
      "feestdag",
      "ziekmelding",
      "verlofsaldo",
      "parttime dag",
      "verzuimdag",
      "bijzonder verlof",
      "zwangerschapsverlof",
      "overuren",
      "vakantiedagen",
      "urenregistratie",
      "verzuimmelding",
    ],
  },
  {
    categoryName: "Declaraties & Reiskosten",
    keywords: [
      "declaratie",
      "reiskosten",
      "onkosten",
      "kilometer",
      "onkostennota",
      "reisdeclaratie",
      "expense",
      "declareren",
    ],
  },
  {
    categoryName: "Toegang & Rechten",
    keywords: [
      "rechten",
      "toegang",
      "permissie",
      "beheerder",
      "admin rechten",
      "aanpassen rechten",
      "autorisatie",
      "manager rol",
      "rol toewijzen",
      "gebruiker",
      "account",
      "inloggen",
      "login",
    ],
  },
  {
    categoryName: "Medewerkersbeheer",
    keywords: [
      "uit dienst",
      "in dienst",
      "dienstverband",
      "medewerker toevoegen",
      "medewerker aanmaken",
      "ontslag",
      "contract",
      "nieuwe medewerker",
      "medewerkersbeheer",
      "medewerker",
      "medewerkers",
      "toevoegen",
      "aangemaakt",
      "dienst",
      "uit dienst melden",
    ],
  },
  {
    categoryName: "Bug / Technisch probleem",
    keywords: [
      "bug",
      "fout",
      "error",
      "werkt niet",
      "mis gaat",
      "technisch probleem",
      "crash",
      "storing",
      "kapot",
      "lukt niet",
      "niet mogelijk",
      "foutmelding",
    ],
  },
  {
    categoryName: "Werkstromen & Automatisering",
    keywords: [
      "workflow",
      "werkstroom",
      "automatisch",
      "automatisering",
      "goedkeuringsflow",
      "goedkeuringsproces",
      "goedkeuren",
      "goedkeuring",
      "goedkeurt",
      "proces",
    ],
  },
  {
    categoryName: "Rapportages & Exports",
    keywords: [
      "rapport",
      "report",
      "export",
      "csv",
      "excel",
      "download",
      "exporteren",
      "overzicht printen",
      "rapportage",
    ],
  },
  {
    categoryName: "Beoordelingen & Ontwikkeling",
    keywords: [
      "beoordeling",
      "functionerings",
      "ontwikkeling",
      "evaluatie",
      "performance review",
      "gesprekscyclus",
      "doelstelling",
      "beoordelen",
    ],
  },
  {
    categoryName: "Overig / Onboarding nieuwe klant",
    keywords: [
      "onboarding",
      "nieuwe klant",
      "starten met buddee",
      "omgeving inrichten",
      "contactformulier",
      "documenten",
    ],
  },
];

/** Bepaalt de meest passende categorie op basis van onderwerp, body en optioneel bronlabel. */
export function inferCategoryName(
  subject: string,
  body: string | null | undefined,
  sourceLabel?: string | null
): CategoryName {
  const normalizedLabel = sourceLabel?.toLowerCase().trim();

  if (normalizedLabel) {
    for (const rule of CATEGORY_RULES) {
      if (rule.sourceLabels?.some((hint) => normalizedLabel.includes(hint.toLowerCase()))) {
        return rule.categoryName;
      }
    }
  }

  const text = `${subject} ${body ?? ""}`.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      return rule.categoryName;
    }
  }

  return FALLBACK_CATEGORY;
}
