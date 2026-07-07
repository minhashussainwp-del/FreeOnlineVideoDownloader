import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessagesSquare, KeyRound } from "lucide-react";
import { ChatStudio } from "@/components/ai-writer/chat-studio";
import { ProviderManager } from "@/components/ai-writer/provider-manager";

export const Route = createFileRoute("/_authenticated/admin/ai")({
  component: AiWriterPage,
});

type Tab = "studio" | "providers";

function AiWriterPage() {
  const [tab, setTab] = useState<Tab>("studio");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">AI Writer</h1>
        <p className="text-sm text-muted-foreground">
          Research, write and publish articles and pages with your own AI providers.
        </p>
      </div>

      <div className="inline-flex rounded-xl border border-border bg-card p-1">
        <button
          onClick={() => setTab("studio")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "studio" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessagesSquare className="h-4 w-4" /> Studio
        </button>
        <button
          onClick={() => setTab("providers")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "providers" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <KeyRound className="h-4 w-4" /> Providers
        </button>
      </div>

      {tab === "studio" ? <ChatStudio /> : <ProviderManager />}
    </div>
  );
}
