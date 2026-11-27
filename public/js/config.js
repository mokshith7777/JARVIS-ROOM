const FALLBACK_CONFIG = {
  "app": {
    "name": "JARVIS ROOM",
    "version": "2.0.0",
    "architecture": "static-es-modules"
  },
  "introVideo": {
    "src": "./assets/intro.mp4",
    "preload": "auto",
    "durationSeconds": 8
  },
  "payment": {
    "upiId": "9391050634@ibl",
    "originalPriceDisplay": "₹49",
    "priceDisplay": "₹19",
    "jarvisProApkUrl": "https://github.com/mokshith7777/Jarvis-android-/releases/latest",
    "timeJApkUrl": "https://github.com/mokshith7777/Jarvis-android-/releases",
    "utrVerificationMode": "client-format-only"
  },
  "screens": [
    {
      "tag": "MAIN MONITOR · 01",
      "title": "3D Portfolio",
      "url": "https://mokshith7777.github.io/portfolio-3d/",
      "displayUrl": "mokshith7777.github.io/portfolio-3d",
      "cta": "Open 3D Portfolio ↗",
      "embed": true,
      "body": "Interactive 3D portfolio hosted on GitHub Pages."
    },
    {
      "tag": "SIDE TABLET · 02",
      "title": "JARVIS AI Portfolio",
      "url": "https://mokshith7777.github.io/jarvis-ai-portfolio/",
      "displayUrl": "mokshith7777.github.io/jarvis-ai-portfolio",
      "cta": "Open JARVIS AI Portfolio ↗",
      "embed": true,
      "body": "JARVIS AI showcase and interactive project portfolio."
    },
    {
      "tag": "LAPTOP · 03",
      "title": "@mokxith_jarvis · Instagram",
      "url": "https://www.instagram.com/mokxith_jarvis?bqrl=MTF3bWFycmprOWlobA==",
      "displayUrl": "instagram.com/mokxith_jarvis",
      "cta": "Open Instagram Profile ↗",
      "embed": false,
      "isIg": true,
      "body": "Follow @mokxith_jarvis on Instagram for JARVIS builds, 3D room updates, and studio previews."
    }
  ],
  "performance": {
    "maxDprMobile": 1.25,
    "maxDprDesktop": 1.75,
    "targetFps": 60
  }
};

export async function loadStudioConfig() {
  try {
    const response = await fetch(new URL('../config/studio.json', import.meta.url), { cache: 'no-cache' });
    if (!response.ok) throw new Error('Studio configuration request failed: ' + response.status);
    const config = await response.json();
    if (!config.payment || !config.screens || !config.introVideo || !config.performance) {
      throw new Error('Studio configuration is incomplete.');
    }
    return config;
  } catch (error) {
    console.warn('[JARVIS] Using built-in studio configuration fallback.', error);
    return FALLBACK_CONFIG;
  }
}
