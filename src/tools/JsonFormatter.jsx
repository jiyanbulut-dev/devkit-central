import { useMemo, useState } from 'react';
import { ArrowDownToLine, Eraser, FileJson, Minimize2, Sparkles } from 'lucide-react';
import JsonView from '../components/JsonView.jsx';
import { CopyButton, ErrorBanner, Panel, SuccessBanner, Toggle, formatBytes } from '../components/ui.jsx';

const SAMPLE = `{"name":"DevKit Central","version":"1.0.0","private":true,"tags":["json","jwt","base64"],"author":{"name":"Ada","active":true},"stats":{"tools":5,"price":0,"ratio":1.5e2},"notes":null}`;

/**
 * Turn a JSON.parse error into { message, line, col }.
 * V8 reports "at position N" (older) or "(line L column C)" (newer); Firefox reports "line L column C".
 */
function describeError(err, text) {
  const message = err.message;
  let line = null;
  let col = null;

  const lc = message.match(/line (\d+) column (\d+)/i);
  if (lc) {
    line = Number(lc[1]);
    col = Number(lc[2]);
  } else {
    const p = message.match(/position (\d+)/i);
    if (p) {
      const before = text.slice(0, Number(p[1])).split('\n');
      line = before.length;
      col = before[before.length - 1].length + 1;
    } else if (/end of (JSON )?input|unexpected end/i.test(message)) {
      const lines = text.split('\n');
      line = lines.length;
      col = lines[lines.length - 1].length + 1;
    }
  }
  return { message, line, col };
}

/** Recursively sort object keys (arrays keep their order). */
function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((k) => [k, sortKeys(value[k])])
    );
  }
  return value;
}

/** Shows the lines around the error with the offending line and column marked. */
function ErrorContext({ text, line, col }) {
  const lines = text.split('\n');
  const start = Math.max(0, line - 3);
  const end = Math.min(lines.length, line + 2);

  return (
    <pre className="mt-3 overflow-x-auto rounded-md bg-ink-900/70 py-2 font-mono text-xs leading-relaxed">
      {lines.slice(start, end).map((content, i) => {
        const n = start + i + 1;
        const isErr = n === line;
        return (
          <div key={n} className={isErr ? 'bg-rose-500/20' : ''}>
            <span className="inline-block w-10 select-none pr-3 text-right text-slate-500">{n}</span>
            <span className={isErr ? 'text-rose-100' : 'text-slate-400'}>{content || ' '}</span>
            {isErr && col != null && (
              <div>
                <span className="inline-block w-10" />
                <span className="text-rose-400">{' '.repeat(Math.max(0, col - 1))}^</span>
              </div>
            )}
          </div>
        );
      })}
    </pre>
  );
}

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('beautify'); // 'beautify' | 'minify'
  const [indent, setIndent] = useState('2'); // '2' | '4' | 'tab'
  const [sorted, setSorted] = useState(false);

  // Validate + format live as the user types.
  const result = useMemo(() => {
    if (!input.trim()) return { empty: true };
    try {
      let value = JSON.parse(input);
      if (sorted) value = sortKeys(value);
      const space = mode === 'minify' ? 0 : indent === 'tab' ? '\t' : Number(indent);
      return { ok: true, output: JSON.stringify(value, null, space) };
    } catch (err) {
      return { ok: false, error: describeError(err, input) };
    }
  }, [input, mode, indent, sorted]);

  const output = result.ok ? result.output : '';

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={mode === 'beautify' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setMode('beautify')}
        >
          <Sparkles size={14} /> Beautify
        </button>
        <button
          type="button"
          className={mode === 'minify' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setMode('minify')}
        >
          <Minimize2 size={14} /> Minify
        </button>

        <select
          value={indent}
          onChange={(e) => setIndent(e.target.value)}
          disabled={mode === 'minify'}
          aria-label="Indentation"
          className="btn-secondary appearance-none pr-6"
        >
          <option value="2">2 spaces</option>
          <option value="4">4 spaces</option>
          <option value="tab">Tab</option>
        </select>

        <Toggle checked={sorted} onChange={setSorted} label="Sort keys" title="Alphabetically sort all object keys" />

        <div className="ml-auto flex gap-2">
          <button type="button" className="btn-ghost" onClick={() => setInput(SAMPLE)}>
            <FileJson size={14} /> Sample
          </button>
          <button type="button" className="btn-ghost" onClick={() => setInput('')} disabled={!input}>
            <Eraser size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Status */}
      {result.ok && (
        <SuccessBanner>
          Valid JSON · {formatBytes(new Blob([input]).size)} in → {formatBytes(new Blob([output]).size)} out
        </SuccessBanner>
      )}
      {result.ok === false && (
        <ErrorBanner title="Invalid JSON">
          <p>
            {result.error.message}
            {result.error.line != null && (
              <span className="ml-1 font-semibold text-rose-300">
                (line {result.error.line}, column {result.error.col})
              </span>
            )}
          </p>
          {result.error.line != null && <ErrorContext text={input} line={result.error.line} col={result.error.col} />}
        </ErrorBanner>
      )}

      {/* Editors */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Input">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder='Paste JSON here, e.g. {"hello": "world"}'
            aria-label="JSON input"
            className={`field h-96 resize-y ${result.ok === false ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/40' : ''}`}
          />
        </Panel>

        <Panel
          title="Output"
          actions={
            <>
              <button
                type="button"
                className="btn-secondary"
                disabled={!output}
                onClick={() => setInput(output)}
                title="Replace the input with this output"
              >
                <ArrowDownToLine size={14} className="-rotate-90" /> Use as input
              </button>
              <CopyButton text={output} />
            </>
          }
        >
          <div className="h-96 overflow-auto rounded-lg border border-ink-500 bg-ink-900 p-3">
            {output ? (
              <JsonView text={output} />
            ) : (
              <p className="text-sm text-slate-500">
                {result.ok === false ? 'Fix the error above to see the formatted output.' : 'Formatted JSON appears here.'}
              </p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
