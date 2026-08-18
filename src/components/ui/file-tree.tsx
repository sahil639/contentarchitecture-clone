"use client";

import { useState } from "react";
import type { TreeNode } from "@/content/repo-tree";

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

function Icon({ folder }: { folder: boolean }) {
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
      <title>{folder ? "Folder" : "File"}</title>
      {folder ? (
        <path d="M2.4 4.2a.6.6 0 0 1 .6-.6h3l1.4 1.6h5a.6.6 0 0 1 .6.6v6.4a.6.6 0 0 1-.6.6H3a.6.6 0 0 1-.6-.6Z" />
      ) : (
        <>
          <path d="M4.3 2.6h4.8L12 5.5V13a.6.6 0 0 1-.6.6H4.3a.6.6 0 0 1-.6-.6V3.2a.6.6 0 0 1 .6-.6Z" />
          <path d="M9 2.8v2.8h2.8" />
        </>
      )}
    </svg>
  );
}

function Row({
  node,
  depth,
  activePath,
  onOpen,
}: {
  node: TreeNode;
  depth: number;
  activePath: string | null;
  onOpen: (path: string) => void;
}) {
  const isFolder = Boolean(node.children);
  const [open, setOpen] = useState(depth === 0 && isFolder);
  const isActive = !isFolder && node.path === activePath;

  return (
    <li>
      <button
        type="button"
        style={{ paddingLeft: BASE_PAD_PX + depth * INDENT_PX }}
        onClick={() => (isFolder ? setOpen((v) => !v) : node.path && onOpen(node.path))}
        aria-expanded={isFolder ? open : undefined}
        className={`flex w-full cursor-pointer items-center gap-6 py-3 pr-10 text-left font-mono text-caption-10 uppercase tracking-wide outline-none transition-colors duration-100 ${
          isActive
            ? "bg-white/10 text-white"
            : "text-white/55 hover:bg-white/5 hover:text-white"
        }`}
      >
        {isFolder ? (
          <Chevron open={open} />
        ) : (
          /* Keeps file names aligned with folder names on the same level. */
          <span aria-hidden="true" className="size-12 shrink-0" />
        )}
        <Icon folder={isFolder} />
        <span className="truncate whitespace-nowrap">{node.name}</span>
      </button>

      {isFolder && open && node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <Row
              key={child.name}
              node={child}
              depth={depth + 1}
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
            activePath={activePath}
            onOpen={onOpen}
          />
        ))}
      </ul>
    </nav>
  );
}
