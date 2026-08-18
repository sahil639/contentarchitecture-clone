"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/ui/panel";
import { FileTree } from "@/components/ui/file-tree";
import { IdeTerminal } from "@/components/ui/ide-terminal";
import { REPO_TREE } from "@/content/repo-tree";
import { REPO_FILES } from "@/content/repo-files";

/*
 * IDE section.
 *
 * A read-write view of the repository: tree on the left, editor on the right,
 * terminal below. The section is locked to the viewport height, and every pane
 * scrolls inside it, so the whole thing holds its size no matter which file is
 * open or how much output the terminal has produced.
 *
 * Edits are held in memory against the file's path, so switching files and
 * coming back keeps whatever was typed. Nothing is written to disk.
 */

const DEFAULT_PATH = "src/components/ui/connector.tsx";

function TopBar({
  showTerminal,
  onToggleTerminal,
}: {
  showTerminal: boolean;
  onToggleTerminal: () => void;
}) {
  const [variant, setVariant] = useState<"next" | "astro">("next");

  return (
    <div className="relative flex h-34 shrink-0 items-center justify-center border-white/10 border-b px-16">
      <div className="-translate-y-1/2 absolute top-1/2 left-8">
        <div className="relative isolate flex items-center gap-2 rounded-4 bg-white/5 p-2">
          {(["next", "astro"] as const).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={variant === key}
              onClick={() => setVariant(key)}
              className={`relative cursor-pointer rounded-4 px-6 py-2 font-mono text-caption-10 uppercase tracking-wide transition-colors ${
                variant === key ? "text-white" : "text-white/40 hover:text-white"
              }`}
            >
              {variant === key && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-4 bg-white/10"
                />
              )}
              <span className="relative">{key === "next" ? "Next.js" : "Astro"}</span>
            </button>
          ))}
        </div>
      </div>

      <span className="max-w-1/3 truncate font-mono text-caption-10 uppercase tracking-wide text-white/40">
        This is the actual repo.
      </span>

      <div className="-translate-y-1/2 absolute top-1/2 right-8 flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleTerminal}
          aria-pressed={showTerminal}
          aria-label={showTerminal ? "Hide terminal" : "Show terminal"}
          className={`flex cursor-pointer items-center gap-6 rounded-4 px-6 py-4 transition-colors hover:bg-white/10 hover:text-white ${
            showTerminal ? "bg-white/10 text-white/80" : "text-white/40"
          }`}
        >
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-14 shrink-0"
          >
            <title>Terminal</title>
            <rect x="2" y="3" width="12" height="10" rx="1.5" />
            <path d="M4.6 6.6 6.6 8.2 4.6 9.8" strokeWidth="1.1" />
            <path d="M7.8 10h2.8" strokeWidth="1.1" />
          </svg>
          <kbd className="hidden rounded-4 border border-white/15 px-5 py-1 font-mono text-[11px] leading-none text-white/55 sm:inline-block">
            ⌘ J
          </kbd>
        </button>
      </div>
    </div>
  );
}

function Editor({
  path,
  value,
  onChange,
}: {
  path: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const lineCount = value.split("\n").length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="shrink-0 border-white/10 border-b px-16 py-8 font-mono text-caption-10 uppercase tracking-wide text-white/40">
        {path}
      </p>

      <div className="flex min-h-0 flex-1 overflow-auto">
        {/*
         * Gutter and textarea share the same type metrics and scroll together
         * inside one scroller, so numbers stay aligned with their lines.
         */}
        <pre
          aria-hidden="true"
          className="shrink-0 select-none py-12 pr-12 pl-16 text-right font-mono text-caption-10 leading-relaxed text-white/25"
        >
          {Array.from({ length: lineCount }, (_, i) => i + 1).join("\n")}
        </pre>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          aria-label={`Contents of ${path}`}
          className="min-h-full min-w-0 flex-1 resize-none whitespace-pre bg-transparent py-12 pr-16 font-mono text-caption-10 leading-relaxed text-white/85 outline-none selection:bg-white selection:text-black"
        />
      </div>
    </div>
  );
}

export function IdeSection({ id }: { id: string }) {
  const [path, setPath] = useState(DEFAULT_PATH);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [showTerminal, setShowTerminal] = useState(true);

  /* ⌘J / Ctrl+J toggles the terminal, matching the shortcut shown in the bar. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setShowTerminal((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = edits[path] ?? REPO_FILES[path] ?? "";

  return (
    <section
      id={id}
      data-section="ide"
      className="h-svh bg-off-white px-16 py-72 text-black lg:p-80"
    >
      <div className="h-full w-full">
        <Panel frame="p-7 lg:p-10" className="h-full" innerClassName="h-full">
          <div className="relative isolate flex h-full flex-col overflow-hidden rounded-4 bg-black text-white ring-1 ring-white/10">
            <TopBar
              showTerminal={showTerminal}
              onToggleTerminal={() => setShowTerminal((v) => !v)}
            />

            <div className="flex min-h-0 flex-1">
              <div className="hidden w-[240px] shrink-0 overflow-y-auto border-white/10 border-r lg:block">
                <FileTree nodes={REPO_TREE} activePath={path} onOpen={setPath} />
              </div>

              <div className="flex min-h-0 flex-1 flex-col">
                <Editor
                  path={path}
                  value={value}
                  onChange={(next) => setEdits((e) => ({ ...e, [path]: next }))}
                />

                {showTerminal && (
                  <div className="h-[38%] min-h-0 shrink-0 border-white/10 border-t">
                    <IdeTerminal />
                  </div>
                )}
              </div>
            </div>

            <div className="flex h-30 shrink-0 items-center justify-between border-white/10 border-t px-16 font-mono text-caption-10 uppercase tracking-wide text-white/40">
              <span>main · updated today</span>
              <span>{Object.keys(edits).length} unsaved</span>
            </div>
          </div>
        </Panel>
      </div>
    </section>
  );
}
