"use client";

import { useEffect, useRef, useState } from "react";
import { REPO_TREE, flattenPaths, type TreeNode } from "@/content/repo-tree";
import { REPO_FILES } from "@/content/repo-files";

/*
 * IDE terminal.
 *
 * A small shell over the in-memory repository. Nothing is executed: each
 * command is interpreted against the tree and file map, which keeps the whole
 * thing client-side and side-effect free.
 */

const PROMPT = "~/contentarch >";

type Entry = { command: string; output: string[] };

function listDir(dir: string): string[] {
  const parts = dir.split("/").filter(Boolean);
  let level: TreeNode[] = REPO_TREE;
  for (const part of parts) {
    const next = level.find((n) => n.name === part && n.children);
    if (!next?.children) return [`cd: no such directory: ${dir}`];
    level = next.children;
  }
  if (level.length === 0) return ["(empty)"];
  return [level.map((n) => (n.children ? `${n.name}/` : n.name)).join("   ")];
}

function treeLines(nodes: TreeNode[], depth = 0): string[] {
  return nodes.flatMap((n) => [
    `${"  ".repeat(depth)}${n.children ? `${n.name}/` : n.name}`,
    ...(n.children ? treeLines(n.children, depth + 1) : []),
  ]);
}

function run(input: string, cwd: string): { output: string[]; cwd: string } {
  const [name, ...args] = input.trim().split(/\s+/);
  const arg = args.join(" ");

  switch (name) {
    case "":
      return { output: [], cwd };
    case "help":
      return {
        output: [
          "Available: ls, cd, cat, tree, pwd, clear, help",
          "This shell reads the repository in memory; nothing is executed.",
        ],
        cwd,
      };
    case "pwd":
      return { output: [cwd || "/"], cwd };
    case "ls":
      return { output: listDir(arg || cwd), cwd };
    case "tree":
      return { output: treeLines(REPO_TREE), cwd };
    case "cd": {
      if (!arg || arg === "/" || arg === "~") return { output: [], cwd: "" };
      if (arg === "..") {
        return { output: [], cwd: cwd.split("/").slice(0, -1).join("/") };
      }
      const next = cwd ? `${cwd}/${arg}` : arg;
      const probe = listDir(next);
      if (probe[0]?.startsWith("cd:")) return { output: probe, cwd };
      return { output: [], cwd: next };
    }
    case "cat": {
      if (!arg) return { output: ["cat: missing operand"], cwd };
      const direct = cwd ? `${cwd}/${arg}` : arg;
      const match =
        REPO_FILES[direct] !== undefined
          ? direct
          : flattenPaths().find((p) => p.endsWith(`/${arg}`) || p === arg);
      if (!match) return { output: [`cat: ${arg}: no such file`], cwd };
      return { output: REPO_FILES[match].split("\n").slice(0, 40), cwd };
    }
    default:
      return { output: [`command not found: ${name}`], cwd };
  }
}

export function IdeTerminal() {
  const [history, setHistory] = useState<Entry[]>([
    {
      command: "",
      output: ["Type `help` for the available commands."],
    },
  ]);
  const [value, setValue] = useState("");
  const [cwd, setCwd] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Keeps the newest line in view as output accumulates. */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = value;
    setValue("");
    if (input.trim() === "clear") {
      setHistory([]);
      return;
    }
    const result = run(input, cwd);
    setCwd(result.cwd);
    setHistory((h) => [...h, { command: input, output: result.output }]);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className="shrink-0 border-white/10 border-b px-16 py-8 font-mono text-caption-10 uppercase tracking-wide text-white/40">
        Terminal
      </p>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-16 py-12 font-mono text-caption-10 leading-relaxed"
      >
        {history.map((entry, i) => (
          <div key={i}>
            {entry.command !== "" && (
              <p className="text-white/50">
                <span className="text-white/30">{PROMPT}</span> {entry.command}
              </p>
            )}
            {entry.output.map((line, j) => (
              <p key={j} className="whitespace-pre text-white/70">
                {line}
              </p>
            ))}
          </div>
        ))}

        <form onSubmit={submit} className="flex items-center gap-8">
          <span className="shrink-0 text-white/30">
            {PROMPT}
            {cwd && <span className="text-accent"> {cwd}</span>}
          </span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal input"
            className="min-w-0 flex-1 bg-transparent text-white outline-none selection:bg-white selection:text-black"
          />
        </form>
      </div>
    </div>
  );
}
