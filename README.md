# JARVIS ROOM

Modular, static-first 3D studio deployed to Firebase Hosting.

## Architecture

- `public/index.html`: lightweight semantic shell and module entry point.
- `public/styles/studio.css`: studio HUD, glass cards, layout and responsive styling.
- `public/js/`: ES modules for configuration, room stations, spatial audio, voice, checkout and GPU effects.
- `public/shaders/`: WebGL GLSL shaders for Arc Reactor plasma rings and cyan portal transitions.
- `public/config/studio.json`: editable UPI display, pricing, APK links, desk screens, intro media path and performance settings.
- `public/assets/intro.mp4`: generated from the source chunks during validation/deployment so Firebase serves a real MP4 file.
- `source-assets/`: original intro video stored as ordered base64 source chunks, outside the deployed public directory.
- `scripts/validate-studio.mjs`: assembles the MP4 and validates paths, configuration, Firebase Hosting and media.

## Validate

No bundler or build step is required. Run from the repository root with Node.js 22:

```sh
node scripts/validate-studio.mjs
for file in public/js/*.js; do node --check --input-type=module < "$file"; done
```

Serve the site over HTTP or use the Firebase Hosting emulator. Do not open the HTML as `file://`.

## Firebase Hosting

- Project: `jarvis-studio-f0423`
- Hosting target: `jarvis-room`
- Site: `jarvis-studio-mokshith`
- Public directory: `public/`
- Live URL: https://jarvis-studio-mokshith.web.app/

Pull requests and feature branches run validation without publishing to the live channel. Pushes to `main` validate the project, assemble the external intro MP4, and deploy the `public/` directory. The deploy workflow uses the existing GitHub secret `FIREBASE_SERVICE_ACCOUNT_JARVIS_STUDIO_F0423`. Keep its JSON value in GitHub Secrets only.

## Checkout limitation

The displayed UPI ID and prices are configuration values. The UTR field checks only that the input contains 12 digits; it does **not** verify a bank transaction. The UI states this explicitly. A real paid-download gate requires server-side payment verification. GitHub release URLs are public unless access is separately controlled.
