import Markdown from 'react-markdown';

interface DocPanelProps {
  content: string;
}

export function DocPanel({ content }: DocPanelProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-8 prose-container">
        <Markdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold tracking-tight mb-4 text-foreground">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-semibold mt-8 mb-3 text-foreground">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base font-semibold mt-6 mb-2 text-foreground">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-sm leading-relaxed text-foreground/80 mb-4">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="text-sm leading-relaxed text-foreground/80 mb-4 list-disc pl-6 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="text-sm leading-relaxed text-foreground/80 mb-4 list-decimal pl-6 space-y-1">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-sm">{children}</li>
            ),
            code: ({ className, children }) => {
              const isBlock = className?.includes('language-');
              if (isBlock) {
                return (
                  <code className="text-[13px] leading-relaxed">{children}</code>
                );
              }
              return (
                <code className="text-[13px] px-1.5 py-0.5 rounded bg-muted font-mono text-foreground">{children}</code>
              );
            },
            pre: ({ children }) => (
              <pre className="bg-muted/60 border border-border rounded-lg p-4 mb-4 overflow-x-auto font-mono">{children}</pre>
            ),
            table: ({ children }) => (
              <div className="mb-4 overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-sm">{children}</table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-muted/50 border-b border-border">{children}</thead>
            ),
            th: ({ children }) => (
              <th className="text-left px-4 py-2 font-medium text-foreground text-xs">{children}</th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2 text-foreground/80 border-t border-border">{children}</td>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-primary/40 pl-4 my-4 text-sm text-muted-foreground italic">{children}</blockquote>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-foreground">{children}</strong>
            ),
            hr: () => (
              <hr className="my-6 border-border" />
            ),
          }}
        >
          {content}
        </Markdown>
      </div>
    </div>
  );
}
