import { describe, expect, it } from "vitest";

import {
  getBusiestWeekdayPoint,
  getTopCategoryItem,
  getVolumeSparkline,
  getVolumeTrend,
} from "@/lib/analytics/dashboard-metrics";

describe("getVolumeSparkline", () => {
  it("returns last N counts from volume series", () => {
    const series = [
      { key: "1", label: "1", count: 1 },
      { key: "2", label: "2", count: 3 },
      { key: "3", label: "3", count: 5 },
    ];

    expect(getVolumeSparkline(series, 2)).toEqual([3, 5]);
  });

  it("returns empty array for undefined series", () => {
    expect(getVolumeSparkline(undefined)).toEqual([]);
  });
});

describe("getVolumeTrend", () => {
  it("detects upward trend", () => {
    const series = [
      { key: "1", label: "1", count: 1 },
      { key: "2", label: "2", count: 1 },
      { key: "3", label: "3", count: 10 },
      { key: "4", label: "4", count: 10 },
    ];

    expect(getVolumeTrend(series)?.direction).toBe("up");
  });

  it("returns null for short series", () => {
    expect(getVolumeTrend([{ key: "1", label: "1", count: 1 }])).toBeNull();
  });
});

describe("getBusiestWeekdayPoint", () => {
  it("returns weekday with highest count", () => {
    const series = [
      { weekday: 1, label: "Maandag", count: 2 },
      { weekday: 3, label: "Woensdag", count: 8 },
    ];

    expect(getBusiestWeekdayPoint(series)?.label).toBe("Woensdag");
  });
});

describe("getTopCategoryItem", () => {
  it("returns first categorized item with count > 0", () => {
    const distribution = {
      total: 10,
      items: [
        { categoryId: null, name: "Geen categorie", count: 5 },
        { categoryId: "c1", name: "Verlof", count: 3 },
      ],
    };

    expect(getTopCategoryItem(distribution)?.name).toBe("Verlof");
  });
});
