"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useSeedDefaultCategories,
} from "@/hooks/useCategories";

export function CategoriesSettingsSection() {
  const { t } = useLocale();
  const { data: categories, isLoading, error } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const seedDefaults = useSeedDefaultCategories();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [message, setMessage] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createCategory.mutateAsync({ name: name.trim(), color });
      setName("");
      setMessage(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("common.unexpectedError"));
    }
  }

  async function handleSeed() {
    try {
      const result = await seedDefaults.mutateAsync();
      setMessage(
        t("settings.seedResult", { inserted: result.inserted, skipped: result.skipped })
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("common.unexpectedError"));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.defaultCategories")}</CardTitle>
          <CardDescription>{t("settings.defaultCategoriesDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button onClick={handleSeed} disabled={seedDefaults.isPending} variant="outline">
            {seedDefaults.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t("settings.seeding")}
              </>
            ) : (
              t("settings.seedCategories")
            )}
          </Button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.newCategory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="category-name">{t("settings.categoryName")}</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("settings.categoryPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-color">{t("settings.categoryColor")}</Label>
              <Input
                id="category-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-20 cursor-pointer p-1"
              />
            </div>
            <Button type="submit" disabled={createCategory.isPending || !name.trim()}>
              {t("common.add")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">{t("settings.categoriesLoading")}</p>
        ) : error ? (
          <p className="p-6 text-sm text-destructive">{t("settings.categoriesLoadFailed")}</p>
        ) : !categories?.length ? (
          <p className="p-6 text-sm text-muted-foreground">{t("settings.categoriesEmptyAlt")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("settings.tableName")}</TableHead>
                <TableHead>{t("settings.tableColor")}</TableHead>
                <TableHead className="text-right">{t("settings.tableAction")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <span
                      className="inline-block size-4 rounded-full border border-border"
                      style={{ backgroundColor: category.color ?? "#6366f1" }}
                      aria-hidden="true"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(t("settings.deleteCategoryConfirm", { name: category.name }))) {
                          deleteCategory.mutate(category.id);
                        }
                      }}
                      disabled={deleteCategory.isPending}
                      aria-label={t("settings.removeCategory", { name: category.name })}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
