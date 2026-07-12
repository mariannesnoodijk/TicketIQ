"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
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

export function LabelsPageContent() {
  const { data: labels, isLoading, error } = useLabels();
  const createLabel = useCreateLabel();
  const deleteLabel = useDeleteLabel();
  const [name, setName] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createLabel.mutateAsync({ name: name.trim() });
    setName("");
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <PageHeader
        eyebrow="Labels"
        title="Beheer"
        description="Beheer labels om tickets te taggen. Labels uit de DummyJSON-import worden automatisch aangemaakt."
      />

      <Card>
        <CardHeader>
          <CardTitle>Nieuw label</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="label-name" className="sr-only">
                Labelnaam
              </Label>
              <Input
                id="label-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bijv. Klant verwacht terugkoppeling"
              />
            </div>
            <Button type="submit" disabled={createLabel.isPending || !name.trim()}>
              Toevoegen
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Labels laden…</p>
        ) : error ? (
          <p className="p-6 text-sm text-destructive">Kon labels niet laden.</p>
        ) : !labels?.length ? (
          <p className="p-6 text-sm text-muted-foreground">
            Nog geen labels. Voeg er een toe of importeer tickets.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead className="text-right">Actie</TableHead>
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
                        if (confirm(`Label "${label.name}" verwijderen?`)) {
                          deleteLabel.mutate(label.id);
                        }
                      }}
                      disabled={deleteLabel.isPending}
                      aria-label={`Verwijder ${label.name}`}
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
