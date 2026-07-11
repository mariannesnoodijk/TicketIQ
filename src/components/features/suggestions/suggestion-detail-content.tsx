"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

import {
  Badge,
  suggestionStatusBadgeVariant,
  suggestionStatusLabel,
} from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAiSuggestion,
  useDeleteAiSuggestion,
  useUpdateAiSuggestion,
} from "@/hooks/useAiSuggestions";
import type { AiSuggestionMetadata, SuggestionStatus } from "@/types";
import { cn } from "@/lib/utils";

type SuggestionWithCategory = NonNullable<ReturnType<typeof useAiSuggestion>["data"]>;

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function SuggestionEditForm({
  suggestion,
  onSaved,
}: {
  suggestion: SuggestionWithCategory;
  onSaved: (message: string) => void;
}) {
  const updateSuggestion = useUpdateAiSuggestion();
  const [title, setTitle] = useState(suggestion.title);
  const [summary, setSummary] = useState(suggestion.summary ?? "");
  const [content, setContent] = useState(suggestion.content);

  const isDirty =
    title !== suggestion.title ||
    summary !== (suggestion.summary ?? "") ||
    content !== suggestion.content;

  async function handleSave() {
    await updateSuggestion.mutateAsync({
      id: suggestion.id,
      title: title.trim(),
      summary: summary.trim() || null,
      content: content.trim(),
    });
    onSaved("Wijzigingen opgeslagen.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggestie bewerken</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titel</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary">Samenvatting</Label>
          <Input id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Artikelinhoud</Label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="flex min-h-[200px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={updateSuggestion.isPending || !isDirty || !title.trim() || !content.trim()}
        >
          Opslaan
        </Button>
      </CardContent>
    </Card>
  );
}

export function SuggestionDetailContent({ suggestionId }: { suggestionId: string }) {
  const router = useRouter();
  const { data: suggestion, isLoading, error } = useAiSuggestion(suggestionId);
  const updateSuggestion = useUpdateAiSuggestion();
  const deleteSuggestion = useDeleteAiSuggestion();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (isLoading) {
    return <p className="px-4 py-10 text-sm text-muted-foreground">Suggestie laden...</p>;
  }

  if (error || !suggestion) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-destructive">Suggestie niet gevonden.</p>
        <Link
          href="/dashboard/suggestions"
          className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex")}
        >
          Terug naar overzicht
        </Link>
      </div>
    );
  }

  const metadata = suggestion.metadata as AiSuggestionMetadata | null;

  async function handleStatusChange(status: SuggestionStatus) {
    await updateSuggestion.mutateAsync({ id: suggestionId, status });
    setActionMessage(`Status gewijzigd naar ${suggestionStatusLabel(status).toLowerCase()}.`);
  }

  async function handleDelete() {
    if (!confirm("Weet je zeker dat je deze suggestie wilt verwijderen?")) return;
    await deleteSuggestion.mutateAsync(suggestionId);
    router.push("/dashboard/suggestions");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/dashboard/suggestions"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 inline-flex")}
          >
            ← Terug
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={suggestionStatusBadgeVariant(suggestion.status)}>
              {suggestionStatusLabel(suggestion.status)}
            </Badge>
            {suggestion.categories ? (
              <Badge variant="outline">{suggestion.categories.name}</Badge>
            ) : null}
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleteSuggestion.isPending}
        >
          Verwijderen
        </Button>
      </div>

      {actionMessage ? <p className="text-sm text-muted-foreground">{actionMessage}</p> : null}

      <SuggestionEditForm
        key={`${suggestion.id}-${suggestion.updated_at}`}
        suggestion={suggestion}
        onSaved={setActionMessage}
      />

      <Card>
        <CardHeader>
          <CardTitle>Status wijzigen</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(["approved", "pending", "draft", "rejected"] as const).map((status) => (
            <Button
              key={status}
              variant={suggestion.status === status ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange(status)}
              disabled={updateSuggestion.isPending || suggestion.status === status}
            >
              {suggestionStatusLabel(status)}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Aangemaakt: {formatDate(suggestion.created_at)}</p>
          <p>Bijgewerkt: {formatDate(suggestion.updated_at)}</p>
          {metadata?.reasoning ? (
            <div className="space-y-1">
              <p className="font-medium text-foreground">AI-redenering</p>
              <p className="whitespace-pre-wrap">{metadata.reasoning}</p>
            </div>
          ) : null}
          {metadata?.sourceTicketIds?.length ? (
            <div className="space-y-1">
              <p className="font-medium text-foreground">Bron-tickets (extern ID)</p>
              <p>{metadata.sourceTicketIds.join(", ")}</p>
            </div>
          ) : null}
          {metadata?.confidence != null ? (
            <p>Vertrouwen: {Math.round(metadata.confidence * 100)}%</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function SuggestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <SuggestionDetailContent suggestionId={id} />;
}
