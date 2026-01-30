"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, X, Loader2, RefreshCw } from "lucide-react";

interface ResearchNote {
  id: string;
  content: string;
  createdAt: string;
}

interface ResearchNotesProps {
  analysisId: string;
  notes: ResearchNote[];
  onNotesChange: (notes: ResearchNote[]) => void;
  onRefresh: () => void;
  isUpdating: boolean;
}

function generateId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function ResearchNotes({
  notes,
  onNotesChange,
  onRefresh,
  isUpdating,
}: ResearchNotesProps) {
  const [draft, setDraft] = useState("");

  function addNote() {
    const trimmed = draft.trim();
    if (!trimmed) return;

    const newNote: ResearchNote = {
      id: generateId(),
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    onNotesChange(updated);
    setDraft("");
  }

  function deleteNote(noteId: string) {
    const updated = notes.filter((n) => n.id !== noteId);
    onNotesChange(updated);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && e.metaKey) {
      e.preventDefault();
      addNote();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary-600" />
          Research Notes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add your own research, earnings call notes, or industry insights.
          Notes are saved automatically.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste your research, earnings call notes, industry insights..."
            rows={4}
            className="min-h-[100px]"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Cmd+Enter to add
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={addNote}
              disabled={!draft.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          </div>
        </div>

        {notes.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground/80">
              Saved Notes ({notes.length})
            </h4>
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="group relative rounded-lg border border-border bg-muted/50 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">
                        {formatRelativeTime(note.createdAt)}
                      </p>
                      <p className="text-base whitespace-pre-wrap break-words">
                        {note.content}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                      aria-label="Delete note"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {notes.length > 0 && (
        <CardFooter>
          <Button
            onClick={onRefresh}
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating Analysis...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Analysis with Notes
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
