import { useMemo, useState } from 'react';
import { ArrowLeftRight, Eraser } from 'lucide-react';
import { CopyButton, ErrorBanner, Panel, Segmented, Toggle } from '../components/ui.jsx';

/**
 * Try to read query parameters from the input.
 * Accepts a full URL ("https://x.dev/?a=1"), a bare query ("?a=1" or "a=1&b=2"), or returns [].
 */
function extractParams(text) {
  const t = text.trim();
  if (!t) return [];
  try {
    const url = new URL(t);
    return [...url.searchParams.entries()];
  } catch {
    if (/^\??[^=&\s]+=/.test(t)) return [...new URLSearchParams(t.replace(/^\?/, '')).entries()];
    return [];
  }
}

export default function UrlTool() {
  const [mode, setMode] = useState('encode');
  const [scope, setScope] = useState('component'); // 'component' | 'full'
  const [plusAsSpace, setPlusAsSpace] = useState(true);
  const [input, setInput] = useState('');

  const result = useMemo(() => {
    if (!input) return { output: '' };
    try {
      if (mode === 'encode') {
        return { output: scope === 'component' ? encodeURIComponent(input) : encodeURI(input) };
      }
      const source = plusAsSpace ? input.replace(/\+/g, ' ') : input;
      return { output: scope === 'component' ? decodeURIComponent(source) : decodeURI(source) };
    } catch (err) {
      return {
        output: '',
        error:
          err instanceof URIError
            ? 'Malformed percent-encoding: a "%" is not followed by two valid hex digits, or the bytes are not valid UTF-8.'
            : err.message,
      };
    }
  }, [input, mode, scope, plusAsSpace]);

  // Inspect parameters from whichever side holds the readable URL.
  const params = useMemo(
    () => extractParams(mode === 'decode' ? result.output || input : input),
    [mode, input, result.output]
  );

  const swap = () => {
    if (result.output) setInput(result.output);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'encode', label: 'Encode' },
            { value: 'decode', label: 'Decode' },
          ]}
        />
        <Segmented
          value={scope}
          onChange={setScope}
          options={[
            { value: 'component', label: 'Component' },
            { value: 'full', label: 'Full URL' },
          ]}
        />
        {mode === 'decode' && (
          <Toggle
            checked={plusAsSpace}
            onChange={setPlusAsSpace}
            label="+ as space"
            title="Treat + as a space (form-encoded query strings)"
          />
        )}
        <div className="ml-auto flex gap-2">
          <button type="button" className="btn-secondary" onClick={swap} disabled={!result.output}>
            <ArrowLeftRight size={14} /> Swap
          </button>
          <button type="button" className="btn-ghost" onClick={() => setInput('')} disabled={!input}>
            <Eraser size={14} /> Clear
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        {scope === 'component'
          ? 'Component mode (encodeURIComponent) escapes everything except letters, digits and - _ . ! ~ * \' ( ). Use it for a single query value or path segment.'
          : 'Full URL mode (encodeURI) keeps URL structure characters such as : / ? # & = intact. Use it for a whole URL.'}
      </p>

      {result.error && <ErrorBanner title="Conversion failed">{result.error}</ErrorBanner>}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Input">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder={
              mode === 'encode' ? 'name=Ada Lovelace & co/é' : 'name%3DAda%20Lovelace%20%26%20co%2F%C3%A9'
            }
            aria-label="Input"
            className="field h-56 resize-y"
          />
        </Panel>

        <Panel title="Output" actions={<CopyButton text={result.output} />}>
          <textarea
            value={result.output}
            readOnly
            aria-label="Output"
            placeholder="Result appears here"
            className="field h-56 resize-y"
          />
        </Panel>
      </div>

      {params.length > 0 && (
        <Panel title={`Query parameters (${params.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-ink-600 text-slate-500">
                  <th className="w-1/3 py-2 pr-4 font-medium">Key</th>
                  <th className="py-2 font-medium">Value (decoded)</th>
                </tr>
              </thead>
              <tbody>
                {params.map(([k, v], i) => (
                  <tr key={i} className="border-b border-ink-700 last:border-0">
                    <td className="break-all py-2 pr-4 text-sky-300">{k}</td>
                    <td className="break-all py-2 text-emerald-300">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
