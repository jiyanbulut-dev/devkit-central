import { Lock, SearchX, Terminal, X } from 'lucide-react';

/**
 * Responsive sidebar.
 * - lg and up: fixed column that is always visible.
 * - below lg: slide-in drawer with a backdrop.
 */
export default function Sidebar({ tools, activeId, onSelect, open, onClose }) {
  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-ink-600 bg-ink-800 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Tools navigation"
      >
        {/* Brand */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-ink-600 px-4">
          <a href="#/" className="flex items-center gap-2.5" onClick={onClose}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 text-ink-950">
              <Terminal size={18} strokeWidth={2.5} />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold tracking-tight text-white">DevKit Central</span>
              <span className="block text-[10px] uppercase tracking-widest text-slate-500">Dev micro-tools</span>
            </span>
          </a>
          <button type="button" className="btn-ghost px-2 lg:hidden" onClick={onClose} aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        {/* Tool list */}
        <nav className="flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Tools ({tools.length})
          </p>

          {tools.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-3 py-10 text-center text-sm text-slate-500">
              <SearchX size={22} />
              No tools match your search.
            </div>
          ) : (
            <ul className="space-y-1">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const active = tool.id === activeId;
                return (
                  <li key={tool.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(tool.id);
                        onClose();
                      }}
                      aria-current={active ? 'page' : undefined}
                      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                        active
                          ? 'bg-accent-500/15 text-accent-400'
                          : 'text-slate-400 hover:bg-ink-700 hover:text-slate-100'
                      }`}
                    >
                      <Icon size={17} className={active ? 'text-accent-400' : 'text-slate-500 group-hover:text-slate-300'} />
                      <span className="truncate">{tool.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>

        {/* Privacy footer */}
        <div className="shrink-0 border-t border-ink-600 p-4">
          <div className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-500">
            <Lock size={14} className="mt-0.5 shrink-0 text-accent-500" />
            <p>Your data never leaves this browser tab. No servers, no tracking, no storage.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
