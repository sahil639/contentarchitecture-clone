/*
 * Copy for the README overlay. Placeholder text standing in for real content,
 * kept at roughly the lengths the panel is laid out for.
 */

export type ReadmeBlock =
  | { kind: "text"; content: string }
  | { kind: "media"; caption: string };

export type ReadmeSection = {
  id: string;
  number: string;
  title: string;
  blocks: ReadmeBlock[];
};

export const README_SECTIONS: ReadmeSection[] = [
  {
    id: "why-this-exists",
    number: "001",
    title: "Why this exists",
    blocks: [
      {
        kind: "text",
        content:
          "Every Sanity project I shipped, the first week looked identical. Spin up Next, or Astro. Wire the Studio. Rewrite the page builder. Rebuild the SEO layer. Re-do the webhook revalidation. Re-style the same contact form for the fourth time.",
      },
      {
        kind: "text",
        content:
          "By the time the actual creative work started, 3 days of the budget were gone and the client had not seen a single pixel that mattered.",
      },
      {
        kind: "text",
        content:
          "Extracting it started small. One project. Then two. Then ten. Every time something broke in production, a migration that nuked a dataset, a CDN cache that served stale OG images for three weeks, a webhook that fired twice and corrupted a sitemap, the fix went back into the boilerplate.",
      },
      {
        kind: "text",
        content:
          "For a long time I called this the cost of headless. I had rebuilt the same foundation so many times I could do it half-asleep, and I mistook that for being good at my job instead of what it was, doing the same work twice.",
      },
      {
        kind: "text",
        content: "At some point that stopped being a reason to keep it to myself.",
      },
    ],
  },
  {
    id: "why-i-keep-shipping-it",
    number: "002",
    title: "Why I keep shipping it",
    blocks: [
      {
        kind: "text",
        content:
          "I use this on every project. I am the heaviest user. The bug I find on a Friday client engagement is the patch you get on Monday.",
      },
      {
        kind: "text",
        content:
          "I am one person, not a team. That is a feature. The architecture is consistent because one mind held it from the first schema file to the last revalidation hook. Nobody overrode the opinion. Nobody added a field because a stakeholder asked nicely.",
      },
      {
        kind: "text",
        content:
          "There is no distance between me and this. The decisions in the repo are the ones I make on paid work, in the same week, under the same deadline. When you open the fetch layer or the page builder, you are reading how I actually ship, not a demo cleaned up for sale.",
      },
      {
        kind: "text",
        content:
          "I am not trying to turn this into a SaaS. There is no dashboard, no seat-based pricing, no telemetry. You buy the repo, you own the repo. I maintain it because I use it too.",
      },
    ],
  },
  {
    id: "who-am-i",
    number: "003",
    title: "Who am I",
    blocks: [
      {
        kind: "text",
        content:
          "Creative web engineer, nearly a decade in. Design sensibility, technical depth, obsessive about detail. Based in Vienna, working worldwide.",
      },
      { kind: "media", caption: "Selected work" },
    ],
  },
];
