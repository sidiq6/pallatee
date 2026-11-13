# CLASSVERSE — PALLET XII-P4

Premium interactive class website built with HTML5, CSS3, and Vanilla JavaScript.

## Run locally

1. Extract the project folder.
2. Open `CLASSVERSE-PALLET-XII-P4` in Visual Studio Code.
3. Install the **Live Server** extension if it is not already installed.
4. Right-click `index.html` and choose **Open with Live Server**.
5. The gallery JSON is loaded with `fetch()`, so use a local web server rather than opening the file directly with `file://`.

## Included features

- Cinematic loading screen with real critical-image loading progress.
- Clickable Instagram and TikTok links on the loading screen and contact section.
- Responsive navigation and scroll reveal.
- Photo gallery with category filters and accessible lightbox.
- Six university logo cards: Harvard, Oxford, UGM, UI, SNU, and ITB.
- Playable Tetris with keyboard and touch controls.
- Best score stored locally in the browser.
- Responsive layout for desktop, tablet, and mobile.

## Audio player

The original MP3 supplied with the project is included at `assets/audio/class-track.mp3` and declared as `audio/mpeg`. Tap the floating **MUSIC** control once to open the player and start playback. The panel also includes play/pause, seek, elapsed/duration display, volume, and mute. Playback is initiated by the visitor's tap; the website does not force autoplay on page load. Before publishing the site publicly, confirm that you have permission to use and distribute the audio.
## Character artwork status

Seven character illustrations were present in the source ZIP. They appear to be third-party/game character artwork. They are not included in the public-facing site until usage rights are confirmed. The site uses no unlicensed character art.

## Asset source mapping

- `assets/images/brand/class-logo.webp` — `memory/Logo/logo kelas/logo kelas.jpg`
- `assets/images/brand/school-logo.webp` — `memory/Logo/logo sekolah/logo sekolahan.jpg`
- `assets/images/hero-class.webp` — `memory/Foto/foto bersama/motion_photo_8395641717964216356.jpg`
- `assets/images/albums/together/` — 14 images from `memory/Foto/foto bersama/`
- `assets/images/albums/core/` — 17 images from `memory/Foto/foto core/`
- `assets/images/albums/bali/` — 4 images from `memory/Foto/Foto Bali/`
- `assets/images/albums/class-portrait-poster.webp` — `memory/Foto/fotoijazah.jpg`
- `assets/images/universities/` — six target university logos from `memory/Logo/university/`

The Stanford logo was intentionally excluded because it is not one of the six requested universities. Yonsei was not present in the ZIP and has not been fabricated.

## Controls — Tetris

- Left / Right arrows: move piece.
- Up arrow: rotate.
- Down arrow: soft drop.
- Space: hard drop.
- P: pause/resume.
- Touch buttons are available on small screens.

## Project notes

- No member names, biographies, class statistics, achievements, organization chart, or event dates were invented.
- The portrait collage is displayed as one image, not split into individual student profiles.
- University cards are aspirational content and do not imply official affiliation.
- The Google Maps link is a search link based on the school name; no street address or coordinates were invented.

## Audit document

See `docs/ASSET-AUDIT.md` for the source ZIP inventory and asset decisions.
