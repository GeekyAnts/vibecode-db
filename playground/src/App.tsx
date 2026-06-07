import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Menu, X } from 'lucide-react';
import { stories } from './stories';
import { runStory } from './stories/runner';
import type { RunResult } from './stories/runner';
import { Sidebar } from './components/Sidebar';
import { CodeEditor } from './components/CodeEditor';
import { ResultPanel } from './components/ResultPanel';
import { DocPanel } from './components/DocPanel';
import { AdapterSwitcher } from './components/AdapterSwitcher';
import type { AdapterConfig } from './components/AdapterSwitcher';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function App() {
  const { storyId } = useParams();
  const navigate = useNavigate();

  const selectedStory = stories.find(s => s.id === storyId) ?? stories[0];
  const [code, setCode] = useState(selectedStory.code ?? '');
  const [result, setResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [adapterConfig, setAdapterConfig] = useState<AdapterConfig>({ type: 'mock' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setCode(selectedStory.code ?? '');
    setResult(null);
  }, [selectedStory.id]);

  const handleSelectStory = useCallback((story: typeof selectedStory) => {
    navigate(`/${story.id}`);
    setSidebarOpen(false);
  }, [navigate]);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const res = await runStory(code, adapterConfig);
      setResult(res);
    } finally {
      setIsRunning(false);
    }
  }, [code, adapterConfig]);

  const isDoc = selectedStory.type === 'doc';

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-background text-foreground">
      {/* Mobile top bar (hidden on desktop) */}
      <div className="lg:hidden flex items-center gap-3 h-14 px-4 border-b border-border bg-card flex-shrink-0">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
          className="-ml-1 p-1.5 rounded-md text-foreground hover:bg-accent transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold truncate">{selectedStory.title}</span>
      </div>

      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: off-canvas drawer on mobile, static column on desktop */}
      <div
        className={cn(
          'flex flex-col overflow-hidden bg-card border-border flex-shrink-0',
          'fixed inset-y-0 left-0 z-50 w-72 border-r transition-transform duration-200 ease-in-out',
          'lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:transition-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close button (mobile only) */}
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
          className="lg:hidden absolute top-3 right-3 z-10 p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <Sidebar selectedStory={selectedStory} onSelect={handleSelectStory} />
      </div>

      {isDoc ? (
        /* Doc view: full-width markdown */
        <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-card">
          <DocPanel content={selectedStory.content ?? ''} />
        </div>
      ) : (
        /* Playground view: editor + result, stacked on mobile, side-by-side on desktop */
        <div className="flex-1 min-w-0 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          {/* Code editor */}
          <div className="flex-1 lg:flex-none w-full lg:w-[420px] min-h-0 flex flex-col overflow-hidden border-b lg:border-b-0 lg:border-r border-border">
            <div className="px-4 py-3 border-b border-border bg-card flex-shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">{selectedStory.title}</h2>
                <Badge variant="secondary" className="text-[10px]">
                  {adapterConfig.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{selectedStory.description}</p>
            </div>
            <div className="flex-shrink-0">
              <AdapterSwitcher config={adapterConfig} onChange={setAdapterConfig} />
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <CodeEditor
                value={code}
                onChange={setCode}
                onRun={handleRun}
                isRunning={isRunning}
              />
            </div>
          </div>

          {/* Result panel */}
          <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-card">
            <ResultPanel result={result} isRunning={isRunning} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
