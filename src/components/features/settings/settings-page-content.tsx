"use client";

import { useEffect, useState } from "react";

import { CategoriesSettingsSection } from "@/components/features/settings/categories-settings-section";
import { LabelsSettingsSection } from "@/components/features/settings/labels-settings-section";
import { PageHeader } from "@/components/layout/page-header";
import { useLocale } from "@/components/providers/locale-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SETTINGS_TABS = {
  categories: "categories",
  labels: "labels",
} as const;

type SettingsTab = (typeof SETTINGS_TABS)[keyof typeof SETTINGS_TABS];

function parseSettingsTabFromHash(hash: string): SettingsTab {
  const normalized = hash.replace(/^#/, "");

  if (normalized === SETTINGS_TABS.labels || normalized === "labels-heading") {
    return SETTINGS_TABS.labels;
  }

  return SETTINGS_TABS.categories;
}

export function SettingsPageContent() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<SettingsTab>(SETTINGS_TABS.categories);

  useEffect(() => {
    setActiveTab(parseSettingsTabFromHash(window.location.hash));

    function handleHashChange() {
      setActiveTab(parseSettingsTabFromHash(window.location.hash));
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function handleTabChange(tab: string) {
    const nextTab = tab as SettingsTab;
    setActiveTab(nextTab);
    window.history.replaceState(null, "", `#${nextTab}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <PageHeader
        eyebrow={t("settings.eyebrow")}
        title={t("settings.title")}
        description={t("settings.descriptionLong")}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col gap-6">
        <TabsList aria-label={t("settings.tabsAria")}>
          <TabsTrigger value={SETTINGS_TABS.categories}>{t("settings.tabCategories")}</TabsTrigger>
          <TabsTrigger value={SETTINGS_TABS.labels}>{t("settings.tabLabels")}</TabsTrigger>
        </TabsList>

        <TabsContent value={SETTINGS_TABS.categories} className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{t("settings.categoriesTabDesc")}</p>
          <CategoriesSettingsSection />
        </TabsContent>

        <TabsContent value={SETTINGS_TABS.labels} className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{t("settings.labelsTabDesc")}</p>
          <LabelsSettingsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
