THE TWENTIETH CHAPTER — v11 MOBILE SPOTIFY FIX

This patch fixes the mobile-only Spotify embed loader that can remain on “Opening your playlist…” indefinitely.

FILES TO REPLACE IN YOUR EXISTING GITHUB REPOSITORY ROOT
- index.html
- script.js

Do not replace styles.css or the assets/ folder for this fix. The index.html update adds a cache-busting query (`script.js?v=11-mobile-fix`) so a mobile browser is less likely to keep an old script after GitHub Pages deploys.

WHAT CHANGED
- A fail-safe timer starts before Spotify's iFrame API script is loaded.
- The timer triggers the ordinary Spotify playlist iframe after 7.5 seconds if the API/controller does not fully initialize or its playback event listeners cannot be registered.
- The fallback also handles a half-created controller and ignores any late callback after the fallback is installed.
- When the API initializes correctly, its play/pause event syncing continues to control the background song. If the browser cannot support that API path, the standard iframe is shown instead of an endless loader, and background audio remains paused while the playlist chapter is open to avoid overlapping tracks.

HOW TO APPLY
1. Extract this ZIP.
2. In the existing GitHub repository, upload and replace `index.html` and `script.js` in the repository root.
3. Commit the changes and wait for GitHub Pages to deploy.
4. On the phone, reload the site. If the old page is still displayed, close its tab and open the site again.

All photos, audio, quiz logic, page navigation, gift reveal, and styles remain unchanged.
