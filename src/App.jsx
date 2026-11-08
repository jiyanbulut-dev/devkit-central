import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import { filterTools, tools } from './tools/index.js';

/** Resolve the active tool id from the URL hash (e.g. "#/jwt"), falling back to the first tool. */
function readHash() {
  const id = window.location.hash.replace(/^#\/?/, '');
  return tools.some((t) => t.id === id) ? id : tools[0].id;
}

function ToolFallback() {
  return (
    <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
      <Loader2 size={16} className="animate-spin" /> Loading tool…
    </div>
  );
}

export default function App() {
  const [activeId, setActiveId] = useState(readHash);
  // Tools the user has opened. They stay mounted (hidden) so their input is kept while switching.
  const [visited, setVisited] = useState(() => new Set([readHash()]));
  const [query, setQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchRef = useRef(null);

  const filtered = useMemo(() => filterTools(query), [query]);

  // Tool switching is hash-based: instant, no reloads, and every tool is deep-linkable.
  const select = useCallback((id) => {
    window.location.hash = `/${id}`;
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const id = readHash();
      setActiveId(id);
      setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Keyboard shortcuts: "/" or Ctrl/Cmd+K focuses search.
  useEffect(() => {
    const onKey = (e) => {
      const el = document.activeElement;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Pressing Enter in the search box opens the top result.
  const openFirstMatch = useCallback(() => {
    if (filtered[0]) {
      select(filtered[0].id);
      searchRef.current?.blur();
    }
  }, [filtered, select]);

  const active = tools.find((t) => t.id === activeId);

  return (
    <div className="flex h-full bg-ink-900 text-slate-200">
      <Sidebar
        tools={filtered}
        activeId={activeId}
        onSelect={select}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          query={query}
          onQueryChange={setQuery}
          onSubmit={openFirstMatch}
          onMenuClick={() => setSidebarOpen(true)}
          searchRef={searchRef}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{active.name}</h1>
              <p className="mt-1 text-sm text-slate-400">{active.description}</p>
            </div>

            {tools
              .filter((t) => visited.has(t.id))
              .map((t) => {
                const Tool = t.component;
                return (
                  <div key={t.id} hidden={t.id !== activeId}>
                    <Suspense fallback={<ToolFallback />}>
                      <Tool />
                    </Suspense>
                  </div>
                );
              })}
          </div>
        </main>
      </div>
    </div>
  );
}
