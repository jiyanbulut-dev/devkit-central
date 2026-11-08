import { useMemo, useState } from 'react';
import { Eraser, FlaskConical } from 'lucide-react';
import { ErrorBanner, Panel, Toggle } from '../components/ui.jsx';

const MAX_MATCHES = 1000;

const FLAGS = [
  { key: 'g', label: 'g', title: 'global: find all matches' },
  { key: 'i', label: 'i', title: 'ignore case' },
  { key: 'm', label: 'm', title: 'multiline: ^ and $ match at line breaks' },
  { key: 's', label: 's', title: 'dotAll: . also matches newlines' },
  { key: 'u', label: 'u', title: 'unicode' },
];

const SAMPLE_PATTERN = '(?<user>[\\w.+-]+)@(?<domain>[\\w-]+\\.[\\w.]+)';
const SAMPLE_TEXT = `Contact the team:
ada@example.com, grace.hopper@navy.mil
bad-address@, linus@kernel.org`;

/** Alternate two highlight colours so adjacent matches stay distinguishable. */
const MARK_CLASSES = ['bg-accent-500/30 text-accent-400', 'bg-amber-400/30 text-amber-300'];

/** Split the text into plain and matched segments for rendering. */
function buildSegments(text, matches) {
  const segments = [];
  let last = 0;
  matches.forEach((m, i) => {
    const len = m[0].length;
    if (len === 0) return; // zero-length matches have nothing to highlight
    if (m.index > last) segments.push({ text: text.slice(last, m.index) });
    segments.push({ text: m[0], mark: i % 2 });
    last = m.index + len;
  });
  if (last < text.length) segments.push({ text: text.slice(last) });
  return segments;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState(new Set(['g']));
  const [text, setText] = useState('');

  // Canonical flag order so the displayed /pattern/flags is stable.
  const flagString = FLAGS.filter((f) => flags.has(f.key))
    .map((f) => f.key)
    .join('');

  const result = useMemo(() => {
    if (!pattern) return { matches: [], truncated: false };
    try {
      const re = new RegExp(pattern, flagString);
      const matches = [];
      let truncated = false;
      if (flagString.includes('g')) {
        for (const m of text.matchAll(re)) {
          if (matches.length >= MAX_MATCHES) {
            truncated = true;
            break;
          }
          matches.push(m);
        }
      } else {
        const m = re.exec(text);
        if (m) matches.push(m);
      }
      return { matches, truncated };
    } catch (err) {
      return { matches: [], truncated: false, error: err.message };
    }
  }, [pattern, flagString, text]);

  const segments = useMemo(() => buildSegments(text, result.matches), [text, result.matches]);

  const toggleFlag = (key, on) =>
    setFlags((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });

  return (
    <div className="space-y-4">
      {/* Pattern + flags */}
      <Panel
        title="Regular expression"
        actions={
          <>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setPattern(SAMPLE_PATTERN);
                setText(SAMPLE_TEXT);
                setFlags(new Set(['g']));
              }}
            >
              <FlaskConical size={14} /> Sample
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setPattern('');
                setText('');
              }}
              disabled={!pattern && !text}
            >
              <Eraser size={14} /> Clear
            </button>
          </>
        }
      >
        <div className="flex items-center gap-2 font-mono">
          <span className="text-xl text-slate-500">/</span>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            spellCheck={false}
            placeholder="pattern"
            aria-label="Regular expression pattern"
            className={`field ${result.error ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/40' : ''}`}
          />
          <span className="text-xl text-slate-500">/</span>
          <span className="min-w-6 text-sm text-accent-400">{flagString}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {FLAGS.map((f) => (
            <Toggle
              key={f.key}
              checked={flags.has(f.key)}
              onChange={(on) => toggleFlag(f.key, on)}
              label={f.label}
              title={f.title}
            />
          ))}
        </div>

        {result.error && (
          <div className="mt-3">
            <ErrorBanner title="Invalid regular expression">{result.error}</ErrorBanner>
          </div>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Test string + highlighted preview */}
        <Panel title="Test string">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            placeholder="Paste or type the text to test against…"
            aria-label="Test string"
            className="field h-40 resize-y"
          />

          <h4 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Highlighted matches
          </h4>
          <pre className="min-h-24 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-ink-500 bg-ink-900 p-3 font-mono text-sm leading-relaxed text-slate-300">
            {text ? (
              segments.map((s, i) =>
                s.mark === undefined ? (
                  <span key={i}>{s.text}</span>
                ) : (
                  <mark key={i} className={`rounded px-0.5 ${MARK_CLASSES[s.mark]}`}>
                    {s.text}
                  </mark>
                )
              )
            ) : (
              <span className="text-slate-500">Matches are highlighted here.</span>
            )}
          </pre>
        </Panel>

        {/* Match list */}
        <Panel
          title={`Matches${pattern && !result.error ? ` (${result.matches.length}${result.truncated ? '+' : ''})` : ''}`}
        >
          {!pattern ? (
            <p className="text-sm text-slate-500">Enter a pattern to start matching.</p>
          ) : result.error ? (
            <p className="text-sm text-slate-500">Fix the pattern to see matches.</p>
          ) : result.matches.length === 0 ? (
            <p className="text-sm text-slate-500">No matches.</p>
          ) : (
            <ol className="max-h-[28rem] space-y-2 overflow-auto pr-1">
              {result.matches.map((m, i) => {
                const groups = m.slice(1);
                const named = m.groups ? Object.entries(m.groups) : [];
                return (
                  <li key={i} className="rounded-lg border border-ink-500 bg-ink-900 p-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span>Match {i + 1}</span>
                      <span>
                        index {m.index}–{m.index + m[0].length}
                      </span>
                    </div>
                    <p className="mt-1 break-all font-mono text-sm text-accent-400">
                      {m[0] === '' ? <em className="text-slate-500">(empty match)</em> : m[0]}
                    </p>

                    {groups.length > 0 && (
                      <ul className="mt-2 space-y-1 border-t border-ink-600 pt-2 text-xs">
                        {groups.map((g, gi) => (
                          <li key={gi} className="flex gap-2 font-mono">
                            <span className="shrink-0 text-slate-500">${gi + 1}</span>
                            <span className="break-all text-slate-300">
                              {g === undefined ? <em className="text-slate-500">undefined</em> : g}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {named.length > 0 && (
                      <ul className="mt-2 space-y-1 border-t border-ink-600 pt-2 text-xs">
                        {named.map(([name, value]) => (
                          <li key={name} className="flex gap-2 font-mono">
                            <span className="shrink-0 text-sky-300">{name}</span>
                            <span className="break-all text-slate-300">
                              {value === undefined ? <em className="text-slate-500">undefined</em> : value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
          {result.truncated && (
            <p className="mt-2 text-xs text-amber-300">Showing the first {MAX_MATCHES} matches.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
