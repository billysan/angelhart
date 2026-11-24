# Sharon Angelhart portfolio shell

A dependency-free, multi-page portfolio prototype. Node.js 20+ is required.

- `npm run dev` builds and serves the site at http://localhost:5173.
- `npm run build` generates the static website in `dist/`.
- `npm test` checks generated routes, internal links, assets, and content slots.

## Editing

Film records, external media links, and contact slots live in `src/content.mjs`. Shared page templates live in `scripts/build.mjs`. Visual tokens and font declarations are at the top of `public/styles.css`.

Rebuild after changes, or restart the preview server. There is no live reload.

All four film pages retain trailer, stills, credits, recognition, and press sections. Replace explicitly labeled placeholders with approved assets. Unconfirmed social profiles appear as labeled icon placeholders on Contact until URLs are supplied. Film dates and runtime remain unconfirmed because sources differ. Script titles are intentionally not published.

## Image and content sources

Film stills, portrait, and on-set photography were imported from the user-provided Google Drive folder. Per-file sources are recorded in `public/assets/stills/sources.json`. These are self-hosted JPEG previews; the original TIFFs remain in Drive. Confirm required photo credits before launch.

Biography draft: https://kneller.co.il/sharon-engelhardt/?lang=en

Feature synopsis paraphrased from: https://ukjewishfilm.org/event/cuz-youre-ugly-qa/

Media records and English digests are in `src/content.mjs`. The Time Out entry summarizes Yael Shuv’s review; video entries are clearly labeled English overviews based on publisher descriptions. Full articles and transcripts are not reproduced. Each modal retains attribution and its original-source link.

## Before launch

Confirm film metadata, image credits, biography, translations, direct email, representation, and social profiles. This iteration is local; no site has been published.

Typography: self-hosted GoMono Nerd Font from https://github.com/ryanoasis/nerd-fonts/tree/master/patched-fonts/Go-Mono. License included in `public/assets/fonts/LICENSE.txt`.

The homepage presents the film portfolio, with a 1.5-second entrance. All pages use faint full-viewport stills with a static grain texture. Images crossfade over two seconds every eight seconds. A small pink pause button controls playback; reduced-motion mode starts paused. Internal links enhance ordinary static navigation with a 333ms content crossfade, keeping the background running; browser back/forward and reduced motion are supported. `/work/` remains a compatibility alias for the portfolio. Press cards open native dialogs, with original links as a no-JavaScript fallback. Social icons appear only on Contact. The footer contains centered copyright only.
