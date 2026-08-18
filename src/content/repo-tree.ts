/*
 * Tree shown in the IDE section's sidebar, mirroring the reference repository's
 * structure.
 *
 * Only the shape is reproduced — names, nesting and ordering. File bodies are
 * generated stubs (see repo-files.ts); the reference repository is a paid
 * product and its source is not copied here.
 *
 * `leaf: true` marks an entry that opens in the editor. Folders without
 * children render collapsible but empty, matching entries whose contents the
 * reference only loads on demand.
 */

export type TreeNode = {
  name: string;
  children?: TreeNode[];
  /** Draws the entry in the accent colour with a status dot. */
  accent?: boolean;
};

export const REPO_TREE: TreeNode[] = [
  {
    name: ".agents",
    children: [
      {
        name: "skills",
        children: [
          { name: "sanity.md" },
          { name: "frontend.md" },
          { name: "icons.md" },
          { name: "scaffolding-plop.md" },
          { name: "design-engineering.md" },
          { name: "modern-web-guidance.md" },
          { name: "react-performance.md" },
          { name: "performance-audit.md" },
          { name: "seo-aeo-best-practices.md" },
          { name: "agent-markdown.md" },
          { name: "view-transitions.md" },
          { name: "code-style.md" },
          { name: "section-colocation.md" },
          { name: "umami-analytics.md" },
          { name: "mantine-hooks.md" },
          { name: "dev-server.md" },
          { name: "docs-maintenance.md" },
          { name: "codebase-design.md" },
          { name: "domain-modeling.md" },
        ],
      },
    ],
  },
  {
    name: ".husky",
    children: [
      {
        name: "_",
        children: [{ name: "pre-commit" }, { name: "prepare-commit-msg" }],
      },
    ],
  },
  {
    name: "app",
    children: [
      {
        name: "(web)",
        children: [
          { name: "[[...uri]]", children: [] },
          { name: "blog", children: [] },
          { name: "layout.tsx" },
        ],
      },
      {
        name: "api",
        children: [
          { name: "agent-markdown", children: [] },
          { name: "agents", children: [] },
          { name: "revalidate", children: [] },
          { name: "draft-mode", children: [] },
          { name: "seo-screenshot", children: [] },
        ],
      },
      {
        name: "sanity-studio",
        children: [{ name: "[[...index]]", children: [] }, { name: "layout.tsx" }],
      },
      { name: "favicon.ico", children: [{ name: "route.ts" }] },
      { name: "llms.txt", children: [{ name: "route.ts" }] },
      { name: "robots.txt", children: [{ name: "route.ts" }] },
      { name: "shared-web-layout.tsx" },
      { name: "sitemap.ts" },
      { name: "not-found.tsx" },
      { name: "global-not-found.tsx" },
    ],
  },
  { name: "components", children: [] },
  { name: "docs", children: [] },
  { name: "features", children: [] },
  { name: "sanity", children: [] },
  { name: "scripts", children: [] },
  { name: "seed", children: [] },
  { name: "templates", children: [] },

  { name: ".env.example" },
  { name: ".gitignore" },
  { name: ".lefthookrc" },
  { name: ".mcp.json" },
  { name: ".npmrc" },
  { name: ".nvmrc" },
  { name: "AGENTS.md" },
  { name: "assets.d.ts" },
  { name: "biome.jsonc" },
  { name: "CLAUDE.md" },
  { name: "env.ts" },
  { name: "GETTING-STARTED.md" },
  { name: "lefthook.yml" },
  { name: "LICENSE.md" },
  { name: "next-env.d.ts" },
  { name: "next.config.ts" },
  { name: "package.json" },
  { name: "package-lock.json" },
  { name: "plopfile.mjs" },
  { name: "proxy.ts" },
  { name: "README.md" },
  { name: "GET-ACCESS.md", accent: true },
  { name: "sanity-schema.json" },
  { name: "sanity.cli.ts" },
  { name: "sanity.config.ts" },
  { name: "skills-lock.json" },
  { name: "tsconfig.json" },
];

/** Depth-first list of every openable path, for the terminal and search. */
export function flattenPaths(nodes: TreeNode[] = REPO_TREE, prefix = ""): string[] {
  return nodes.flatMap((n) => {
    const path = prefix ? `${prefix}/${n.name}` : n.name;
    return n.children ? flattenPaths(n.children, path) : [path];
  });
}

/** Resolves a slash-separated path to its node, or null. */
export function findNode(path: string, nodes: TreeNode[] = REPO_TREE): TreeNode | null {
  const [head, ...rest] = path.split("/").filter(Boolean);
  const match = nodes.find((n) => n.name === head);
  if (!match) return null;
  if (rest.length === 0) return match;
  return match.children ? findNode(rest.join("/"), match.children) : null;
}
