/*
 * Tree shown in the IDE section's sidebar.
 *
 * Declared rather than derived from the filesystem: this renders in the browser,
 * and the shape is small enough that hand-declaring it keeps the viewer free of
 * any build-time filesystem step.
 *
 * `path` matches a key in REPO_FILES when the entry is openable.
 */

export type TreeNode = {
  name: string;
  path?: string;
  children?: TreeNode[];
};

export const REPO_TREE: TreeNode[] = [
  {
    name: "src",
    children: [
      {
        name: "app",
        children: [
          { name: "globals.css", path: "src/app/globals.css" },
          { name: "layout.tsx", path: "src/app/layout.tsx" },
          { name: "page.tsx", path: "src/app/page.tsx" },
        ],
      },
      {
        name: "components",
        children: [
          {
            name: "motion",
            children: [
              {
                name: "odometer-text.tsx",
                path: "src/components/motion/odometer-text.tsx",
              },
              {
                name: "text-vortex.tsx",
                path: "src/components/motion/text-vortex.tsx",
              },
              {
                name: "use-typewriter.ts",
                path: "src/components/motion/use-typewriter.ts",
              },
            ],
          },
          {
            name: "sections",
            children: [
              {
                name: "hero-section.tsx",
                path: "src/components/sections/hero-section.tsx",
              },
              {
                name: "text-terminal-section.tsx",
                path: "src/components/sections/text-terminal-section.tsx",
              },
            ],
          },
          {
            name: "ui",
            children: [
              { name: "connector.tsx", path: "src/components/ui/connector.tsx" },
              { name: "panel.tsx", path: "src/components/ui/panel.tsx" },
              {
                name: "split-button.tsx",
                path: "src/components/ui/split-button.tsx",
              },
            ],
          },
        ],
      },
      { name: "content", children: [] },
    ],
  },
  { name: "public", children: [] },
  { name: "next.config.ts", path: "next.config.ts" },
  { name: "package.json", path: "package.json" },
  { name: "tsconfig.json", path: "tsconfig.json" },
];

/** Depth-first list of every openable file path, for the terminal and search. */
export function flattenPaths(nodes: TreeNode[] = REPO_TREE): string[] {
  return nodes.flatMap((n) =>
    n.children ? flattenPaths(n.children) : n.path ? [n.path] : [],
  );
}
