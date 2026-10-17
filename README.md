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

PLAYLIST AND AUDIO HANDOFF (CURRENT v10 BEHAVIOR)
The music chapter embeds the supplied Spotify playlist `6hsGNTF4cAAcn42sR1ZiTK` using Spotify’s documented iFrame API and provides a prominent “Open the full playlist in Spotify” link. The in-page player is 352px tall on phone-sized screens and 420px on larger screens so the playlist is more usable without being clipped. When the embedded Spotify player starts, the background song pauses and Spotify takes the foreground. When Spotify is paused or the visitor turns to another page, the background song resumes from the same playhead. The voice note gets the same foreground priority: background audio pauses for the note and resumes from the preserved position when the note pauses or ends. The player is paused when its chapter is left. If the visitor has deliberately switched background sound off, it stays off.

Browsers generally block sound autoplay before a visitor interacts, so the background song starts on the first tap on the cover and has a button fallback. When the documented Spotify API cannot initialize, the site falls back to the ordinary Spotify embed and pauses background sound for the whole playlist chapter because that fallback does not report play/pause state. Opening Spotify in its separate app or tab is outside the page’s playback control, so it cannot provide the same automatic pause/resume handoff. If a browser blocks automatic ambient resumption, tap Sound to continue from the saved position.

GIFT COUNTDOWN / QR
The scheduled reveal is 18 October 2026 at 8:45 p.m. IST (UTC+05:30). The gift box flips to its QR face when that time passes, or earlier when the 15-letter quiz answer key is entered. The passcode is generated from each question’s intended answer position (`a` for option 1, `b` for option 2, `c` for option 3, `d` for option 4), rather than from the visitor’s own selections. The QR image is installed at `assets/gift/gift-qr.png`. The timer works while the page is open and also reveals immediately if the site is opened after the scheduled time; it cannot run in a closed browser or wake a recipient's device. Both the countdown and password are client-side presentation logic, not secure access control: anyone technically able to inspect the public source can read the passcode. Swipe left/right on a page to turn it; use the bottom arrows as a fallback. The flip animation is a CSS approximation of a physical page turn.

PRIVACY / PHOTOS
This site is static and does not send quiz answers to a server. Anything uploaded to a public GitHub Pages repository and the published website should be treated as public. If you do not want the actual photos or gift URL publicly visible, use a hosting arrangement with appropriate access control rather than public static hosting.

DESIGN REFERENCES
`assets/references/` preserves the nine reference images in the original order and includes several supplementary aesthetic references. They are reference material, not necessarily the actual photographs/voice recording. Do not use mockups or blurred sample portraits as the real personal photos.


## Playlist update (v8)
The music chapter now embeds the supplied Spotify playlist `6hsGNTF4cAAcn42sR1ZiTK`; the direct Spotify playlist link remains as a fallback. The background song and voice-note behavior are unchanged.


## Playlist layout update (v9)
The Spotify player is now constrained to the playlist card and switches to a compact 152px player on phone-sized screens. The Spotify link is a prominent touch-friendly button, and extra bottom spacing keeps the fixed page-turn controls from obscuring the final note. Photos, quiz, voice note, gift reveal, and background audio behavior are unchanged.


## Spotify / audio coordination update (v10)
The playlist now uses Spotify's documented iFrame API so the page can respond to actual playback events. The mobile player has a larger 352px viewport (420px on larger screens), and the play/pause status coordinates with the background song. Ambient audio continues while Spotify is idle, pauses when Spotify starts, and resumes from the same HTMLAudioElement playhead when Spotify pauses or the visitor turns the page. The voice note receives the same foreground priority. The page pauses Spotify when leaving the music chapter.

Spotify's iFrame API exposes playback events when it initializes correctly. If the API cannot load, the site falls back to Spotify's ordinary embed; in that compatibility mode the background song is paused for the whole playlist chapter because the basic iframe does not report its play/pause state. Opening the playlist in the external Spotify app is outside the page's playback control, so audio handoff cannot be guaranteed across that external app. Browsers may still block automatic ambient resumption; if so, a tap on Sound resumes it at the preserved position.
