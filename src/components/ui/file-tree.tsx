"use client";

import { useState } from "react";
import type { TreeNode } from "@/content/repo-tree";
import { kindOf } from "@/content/repo-files";

/*
 * File tree.
 *
 * Folders toggle open; files select. Indentation is applied as inline padding
 * rather than nested boxes, so each row's hit area and hover fill span the full
 * sidebar width regardless of depth.
 */

const INDENT_PX = 12;
const BASE_PAD_PX = 10;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-12 shrink-0 transition-transform duration-150 ${open ? "rotate-90" : ""}`}
    >
      <title>Toggle</title>
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

/* Glyph per file type, so the tree is scannable without reading extensions. */
function Icon({ folder, name }: { folder: boolean; name: string }) {
  const kind = folder ? "folder" : kindOf(name);

  const glyph = () => {
    switch (kind) {
      case "folder":
        return (
          <path d="M2.4 4.2a.6.6 0 0 1 .6-.6h3l1.4 1.6h5a.6.6 0 0 1 .6.6v6.4a.6.6 0 0 1-.6.6H3a.6.6 0 0 1-.6-.6Z" />
        );
      case "json":
        /* Braces. */
        return (
          <>
            <path d="M6.7 4c-1 0-1.4.5-1.4 1.4v1c0 .8-.3 1.2-1 1.6.7.4 1 .8 1 1.6v1c0 .9.4 1.4 1.4 1.4" />
            <path d="M9.3 4c1 0 1.4.5 1.4 1.4v1c0 .8.3 1.2 1 1.6-.7.4-1 .8-1 1.6v1c0 .9-.4 1.4-1.4 1.4" />
          </>
        );
      case "ts":
        /* Angle brackets. */
        return (
          <>
            <path d="M6 5.5 3.2 8 6 10.5" />
            <path d="M10 5.5 12.8 8 10 10.5" />
          </>
        );
      case "tsx":
        /* Orbit, for component files. */
        return (
          <>
            <circle cx="8" cy="8" r="1.2" />
            <ellipse cx="8" cy="8" rx="5.6" ry="2.4" />
            <ellipse cx="8" cy="8" rx="5.6" ry="2.4" transform="rotate(60 8 8)" />
            <ellipse cx="8" cy="8" rx="5.6" ry="2.4" transform="rotate(120 8 8)" />
          </>
        );
      case "config":
        /* Sliders. */
        return (
          <>
            <path d="M2.8 5.6h10.4M2.8 10.4h10.4" />
            <circle cx="6" cy="5.6" r="1.3" />
            <circle cx="10" cy="10.4" r="1.3" />
          </>
        );
      case "md":
        /* Page with rules. */
        return (
          <>
            <path d="M4.3 2.6h4.8L12 5.5V13a.6.6 0 0 1-.6.6H4.3a.6.6 0 0 1-.6-.6V3.2a.6.6 0 0 1 .6-.6Z" />
            <path d="M9 2.8v2.8h2.8M5.8 8.6h4.4M5.8 10.8h3" />
          </>
        );
      default:
        return (
          <>
            <path d="M4.3 2.6h4.8L12 5.5V13a.6.6 0 0 1-.6.6H4.3a.6.6 0 0 1-.6-.6V3.2a.6.6 0 0 1 .6-.6Z" />
            <path d="M9 2.8v2.8h2.8" />
          </>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[1.05em] shrink-0 text-current/70"
    >
      <title>{folder ? "Folder" : kind}</title>
      {glyph()}
    </svg>
  );
}

function Row({
  node,
  depth,
  parentPath,
  activePath,
  onOpen,
}: {
  node: TreeNode;
  depth: number;
  parentPath: string;
  activePath: string | null;
  onOpen: (path: string) => void;
}) {
  const isFolder = Boolean(node.children);
  const path = parentPath ? `${parentPath}/${node.name}` : node.name;
  /* Folders start closed, matching the reference's collapsed root listing. */
  const [open, setOpen] = useState(false);
  const isActive = !isFolder && path === activePath;

  return (
    <li>
      <button
        type="button"
        style={{ paddingLeft: BASE_PAD_PX + depth * INDENT_PX }}
        onClick={() => (isFolder ? setOpen((v) => !v) : onOpen(path))}
        aria-expanded={isFolder ? open : undefined}
        className={`flex w-full cursor-pointer items-center gap-6 py-3 pr-10 text-left font-mono text-caption-10 uppercase tracking-wide outline-none transition-colors duration-100 ${
          isActive
            ? "bg-white/10 text-white"
            : node.accent
              ? "text-accent hover:bg-white/5"
              : "text-white/55 hover:bg-white/5 hover:text-white"
        }`}
      >
        {isFolder ? (
          <Chevron open={open} />
        ) : (
          /* Keeps file names aligned with folder names on the same level. */
          <span aria-hidden="true" className="size-12 shrink-0" />
        )}
        {node.accent && (
          <span aria-hidden="true" className="size-5 shrink-0 rounded-full bg-accent" />
        )}
        {!node.accent && <Icon folder={isFolder} name={node.name} />}
        <span className="truncate whitespace-nowrap">{node.name}</span>
      </button>

      {isFolder && open && node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <Row
              key={child.name}
              node={child}
              depth={depth + 1}
              parentPath={path}
              activePath={activePath}
              onOpen={onOpen}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FileTree({
  nodes,
  activePath,
  onOpen,
}: {
  nodes: TreeNode[];
  activePath: string | null;
  onOpen: (path: string) => void;
}) {
  return (
    <nav aria-label="Repository files" className="py-8">
      <ul>
        {nodes.map((node) => (
          <Row
            key={node.name}
            node={node}
            depth={0}
            parentPath=""
            activePath={activePath}
            onOpen={onOpen}
          />
        ))}
      </ul>
    </nav>
  );
}
