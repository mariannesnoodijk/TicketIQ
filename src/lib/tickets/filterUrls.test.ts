import { describe, expect, it } from "vitest";

import {
  getTicketsCategoryFilterUrl,
  getTicketsFilterUrl,
  hasActiveTicketFilters,
  parseTicketFiltersFromSearchParams,
} from "@/lib/tickets/filterUrls";

describe("parseTicketFiltersFromSearchParams", () => {
  it("parses filter params from URL search params", () => {
    const params = new URLSearchParams(
      "categoryId=cat-1&status=open&weekday=2&organization=Acme"
    );

    expect(parseTicketFiltersFromSearchParams(params)).toEqual({
      categoryId: "cat-1",
      status: "open",
      weekday: 2,
      organization: "Acme",
    });
  });

  it("returns empty object for missing params", () => {
    expect(parseTicketFiltersFromSearchParams(new URLSearchParams())).toEqual({});
  });
});

describe("getTicketsFilterUrl", () => {
  it("builds query string for ticket filters", () => {
    const url = getTicketsFilterUrl({
      categoryId: "cat-1",
      search: "login",
      weekday: 4,
    });

    expect(url).toContain("/dashboard/tickets?");
    expect(url).toContain("categoryId=cat-1");
    expect(url).toContain("search=login");
    expect(url).toContain("weekday=4");
  });

  it("returns base path without filters", () => {
    expect(getTicketsFilterUrl({})).toBe("/dashboard/tickets");
  });
});

describe("getTicketsCategoryFilterUrl", () => {
  it("uses uncategorized sentinel when categoryId is null", () => {
    expect(getTicketsCategoryFilterUrl(null)).toContain("categoryId=uncategorized");
  });
});

describe("hasActiveTicketFilters", () => {
  it("detects active filters", () => {
    expect(hasActiveTicketFilters({ status: "open" })).toBe(true);
    expect(hasActiveTicketFilters({})).toBe(false);
  });
});
