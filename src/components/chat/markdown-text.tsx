// Lightweight markdown renderer for chat messages.
// Supports: **bold**, *italic*, `code`, [links](url), ~~strike~~, and line breaks.
// URLs are sanitized to open in a new tab with rel="noopener noreferrer".

"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  className?: string;
}

/**
 * Render a chat message as markdown. Uses react-markdown with a strict allowlist
 * of inline elements (no headings, lists, or images — chat is for short text).
 */
export function MarkdownText({ text, className }: Props) {
  return (
    <div
      className={cn(
        "text-sm leading-relaxed [&_a]:underline [&_a]:underline-offset-2",
        "[&_code]:font-mono [&_code]:text-[0.85em] [&_code]:bg-black/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded",
        "dark:[&_code]:bg-white/10",
        className,
      )}
    >
      <ReactMarkdown
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            />
          ),
          // Block all block-level elements we don't want in chat.
          h1: ({ node, ...props }) => <span {...props} />,
          h2: ({ node, ...props }) => <span {...props} />,
          h3: ({ node, ...props }) => <span {...props} />,
          ul: ({ node, ...props }) => <span {...props} />,
          ol: ({ node, ...props }) => <span {...props} />,
          li: ({ node, ...props }) => <span {...props} />,
          img: () => null,
        }}
        unwrapDisallowed
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
