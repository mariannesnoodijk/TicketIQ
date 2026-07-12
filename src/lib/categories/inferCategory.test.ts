import { describe, expect, it } from "vitest";

import { inferCategoryName } from "@/lib/categories/inferCategory";

describe("inferCategoryName", () => {
  it("maps payroll source label to Salarisverwerking", () => {
    expect(inferCategoryName("Vraag over loon", null, "payroll")).toBe(
      "Salarisverwerking & Loonstroken"
    );
  });

  it("maps verlof keywords in subject", () => {
    expect(inferCategoryName("Verlof aanvragen lukt niet", "Ik wil vakantiedagen boeken")).toBe(
      "Verlof & Verzuim"
    );
  });

  it("maps integration keywords", () => {
    expect(inferCategoryName("Koppeling met AFAS werkt niet", null)).toBe(
      "Koppelingen & Integraties"
    );
  });

  it("falls back to Overig when no rule matches", () => {
    expect(inferCategoryName("Algemene vraag", "Geen specifieke keywords")).toBe(
      "Overig / Onboarding nieuwe klant"
    );
  });
});
