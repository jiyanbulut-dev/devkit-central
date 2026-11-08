import { useEffect, useMemo, useState } from 'react';
import { Clock, Eraser, FileKey } from 'lucide-react';
import JsonView from '../components/JsonView.jsx';
import { CopyButton, ErrorBanner, Panel } from '../components/ui.jsx';

// Example token (HS256, signature is not meaningful). exp is far in the future.
const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImFkbWluIjp0cnVlLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6NDEwMjQ0NDgwMH0.' +
  'c2lnbmF0dXJlLW5vdC12ZXJpZmllZA';

/** Decode a base64url segment to a UTF-8 string. Throws on invalid input. */
function decodeSegment(segment) {
  let b64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

function decodeJson(segment, label) {
  try {
    const parsed = JSON.parse(decodeSegment(segment));
    return parsed;
  } catch {
    throw new Error(`The ${label} is not valid base64url-encoded JSON.`);
  }
}

function decodeJwt(raw) {
  const token = raw.trim().replace(/^bearer\s+/i, '');
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error(`A JWT has 3 dot-separated parts (header.payload.signature); found ${parts.length}.`);
  }
  return {
    header: decodeJson(parts[0], 'header'),
    payload: decodeJson(parts[1], 'payload'),
    signature: parts[2],
    parts,
  };
}

/** "in 3 hours", "2 days ago" … */
function relative(seconds) {
  const abs = Math.abs(seconds);
  const units = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];
  for (const [name, size] of units) {
    if (abs >= size || name === 'second') {
      const n = Math.floor(abs / size);
      const label = `${n} ${name}${n === 1 ? '' : 's'}`;
      return seconds >= 0 ? `in ${label}` : `${label} ago`;
    }
  }
}

function formatTime(ts) {
  const d = new Date(ts * 1000);
  if (Number.isNaN(d.getTime())) return 'Invalid date';
  return `${d.toISOString().replace('.000Z', 'Z')}  ·  local: ${d.toLocaleString()}`;
}

const CLAIM_LABELS = {
  iss: 'Issuer',
  sub: 'Subject',
  aud: 'Audience',
  jti: 'JWT ID',
};

function ExpirationStatus({ payload, now }) {
  const { exp, nbf } = payload;
  const hasExp = typeof exp === 'number';
  const notYet = typeof nbf === 'number' && nbf > now;

  let tone = 'border-ink-500 bg-ink-700 text-slate-300';
  let text = 'No "exp" claim: this token never expires.';

  if (notYet) {
    tone = 'border-amber-500/40 bg-amber-500/10 text-amber-300';
    text = `Not valid yet. Becomes valid ${relative(nbf - now)}.`;
  } else if (hasExp) {
    const expired = exp <= now;
    tone = expired
      ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
      : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
    text = expired ? `Expired ${relative(exp - now)}.` : `Valid. Expires ${relative(exp - now)}.`;
  }

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium ${tone}`} role="status">
      <Clock size={16} />
      {text}
    </div>
  );
}

export default function JwtDecoder() {
  const [token, setToken] = useState('');
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  // Tick every second so the expiration countdown stays accurate.
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const decoded = useMemo(() => {
    if (!token.trim()) return null;
    try {
      return { ok: true, ...decodeJwt(token) };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [token]);

  const timeClaims = decoded?.ok
    ? [
        ['exp', 'Expires at'],
        ['iat', 'Issued at'],
        ['nbf', 'Not before'],
      ].filter(([k]) => typeof decoded.payload[k] === 'number')
    : [];

  const otherClaims = decoded?.ok ? Object.keys(CLAIM_LABELS).filter((k) => k in decoded.payload) : [];

  return (
    <div className="space-y-4">
      <Panel
        title="Encoded token"
        actions={
          <>
            <button type="button" className="btn-ghost" onClick={() => setToken(SAMPLE)}>
              <FileKey size={14} /> Sample
            </button>
            <button type="button" className="btn-ghost" onClick={() => setToken('')} disabled={!token}>
              <Eraser size={14} /> Clear
            </button>
          </>
        }
      >
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          spellCheck={false}
          placeholder="Paste a JWT here (eyJhbGciOi…)"
          aria-label="JWT input"
          className="field h-32 resize-y break-all"
        />
        {decoded?.ok && (
          <p className="mt-3 break-all font-mono text-xs leading-relaxed">
            <span className="text-rose-300">{decoded.parts[0]}</span>
            <span className="text-slate-500">.</span>
            <span className="text-violet-300">{decoded.parts[1]}</span>
            <span className="text-slate-500">.</span>
            <span className="text-sky-300">{decoded.parts[2]}</span>
          </p>
        )}
      </Panel>

      {decoded?.ok === false && <ErrorBanner title="Could not decode token">{decoded.error}</ErrorBanner>}

      {decoded?.ok && (
        <>
          <ExpirationStatus payload={decoded.payload} now={now} />

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel
              title={<span className="text-rose-300">Header</span>}
              actions={<CopyButton text={JSON.stringify(decoded.header, null, 2)} />}
            >
              <JsonView text={JSON.stringify(decoded.header, null, 2)} />
            </Panel>

            <Panel
              title={<span className="text-violet-300">Payload</span>}
              actions={<CopyButton text={JSON.stringify(decoded.payload, null, 2)} />}
            >
              <JsonView text={JSON.stringify(decoded.payload, null, 2)} />
            </Panel>
          </div>

          {(timeClaims.length > 0 || otherClaims.length > 0) && (
            <Panel title="Registered claims">
              <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[auto_1fr]">
                {timeClaims.map(([key, label]) => (
                  <div key={key} className="contents">
                    <dt className="text-slate-400">
                      {label} <span className="font-mono text-xs text-slate-500">({key})</span>
                    </dt>
                    <dd className="break-all font-mono text-xs text-slate-200">
                      {formatTime(decoded.payload[key])}
                      <span className="ml-2 text-slate-500">{relative(decoded.payload[key] - now)}</span>
                    </dd>
                  </div>
                ))}
                {otherClaims.map((key) => (
                  <div key={key} className="contents">
                    <dt className="text-slate-400">
                      {CLAIM_LABELS[key]} <span className="font-mono text-xs text-slate-500">({key})</span>
                    </dt>
                    <dd className="break-all font-mono text-xs text-slate-200">
                      {typeof decoded.payload[key] === 'string'
                        ? decoded.payload[key]
                        : JSON.stringify(decoded.payload[key])}
                    </dd>
                  </div>
                ))}
              </dl>
            </Panel>
          )}

          <Panel
            title={<span className="text-sky-300">Signature</span>}
            actions={<CopyButton text={decoded.signature} />}
          >
            <p className="mb-2 text-sm text-slate-400">
              Algorithm: <span className="font-mono text-slate-200">{decoded.header.alg ?? 'unknown'}</span>
              {decoded.header.alg === 'none' && (
                <span className="ml-2 text-amber-300">Unsecured token: no signature present.</span>
              )}
            </p>
            <p className="break-all rounded-lg border border-ink-500 bg-ink-900 p-3 font-mono text-xs text-sky-300">
              {decoded.signature || '(empty)'}
            </p>
            <p className="mt-3 text-xs text-slate-500">
              The signature is shown but not verified. Verifying it requires your secret or public key, and this tool
              never asks for one. Never trust a token's contents until your server has verified it.
            </p>
          </Panel>
        </>
      )}
    </div>
  );
}
