import { useCallback, useState } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * Shared UI primitives used by every tool so they look and behave consistently.
 */

/** Copy text to the clipboard (with a legacy fallback for non-secure contexts). */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

export function CopyButton({ text, label = 'Copy', disabled = false }) {
  const [copied, setCopied] = useState(false);

  const onClick = useCallback(async () => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <button type="button" className="btn-secondary" onClick={onClick} disabled={disabled || !text}>
      {copied ? <Check size={14} className="text-accent-400" /> : <Copy size={14} />}
      {copied ? 'Copied' : label}
    </button>
  );
}

/** Titled panel with an optional actions area in the header. */
export function Panel({ title, actions, children, className = '' }) {
  return (
    <section className={`panel flex min-w-0 flex-col ${className}`}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-600 px-4 py-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
      <div className="flex-1 p-4">{children}</div>
    </section>
  );
}

export function ErrorBanner({ title = 'Error', children }) {
  return (
    <div role="alert" className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm">
      <p className="font-semibold text-rose-300">{title}</p>
      <div className="mt-1 font-mono text-xs text-rose-200/90">{children}</div>
    </div>
  );
}

export function SuccessBanner({ children }) {
  return (
    <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
      {children}
    </div>
  );
}

/** Pill-style checkbox toggle. */
export function Toggle({ checked, onChange, label, title }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      title={title}
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition ${
        checked
          ? 'border-accent-500 bg-accent-500/15 text-accent-400'
          : 'border-ink-500 bg-ink-700 text-slate-400 hover:text-slate-200'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${checked ? 'bg-accent-400' : 'bg-ink-400'}`} />
      {label}
    </button>
  );
}

/** Segmented control: options = [{ value, label }] */
export function Segmented({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-lg border border-ink-500 bg-ink-700 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1 text-sm font-medium transition ${
            value === o.value ? 'bg-accent-500 text-ink-950' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}
