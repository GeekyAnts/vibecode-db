import { useState } from 'react';
import type { AdapterType } from '../stories';
import { Badge } from '@/components/ui/badge';

export interface AdapterConfig {
  type: AdapterType;
  supabaseUrl?: string;
  supabaseKey?: string;
  pocketbaseUrl?: string;
  restBaseUrl?: string;
}

interface AdapterSwitcherProps {
  config: AdapterConfig;
  onChange: (config: AdapterConfig) => void;
}

const adapters: { type: AdapterType; label: string; description: string }[] = [
  { type: 'mock', label: 'Mock', description: 'In-memory (no setup required)' },
  { type: 'supabase', label: 'Supabase', description: 'Requires URL + Key' },
  { type: 'pocketbase', label: 'PocketBase', description: 'Requires server URL' },
  { type: 'rest', label: 'REST', description: 'Requires base URL' },
];

export function AdapterSwitcher({ config, onChange }: AdapterSwitcherProps) {
  const [showConfig, setShowConfig] = useState(false);

  return (
    <div className="border-b border-border bg-muted/30">
      <div className="px-4 py-2 flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground mr-1">Adapter:</span>
        <div className="flex gap-1">
          {adapters.map((a) => (
            <button
              key={a.type}
              onClick={() => {
                onChange({ ...config, type: a.type });
                if (a.type !== 'mock') setShowConfig(true);
                else setShowConfig(false);
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                config.type === a.type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
        {config.type !== 'mock' && (
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {showConfig ? 'Hide' : 'Configure'}
          </button>
        )}
        {config.type === 'mock' && (
          <Badge variant="outline" className="ml-auto text-[10px] text-green-600 border-green-600/30">
            Ready
          </Badge>
        )}
      </div>

      {showConfig && config.type === 'supabase' && (
        <div className="px-4 pb-3 space-y-2">
          <input
            type="text"
            placeholder="Supabase URL (https://xxx.supabase.co)"
            value={config.supabaseUrl ?? ''}
            onChange={(e) => onChange({ ...config, supabaseUrl: e.target.value })}
            className="w-full px-3 py-1.5 text-xs font-mono rounded border border-input bg-background placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="text"
            placeholder="Supabase Anon Key"
            value={config.supabaseKey ?? ''}
            onChange={(e) => onChange({ ...config, supabaseKey: e.target.value })}
            className="w-full px-3 py-1.5 text-xs font-mono rounded border border-input bg-background placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      )}

      {showConfig && config.type === 'pocketbase' && (
        <div className="px-4 pb-3">
          <input
            type="text"
            placeholder="PocketBase URL (http://127.0.0.1:8090)"
            value={config.pocketbaseUrl ?? ''}
            onChange={(e) => onChange({ ...config, pocketbaseUrl: e.target.value })}
            className="w-full px-3 py-1.5 text-xs font-mono rounded border border-input bg-background placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      )}

      {showConfig && config.type === 'rest' && (
        <div className="px-4 pb-3">
          <input
            type="text"
            placeholder="REST Base URL (https://api.example.com)"
            value={config.restBaseUrl ?? ''}
            onChange={(e) => onChange({ ...config, restBaseUrl: e.target.value })}
            className="w-full px-3 py-1.5 text-xs font-mono rounded border border-input bg-background placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      )}
    </div>
  );
}
