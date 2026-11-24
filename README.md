# JARVIS ROOM

Source code for the JARVIS ROOM interactive 3D studio, deployed to Firebase Hosting.

## Automatic deployment

Every push to the `main` branch triggers GitHub Actions and deploys the contents of `public/` to the existing Firebase Hosting site:

- Firebase project: `jarvis-studio-f0423`
- Hosting site: `jarvis-studio-mokshith`
- Live website: https://jarvis-studio-mokshith.web.app/

### Required GitHub secret

In **Settings → Secrets and variables → Actions**, create this repository secret:

`FIREBASE_SERVICE_ACCOUNT_JARVIS_STUDIO_F0423`

Its value must be the Firebase service-account JSON for project `jarvis-studio-f0423`. Keep it private; do not commit it to the repository or share it in chat.

### Deploy

1. Add the website's `index.html` to `public/index.html`.
2. Push or commit changes to `main`.
3. Open the **Actions** tab and check the **Deploy to Firebase Hosting** workflow.
4. When the workflow succeeds, the live Firebase site will contain the new version.

This is a static website, so no npm build step is required.
