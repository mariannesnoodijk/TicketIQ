"use client";

import { useEffect, useState } from "react";

import { CategoriesSettingsSection } from "@/components/features/settings/categories-settings-section";
import { LabelsSettingsSection } from "@/components/features/settings/labels-settings-section";
import { PageHeader } from "@/components/layout/page-header";
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
        eyebrow="Instellingen"
        title="Beheer"
        description="Beheer categorieën en labels om tickets te organiseren en te taggen."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col gap-6">
        <TabsList aria-label="Instellingen">
          <TabsTrigger value={SETTINGS_TABS.categories}>Categorieën</TabsTrigger>
          <TabsTrigger value={SETTINGS_TABS.labels}>Labels</TabsTrigger>
        </TabsList>

        <TabsContent value={SETTINGS_TABS.categories} className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Organiseer tickets per thema. Gebruik de standaard set of voeg eigen categorieën toe.
          </p>
          <CategoriesSettingsSection />
        </TabsContent>

        <TabsContent value={SETTINGS_TABS.labels} className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Tag tickets met labels. Labels uit de DummyJSON-import worden automatisch aangemaakt.
          </p>
          <LabelsSettingsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
