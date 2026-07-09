import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Sparkles,
  Loader2,
  Wand2,
  Scissors,
  Expand,
  SpellCheck,
  Check,
  RefreshCw,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { assistWrite } from "@/lib/ai-writer.functions";

type FieldKind =
  | "name"
  | "tagline"
  | "description"
  | "title"
  | "excerpt"
  | "meta_title"
  | "meta_description"
  | "article"
  | "ad_copy"
  | "text";

type Mode = "generate" | "improve" | "shorten" | "expand" | "fix" | "custom";

export function AiAssist({
  fieldKind,
  value,
  onApply,
  context,
  label,
  className,
}: {
  fieldKind: FieldKind;
  value: string;
  onApply: (text: string) => void;
  /** Short description of the page/tool so the AI has context. */
  context?: string;
  /** Accessible label, e.g. "meta description". */
  label?: string;
  className?: string;
}) {
  const assistFn = useServerFn(assistWrite);
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [result, setResult] = useState("");

  const run = useMutation({
    mutationFn: (mode: Mode) =>
      assistFn({
        data: {
          fieldKind,
          mode,
          current: value ?? "",
          instruction: instruction.trim(),
          context: context ?? "",
        },
      }),
    onSuccess: (r) => setResult(r.text),
  });

  const hasValue = (value ?? "").trim().length > 0;

  const apply = () => {
    if (!result) return;
    onApply(result);
    setResult("");
    setInstruction("");
    setOpen(false);
  };

  const Action = ({
    mode,
    icon: Icon,
    children,
    disabled,
  }: {
    mode: Mode;
    icon: typeof Wand2;
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={() => run.mutate(mode)}
      disabled={run.isPending || disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={`AI assist${label ? ` — ${label}` : ""}`}
          className={
            className ??
            "inline-flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
          }
        >
          <Sparkles className="h-3.5 w-3.5" /> AI
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 space-y-3"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-1.5 text-sm font-bold">
          <Sparkles className="h-4 w-4 text-primary" />
          AI writing assist
        </div>

        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder={
            hasValue
              ? "Optional: how should the AI change this? (tone, focus, keywords…)"
              : "Optional: describe what you want (topic, tone, keywords…)"
          }
          rows={2}
          className="w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary"
        />

        <div className="flex flex-wrap gap-1.5">
          <Action mode={instruction.trim() ? "custom" : "generate"} icon={Wand2}>
            {hasValue ? "Regenerate" : "Generate"}
          </Action>
          <Action mode="improve" icon={RefreshCw} disabled={!hasValue}>
            Improve
          </Action>
          <Action mode="shorten" icon={Scissors} disabled={!hasValue}>
            Shorten
          </Action>
          <Action mode="expand" icon={Expand} disabled={!hasValue}>
            Expand
          </Action>
          <Action mode="fix" icon={SpellCheck} disabled={!hasValue}>
            Fix
          </Action>
        </div>

        {run.isPending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Writing…
          </div>
        )}

        {run.isError && (
          <p className="rounded-lg bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
            {run.error instanceof Error ? run.error.message : "AI request failed"}
          </p>
        )}

        {result && !run.isPending && (
          <div className="space-y-2">
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-background px-2.5 py-2 text-xs whitespace-pre-wrap">
              {result}
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setResult("")}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={apply}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-xs font-bold text-primary-foreground"
              >
                <Check className="h-3.5 w-3.5" /> Use this
              </button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
