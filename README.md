# Zaluea 3.0
Fast, free & stealthy Ultraviolet web proxy. cherri-style dark-rose UI with themes.

## Run it
```sh
npm install
npm start
```
Then open http://localhost:8080 (hard-refresh with Ctrl+Shift+R if you see the old look — assets are versioned `?v=3`).

## School Chromebook use (no Node? no problem)
The `Site/` folder is a fully static app. Upload it to any free static host
(GitHub Pages, Netlify Drop, Cloudflare Pages, Vercel) over HTTPS and it
auto-rotates through free public bare backends — no `npm start` needed.
If the school filter blocks shared hosting domains ("domain" errors), use
`⧉ Blank` (about:blank hides the URL entirely) + `🕶 Cloak`, or paste any
working bare URL in ⚙ Settings → Proxy backend → Use custom.

## What changed
- New modern glass UI (home + games)
- Real free proxy backend: `bare-server-node v2` at `/bare/` (+ stealth alias `/api/`), public fallback if self-host is unreachable
- Undetectable features: tab cloak presets (Classroom/Docs/Drive/Khan/Clever), panic key `]` → instant Classroom, `about:blank` launcher, stealth viewer that keeps `/service/` URLs out of the address bar, `noindex/nofollow` + `no-referrer`
- Fixed old bugs: broken `node-static` server, mismatched `iconSet/icoSet`, crashing `localStorage` title load, wrong favicon path

## Stealth tips
- Click **⧉ Blank** before sharing your screen — URL bar stays empty.
- Click **🕶 Cloak** or press **]** if a teacher walks by.
- Keep **Stealth viewer** ON in ⚙ Settings so proxy URLs never show in the address bar.

## Credits
Zaluea uses [Ultraviolet](https://github.com/titaniumnetwork-dev/Ultraviolet)
