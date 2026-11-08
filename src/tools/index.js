import { Braces, KeyRound, Binary, Regex, Link2 } from 'lucide-react';
import { lazy } from 'react';

/**
 * Tool registry.
 *
 * To add a new tool:
 *   1. Create `src/tools/MyTool.jsx` with a default-exported component.
 *   2. Add an entry below. The sidebar, search and routing pick it up automatically.
 *
 * Components are lazy-loaded so each tool is its own chunk and the first paint stays small.
 */
export const tools = [
  {
    id: 'json',
    name: 'JSON Formatter',
    description: 'Beautify, minify and validate JSON with precise error locations.',
    keywords: ['json', 'format', 'beautify', 'minify', 'validate', 'pretty', 'lint', 'parse'],
    icon: Braces,
    component: lazy(() => import('./JsonFormatter.jsx')),
  },
  {
    id: 'jwt',
    name: 'JWT Decoder',
    description: 'Decode header, payload and signature, and check token expiration.',
    keywords: ['jwt', 'token', 'jws', 'auth', 'bearer', 'decode', 'exp', 'claims', 'oauth'],
    icon: KeyRound,
    component: lazy(() => import('./JwtDecoder.jsx')),
  },
  {
    id: 'base64',
    name: 'Base64 Encoder / Decoder',
    description: 'Convert text to and from Base64, with URL-safe and UTF-8 support.',
    keywords: ['base64', 'encode', 'decode', 'b64', 'binary', 'text', 'utf-8', 'atob', 'btoa'],
    icon: Binary,
    component: lazy(() => import('./Base64Tool.jsx')),
  },
  {
    id: 'regex',
    name: 'RegEx Tester',
    description: 'Test regular expressions live with flag toggles and match highlighting.',
    keywords: ['regex', 'regexp', 'regular expression', 'match', 'pattern', 'test', 'flags', 'groups'],
    icon: Regex,
    component: lazy(() => import('./RegexTester.jsx')),
  },
  {
    id: 'url',
    name: 'URL Encoder / Decoder',
    description: 'Percent-encode and decode URL components, and inspect query parameters.',
    keywords: ['url', 'uri', 'encode', 'decode', 'percent', 'escape', 'query', 'params', 'sanitize'],
    icon: Link2,
    component: lazy(() => import('./UrlTool.jsx')),
  },
];

/** Case-insensitive match against name, description and keywords. */
export function filterTools(query) {
  const q = query.trim().toLowerCase();
  if (!q) return tools;
  const terms = q.split(/\s+/);
  return tools.filter((t) => {
    const haystack = [t.name, t.description, ...t.keywords].join(' ').toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
