import { useState } from 'react';
import { Globe, Search, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { getAllCategories, openWebsite, searchGoogle, Website } from '@/lib/webAccess';

type WebAccessPanelProps = {
  onCommand: (text: string) => void;
};

export default function WebAccessPanel({ onCommand }: WebAccessPanelProps) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('Social Media');

  const categories = getAllCategories();

  const handleSiteClick = (site: Website) => {
    openWebsite(site.url);
    onCommand(`open ${site.name}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    searchGoogle(searchQuery);
    onCommand(`search ${searchQuery}`);
    setSearchQuery('');
  };

  const activeSites = categories.find((c) => c.category === activeCategory)?.sites || [];

  return (
    <div className="w-full rounded-xl bg-white/3 border border-white/8 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-violet-400" />
          <span className="text-xs font-semibold text-slate-300">Web Access</span>
          <span className="text-[9px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded-full border border-violet-500/20">
            40+ sites
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={13} className="text-slate-500" />
        ) : (
          <ChevronDown size={13} className="text-slate-500" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-white/5">
          {/* Quick search */}
          <form onSubmit={handleSearch} className="flex gap-1.5 mt-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick search..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
            />
            <button
              type="submit"
              className="w-7 h-7 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 flex items-center justify-center text-violet-400 transition-colors"
            >
              <Search size={11} />
            </button>
          </form>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(cat.category)}
                className={`text-[9px] px-2 py-0.5 rounded-full border transition-all ${
                  activeCategory === cat.category
                    ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                    : 'bg-white/3 text-slate-500 border-white/8 hover:text-slate-400 hover:bg-white/8'
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {/* Sites grid */}
          <div className="grid grid-cols-2 gap-1">
            {activeSites.map((site) => (
              <button
                key={site.name}
                onClick={() => handleSiteClick(site)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/15 text-left transition-all group"
              >
                <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=16`}
                    alt=""
                    className="w-3 h-3"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-300 truncate flex-1 transition-colors">
                  {site.name}
                </span>
                <ExternalLink size={9} className="text-slate-600 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
