# DevKit Central

An open-source, **privacy-first** hub of developer micro-tools. Everything runs 100% client-side in your browser: no backend, no analytics, no network requests with your data.

Built with **React (Vite)**, **Tailwind CSS** and **Lucide** icons.

## Tools

| Tool | What it does |
| --- | --- |
| JSON Formatter | Beautify / minify / validate, sort keys, error line + column with context |
| JWT Decoder | Decode header, payload and signature; live expiration (`exp`, `nbf`, `iat`) check |
| Base64 Encoder / Decoder | UTF-8 safe, URL-safe variant, one-click swap |
| RegEx Tester | Live matching, `g` `i` `m` (+ `s` `u`) flag toggles, highlights, capture groups |
| URL Encoder / Decoder | Component or full-URL mode, `+` as space, query parameter inspector |

## UX

- Dark theme, responsive sidebar (drawer on mobile) and navbar
- Search by name or functionality; press `/` or `Ctrl/Cmd + K` to focus it, `Enter` to open the top result
- Instant tool switching with no page reloads; each tool is deep-linkable (`/#/jwt`)
- Tools you've opened stay mounted, so switching away and back keeps your input (in memory only, nothing is persisted)
- Each tool is code-split and lazy-loaded

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build locally
```

Requires Node.js 18+.

## Project structure

```
devkit-central/
├── index.html
├── tailwind.config.js        # dark palette (ink / accent) + fonts
├── postcss.config.js
├── vite.config.js
├── vercel.json               # Vercel config + security headers
├── netlify.toml              # Netlify config + security headers
├── public/favicon.svg
└── src/
    ├── main.jsx
    ├── index.css             # Tailwind layers + shared .field / .btn / .panel classes
    ├── App.jsx               # layout, hash routing, search, keyboard shortcuts
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Sidebar.jsx
    │   ├── JsonView.jsx      # syntax-highlighted JSON (no dangerouslySetInnerHTML)
    │   └── ui.jsx            # CopyButton, Panel, Toggle, Segmented, banners
    └── tools/
        ├── index.js          # tool registry (add new tools here)
        ├── JsonFormatter.jsx
        ├── JwtDecoder.jsx
        ├── Base64Tool.jsx
        ├── RegexTester.jsx
        └── UrlTool.jsx
```

## Adding a tool

1. Create `src/tools/MyTool.jsx` with a default-exported React component.
2. Register it in `src/tools/index.js` (`id`, `name`, `description`, `keywords`, `icon`, lazy `component`).

The sidebar, search and routing pick it up automatically.

## Deploying

**Vercel:** import the repo. `vercel.json` already sets the framework, build command and output directory.

**Netlify:** import the repo. `netlify.toml` sets `npm run build` and publishes `dist/`.

Both configs add basic security headers (`nosniff`, `X-Frame-Options`, `no-referrer`, locked-down permissions policy). Because routing is hash-based, no server-side rewrites are required, though the SPA fallback is included anyway.

## Privacy

All processing uses browser APIs only (`JSON`, `atob` / `btoa`, `TextEncoder`, `RegExp`, `encodeURIComponent`). Nothing is sent anywhere, and nothing is written to `localStorage`, cookies or any other storage.

A note on the JWT tool: it decodes tokens but **does not verify signatures**. Never trust token contents until your server has verified the signature.

## License

MIT
