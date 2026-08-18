/*
 * Contents shown in the IDE editor.
 *
 * These are generated stubs, not the reference repository's source: that repo
 * is a paid product, so only its structure is mirrored here. Each stub is
 * shaped to its file type so the editor reads as a working view, and every one
 * is safe to replace with your own source.
 */

function titleFrom(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const STUBS: Record<string, (path: string, name: string) => string> = {
  md: (path, name) =>
    [
      `# ${titleFrom(name)}`,
      "",
      "> Placeholder. Replace with your own content.",
      "",
      "## Overview",
      "",
      `This document lives at \`${path}\`.`,
      "",
      "## Notes",
      "",
      "- Structure mirrors the reference repository",
      "- Contents are your own",
      "",
    ].join("\n"),

  json: (path, name) =>
    [
      "{",
      `  "$comment": "Placeholder for ${path}",`,
      `  "name": "${name.replace(/\.[^.]+$/, "")}",`,
      '  "version": "0.1.0",',
      '  "private": true',
      "}",
      "",
    ].join("\n"),

  ts: (path) =>
    [
      "/**",
      ` * ${path}`,
      " *",
      " * Placeholder module. Replace with your own implementation.",
      " */",
      "",
      "export const config = {",
      "  enabled: true,",
      "} as const;",
      "",
      "export default config;",
      "",
    ].join("\n"),

  tsx: (path, name) =>
    [
      "/**",
      ` * ${path}`,
      " *",
      " * Placeholder component. Replace with your own implementation.",
      " */",
      "",
      `export default function ${titleFrom(name).replace(/\s/g, "")}({`,
      "  children,",
      "}: {",
      "  children: React.ReactNode;",
      "}) {",
      "  return <div>{children}</div>;",
      "}",
      "",
    ].join("\n"),

  config: (path) =>
    [`# ${path}`, "#", "# Placeholder. Replace with your own settings.", "", ""].join(
      "\n",
    ),

  shell: (path) =>
    ["#!/usr/bin/env sh", "#", `# ${path}`, "", "echo \"placeholder hook\"", ""].join(
      "\n",
    ),
};

/** Buckets a filename into one of the stub shapes above. */
export function kindOf(name: string): keyof typeof STUBS | "plain" {
  const lower = name.toLowerCase();
  if (lower.endsWith(".md")) return "md";
  if (lower.endsWith(".json") || lower.endsWith(".jsonc")) return "json";
  if (lower.endsWith(".tsx")) return "tsx";
  if (lower.endsWith(".ts") || lower.endsWith(".mjs")) return "ts";
  if (
    lower.endsWith(".yml") ||
    lower.endsWith(".yaml") ||
    lower.startsWith(".env") ||
    lower === ".gitignore" ||
    lower === ".npmrc" ||
    lower === ".nvmrc" ||
    lower === ".lefthookrc"
  ) {
    return "config";
  }
  if (!lower.includes(".")) return "shell";
  return "plain";
}

export function contentFor(path: string): string {
  const name = path.split("/").pop() ?? path;
  const kind = kindOf(name);
  const stub = STUBS[kind];
  if (!stub) return [`${path}`, "", "Placeholder file.", ""].join("\n");
  return stub(path, name);
}
