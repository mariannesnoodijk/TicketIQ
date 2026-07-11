import { tool } from "ai";
import { z } from "zod";

import { DEFAULT_CATEGORIES } from "@/lib/categories/defaultCategories";
import type { createClient } from "@/lib/supabase/server";
import type { AssignTicketCategoryResult } from "@/lib/ai/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const allowedCategoryNames = new Set<string>(DEFAULT_CATEGORIES.map((c) => c.name));

const assignmentSchema = z.object({
  externalId: z.string().min(1),
  categoryName: z.string().min(1),
});

export function createAssignTicketCategoryTool(
  supabase: SupabaseServerClient,
  userId: string
) {
  return tool({
    description:
      "Wijst een categorie toe aan geïmporteerde tickets in de database op basis van external_id. Roep aan per cluster na het kiezen van een categorie.",
    inputSchema: z.object({
      assignments: z
        .array(assignmentSchema)
        .min(1)
        .max(100)
        .describe("Lijst van ticket external_id + categorienaam koppelingen"),
    }),
    execute: async ({ assignments }): Promise<AssignTicketCategoryResult> => {
      try {
        const parsedAssignments = z.array(assignmentSchema).safeParse(assignments);

        if (!parsedAssignments.success) {
          return {
            updated: 0,
            skipped: 0,
            message: "Ongeldige toewijzingen.",
            errors: [parsedAssignments.error.issues[0]?.message ?? "validatiefout"],
          };
        }

        const { data: categories, error: categoriesError } = await supabase
          .from("categories")
          .select("id, name")
          .eq("user_id", userId);

        if (categoriesError) {
          return {
            updated: 0,
            skipped: parsedAssignments.data.length,
            message: categoriesError.message,
            errors: [categoriesError.message],
          };
        }

        const categoryByName = new Map((categories ?? []).map((c) => [c.name, c.id]));
        let updated = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (const assignment of parsedAssignments.data) {
          if (!allowedCategoryNames.has(assignment.categoryName)) {
            skipped++;
            errors.push(`Ongeldige categorie "${assignment.categoryName}" voor ${assignment.externalId}`);
            continue;
          }

          const categoryId = categoryByName.get(assignment.categoryName);

          if (!categoryId) {
            skipped++;
            errors.push(
              `Categorie "${assignment.categoryName}" bestaat nog niet — maak eerst standaard categorieën aan`
            );
            continue;
          }

          const { data, error } = await supabase
            .from("tickets")
            .update({ category_id: categoryId })
            .eq("user_id", userId)
            .eq("external_id", assignment.externalId)
            .select("id");

          if (error) {
            skipped++;
            errors.push(`${assignment.externalId}: ${error.message}`);
            continue;
          }

          if (!data?.length) {
            skipped++;
            errors.push(`Ticket ${assignment.externalId} niet gevonden in database`);
            continue;
          }

          updated++;
        }

        return {
          updated,
          skipped,
          message:
            updated > 0
              ? `${updated} ticket(s) gecategoriseerd${skipped > 0 ? `, ${skipped} overgeslagen` : ""}.`
              : "Geen tickets gecategoriseerd.",
          errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
        };
      } catch (error) {
        return {
          updated: 0,
          skipped: assignments.length,
          message:
            error instanceof Error
              ? error.message
              : "Kon ticketcategorieën niet toewijzen.",
        };
      }
    },
  });
}
