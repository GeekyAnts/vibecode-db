import type React from 'react';
import type { RunResult } from '../stories/runner';

interface ResultPanelProps {
  result: RunResult | null;
  isRunning: boolean;
}

export function ResultPanel({ result, isRunning }: ResultPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <span className="text-sm font-medium text-muted-foreground">Result</span>
        {result && (
          <span className="text-xs text-muted-foreground">
            {result.duration.toFixed(1)}ms
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto p-4">
        {isRunning && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">Executing...</span>
          </div>
        )}

        {!isRunning && !result && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <svg className="h-12 w-12 mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 5v14l11-7z" />
            </svg>
            <p className="text-sm">Click Run to execute the query</p>
          </div>
        )}

        {!isRunning && result && result.error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-4 w-4 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span className="text-sm font-medium text-destructive">Error</span>
            </div>
            <pre className="text-sm font-mono text-destructive whitespace-pre-wrap">{result.error}</pre>
          </div>
        )}

        {!isRunning && result && !result.error && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="text-sm font-medium text-green-600">Success</span>
            </div>
            <JsonView data={result.data} />
          </div>
        )}
      </div>
    </div>
  );
}

function JsonView({ data }: { data: unknown }) {
  if (data === null || data === undefined) {
    return <span className="text-muted-foreground font-mono text-sm">null</span>;
  }

  const json = JSON.stringify(data, null, 2);

  return (
    <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap break-all">
      {syntaxHighlight(json)}
    </pre>
  );
}

function syntaxHighlight(json: string): (string | React.JSX.Element)[] {
  const parts: (string | React.JSX.Element)[] = [];
  let key = 0;

  // Simple regex-based syntax highlighting
  const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(json)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(json.slice(lastIndex, match.index));
    }

    let cls = 'text-orange-600 dark:text-orange-400'; // number
    if (/^"/.test(match[0])) {
      if (/:$/.test(match[0])) {
        cls = 'text-blue-600 dark:text-blue-400'; // key
      } else {
        cls = 'text-green-600 dark:text-green-400'; // string
      }
    } else if (/true|false/.test(match[0])) {
      cls = 'text-purple-600 dark:text-purple-400'; // boolean
    } else if (/null/.test(match[0])) {
      cls = 'text-muted-foreground'; // null
    }

    parts.push(
      <span key={key++} className={cls}>
        {match[0]}
      </span>,
    );

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < json.length) {
    parts.push(json.slice(lastIndex));
  }

  return parts;
}
