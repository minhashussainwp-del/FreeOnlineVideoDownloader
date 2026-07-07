import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  Square,
  Sparkles,
  Globe,
  Plus,
  Search,
  FileText,
  Bot,
  User as UserIcon,
  Copy,
  Check,
  Wrench,
  Gauge,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listAiProviders, saveAiConversation } from "@/lib/ai-writer.functions";
import { PublishBar } from "./publish-bar";

function textOf(message: UIMessage): string {
  return message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}

export function ChatStudio() {
  const listProvidersFn = useServerFn(listAiProviders);
  const saveConvoFn = useServerFn(saveAiConversation);

  const { data: providers } = useQuery({
    queryKey: ["ai-providers"],
    queryFn: () => listProvidersFn(),
  });

  const [providerId, setProviderId] = useState<string>("");
  const [research, setResearch] = useState(true);
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  // Keep current control values available inside the transport closure.
  const providerRef = useRef(providerId);
  const researchRef = useRef(research);
  providerRef.current = providerId;
  researchRef.current = research;

  // Pick the default (or first) provider once loaded.
  useEffect(() => {
    if (!providerId && providers && providers.length > 0) {
      const def = providers.find((p) => p.is_default && p.enabled) ?? providers.find((p) => p.enabled);
      if (def) setProviderId(def.id);
    }
  }, [providers, providerId]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai-writer-chat",
        prepareSendMessagesRequest: async ({ messages }) => {
          const { data } = await supabase.auth.getSession();
          return {
            headers: { Authorization: `Bearer ${data.session?.access_token ?? ""}` },
            body: {
              messages,
              providerId: providerRef.current || undefined,
              research: researchRef.current,
            },
          };
        },
      }),
    [],
  );

  const { messages, sendMessage, status, stop, setMessages, error } = useChat({
    transport,
    onError: (e) => console.error("chat error", e),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const busy = status === "submitted" || status === "streaming";

  // Auto-save conversation (24h) after each completed turn.
  const convoIdRef = useRef<string | undefined>(undefined);
  const savedCountRef = useRef(0);
  useEffect(() => {
    if (status !== "ready" || messages.length === 0) return;
    if (messages.length === savedCountRef.current) return;
    savedCountRef.current = messages.length;
    const firstUser = messages.find((m) => m.role === "user");
    const title = (firstUser ? textOf(firstUser) : "New chat").slice(0, 80) || "New chat";
    saveConvoFn({
      data: { id: convoIdRef.current, title, messages: messages as unknown[] },
    })
      .then((r) => {
        if (r?.id) convoIdRef.current = r.id;
      })
      .catch((e) => console.error("save convo", e));
  }, [status, messages, saveConvoFn]);

  const send = () => {
    const text = input.trim();
    if (!text || busy) return;
    if (!providers || providers.length === 0) return;
    setInput("");
    sendMessage({ text });
  };

  const newChat = () => {
    setMessages([]);
    convoIdRef.current = undefined;
    savedCountRef.current = 0;
  };

  const lastAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return textOf(messages[i]);
    }
    return "";
  }, [messages]);

  const copyLast = async () => {
    if (!lastAssistant) return;
    await navigator.clipboard.writeText(lastAssistant);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const noProviders = providers && providers.length === 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="flex min-h-[70vh] flex-col rounded-2xl border border-border bg-card">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <select
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-sm"
          >
            {(providers ?? [])
              .filter((p) => p.enabled)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.model}
                </option>
              ))}
            {noProviders && <option value="">No providers</option>}
          </select>

          <button
            onClick={() => setResearch((r) => !r)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
              research
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
            title="Let the AI search the live web while writing"
          >
            <Globe className="h-4 w-4" /> Research {research ? "on" : "off"}
          </button>

          <div className="ml-auto flex items-center gap-2">
            {lastAssistant && (
              <button
                onClick={copyLast}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary"
              >
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                Copy
              </button>
            )}
            <button
              onClick={newChat}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary"
            >
              <Plus className="h-4 w-4" /> New chat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <Sparkles className="h-7 w-7" />
              </span>
              <h3 className="font-display text-lg font-bold">AI Writing & SEO Studio</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Research and write full articles, or ask me to audit and fix SEO. I can analyze any
                live URL or a stored post for on-page & technical issues and fix them directly.
              </p>
              {!noProviders && (
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {[
                    "Audit the SEO of all my published posts and list the top issues",
                    "Fix the meta title & description of my latest post",
                    "Analyze the SEO of https://freevideodownloader.lovable.app and fix what you can",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {noProviders && (
                <p className="mt-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  Add an AI provider in the Providers tab first.
                </p>
              )}
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className="flex gap-3">
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  m.role === "user"
                    ? "bg-secondary text-foreground"
                    : "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                }`}
              >
                {m.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                {m.parts.map((part, i) => {
                  if (part.type === "text") {
                    return (
                      <div
                        key={i}
                        className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-pre:bg-muted prose-pre:text-foreground"
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
                      </div>
                    );
                  }
                  const toolLabels: Record<string, string> = {
                    "tool-web_search": "Searching the web…",
                    "tool-read_url": "Reading a source…",
                    "tool-list_site_posts": "Loading your posts…",
                    "tool-audit_post": "Auditing post SEO…",
                    "tool-analyze_url": "Analyzing page SEO…",
                    "tool-apply_post_seo": "Applying SEO fixes…",
                  };
                  if (part.type in toolLabels) {
                    const Icon =
                      part.type === "tool-apply_post_seo"
                        ? Wrench
                        : part.type === "tool-audit_post" || part.type === "tool-analyze_url"
                          ? Gauge
                          : part.type === "tool-list_site_posts"
                            ? FileText
                            : part.type === "tool-read_url"
                              ? FileText
                              : Search;
                    return (
                      <div
                        key={i}
                        className="my-1 inline-flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        <Icon className="h-3.5 w-3.5" /> {toolLabels[part.type]}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex items-center gap-2 pl-11 text-sm text-muted-foreground">
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error.message || "Something went wrong. Check your provider key and try again."}
            </p>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder="Write an article about… (Shift+Enter for a new line)"
              disabled={noProviders}
              className="max-h-40 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            {busy ? (
              <button
                onClick={() => stop()}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-secondary"
              >
                <Square className="h-4 w-4" /> Stop
              </button>
            ) : (
              <button
                onClick={send}
                disabled={!input.trim() || noProviders}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-accent px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> Send
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Publish sidebar */}
      <div className="space-y-4">
        <PublishBar markdown={lastAssistant} />
      </div>
    </div>
  );
}
