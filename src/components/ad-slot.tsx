import { useEffect, useRef } from "react";

/**
 * Renders raw ad-network markup (HTML + <script>) provided by an admin.
 * innerHTML does not execute injected <script> tags, so we recreate them.
 * Client-only: renders an empty container during SSR.
 */
export function AdSlot({ code, className }: { code?: string | null; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    if (!code || !code.trim()) {
      host.innerHTML = "";
      return;
    }
    host.innerHTML = code;
    const scripts = Array.from(host.querySelectorAll("script"));
    for (const old of scripts) {
      const s = document.createElement("script");
      for (const attr of Array.from(old.attributes)) {
        s.setAttribute(attr.name, attr.value);
      }
      s.text = old.textContent ?? "";
      old.replaceWith(s);
    }
  }, [code]);

  if (!code || !code.trim()) return null;
  return <div ref={ref} className={className} aria-label="Advertisement" />;
}
