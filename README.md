THE TWENTIETH CHAPTER — GITHUB PAGES PACKAGE
================================================

This is a complete static website intended for GitHub Pages. It requires no build step and no server. All page navigation, swipe gestures, 3D page-turn effects, avatar medallion reveal, single-tap peephole-to-photo reveal, quiz flow, countdown and gift-card flip run in the browser.

QUICK START
1. Create a GitHub repository (public is easiest for GitHub Pages).
2. Extract the ZIP on your computer, open the inner `The_Twentieth_Chapter` folder, and upload its contents (including `index.html`, `styles.css`, `script.js`, `.nojekyll`, and `assets/`) to the repository root. Do not upload the ZIP itself or leave these files inside an extra `The_Twentieth_Chapter/` directory in the repository.
3. In the repository, open Settings → Pages.
4. Choose deployment from the `main` branch and `/ (root)`, then Save.
5. Wait for GitHub Pages to publish, then open the URL shown in Settings → Pages.

AUTHENTIC PERSONAL ASSETS ALREADY INSTALLED
- assets/avatar/her-avatar.png — the original avatar is shown immediately on the cover; tap it to flip the medallion
- assets/photos/handwritten-letter.jpg — the complete letter image, displayed without cropping
- assets/photos/childhood-one.jpg — first childhood photo, revealed after the door knock
- assets/photos/childhood-two.jpg — second childhood photo, shown next
- assets/photos/adult-one.jpg and assets/photos/adult-two.jpg — displayed together in a two-photo collage
- assets/audio/birthday-voice-note.mp3 — converted from the supplied M4A recording for browser compatibility

ALL REQUESTED PERSONAL ASSETS ARE INCLUDED
- assets/music/background-song.mp3 — the supplied background song, converted to a browser-compatible MP3
- assets/gift/gift-qr.png — the supplied QR image
No additional photos, audio files, or QR image need to be added for the current build.

The quiz reveals its intended answer after every selection and the final collage distinguishes the visitor’s choices from the intended answers. The intended answers for all 15 questions have now been supplied and confirmed by the site owner; the correct option positions, envelope reveals, answer collage, and generated passcode share the same answer key. The website does not invent or synthesize personal photographs. The uploaded avatar, letter, two childhood photos, two recent photos, and voice note have been installed. The original avatar artwork is visually unchanged; its PNG was re-saved only to correct a metadata CRC issue so browsers can load it. Tapping the avatar medallion flips it in 3D. The recent photos are displayed together, and all photos use contain-style sizing so the full image remains visible.

PLAYLIST
The real shared YouTube Music playlist URL is linked in the music section:
https://music.youtube.com/playlist?list=PLJmUYonVm99c&drli=1
The page embeds the playlist using YouTube’s alternate supported playlist-query form (`/embed/?listType=playlist&list=...`) and a standard browser referrer policy, while keeping the direct YouTube Music link visible as a fallback. The playlist can remain unlisted: YouTube says unlisted playlists can be shared by link. If the embedded player still reports that a video is unavailable, the issue is likely a track or YouTube-side embed limitation. Check that the playlist is not private and that individual tracks are not private, age-restricted, or blocked from embedding. Making the playlist public does not override per-track restrictions.

BACKGROUND AUDIO LIMITATION
Browsers generally block autoplay with sound before a visitor interacts. The background song starts on the first tap anywhere on the cover, with a button fallback. If it was playing when the visitor enters the music/playlist chapter, it pauses without resetting its playhead and resumes from the same point when the visitor leaves. The background song also pauses while the voice note plays, and resumes from the saved position when the voice note is paused or finishes. If the visitor had manually paused the background song beforehand, it stays paused. Browsers require a user gesture before audio can start.

GIFT COUNTDOWN / QR
The scheduled reveal is 18 October 2026 at 8:45 p.m. IST (UTC+05:30). The gift box flips to its QR face when that time passes, or earlier when the 15-letter quiz answer key is entered. The passcode is generated from each question’s intended answer position (`a` for option 1, `b` for option 2, `c` for option 3, `d` for option 4), rather than from the visitor’s own selections. The QR image is installed at `assets/gift/gift-qr.png`. The timer works while the page is open and also reveals immediately if the site is opened after the scheduled time; it cannot run in a closed browser or wake a recipient's device. Both the countdown and password are client-side presentation logic, not secure access control: anyone technically able to inspect the public source can read the passcode. Swipe left/right on a page to turn it; use the bottom arrows as a fallback. The flip animation is a CSS approximation of a physical page turn.

PRIVACY / PHOTOS
This site is static and does not send quiz answers to a server. Anything uploaded to a public GitHub Pages repository and the published website should be treated as public. If you do not want the actual photos or gift URL publicly visible, use a hosting arrangement with appropriate access control rather than public static hosting.

DESIGN REFERENCES
`assets/references/` preserves the nine reference images in the original order and includes several supplementary aesthetic references. They are reference material, not necessarily the actual photographs/voice recording. Do not use mockups or blurred sample portraits as the real personal photos.
