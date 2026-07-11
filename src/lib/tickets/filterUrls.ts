import type { AnalyticsPeriod, VolumeBucketUnit } from "@/lib/analytics/period";
import { getDateRangeForPeriod } from "@/lib/analytics/period";
import { getVolumeBucketDateRange } from "@/lib/analytics/dateLabels";
import type { AiSuggestionListFilters, TicketListFilters } from "@/lib/queryKeys";
import { UNCATEGORIZED_CATEGORY_FILTER } from "@/lib/tickets/constants";

const TICKETS_PATH = "/dashboard/tickets";
const SUGGESTIONS_PATH = "/dashboard/suggestions";

export function parseTicketFiltersFromSearchParams(
  params: URLSearchParams
): TicketListFilters {
  const filters: TicketListFilters = {};

  const categoryId = params.get("categoryId");
  if (categoryId) filters.categoryId = categoryId;

  const status = params.get("status");
  if (status) filters.status = status;

  const labelId = params.get("labelId");
  if (labelId) filters.labelId = labelId;

  const search = params.get("search");
  if (search) filters.search = search;

  const createdFrom = params.get("createdFrom");
  if (createdFrom) filters.createdFrom = createdFrom;

  const createdTo = params.get("createdTo");
  if (createdTo) filters.createdTo = createdTo;

  const weekday = params.get("weekday");
  if (weekday !== null && weekday !== "") {
    filters.weekday = Number(weekday);
  }

  const organization = params.get("organization");
  if (organization) filters.organization = organization;

  return filters;
}

export function getTicketsFilterUrl(filters: TicketListFilters): string {
  const params = new URLSearchParams();

  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.status) params.set("status", filters.status);
  if (filters.labelId) params.set("labelId", filters.labelId);
  if (filters.search) params.set("search", filters.search);
  if (filters.createdFrom) params.set("createdFrom", filters.createdFrom);
  if (filters.createdTo) params.set("createdTo", filters.createdTo);
  if (filters.weekday !== undefined) params.set("weekday", String(filters.weekday));
  if (filters.organization) params.set("organization", filters.organization);

  const qs = params.toString();
  return qs ? `${TICKETS_PATH}?${qs}` : TICKETS_PATH;
}

function periodToCreatedRange(period: AnalyticsPeriod): Pick<TicketListFilters, "createdFrom" | "createdTo"> {
  const range = getDateRangeForPeriod(period);

  if (!range.start) {
    return {};
  }

  return {
    createdFrom: range.start.toISOString(),
    createdTo: range.end.toISOString(),
  };
}

export function getTicketsVolumeFilterUrl(
  bucketKey: string,
  unit: VolumeBucketUnit
): string {
  const { createdFrom, createdTo } = getVolumeBucketDateRange(bucketKey, unit);
  return getTicketsFilterUrl({ createdFrom, createdTo });
}

export function getTicketsWeekdayFilterUrl(
  weekday: number,
  period: AnalyticsPeriod
): string {
  return getTicketsFilterUrl({ weekday, ...periodToCreatedRange(period) });
}

export function getTicketsOrganizationFilterUrl(
  organization: string,
  period: AnalyticsPeriod
): string {
  return getTicketsFilterUrl({ organization, ...periodToCreatedRange(period) });
}

export function getTicketsCategoryFilterUrl(
  categoryId: string | null,
  period?: AnalyticsPeriod
): string {
  return getTicketsFilterUrl({
    categoryId: categoryId === null ? UNCATEGORIZED_CATEGORY_FILTER : categoryId,
    ...(period ? periodToCreatedRange(period) : {}),
  });
}

export function getSuggestionsStatusFilterUrl(
  status: string,
  period?: AnalyticsPeriod
): string {
  const params = new URLSearchParams();
  params.set("status", status);

  if (period) {
    const range = getDateRangeForPeriod(period);
    if (range.start) {
      params.set("createdFrom", range.start.toISOString());
      params.set("createdTo", range.end.toISOString());
    }
  }

  return `${SUGGESTIONS_PATH}?${params.toString()}`;
}

export function parseSuggestionFiltersFromSearchParams(
  params: URLSearchParams
): AiSuggestionListFilters {
  const filters: AiSuggestionListFilters = {};

  const status = params.get("status");
  if (status) filters.status = status;

  const search = params.get("search");
  if (search) filters.search = search;

  const createdFrom = params.get("createdFrom");
  if (createdFrom) filters.createdFrom = createdFrom;

  const createdTo = params.get("createdTo");
  if (createdTo) filters.createdTo = createdTo;

  return filters;
}

export function hasActiveTicketFilters(filters: TicketListFilters): boolean {
  return Boolean(
    filters.status ||
      filters.categoryId ||
      filters.labelId ||
      filters.search ||
      filters.createdFrom ||
      filters.createdTo ||
      filters.weekday !== undefined ||
      filters.organization
  );
}
