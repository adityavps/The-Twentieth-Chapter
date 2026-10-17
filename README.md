# Version 12 — Consistent Spotify player

1. Replace `index.html` and `script.js` in the root of your existing GitHub Pages repository.
2. Keep `styles.css` and the complete `assets/` directory unchanged.
3. Commit the changes and wait for GitHub Pages to deploy.
4. On phones, close the old site tab and reopen the site so the new `script.js?v=12-visible-embed` is loaded.

The Spotify embed is initialised only once the music chapter is visible, and controller dimensions are measured in pixels. If the iFrame API is unavailable in a browser, the standard iframe fallback is created while the chapter is visible to avoid zero-width sizing.
