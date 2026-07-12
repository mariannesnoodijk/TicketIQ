"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useCreateLabel, useDeleteLabel, useLabels } from "@/hooks/useLabels";

export function LabelsSettingsSection() {
  const { t } = useLocale();
  const { data: labels, isLoading, error } = useLabels();
  const createLabel = useCreateLabel();
  const deleteLabel = useDeleteLabel();
  const [name, setName] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createLabel.mutateAsync({ name: name.trim() });
      setName("");
    } catch {
      // React Query houdt mutation.error bij; formulier blijft bruikbaar.
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.newLabel")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="label-name" className="sr-only">
                {t("settings.labelName")}
              </Label>
              <Input
                id="label-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("settings.labelPlaceholder")}
              />
            </div>
            <Button type="submit" disabled={createLabel.isPending || !name.trim()}>
              {t("common.add")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">{t("settings.labelsLoading")}</p>
        ) : error ? (
          <p className="p-6 text-sm text-destructive">{t("settings.labelsLoadFailed")}</p>
        ) : !labels?.length ? (
          <p className="p-6 text-sm text-muted-foreground">{t("settings.labelsEmptyAlt")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("settings.tableName")}</TableHead>
                <TableHead className="text-right">{t("settings.tableAction")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labels.map((label) => (
                <TableRow key={label.id}>
                  <TableCell className="font-medium">{label.name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(t("settings.deleteLabelConfirm", { name: label.name }))) {
                          deleteLabel.mutate(label.id);
                        }
                      }}
                      disabled={deleteLabel.isPending}
                      aria-label={t("settings.removeCategory", { name: label.name })}
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
