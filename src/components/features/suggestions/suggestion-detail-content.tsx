"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { use, useState } from "react";

import {
  Badge,
  suggestionStatusBadgeVariant,
  suggestionStatusLabel,
} from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import {
  useAiSuggestion,
  useDeleteAiSuggestion,
  useReviseAiSuggestion,
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

type ActionFeedback = {
  message: string;
  variant: "success" | "default";
};

function ActionFeedbackBanner({ feedback }: { feedback: ActionFeedback }) {
  const isSuccess = feedback.variant === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm",
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "border-border bg-muted/40 text-muted-foreground"
      )}
    >
      {isSuccess ? <Check className="size-4 shrink-0" aria-hidden /> : null}
      <span>{feedback.message}</span>
    </div>
  );
}

function SuggestionEditForm({
  suggestion,
  onSaved,
  onEditStart,
}: {
  suggestion: SuggestionWithCategory;
  onSaved: () => void;
  onEditStart: () => void;
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
    onSaved();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggestie bewerken</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titel</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              onEditStart();
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary">Samenvatting</Label>
          <Input
            id="summary"
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value);
              onEditStart();
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Artikelinhoud</Label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              onEditStart();
            }}
            rows={16}
            className="flex min-h-[280px] w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={updateSuggestion.isPending || !isDirty || !title.trim() || !content.trim()}
        >
          {updateSuggestion.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Opslaan…
            </>
          ) : (
            "Opslaan"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function RejectSuggestionCard({
  onReject,
  isPending,
}: {
  onReject: (feedback: string) => Promise<void>;
  isPending: boolean;
}) {
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = feedback.trim();

    if (trimmed.length < 10) {
      setError("Beschrijf minimaal wat er ontbreekt of beter moet (10+ tekens).");
      return;
    }

    setError(null);
    await onReject(trimmed);
    setFeedback("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Afwijzen met feedback</CardTitle>
        <CardDescription>
          Leg uit wat er ontbreekt of anders moet. Daarna kun je de AI een nieuw artikel laten
          schrijven.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reject-feedback">Aanpassingen voorstellen</Label>
            <textarea
              id="reject-feedback"
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                setError(null);
              }}
              rows={4}
              placeholder="Bijv.: voeg concrete stappen toe voor het resetten van het wachtwoord, inclusief waar de gebruiker moet klikken."
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" variant="destructive" disabled={isPending}>
            Afwijzen en feedback opslaan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ReviseSuggestionCard({
  initialFeedback,
  onRevise,
  isPending,
}: {
  initialFeedback: string;
  onRevise: (feedback: string) => Promise<void>;
  isPending: boolean;
}) {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = feedback.trim();

    if (trimmed.length < 10) {
      setError("Feedback moet minimaal 10 tekens bevatten.");
      return;
    }

    setError(null);
    await onRevise(trimmed);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nieuw artikel laten schrijven</CardTitle>
        <CardDescription>
          De AI herschrijft dit artikel op basis van je feedback en de bron-supporttickets, met
          concrete stappen en secties.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="revise-feedback">Feedback voor AI</Label>
            <textarea
              id="revise-feedback"
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                setError(null);
              }}
              rows={5}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Artikel wordt geschreven…
              </>
            ) : (
              "Nieuw artikel laten schrijven"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function SuggestionDetailContent({ suggestionId }: { suggestionId: string }) {
  const router = useRouter();
  const { data: suggestion, isLoading, error } = useAiSuggestion(suggestionId);
  const updateSuggestion = useUpdateAiSuggestion();
  const deleteSuggestion = useDeleteAiSuggestion();
  const reviseSuggestion = useReviseAiSuggestion();
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(null);

  function showFeedback(message: string, variant: ActionFeedback["variant"] = "default") {
    setActionFeedback({ message, variant });
  }

  function clearFeedback() {
    setActionFeedback(null);
  }

  if (isLoading) {
    return <p className="px-4 py-10 text-sm text-muted-foreground">Suggestie laden…</p>;
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
  const storedFeedback = metadata?.revisionFeedback ?? "";
  const showReviseCard =
    suggestion.status === "rejected" || storedFeedback.length >= 10;
  const currentSuggestion = suggestion;

  async function handleStatusChange(status: SuggestionStatus) {
    if (status === "rejected") return;

    await updateSuggestion.mutateAsync({ id: suggestionId, status });
    showFeedback(`Status gewijzigd naar ${suggestionStatusLabel(status).toLowerCase()}.`);
  }

  async function handleReject(feedback: string) {
    const existingMetadata = (currentSuggestion.metadata ?? {}) as AiSuggestionMetadata;

    await updateSuggestion.mutateAsync({
      id: suggestionId,
      status: "rejected",
      metadata: {
        ...existingMetadata,
        revisionFeedback: feedback,
        revisionHistory: [
          ...(existingMetadata.revisionHistory ?? []),
          {
            feedback,
            at: new Date().toISOString(),
            action: "rejected",
          },
        ],
      },
    });

    showFeedback("Suggestie afgewezen. Je kunt nu een nieuw artikel laten schrijven.");
  }

  async function handleRevise(feedback: string) {
    const result = await reviseSuggestion.mutateAsync({ id: suggestionId, feedback });
    showFeedback(
      `Nieuw artikel gegenereerd: "${result.title ?? currentSuggestion.title}". Status staat op concept.`
    );
  }

  async function handleDelete() {
    if (!confirm("Weet je zeker dat je deze suggestie wilt verwijderen?")) return;
    await deleteSuggestion.mutateAsync(suggestionId);
    router.push("/dashboard/suggestions");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <PageHeader
        eyebrow="Helpcenter"
        title={suggestion.title}
        backHref="/dashboard/suggestions"
        size="compact"
        actions={
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteSuggestion.isPending}
          >
            Verwijderen
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={suggestionStatusBadgeVariant(suggestion.status)}>
          {suggestionStatusLabel(suggestion.status)}
        </Badge>
        {suggestion.categories ? (
          <Badge variant="outline">{suggestion.categories.name}</Badge>
        ) : null}
      </div>

      {actionFeedback ? <ActionFeedbackBanner feedback={actionFeedback} /> : null}

      {showReviseCard ? (
        <ReviseSuggestionCard
          key={`${suggestion.id}-${storedFeedback}-${suggestion.updated_at}`}
          initialFeedback={storedFeedback}
          onRevise={handleRevise}
          isPending={reviseSuggestion.isPending}
        />
      ) : null}

      <SuggestionEditForm
        key={`${suggestion.id}-${suggestion.updated_at}`}
        suggestion={suggestion}
        onSaved={() => showFeedback("Artikel opgeslagen.", "success")}
        onEditStart={clearFeedback}
      />

      <Card>
        <CardHeader>
          <CardTitle>Status wijzigen</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(["approved", "pending", "draft"] as const).map((status) => (
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

      {suggestion.status !== "rejected" ? (
        <RejectSuggestionCard
          onReject={handleReject}
          isPending={updateSuggestion.isPending}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Aangemaakt: {formatDate(suggestion.created_at)}</p>
          <p>Bijgewerkt: {formatDate(suggestion.updated_at)}</p>
          {metadata?.revisionFeedback ? (
            <div className="space-y-1">
              <p className="font-medium text-foreground">Laatste feedback</p>
              <p className="whitespace-pre-wrap">{metadata.revisionFeedback}</p>
            </div>
          ) : null}
          {metadata?.revisionHistory?.length ? (
            <div className="space-y-1">
              <p className="font-medium text-foreground">Revisiegeschiedenis</p>
              <ul className="space-y-2">
                {metadata.revisionHistory.map((entry, index) => (
                  <li key={`${entry.at}-${index}`} className="rounded-lg border border-border p-2">
                    <p className="text-xs text-muted-foreground">
                      {entry.action === "rejected" ? "Afgewezen" : "Herschreven"} —{" "}
                      {formatDate(entry.at)}
                    </p>
                    <p className="whitespace-pre-wrap">{entry.feedback}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
