import { Github, Menu, Search, ShieldCheck, X } from 'lucide-react';

/**
 * Top bar: mobile menu button, global tool search, privacy badge.
 * The search input ref is owned by App so the "/" and Ctrl/Cmd+K shortcuts can focus it.
 */
export default function Navbar({ query, onQueryChange, onSubmit, onMenuClick, searchRef }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-ink-600 bg-ink-900/90 px-4 backdrop-blur">
      <button
        type="button"
        className="btn-ghost -ml-2 px-2 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      <form
        className="relative max-w-xl flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        role="search"
      >
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && (onQueryChange(''), e.currentTarget.blur())}
          placeholder="Search tools… (json, jwt, base64)"
          aria-label="Search tools"
          className="w-full rounded-lg border border-ink-500 bg-ink-800 py-2 pl-9 pr-16 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-accent-500 focus:ring-1 focus:ring-accent-500/40"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-slate-200"
          >
            <X size={14} />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-ink-500 bg-ink-700 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 sm:block">
            Ctrl K
          </kbd>
        )}
      </form>

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 text-xs font-medium text-accent-400 md:inline-flex">
          <ShieldCheck size={14} />
          100% client-side
        </span>
        <a
          href="https://github.com/"
          target="_blank"
          rel="noreferrer noopener"
          className="btn-ghost px-2"
          aria-label="View source on GitHub"
        >
          <Github size={18} />
        </a>
      </div>
    </header>
  );
}
