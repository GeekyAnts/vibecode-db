import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
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

function App() {
  const { storyId } = useParams();
  const navigate = useNavigate();

  const selectedStory = stories.find(s => s.id === storyId) ?? stories[0];
  const [code, setCode] = useState(selectedStory.code ?? '');
  const [result, setResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [adapterConfig, setAdapterConfig] = useState<AdapterConfig>({ type: 'mock' });

  useEffect(() => {
    setCode(selectedStory.code ?? '');
    setResult(null);
  }, [selectedStory.id]);

  const handleSelectStory = useCallback((story: typeof selectedStory) => {
    navigate(`/${story.id}`);
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
    <div className="h-screen flex overflow-hidden bg-background text-foreground">
      {/* Column 1: Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-border bg-card flex flex-col overflow-hidden">
        <Sidebar selectedStory={selectedStory} onSelect={handleSelectStory} />
      </div>

      {isDoc ? (
        /* Doc view: full-width markdown */
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-card">
          <DocPanel content={selectedStory.content ?? ''} />
        </div>
      ) : (
        <>
          {/* Column 2: Code editor */}
          <div className="w-[420px] flex-shrink-0 border-r border-border flex flex-col overflow-hidden">
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

          {/* Column 3: Result panel */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-card">
            <ResultPanel result={result} isRunning={isRunning} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
