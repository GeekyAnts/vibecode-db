import { stories, categories } from '../stories';
import type { Story } from '../stories';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  selectedStory: Story;
  onSelect: (story: Story) => void;
}

const categoryIcons: Record<string, string> = {
  'Getting Started': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  Adapters: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  CRUD: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7',
  Filters: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
  Transforms: 'M3 6h18M6 12h12M9 18h6',
  Auth: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  Storage: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  Realtime: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  RPC: 'M7 8l-4 4 4 4M17 8l4 4-4 4M14 4l-4 16',
};

export function Sidebar({ selectedStory, onSelect }: SidebarProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex-shrink-0">
        <h1 className="text-sm font-semibold tracking-tight">vibecode-db</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Playground & Docs</p>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-2">
          {categories.map((category) => {
            const categoryStories = stories.filter((s) => s.category === category);
            const isDocCategory = categoryStories.every((s) => s.type === 'doc');

            return (
              <div key={category} className="mb-3">
                <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                  <svg className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={categoryIcons[category] ?? 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'} />
                  </svg>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {category}
                  </span>
                  <Badge variant={isDocCategory ? 'outline' : 'secondary'} className="text-[10px] px-1.5 py-0 h-4 ml-auto">
                    {categoryStories.length}
                  </Badge>
                </div>
                {categoryStories.map((story) => (
                  <button
                    key={story.id}
                    onClick={() => onSelect(story)}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                      selectedStory.id === story.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {story.type === 'doc' && (
                      <svg className="h-3 w-3 flex-shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    )}
                    <span className="truncate">{story.title}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
