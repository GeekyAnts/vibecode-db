import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

/**
 * Lightweight, dependency-free code block styled to match the landing page's
 * dark glassmorphic aesthetic. (The original Next.js site used
 * react-syntax-highlighter; here we keep the playground bundle lean.)
 */
export function CodeBlock({ code, language = "javascript", className }: CodeBlockProps) {
  return (
    <div className={cn("relative", className)}>
      <pre
        className="overflow-x-auto rounded-lg border border-white/10 bg-black/60 p-4 text-sm leading-relaxed backdrop-blur-md"
        data-language={language}
      >
        <code className="font-mono text-[0.875rem] text-slate-200">{code}</code>
      </pre>
    </div>
  )
}
