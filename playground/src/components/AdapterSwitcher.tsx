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

// Read credentials from env at module level
// Use service key for playground so storage/admin operations work
const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const ENV_SUPABASE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const ENV_POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL ?? '';

const adapters: { type: AdapterType; label: string }[] = [
  { type: 'mock', label: 'Mock' },
  { type: 'supabase', label: 'Supabase' },
  { type: 'pocketbase', label: 'PocketBase' },
  { type: 'rest', label: 'REST' },
];

function isReady(config: AdapterConfig): boolean {
  switch (config.type) {
    case 'mock':
      return true;
    case 'supabase':
      return !!(config.supabaseUrl && config.supabaseKey);
    case 'pocketbase':
      return !!config.pocketbaseUrl;
    case 'rest':
      return !!config.restBaseUrl;
    default:
      return false;
  }
}

export function AdapterSwitcher({ config, onChange }: AdapterSwitcherProps) {
  const ready = isReady(config);

  return (
    <div className="border-b border-border bg-muted/30">
      <div className="px-4 py-2 flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground mr-1">Adapter:</span>
        <div className="flex gap-1">
          {adapters.map((a) => (
            <button
              key={a.type}
              onClick={() => {
                const next: AdapterConfig = { ...config, type: a.type };
                // Auto-fill from env when switching
                if (a.type === 'supabase' && ENV_SUPABASE_URL) {
                  next.supabaseUrl = ENV_SUPABASE_URL;
                  next.supabaseKey = ENV_SUPABASE_KEY;
                }
                if (a.type === 'pocketbase' && ENV_POCKETBASE_URL) {
                  next.pocketbaseUrl = ENV_POCKETBASE_URL;
                }
                onChange(next);
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
        {ready && (
          <Badge variant="outline" className="ml-auto text-[10px] text-green-600 border-green-600/30">
            Ready
          </Badge>
        )}
      </div>
    </div>
  );
}
