# STILL

A responsive companion-chat interface study, with quiet and immersive reading modes, two fictional characters, session-only message collections, and optional ambient sound.

This is an independent interface demo using preset responses. It is not a live chat service or a client case study. No messages leave the browser.

Run: `npm install`, `npm run build`, `npm test`.

Public demo: https://still.prayert.cn/

React, TypeScript, Vite. Icons by Lucide (ISC license).

Chinese: https://still.prayert.cn/ · English: https://still.prayert.cn/en/

Both language routes are prerendered. Changing language starts a new demo session.
The scene uses media-specific WebP files: 22 KB on phones, 60 KB on desktop,
with a separate 1.5 KB avatar. Original artwork is retained in the source;
full PNG files are excluded from the Vercel deployment.

Production is hosted on Vercel under the owner's `still-chat` project and custom
domain. Images cache for one day; fingerprinted CSS/JS cache for one year.
To deploy after building and testing:

```sh
node scripts/prepare-vercel.mjs
cd deploy-vercel
vercel deploy --prod --yes --scope prayerts-projects
```

`vercel.static.json` is the tracked static hosting configuration. The ignored
staging folder retains the local Vercel project linkage. `docs/` is the legacy
GitHub Pages build, not the active custom-domain deployment.
