import { useMemo, useState } from 'react';
import { ArrowLeftRight, Eraser } from 'lucide-react';
import { CopyButton, ErrorBanner, Panel, Segmented, Toggle } from '../components/ui.jsx';

/** Encode a Unicode string as Base64 (UTF-8 safe, unlike a bare btoa). */
function encode(text, urlSafe) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  let out = btoa(bin);
  if (urlSafe) out = out.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return out;
}

/** Decode Base64 or Base64URL (with or without padding) to a UTF-8 string. */
function decode(b64) {
  let s = b64.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export default function Base64Tool() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);

  const result = useMemo(() => {
    if (!input) return { output: '' };
    try {
      return { output: mode === 'encode' ? encode(input, urlSafe) : decode(input) };
    } catch {
      return {
        output: '',
        error:
          mode === 'decode'
            ? 'Input is not valid Base64 (or does not decode to UTF-8 text).'
            : 'Could not encode this input.',
      };
    }
  }, [input, mode, urlSafe]);

  // Move the output into the input and flip the direction.
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
        {mode === 'encode' && (
          <Toggle
            checked={urlSafe}
            onChange={setUrlSafe}
            label="URL-safe"
            title="Use - and _ instead of + and /, and drop = padding"
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

      {result.error && <ErrorBanner title="Conversion failed">{result.error}</ErrorBanner>}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={mode === 'encode' ? 'Plain text' : 'Base64 input'}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder={mode === 'encode' ? 'Type or paste text to encode…' : 'Paste Base64 to decode…'}
            aria-label="Input"
            className="field h-72 resize-y"
          />
          <p className="mt-2 text-xs text-slate-500">{input.length.toLocaleString()} characters</p>
        </Panel>

        <Panel title={mode === 'encode' ? 'Base64 output' : 'Decoded text'} actions={<CopyButton text={result.output} />}>
          <textarea
            value={result.output}
            readOnly
            aria-label="Output"
            placeholder="Result appears here"
            className="field h-72 resize-y"
          />
          <p className="mt-2 text-xs text-slate-500">{result.output.length.toLocaleString()} characters</p>
        </Panel>
      </div>
    </div>
  );
}
