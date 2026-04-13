import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

// ── Custom component map ──────────────────────────────────────
const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-8 text-3xl font-bold tracking-tight first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-8 text-2xl font-bold tracking-tight first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-6 text-xl font-semibold">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-4 text-base font-semibold">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="mb-4 leading-7 last:mb-0">{children}</p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent-600 underline underline-offset-2 transition-colors hover:text-accent-700 dark:text-accent-400"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-accent-500 pl-4 italic text-muted">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc pl-6 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal pl-6 space-y-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-7">{children}</li>
  ),
  hr: () => (
    <hr className="my-8 border-border" />
  ),
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ''}
      className="my-4 max-w-full rounded-xl border border-border"
      loading="lazy"
    />
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.startsWith('language-')
    if (isBlock) {
      return (
        <pre className="my-4 overflow-x-auto rounded-xl border border-border bg-zinc-950 p-4 text-sm dark:bg-zinc-900">
          <code className={`${className ?? ''} text-zinc-100`}>{children}</code>
        </pre>
      )
    }
    return (
      <code
        className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-800 dark:bg-slate-800 dark:text-slate-200"
        {...props}
      >
        {children}
      </code>
    )
  },
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-border bg-surface-elevated">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-border">{children}</tbody>
  ),
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5">{children}</td>
  ),
}

// ── Main component ────────────────────────────────────────────

interface MarkdownRendererProps {
  content:   string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`text-foreground ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
