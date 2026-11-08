/**
 * Read-only, syntax-highlighted JSON viewer.
 * Builds React elements (no dangerouslySetInnerHTML) so untrusted input can never inject markup.
 */

// Tokens: strings (optionally followed by ":" => object key), booleans, null, numbers.
const TOKEN =
  /("(?:\\.|[^\\"])*")(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;

// Skip highlighting for very large payloads to keep the UI responsive.
const HIGHLIGHT_LIMIT = 200_000;

function highlight(text) {
  const out = [];
  let last = 0;
  let key = 0;

  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) out.push(text.slice(last, m.index));

    if (m[1]) {
      const isKey = Boolean(m[2]);
      out.push(
        <span key={key++} className={isKey ? 'text-sky-300' : 'text-emerald-300'}>
          {m[1]}
        </span>
      );
      if (isKey) out.push(m[2]);
    } else if (m[3]) {
      out.push(
        <span key={key++} className="text-amber-300">
          {m[0]}
        </span>
      );
    } else if (m[0] === 'null') {
      out.push(
        <span key={key++} className="text-rose-300">
          {m[0]}
        </span>
      );
    } else {
      out.push(
        <span key={key++} className="text-violet-300">
          {m[0]}
        </span>
      );
    }
    last = m.index + m[0].length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function JsonView({ text, className = '' }) {
  return (
    <pre
      className={`overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-slate-300 ${className}`}
    >
      {text.length > HIGHLIGHT_LIMIT ? text : highlight(text)}
    </pre>
  );
}
