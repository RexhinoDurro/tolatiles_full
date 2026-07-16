import Link from 'next/link';
import type { ReactNode } from 'react';

// Lightweight markdown-lite parser for short marketing copy: supports **bold**
// and [label](href) so data files (services.ts, serviceDetails.ts) can mark up
// SEO-relevant keywords and internal links without storing raw HTML.
const RICH_TEXT_PATTERN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;

/** Strips the same **bold** / [label](href) markdown-lite syntax down to plain text,
 * for contexts that can't render JSX — meta tags, JSON-LD, truncated excerpts. */
export function stripRichTextMarkdown(text: string): string {
  return text.replace(RICH_TEXT_PATTERN, (_match, bold, linkLabel) => bold ?? linkLabel ?? '');
}

export function renderRichText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  RICH_TEXT_PATTERN.lastIndex = 0;
  while ((match = RICH_TEXT_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const [, bold, linkLabel, linkHref] = match;
    if (bold !== undefined) {
      nodes.push(
        <strong key={key++} className="font-bold text-gray-900">
          {bold}
        </strong>
      );
    } else if (linkLabel !== undefined && linkHref !== undefined) {
      const linkClassName = 'font-semibold text-brand-ink underline underline-offset-2 hover:text-blue-600 transition-colors';
      nodes.push(
        linkHref.startsWith('/') ? (
          <Link key={key++} href={linkHref} className={linkClassName}>
            {linkLabel}
          </Link>
        ) : (
          <a key={key++} href={linkHref} className={linkClassName}>
            {linkLabel}
          </a>
        )
      );
    }

    lastIndex = RICH_TEXT_PATTERN.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
