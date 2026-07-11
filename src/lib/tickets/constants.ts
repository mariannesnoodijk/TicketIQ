/** URL/query-waarde voor tickets zonder categorie. */
export const UNCATEGORIZED_CATEGORY_FILTER = "uncategorized" as const;

export function getTicketsCategoryFilterUrl(categoryId: string | null): string {
  const param =
    categoryId === null ? UNCATEGORIZED_CATEGORY_FILTER : encodeURIComponent(categoryId);
  return `/dashboard/tickets?categoryId=${param}`;
}
