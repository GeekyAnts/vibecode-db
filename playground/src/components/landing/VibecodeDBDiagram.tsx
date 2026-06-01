import { Logo } from "./Logo"

interface VibecodeDBDiagramProps {
  className?: string
  width?: number
  height?: number
}

export function VibecodeDBDiagram({
  className = "",
  width = 1200,
  height = 600,
}: VibecodeDBDiagramProps) {
  return (
    <svg
      viewBox="80 120 990 480"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={width}
      height={height}
    >
      {/* Front-end dotted rectangle - centered and widened */}
      <rect x="100" y="180" width="700" height="400" rx="20" fill="none" stroke="#4b5563" strokeWidth="2" strokeDasharray="8,8" opacity="0.6" />
      <text x="120" y="205" fill="#9ca3af" fontFamily="Inter, system-ui, sans-serif" fontSize="14" fontWeight="500">Front-end</text>

      {/* Your App Logic (Left) - centered */}
      <g transform="translate(150, 250)">
        <rect x="0" y="0" width="160" height="130" rx="16" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
        <circle cx="35" cy="35" r="10" fill="#10b981" />
        <rect x="60" y="28" width="70" height="5" fill="#e5e5e5" rx="2" />
        <rect x="60" y="38" width="45" height="5" fill="#a3a3a3" rx="2" />

        <rect x="25" y="65" width="110" height="10" fill="#374151" rx="5" />
        <rect x="25" y="85" width="85" height="10" fill="#374151" rx="5" />
        <rect x="25" y="105" width="65" height="10" fill="#374151" rx="5" />

        <text x="80" y="150" textAnchor="middle" fill="#e5e5e5" fontFamily="Inter, system-ui, sans-serif" fontSize="16" fontWeight="600">Your app logic</text>
      </g>

      {/* Connection line to Vibecode DB */}
      <line x1="310" y1="315" x2="380" y2="315" stroke="#6366f1" strokeWidth="4" markerEnd="url(#arrowhead)" />

      {/* Vibecode DB (Center) - centered */}
      <g transform="translate(380, 220)">
        {/* Main container */}
        <rect x="0" y="0" width="340" height="190" rx="20" fill="#1e1b4b" stroke="#4c46d6" strokeWidth="4" />

        {/* Lightning bolt icon */}
        <g transform="translate(25, 25)">
          <rect x="0" y="0" width="50" height="50" rx="12" fill="#4c46d6" />
          <foreignObject x="0" y="0" width="50" height="50">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
              <Logo size="lg" showText={false} />
            </div>
          </foreignObject>
        </g>

        {/* Title */}
        <text x="95" y="38" fill="white" fontFamily="Inter, system-ui, sans-serif" fontSize="22" fontWeight="700">Vibecode DB</text>
        <text x="95" y="58" fill="#c7d2fe" fontFamily="Inter, system-ui, sans-serif" fontSize="14" fontWeight="500">Frontend Database</text>
        <text x="95" y="75" fill="#c7d2fe" fontFamily="Inter, system-ui, sans-serif" fontSize="14" fontWeight="500">API Gateway</text>

        {/* Features */}
        <rect x="20" y="100" width="300" height="2" fill="#4c46d6" opacity="0.5" />
        <text x="25" y="125" fill="#e0e7ff" fontFamily="Inter, system-ui, sans-serif" fontSize="13">• Unified Frontend API</text>
        <text x="25" y="145" fill="#e0e7ff" fontFamily="Inter, system-ui, sans-serif" fontSize="13">• Start Fast, Scale Flexibly</text>
        <text x="25" y="165" fill="#e0e7ff" fontFamily="Inter, system-ui, sans-serif" fontSize="13">• No Backend Rewrites</text>
      </g>

      {/* Connection lines to backends (dotted) - longer arrows */}
      <line x1="720" y1="280" x2="850" y2="180" stroke="#6366f1" strokeWidth="2" strokeDasharray="6,4" markerEnd="url(#arrowhead)" />
      <line x1="720" y1="300" x2="850" y2="270" stroke="#6366f1" strokeWidth="2" strokeDasharray="6,4" markerEnd="url(#arrowhead)" />
      <line x1="720" y1="320" x2="850" y2="360" stroke="#6366f1" strokeWidth="2" strokeDasharray="6,4" markerEnd="url(#arrowhead)" />
      <line x1="720" y1="340" x2="850" y2="450" stroke="#6366f1" strokeWidth="2" strokeDasharray="6,4" markerEnd="url(#arrowhead)" />

      {/* Connection line to Faker (dotted arrow down) */}
      <line x1="550" y1="410" x2="550" y2="450" stroke="#6366f1" strokeWidth="2" strokeDasharray="6,4" markerEnd="url(#arrowhead)" />

      {/* Mock (in-memory) - centered under Vibecode DB */}
      <g transform="translate(470, 460)">
        <rect x="0" y="0" width="160" height="80" rx="16" fill="#1a1a1a" stroke="#8b5cf6" strokeWidth="3" />
        <circle cx="30" cy="40" r="12" fill="#8b5cf6" />
        <text x="55" y="35" fill="#e5e5e5" fontFamily="Inter, system-ui, sans-serif" fontSize="16" fontWeight="600">Mock</text>
        <text x="55" y="52" fill="#a3a3a3" fontFamily="Inter, system-ui, sans-serif" fontSize="12">In-memory</text>
      </g>

      {/* Backend Services - moved further right */}

      {/* Supabase */}
      <g transform="translate(850, 140)">
        <rect x="0" y="0" width="200" height="80" rx="16" fill="#1a1a1a" stroke="#10b981" strokeWidth="3" />
        <circle cx="30" cy="40" r="12" fill="#10b981" />
        <text x="55" y="35" fill="#e5e5e5" fontFamily="Inter, system-ui, sans-serif" fontSize="16" fontWeight="600">Supabase</text>
        <text x="55" y="52" fill="#a3a3a3" fontFamily="Inter, system-ui, sans-serif" fontSize="12">PostgreSQL</text>
      </g>

      {/* PocketBase */}
      <g transform="translate(850, 240)">
        <rect x="0" y="0" width="200" height="80" rx="16" fill="#1a1a1a" stroke="#f59e0b" strokeWidth="3" />
        <circle cx="30" cy="40" r="12" fill="#f59e0b" />
        <text x="55" y="35" fill="#e5e5e5" fontFamily="Inter, system-ui, sans-serif" fontSize="16" fontWeight="600">PocketBase</text>
        <text x="55" y="52" fill="#a3a3a3" fontFamily="Inter, system-ui, sans-serif" fontSize="12">Open Source BaaS</text>
      </g>

      {/* REST API (custom adapter) */}
      <g transform="translate(850, 340)">
        <rect x="0" y="0" width="200" height="80" rx="16" fill="#1a1a1a" stroke="#3b82f6" strokeWidth="3" />
        <circle cx="30" cy="40" r="12" fill="#3b82f6" />
        <text x="55" y="35" fill="#e5e5e5" fontFamily="Inter, system-ui, sans-serif" fontSize="16" fontWeight="600">REST API</text>
        <text x="55" y="52" fill="#a3a3a3" fontFamily="Inter, system-ui, sans-serif" fontSize="12">Custom Adapter</text>
      </g>

      {/* GraphQL (custom adapter) */}
      <g transform="translate(850, 440)">
        <rect x="0" y="0" width="200" height="80" rx="16" fill="#1a1a1a" stroke="#e91e63" strokeWidth="3" />
        <circle cx="30" cy="40" r="12" fill="#e91e63" />
        <text x="55" y="35" fill="#e5e5e5" fontFamily="Inter, system-ui, sans-serif" fontSize="16" fontWeight="600">GraphQL</text>
        <text x="55" y="52" fill="#a3a3a3" fontFamily="Inter, system-ui, sans-serif" fontSize="12">Custom Adapter</text>
      </g>

      {/* Arrow marker definition */}
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
        </marker>
      </defs>
    </svg>
  )
}
