import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { loadStudioConfig } from './config.js';
import { createStations } from './rooms.js';
import { createAudioEngine } from './audio.js';
import { createVoiceGuide } from './voice.js';
import { initCheckout } from './checkout.js';
import { initPortalTransition } from './transitions.js';
import { attachArcReactorShader } from './arc-reactor.js';
const studioConfig = await loadStudioConfig();


(function () {
  'use strict';

  /* =========================================================
   * PHOTO FRAMES & WORKSTATION SCREENS CONFIGURATION
   * ========================================================= */
  var PHOTOS_CONFIG = {
    hallLeft: {
      title: 'MJOLNIR',
      imageUrl: "./assets/hall-left.jpg",
      fallback: ['#0B132B', '#38BDF8', '#1E3A8A']
    },
    hallRight: {
      title: 'ARC REACTOR · MARK 1',
      imageUrl: "./assets/hall-right.jpg",
      fallback: ['#050811', '#38BDF8', '#1E3A8A']
    },
    inspiration: {
      title: 'AMAZING SPIDER-MAN',
      imageUrl: 'https://rukmini1.flixcart.com/image/1500/1500/l05lx8w0/poster/3/g/1/medium-amazing-spiderman-movie-d-on-fine-art-paper-hd-quality-original-imagcycz8ejdgkaq.jpeg?q=70',
      backupUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRn5EluqDYORSEKjIR9GsPRm9W--lIcy2LQPtkWj9OHKtqKXg9EHVG2Gnew&s=10',
      fallback: ['#0B1528', '#D92626', '#1D4ED8']
    },
    craft: {
      title: 'IRON MAN · MARK 50',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzbYdT9wsYc-z3NxN8JNbMNTq9fc-5NwlKUNqAHB7-YED27GFlVy9GzZU&s=10',
      fallback: ['#1C0909', '#B91C1C', '#F59E0B']
    },
    memIron1: {
      title: 'IRON MAN · MARK 85',
      imageUrl: 'https://cdna.artstation.com/p/assets/images/images/040/909/316/large/maro-valls-ironman-portrait-v5-final-artstation.jpg?1630235238',
      backupUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaQTYZL7VAaRjOxK83avpEt-Bcx0MRYCU2wfX4QzK4GcsWed1d3-m_81H6&s=10',
      fallback: ['#24070B', '#DC2626', '#F59E0B']
    },
    memIron2: {
      title: 'IRON MAN · HELMET',
      imageUrl: 'https://c4.wallpaperflare.com/wallpaper/24/304/957/iron-man-marvel-cinematic-universe-wallpaper-preview.jpg',
      backupUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8n3WkTrfbbw5Yk83-na-ja5L7ctNH6iSMy-mrB5pteih9_3kgw4l4844&s=10',
      fallback: ['#18060A', '#B91C1C', '#FBBF24']
    },
    memIron3: {
      title: 'IRON MAN · MARK III',
      imageUrl: 'https://i.etsystatic.com/48229522/r/il/bb8b01/5659939967/il_fullxfull.5659939967_8iy7.jpg',
      backupUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3RQxM91a7j8N-2Tif2KdF5BMCZN8C1BBOTDgdJO88fprfogJqsicAkC0&s=10',
      fallback: ['#0C1926', '#E11D48', '#38BDF8']
    },
    memIron4: {
      title: 'IRON MAN · MARK 50',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzbYdT9wsYc-z3NxN8JNbMNTq9fc-5NwlKUNqAHB7-YED27GFlVy9GzZU&s=10',
      fallback: ['#1C0909', '#DC2626', '#F59E0B']
    }
  };

  var SPIDERMAN_WALLPAPER_URLS = [
    'https://cdn.theplaylist.net/wp-content/uploads/2012/07/15070731/hr_The_Amazing_Spider-Man_21-header.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHj_Fuxqq6kx73hMdyUvp497coxE9_YqCLzlCCt9ztDO8VSCACetKmeNI&s=10'
  ];

  var PAYMENT_CONFIG = studioConfig.payment;
  var SCREENS_CONFIG = studioConfig.screens;

  /* =========================================================
   * AUDIO SYNTHESIZER (Unlocked on Knock / Tap)
   * ========================================================= */
  var audioEngine = createAudioEngine();
  var audioCtx = null;
  function ensureAudio() { try { audioCtx = audioEngine.unlock(); } catch (e) {} }

  function playKnockSound() {
    ensureAudio();
    if (!audioCtx) return;
    [0, 0.16, 0.34].forEach(function (delay) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(132, audioCtx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(48, audioCtx.currentTime + delay + 0.085);
      gain.gain.setValueAtTime(0.34, audioCtx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 0.095);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + 0.1);
    });
  }

  function playSoftChime(freq) {
    ensureAudio();
    if (!audioCtx) return;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq || 520, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.075, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.19);
  }

  var studioToastTimer = null;
  function showStudioToast(msg) {
    var el = document.getElementById('studio-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(studioToastTimer);
    studioToastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  var ambientNodes = null;
  var isAmbientOn = false;
  function updateAmbientTone() {
    if (!ambientNodes || !audioCtx) return;
    var now = audioCtx.currentTime;
    ambientNodes.filter.frequency.setTargetAtTime(isNight ? 280 : 520, now, 0.6);
    ambientNodes.osc1.frequency.setTargetAtTime(isNight ? 98 : 110, now, 0.6);
    ambientNodes.osc2.frequency.setTargetAtTime(isNight ? 146.83 : 164.81, now, 0.6);
  }
  function toggleAmbientSound() {
    ensureAudio();
    if (!audioCtx) return;
    var btn = document.getElementById('ambient-btn');
    var icon = document.getElementById('ambient-icon');
    var now = audioCtx.currentTime;
    if (!isAmbientOn) {
      var master = audioCtx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.linearRampToValueAtTime(0.048, now + 1.1);

      var filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isNight ? 280 : 520, now);

      var osc1 = audioCtx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(isNight ? 98 : 110, now);

      var osc2 = audioCtx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(isNight ? 146.83 : 164.81, now);

      var lfo = audioCtx.createOscillator();
      var lfoGain = audioCtx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.14, now);
      lfoGain.gain.setValueAtTime(0.014, now);
      lfo.connect(lfoGain);
      lfoGain.connect(master.gain);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(master);
      master.connect(audioCtx.destination);
      osc1.start();
      osc2.start();
      lfo.start();

      ambientNodes = { osc1: osc1, osc2: osc2, lfo: lfo, filter: filter, master: master };
      isAmbientOn = true;
      btn.classList.add('active');
      icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>';
      showStudioToast(isNight ? 'Ambient audio on · Night mode' : 'Ambient audio on · Studio mode');
    } else {
      isAmbientOn = false;
      btn.classList.remove('active');
      icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';
      if (ambientNodes) {
        var nodes = ambientNodes;
        ambientNodes = null;
        try {
          nodes.master.gain.cancelScheduledValues(now);
          nodes.master.gain.setTargetAtTime(0.0001, now, 0.18);
          setTimeout(function () {
            try { nodes.osc1.stop(); nodes.osc2.stop(); nodes.lfo.stop(); } catch (e) {}
          }, 700);
        } catch (e) {}
      }
      showStudioToast('Ambient audio muted');
    }
  }

  function playShutterSound() {
    ensureAudio();
    if (!audioCtx) return;
    var now = audioCtx.currentTime;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  function captureStudioSnapshot() {
    if (!renderer || !scene || !camera) return;
    playShutterSound();
    var flash = document.getElementById('snap-flash');
    if (flash) {
      flash.classList.add('flash');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { flash.classList.remove('flash'); });
      });
    }
    renderer.render(scene, camera);
    try {
      var dataUrl = canvas.toDataURL('image/png');
      var a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'jarvis-room-snapshot.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showStudioToast('Studio snapshot saved');
    } catch (e) {
      showStudioToast('Snapshot ready');
    }
  }

  /* =========================================================
   * WEBGL RENDERER SETUP
   * ========================================================= */
  var portalEffects = initPortalTransition();
  var canvas = document.getElementById('world');
  var renderer = null;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false
    });
  } catch (err) {
    document.getElementById('preloader').classList.add('hidden');
    document.getElementById('webgl-error').classList.add('show');
    document.getElementById('retry-btn').addEventListener('click', function () { window.location.reload(); });
    return;
  }

  var mobileViewport = window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobileViewport ? studioConfig.performance.maxDprMobile : studioConfig.performance.maxDprDesktop));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputEncoding = THREE.sRGBEncoding;

  canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); });

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x16181E);

  var camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.08, 340);

  /* =========================================================
   * HIGH-DETAIL PROCEDURAL PBR TEXTURES
   * ========================================================= */
  function makePlankWoodTexture(baseR, baseG, baseB, repeats) {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    var ctx = c.getContext('2d');
    ctx.fillStyle = 'rgb(' + baseR + ',' + baseG + ',' + baseB + ')';
    ctx.fillRect(0, 0, 512, 512);
    var planks = 8;
    var ph = 512 / planks;
    for (var i = 0; i < planks; i++) {
      var delta = (i % 2 === 0 ? 7 : -6) + ((i * 11) % 10 - 5);
      ctx.fillStyle = 'rgb(' + Math.max(20, baseR + delta) + ',' + Math.max(15, baseG + delta) + ',' + Math.max(12, baseB + delta) + ')';
      ctx.fillRect(0, i * ph, 512, ph - 2);
      ctx.strokeStyle = 'rgba(35, 20, 8, 0.24)';
      ctx.lineWidth = 1.4;
      for (var g = 0; g < 8; g++) {
        ctx.beginPath();
        var gy = i * ph + (g + 0.5) * (ph / 8);
        ctx.moveTo(0, gy);
        ctx.bezierCurveTo(160, gy + 5, 350, gy - 5, 512, gy);
        ctx.stroke();
      }
      // Subtle end-joint seam
      var jointX = ((i * 173) % 420) + 40;
      ctx.fillStyle = 'rgba(30, 18, 10, 0.35)';
      ctx.fillRect(jointX, i * ph, 2, ph);
      ctx.fillRect(0, (i + 1) * ph - 2, 512, 2);
    }
    var tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeats || 5, repeats || 5);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makePlasterTexture(hexBase) {
    var c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    var ctx = c.getContext('2d');
    ctx.fillStyle = hexBase;
    ctx.fillRect(0, 0, 256, 256);
    var seed = 1337;
    function nextRand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    for (var i = 0; i < 1800; i++) {
      var x = Math.floor(nextRand() * 256);
      var y = Math.floor(nextRand() * 256);
      ctx.fillStyle = (i % 2 === 0) ? 'rgba(255,255,255,0.018)' : 'rgba(0,0,0,0.022)';
      ctx.fillRect(x, y, 2, 2);
    }
    var tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeRugTexture() {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#252934';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.24)';
    ctx.lineWidth = 6;
    ctx.strokeRect(22, 22, 468, 468);
    ctx.strokeStyle = 'rgba(232, 106, 51, 0.16)';
    ctx.lineWidth = 2;
    ctx.strokeRect(38, 38, 436, 436);
    for (var y = 0; y < 512; y += 6) {
      ctx.fillStyle = (y % 12 === 0) ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.04)';
      ctx.fillRect(0, y, 512, 2);
    }
    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeSignTexture(text) {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 128;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#1E1110';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#8A4532';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 504, 120);
    ctx.font = '700 52px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#FF5E3A';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FF8663';
    ctx.fillText(text, 256, 66);
    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makePosterTexture(cfg) {
    // Rich fallback poster immediately visible while/if remote image loads
    var c = document.createElement('canvas');
    c.width = 512; c.height = 680;
    var ctx = c.getContext('2d');
    var fb = cfg.fallback;
    var g = ctx.createLinearGradient(0, 0, 512, 680);
    g.addColorStop(0, fb[0]);
    g.addColorStop(1, '#090B10');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 680);

    // Stylized emblem backdrop
    ctx.fillStyle = fb[1];
    ctx.beginPath();
    ctx.arc(256, 290, 148, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = fb[2];
    ctx.beginPath();
    ctx.arc(256, 290, 82, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#F6F3EE';
    ctx.lineWidth = 6;
    ctx.strokeRect(28, 28, 456, 624);
    ctx.fillStyle = '#F6F3EE';
    ctx.font = '700 30px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(cfg.title, 256, 585);

    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;

    function loadUrl(url, nextUrl) {
      if (!url) return;
      var img = new Image();
      if (!url.startsWith('data:')) img.crossOrigin = 'anonymous';
      img.onload = function () {
        tex.image = img;
        tex.needsUpdate = true;
      };
      img.onerror = function () {
        if (nextUrl) loadUrl(nextUrl, null);
      };
      img.src = url;
    }
    loadUrl(cfg.imageUrl, cfg.backupUrl || null);
    return tex;
  }

  /* =========================================================
   * LIVE INDIAN STANDARD TIME (IST · Asia/Kolkata) DESK CLOCK
   * ========================================================= */
  var clockCanvas = document.createElement('canvas');
  clockCanvas.width = 320; clockCanvas.height = 120;
  var clockCtx = clockCanvas.getContext('2d');
  var clockTex = new THREE.CanvasTexture(clockCanvas);
  clockTex.encoding = THREE.sRGBEncoding;

  function updateISTClock() {
    var timeStr = '';
    try {
      timeStr = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).format(new Date()).toUpperCase();
    } catch (e) {
      var d = new Date();
      timeStr = d.toTimeString().slice(0, 8);
    }
    clockCtx.fillStyle = '#090B10';
    clockCtx.fillRect(0, 0, 320, 120);
    clockCtx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    clockCtx.lineWidth = 3;
    clockCtx.strokeRect(4, 4, 312, 112);

    clockCtx.font = '700 16px "Space Grotesk", sans-serif';
    clockCtx.textAlign = 'center';
    clockCtx.fillStyle = '#38BDF8';
    clockCtx.fillText('IST · INDIA', 160, 28);

    clockCtx.font = '700 40px "Space Grotesk", monospace';
    clockCtx.shadowColor = '#FF7A2F';
    clockCtx.shadowBlur = 12;
    clockCtx.fillStyle = '#FF9A52';
    clockCtx.fillText(timeStr, 160, 78);
    clockCtx.shadowBlur = 0;
    clockTex.needsUpdate = true;
  }
  updateISTClock();
  setInterval(updateISTClock, 1000);

  function makeMonitorTexture(tag, title, sub, accentHex) {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 288;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#0E1118';
    ctx.fillRect(0, 0, 512, 288);
    ctx.fillStyle = accentHex || '#38BDF8';
    ctx.fillRect(32, 30, 58, 4);
    ctx.font = '600 15px "Space Grotesk", sans-serif';
    ctx.fillText(tag, 32, 58);
    ctx.fillStyle = '#F6F3EE';
    ctx.font = '700 32px "Space Grotesk", sans-serif';
    ctx.fillText(title, 32, 122);
    ctx.fillStyle = 'rgba(246,243,238,0.68)';
    ctx.font = '500 18px "DM Sans", sans-serif';
    ctx.fillText(sub, 32, 160);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.strokeRect(32, 198, 190, 42);
    ctx.fillStyle = '#F6F3EE';
    ctx.font = '600 15px "DM Sans", sans-serif';
    ctx.fillText('TAP TO OPEN →', 54, 224);
    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  /* =========================================================
   * REALISTIC MATERIALS (100% OPAQUE WALLS + WALNUT WOOD DOOR)
   * ========================================================= */
  var floorTex = makePlankWoodTexture(178, 136, 94, 6);
  var walnutDoorTex = makePlankWoodTexture(108, 66, 38, 1);
  var studioPlasterTex = makePlasterTexture('#22242B');
  var hallPlasterTex = makePlasterTexture('#C9BAA7');

  var matFloor = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.58, metalness: 0.06 });
  var matHallWall = new THREE.MeshStandardMaterial({ map: hallPlasterTex, roughness: 0.9, metalness: 0.0, transparent: false, opacity: 1 });
  var matStudioWall = new THREE.MeshStandardMaterial({ map: studioPlasterTex, roughness: 0.84, metalness: 0.06, transparent: false, opacity: 1 });
  var DOOM_WALLPAPER_URLS = [
    'https://images.hdqwalls.com/wallpapers/doctor-doom-for-avengers-doomsday-yg.jpg',
    'https://wallpapers.com/images/hd/doctor-doom-mask-close-up-tp4lr3v62ux8tp3i.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEBHv0dLoz8brs0erNySecumjL1xxJ-JBUupibJwPrKubAu2fMvwuqjCXe&s=10'
  ];
  (function loadDoomsdayWallpaper(idx) {
    if (idx >= DOOM_WALLPAPER_URLS.length) return;
    var wpImg = new Image();
    wpImg.crossOrigin = 'anonymous';
    wpImg.onload = function () {
      var wpTex = new THREE.Texture(wpImg);
      wpTex.encoding = THREE.sRGBEncoding;
      wpTex.wrapS = THREE.ClampToEdgeWrapping;
      wpTex.wrapT = THREE.ClampToEdgeWrapping;
      wpTex.needsUpdate = true;
      matStudioWall.map = wpTex;
      matStudioWall.needsUpdate = true;
    };
    wpImg.onerror = function () { loadDoomsdayWallpaper(idx + 1); };
    wpImg.src = DOOM_WALLPAPER_URLS[idx];
  })(0);
  var matCeiling = new THREE.MeshStandardMaterial({ color: 0xEAE5DE, roughness: 0.92, metalness: 0.0, transparent: false, opacity: 1 });
  var matWhiteTrim = new THREE.MeshStandardMaterial({ color: 0xEDE9E2, roughness: 0.52, metalness: 0.06 });
  var matWoodDoor = new THREE.MeshStandardMaterial({ map: walnutDoorTex, roughness: 0.46, metalness: 0.08 });
  var matWoodDoorInset = new THREE.MeshStandardMaterial({ map: walnutDoorTex, color: 0xD8C4B4, roughness: 0.55, metalness: 0.05 });
  var matDarkWood = new THREE.MeshStandardMaterial({ color: 0x734928, roughness: 0.50, metalness: 0.08 });
  var matMetalDark = new THREE.MeshStandardMaterial({ color: 0x1A1C22, roughness: 0.38, metalness: 0.78 });
  var matBrass = new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.28, metalness: 0.86 });
  var matSilver = new THREE.MeshStandardMaterial({ color: 0xD4D8DF, roughness: 0.25, metalness: 0.88 });
  var matLeather = new THREE.MeshStandardMaterial({ color: 0x343740, roughness: 0.65, metalness: 0.12 });
  var matDeskMat = new THREE.MeshStandardMaterial({ color: 0x171920, roughness: 0.92, metalness: 0.02 });
  var matCyanLed = new THREE.MeshStandardMaterial({ color: 0x7DD3FC, emissive: 0x38BDF8, emissiveIntensity: 0.95, roughness: 0.2 });
  var matWarmLed = new THREE.MeshStandardMaterial({ color: 0xFFE8CC, emissive: 0xFFAE52, emissiveIntensity: 0.85, roughness: 0.2 });

  function addSolidBox(w, h, d, mat, x, y, z, parent) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    (parent || scene).add(m);
    return m;
  }

  /* =========================================================
   * 1. ENCLOSED OPAQUE OUTER HALLWAY (Z: +4.2 to +7.8)
   * Doorway sits at Z = +4.2, X = 0
   * ========================================================= */
  // Exterior cinema intro uses photorealistic film sequence canvas (#cinema-intro-canvas)

  var hallGroup = new THREE.Group();
  scene.add(hallGroup);

  addSolidBox(6.4, 0.14, 5.6, matFloor, 0, -0.07, 7.0, hallGroup);
  addSolidBox(6.4, 0.14, 5.6, matCeiling, 0, 3.55, 7.0, hallGroup);
  addSolidBox(0.24, 3.6, 5.6, matHallWall, -3.1, 1.75, 7.0, hallGroup);
  addSolidBox(0.24, 3.6, 5.6, matHallWall, 3.1, 1.75, 7.0, hallGroup);
  var hallBackWall = addSolidBox(6.4, 3.6, 0.24, matHallWall, 0, 1.75, 9.7, hallGroup);
  hallBackWall.visible = true;
  // Front wall around door (100% opaque, solid thickness)
  addSolidBox(2.52, 3.6, 0.24, matHallWall, -1.87, 1.75, 4.2, hallGroup);
  addSolidBox(2.52, 3.6, 0.24, matHallWall, 1.87, 1.75, 4.2, hallGroup);
  addSolidBox(1.36, 1.24, 0.24, matHallWall, 0, 2.96, 4.2, hallGroup);

  // Molded wooden door jamb & baseboards
  addSolidBox(0.12, 2.36, 0.28, matDarkWood, -0.64, 1.18, 4.2, hallGroup);
  addSolidBox(0.12, 2.36, 0.28, matDarkWood, 0.64, 1.18, 4.2, hallGroup);
  addSolidBox(1.40, 0.12, 0.28, matDarkWood, 0, 2.38, 4.2, hallGroup);
  addSolidBox(2.45, 0.14, 0.04, matWhiteTrim, -1.91, 0.07, 4.34, hallGroup);
  addSolidBox(2.45, 0.14, 0.04, matWhiteTrim, 1.91, 0.07, 4.34, hallGroup);

  // Overhead backlit "JARVIS ROOM" Lightbox (prominent wide framing)
  addSolidBox(1.52, 0.34, 0.08, matMetalDark, 0, 2.76, 4.36, hallGroup);
  var signFace = new THREE.Mesh(new THREE.PlaneGeometry(1.44, 0.28), new THREE.MeshBasicMaterial({ map: makeSignTexture('JARVIS ROOM') }));
  signFace.position.set(0, 2.76, 4.405);
  hallGroup.add(signFace);

  // Realistic Paneled Solid Walnut Wood Door (Pivot on left hinge at X = -0.58, Z = 4.2)
  var doorPivot = new THREE.Group();
  doorPivot.position.set(-0.58, 0, 4.2);
  scene.add(doorPivot);

  var doorMesh = new THREE.Mesh(new THREE.BoxGeometry(1.16, 2.32, 0.07), matWoodDoor);
  doorMesh.position.set(0.58, 1.16, 0);
  doorMesh.castShadow = true;
  doorMesh.receiveShadow = true;
  doorMesh.userData = { type: 'door' };
  doorPivot.add(doorMesh);

  // Beveled wooden door panels (front & back)
  [0.038, -0.038].forEach(function (zOff) {
    addSolidBox(0.76, 0.86, 0.014, matWoodDoorInset, 0.58, 1.64, zOff, doorPivot);
    addSolidBox(0.76, 0.78, 0.014, matWoodDoorInset, 0.58, 0.64, zOff, doorPivot);
  });

  // Brass lever handle & hinges
  addSolidBox(0.18, 0.032, 0.06, matBrass, 1.00, 1.04, 0.055, doorPivot);
  addSolidBox(0.18, 0.032, 0.06, matBrass, 1.00, 1.04, -0.055, doorPivot);
  addSolidBox(0.03, 0.12, 0.04, matBrass, 0.01, 0.45, 0.03, doorPivot);
  addSolidBox(0.03, 0.12, 0.04, matBrass, 0.01, 1.85, 0.03, doorPivot);

  /* =========================================================
   * 2. SPACIOUS REALISTIC STUDIO ROOM (9.4m × 8.4m × 3.55m)
   * X: -4.7..+4.7, Z: -4.3..+4.1
   * ========================================================= */
  var roomGroup = new THREE.Group();
  scene.add(roomGroup);

  addSolidBox(9.6, 0.14, 8.6, matFloor, 0, -0.07, -0.1, roomGroup);
  addSolidBox(9.6, 0.14, 8.6, matCeiling, 0, 3.55, -0.1, roomGroup);
  // 100% opaque solid perimeter walls
  addSolidBox(9.6, 3.6, 0.26, matStudioWall, 0, 1.75, -4.35, roomGroup);
  addSolidBox(0.26, 3.6, 8.6, matStudioWall, -4.75, 1.75, -0.1, roomGroup);
  // East wall with doorway into JARVIS MEMORIES (opening at Z = -2.73..-1.57)
  addSolidBox(0.26, 3.6, 1.67, matStudioWall, 4.75, 1.75, -3.565, roomGroup);
  addSolidBox(0.26, 3.6, 5.77, matStudioWall, 4.75, 1.75, 1.315, roomGroup);
  addSolidBox(0.26, 1.24, 1.24, matStudioWall, 4.75, 2.96, -2.15, roomGroup);
  // Inner south wall cladding flanking the wooden door
  addSolidBox(4.1, 3.6, 0.06, matStudioWall, -2.68, 1.75, 4.06, roomGroup);
  addSolidBox(4.1, 3.6, 0.06, matStudioWall, 2.68, 1.75, 4.06, roomGroup);
  addSolidBox(1.4, 1.24, 0.06, matStudioWall, 0, 2.96, 4.06, roomGroup);

  // Baseboards & crown molding around interior perimeter
  addSolidBox(9.3, 0.12, 0.03, matMetalDark, 0, 0.06, -4.20, roomGroup);
  addSolidBox(0.03, 0.12, 8.3, matMetalDark, -4.60, 0.06, -0.1, roomGroup);
  addSolidBox(0.03, 0.12, 1.48, matMetalDark, 4.60, 0.06, -3.52, roomGroup);
  addSolidBox(0.03, 0.12, 5.55, matMetalDark, 4.60, 0.06, 1.25, roomGroup);

  // Louvered Window + Radiator on North-West Wall
  addSolidBox(1.70, 1.72, 0.12, matWhiteTrim, -2.05, 1.92, -4.20, roomGroup);
  addSolidBox(1.52, 1.54, 0.04, new THREE.MeshStandardMaterial({ color: 0xDCE7F3, emissive: 0x3B526E, emissiveIntensity: 0.3 }), -2.05, 1.92, -4.16, roomGroup);
  for (var s = 0; s < 8; s++) {
    addSolidBox(1.48, 0.04, 0.06, matWhiteTrim, -2.05, 1.28 + s * 0.18, -4.12, roomGroup);
  }
  for (var r = 0; r < 11; r++) {
    addSolidBox(0.08, 0.60, 0.12, matWhiteTrim, -2.55 + r * 0.10, 0.56, -4.14, roomGroup);
  }

  // Clean full-bleed Doomsday mural walls (diagonal LED wall strips removed)

  // Recessed Ceiling Downlights + Central Pendant
  [[-2.2, -2.0], [2.2, -2.0], [-2.2, 1.8], [2.2, 1.8]].forEach(function (pt) {
    var housing = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 20), matMetalDark);
    housing.position.set(pt[0], 3.46, pt[1]);
    roomGroup.add(housing);
    var lens = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 20), matWarmLed);
    lens.position.set(pt[0], 3.44, pt[1]);
    roomGroup.add(lens);
  });
  addSolidBox(0.02, 0.85, 0.02, matMetalDark, 0, 3.05, -0.2, roomGroup);
  var bulb = new THREE.Mesh(new THREE.SphereGeometry(0.095, 18, 18), matWarmLed);
  bulb.position.set(0, 2.60, -0.2);
  roomGroup.add(bulb);

  // Woven Area Rug in Lounge Zone
  var rug = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.015, 2.9), new THREE.MeshStandardMaterial({ map: makeRugTexture(), roughness: 0.95 }));
  rug.position.set(-1.3, 0.008, 0.1);
  rug.receiveShadow = true;
  roomGroup.add(rug);

  // =========================================================
  // CINEMATIC 3D MARVEL / DOOMSDAY THEME OBJECTS
  // =========================================================
  var matObsidian = new THREE.MeshStandardMaterial({ color: 0x0B0E14, roughness: 0.28, metalness: 0.72 });
  var matCopperCoil = new THREE.MeshStandardMaterial({ color: 0xB45309, roughness: 0.32, metalness: 0.85 });
  var matArcCore = new THREE.MeshStandardMaterial({ color: 0xE0F2FE, emissive: 0x38BDF8, emissiveIntensity: 2.0, roughness: 0.12, metalness: 0.2 });
  var matDoomCrystal = new THREE.MeshStandardMaterial({ color: 0x10B981, emissive: 0x059669, emissiveIntensity: 1.75, roughness: 0.15, metalness: 0.4 });
  var matDoomRing = new THREE.MeshStandardMaterial({ color: 0x34D399, emissive: 0x10B981, emissiveIntensity: 0.9, roughness: 0.25, metalness: 0.8 });
  var matCrimsonHol = new THREE.MeshBasicMaterial({ color: 0xFF1744, wireframe: true, transparent: true, opacity: 0.52 });

  // 1) Floating 3D Arc Reactor Pedestal (West Lounge Showcase)
  var arcStand = new THREE.Group();
  arcStand.position.set(-3.45, 0, 1.25);
  var arcBase = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.40, 0.96, 6), matObsidian);
  arcBase.position.y = 0.48;
  arcBase.castShadow = true;
  arcBase.receiveShadow = true;
  arcStand.add(arcBase);
  var arcTrim = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.014, 12, 36), matArcCore);
  arcTrim.rotation.x = Math.PI / 2;
  arcTrim.position.y = 0.97;
  arcStand.add(arcTrim);

  var arcRotor = new THREE.Group();
  arcRotor.position.y = 1.48;
  var arcReactorShaderEffect = null;
  attachArcReactorShader(THREE, arcRotor).then(function (effect) { arcReactorShaderEffect = effect; }).catch(function () {});
  var arcOuterRing = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.036, 16, 48), matSilver);
  arcRotor.add(arcOuterRing);
  var arcInnerGlow = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.024, 14, 40), matArcCore);
  arcRotor.add(arcInnerGlow);
  var arcCenterCore = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.055, 24), matArcCore);
  arcCenterCore.rotation.x = Math.PI / 2;
  arcRotor.add(arcCenterCore);
  for (var c = 0; c < 10; c++) {
    var ang = (c / 10) * Math.PI * 2;
    var coil = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.075, 0.085), matCopperCoil);
    coil.position.set(Math.cos(ang) * 0.27, Math.sin(ang) * 0.27, 0);
    coil.rotation.z = ang;
    arcRotor.add(coil);
  }
  arcStand.add(arcRotor);
  var arcLight = new THREE.PointLight(0x38BDF8, 0.65, 4.2);
  arcLight.position.set(0, 1.48, 0.2);
  arcStand.add(arcLight);
  roomGroup.add(arcStand);

  // 2) Doomsday Emerald Arcane Relic & Orbiting Rings (South-West Corner)
  var doomStand = new THREE.Group();
  doomStand.position.set(-3.55, 0, 2.95);
  var doomPlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.34, 1.04, 8), matObsidian);
  doomPlinth.position.y = 0.52;
  doomPlinth.castShadow = true;
  doomStand.add(doomPlinth);
  var doomCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.05, 8), matBrass);
  doomCollar.position.y = 1.04;
  doomStand.add(doomCollar);

  var doomCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), matDoomCrystal);
  doomCrystal.position.y = 1.54;
  doomStand.add(doomCrystal);
  var doomRingA = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.015, 12, 48), matDoomRing);
  doomRingA.position.y = 1.54;
  doomRingA.rotation.x = 0.65;
  doomStand.add(doomRingA);
  var doomRingB = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.012, 12, 48), matBrass);
  doomRingB.position.y = 1.54;
  doomRingB.rotation.y = 0.8;
  doomRingB.rotation.x = -0.55;
  doomStand.add(doomRingB);
  var doomLight = new THREE.PointLight(0x10B981, 0.85, 4.8);
  doomLight.position.set(0, 1.54, 0.2);
  doomStand.add(doomLight);
  roomGroup.add(doomStand);

  // 3) Floating Crimson Holographic Tactical Globe (North-West Corner)
  var holoStand = new THREE.Group();
  holoStand.position.set(-3.65, 0, -3.25);
  var holoBase = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.38, 0.86, 24), matObsidian);
  holoBase.position.y = 0.43;
  holoBase.castShadow = true;
  holoStand.add(holoBase);
  var holoEmitter = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.015, 12, 36), new THREE.MeshBasicMaterial({ color: 0xFF1744 }));
  holoEmitter.rotation.x = Math.PI / 2;
  holoEmitter.position.y = 0.87;
  holoStand.add(holoEmitter);
  var holoGlobe = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 2), matCrimsonHol);
  holoGlobe.position.y = 1.38;
  holoStand.add(holoGlobe);
  var holoOrbit = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.009, 10, 48), new THREE.MeshBasicMaterial({ color: 0x34D399, transparent: true, opacity: 0.72 }));
  holoOrbit.position.y = 1.38;
  holoOrbit.rotation.x = 1.15;
  holoStand.add(holoOrbit);
  roomGroup.add(holoStand);

  /* =========================================================
   * 3. REAL MARVEL GALLERY PHOTO FRAMES (OUTSIDE + INSIDE)
   * ========================================================= */
  function mountPhotoFrame(cfg, x, y, z, rotY, w, h, parent) {
    var g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotY;

    // Thick matte black gallery frame + white inner mat
    var outer = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, h + 0.12, 0.05), matMetalDark);
    outer.castShadow = true;
    g.add(outer);

    var matBoard = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.04, h + 0.04), new THREE.MeshBasicMaterial({ color: 0xEFECE6 }));
    matBoard.position.z = 0.026;
    g.add(matBoard);

    var artMat = new THREE.MeshBasicMaterial({
      map: makePosterTexture(cfg),
      polygonOffset: true,
      polygonOffsetFactor: -2
    });
    var art = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.02, h - 0.02), artMat);
    art.position.z = 0.030;
    g.add(art);

    // Subtle gallery brass picture-light bar above each frame
    addSolidBox(w * 0.55, 0.025, 0.08, matBrass, 0, h / 2 + 0.11, 0.06, g);
    (parent || scene).add(g);
  }

  // Outside hallway Marvel frames flanking the wooden door (balanced wide composition)
  mountPhotoFrame(PHOTOS_CONFIG.hallLeft, -1.42, 1.58, 4.35, 0, 0.82, 1.10, hallGroup);
  mountPhotoFrame(PHOTOS_CONFIG.hallRight, 1.42, 1.58, 4.35, 0, 0.82, 1.10, hallGroup);

  // Inside studio frames: Amazing Spider-Man ("Inspiration") & Iron Man ("Craft")
  mountPhotoFrame(PHOTOS_CONFIG.inspiration, 0.45, 2.02, -4.18, 0, 0.96, 1.28, roomGroup);
  mountPhotoFrame(PHOTOS_CONFIG.craft, 2.45, 1.78, 3.98, Math.PI, 0.92, 1.22, roomGroup);

  /* =========================================================
   * 4. LOUNGE CHAIRS & ROOM-AWARE JARVIS ORB
   * ========================================================= */
  function buildLoungeChair(x, z, rotY) {
    var g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    addSolidBox(0.84, 0.15, 0.78, matLeather, 0, 0.44, 0, g);
    var back = addSolidBox(0.84, 0.62, 0.15, matLeather, 0, 0.76, -0.34, g);
    back.rotation.x = -0.22;
    // Armrests
    addSolidBox(0.10, 0.22, 0.66, matLeather, -0.42, 0.56, -0.02, g);
    addSolidBox(0.10, 0.22, 0.66, matLeather, 0.42, 0.56, -0.02, g);
    // Chrome swivel base
    addSolidBox(0.06, 0.38, 0.06, matSilver, 0, 0.19, 0, g);
    addSolidBox(0.58, 0.03, 0.06, matSilver, 0, 0.02, 0, g);
    addSolidBox(0.06, 0.03, 0.58, matSilver, 0, 0.02, 0, g);
    roomGroup.add(g);
  }
  buildLoungeChair(-1.15, 0.95, 0.35);
  buildLoungeChair(-1.75, -0.85, 0.62);

  // Floating JARVIS Assistant Orb
  var orbGroup = new THREE.Group();
  orbGroup.position.set(-1.70, 1.24, -0.78);
  roomGroup.add(orbGroup);

  var orbGradCanvas = document.createElement('canvas');
  orbGradCanvas.width = 256; orbGradCanvas.height = 256;
  var orbGradCtx = orbGradCanvas.getContext('2d');
  var orbGrad = orbGradCtx.createLinearGradient(0, 0, 256, 256);
  orbGrad.addColorStop(0.0, '#FF6B81');
  orbGrad.addColorStop(0.35, '#FF0A3C');
  orbGrad.addColorStop(0.72, '#DC0028');
  orbGrad.addColorStop(1.0, '#6B0016');
  orbGradCtx.fillStyle = orbGrad;
  orbGradCtx.fillRect(0, 0, 256, 256);
  var orbGradTex = new THREE.CanvasTexture(orbGradCanvas);
  orbGradTex.encoding = THREE.sRGBEncoding;

  var orbMat = new THREE.MeshStandardMaterial({
    map: orbGradTex,
    emissive: 0xFF1744,
    emissiveMap: orbGradTex,
    emissiveIntensity: 1.35,
    roughness: 0.14,
    metalness: 0.32
  });
  var orbMesh = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), orbMat);
  orbMesh.userData = { type: 'assistant' };
  orbGroup.add(orbMesh);

  var eyeMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  var eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.095, 0.02), eyeMat);
  eyeL.position.set(-0.068, 0.02, 0.235);
  var eyeR = eyeL.clone();
  eyeR.position.x = 0.068;
  orbGroup.add(eyeL, eyeR);

  var haloMat = new THREE.MeshBasicMaterial({ color: 0xFF3358, transparent: true, opacity: 0.62, side: THREE.DoubleSide });
  var haloRing = new THREE.Mesh(new THREE.RingGeometry(0.30, 0.33, 40), haloMat);
  orbGroup.add(haloRing);

  /* =========================================================
   * 5. REALISTIC WORKSTATION DESK + IST CLOCK + 3 SCREENS
   * ========================================================= */
  var deskGroup = new THREE.Group();
  deskGroup.position.set(2.25, 0, -3.15);
  roomGroup.add(deskGroup);

  // Walnut standing desk + cable tray + steel T-legs + desk mat
  addSolidBox(2.55, 0.075, 1.02, matDarkWood, 0, 0.78, 0, deskGroup);
  addSolidBox(1.55, 0.008, 0.56, matDeskMat, 0, 0.822, 0.12, deskGroup);
  addSolidBox(0.08, 0.78, 0.08, matMetalDark, -1.12, 0.39, 0, deskGroup);
  addSolidBox(0.08, 0.78, 0.08, matMetalDark, 1.12, 0.39, 0, deskGroup);
  addSolidBox(0.08, 0.04, 0.72, matMetalDark, -1.12, 0.02, 0, deskGroup);
  addSolidBox(0.08, 0.04, 0.72, matMetalDark, 1.12, 0.02, 0, deskGroup);

  // Ergonomic high-back chair behind desk
  var chairG = new THREE.Group();
  chairG.position.set(0, 0, 0.92);
  addSolidBox(0.56, 0.10, 0.54, matLeather, 0, 0.48, 0, chairG);
  addSolidBox(0.52, 0.68, 0.08, matLeather, 0, 0.86, 0.24, chairG);
  addSolidBox(0.06, 0.42, 0.06, matMetalDark, 0, 0.22, 0, chairG);
  addSolidBox(0.56, 0.04, 0.06, matMetalDark, 0, 0.03, 0, chairG);
  addSolidBox(0.06, 0.04, 0.56, matMetalDark, 0, 0.03, 0, chairG);
  deskGroup.add(chairG);

  // Studio speakers left & right
  addSolidBox(0.16, 0.26, 0.18, matMetalDark, -1.08, 0.95, -0.26, deskGroup);
  addSolidBox(0.16, 0.26, 0.18, matMetalDark, 1.08, 0.95, -0.26, deskGroup);

  // Main Ultrawide Monitor
  addSolidBox(1.06, 0.56, 0.04, matMetalDark, 0, 1.24, -0.26, deskGroup);
  addSolidBox(0.09, 0.26, 0.06, matMetalDark, 0, 0.92, -0.28, deskGroup);
  var scr0 = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.50), new THREE.MeshBasicMaterial({ map: makeMonitorTexture('MAIN MONITOR', '3D Portfolio', 'mokshith7777.github.io/portfolio-3d', '#38BDF8') }));
  scr0.position.set(0, 1.24, -0.236);
  scr0.userData = { type: 'screen', index: 0 };
  deskGroup.add(scr0);

  // Right Side Tablet
  var tabG = new THREE.Group();
  tabG.position.set(0.78, 1.06, -0.14);
  tabG.rotation.y = -0.26;
  addSolidBox(0.48, 0.32, 0.03, matMetalDark, 0, 0, 0, tabG);
  var scr1 = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.28), new THREE.MeshBasicMaterial({ map: makeMonitorTexture('SIDE TABLET', 'JARVIS AI Portfolio', 'mokshith7777.github.io/jarvis-ai-portfolio', '#E86A33') }));
  scr1.position.z = 0.018;
  scr1.userData = { type: 'screen', index: 1 };
  tabG.add(scr1);
  deskGroup.add(tabG);

  // Left Laptop
  var lapG = new THREE.Group();
  lapG.position.set(-0.78, 0.825, -0.08);
  lapG.rotation.y = 0.28;
  addSolidBox(0.44, 0.02, 0.30, matSilver, 0, 0, 0, lapG);
  var lapLid = new THREE.Group();
  lapLid.position.set(0, 0.01, -0.15);
  lapLid.rotation.x = -0.22;
  addSolidBox(0.44, 0.30, 0.018, matSilver, 0, 0.15, 0, lapLid);
  var scr2 = new THREE.Mesh(new THREE.PlaneGeometry(0.40, 0.26), new THREE.MeshBasicMaterial({ map: makeMonitorTexture('LAPTOP', '@mokxith_jarvis', 'instagram.com/mokxith_jarvis', '#E1306C') }));
  scr2.position.set(0, 0.15, 0.012);
  scr2.userData = { type: 'screen', index: 2 };
  lapLid.add(scr2);
  lapG.add(lapLid);
  deskGroup.add(lapG);

  // Live IST Digital Clock/Timer under monitor + Keyboard + Trackpad
  addSolidBox(0.32, 0.125, 0.07, matMetalDark, 0, 0.88, -0.06, deskGroup);
  var clockFace = new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.105), new THREE.MeshBasicMaterial({ map: clockTex }));
  clockFace.position.set(0, 0.88, -0.022);
  deskGroup.add(clockFace);
  addSolidBox(0.48, 0.018, 0.16, matMetalDark, -0.08, 0.835, 0.20, deskGroup);
  addSolidBox(0.15, 0.014, 0.14, matMetalDark, 0.30, 0.835, 0.20, deskGroup);

  /* =========================================================
   * 6. EMPTY INDUSTRIAL OAK & STEEL BOOKSHELF (East Wall)
   * ========================================================= */
  var shelfGroup = new THREE.Group();
  shelfGroup.position.set(4.28, 0, 0.75);
  shelfGroup.rotation.y = -Math.PI / 2;
  roomGroup.add(shelfGroup);

  [-1.35, 0, 1.35].forEach(function (px) {
    addSolidBox(0.05, 2.05, 0.05, matMetalDark, px, 1.025, -0.24, shelfGroup);
    addSolidBox(0.05, 2.05, 0.05, matMetalDark, px, 1.025, 0.24, shelfGroup);
  });
  // Empty solid oak shelves (ready for custom objects)
  [0.24, 0.78, 1.32, 1.86].forEach(function (sy) {
    addSolidBox(2.76, 0.05, 0.52, matDarkWood, 0, sy, 0, shelfGroup);
  });
  // Architectural rear X-bracing
  var brace1 = addSolidBox(0.025, 2.6, 0.025, matMetalDark, 0, 1.05, -0.25, shelfGroup);
  brace1.rotation.z = 0.82;
  var brace2 = addSolidBox(0.025, 2.6, 0.025, matMetalDark, 0, 1.05, -0.25, shelfGroup);
  brace2.rotation.z = -0.82;

  // Helper to render crisp product box label textures
  function makeApkBoxTexture(title, badge, accentHex, bgHex) {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 384;
    var ctx = c.getContext('2d');
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 512, 384);
    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 10;
    ctx.strokeRect(16, 16, 480, 352);
    ctx.fillStyle = accentHex;
    ctx.font = '700 24px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(badge, 256, 86);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 54px "Space Grotesk", sans-serif';
    ctx.fillText(title, 256, 198);
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = '600 22px "DM Sans", sans-serif';
    ctx.fillText('TAP TO OPEN', 256, 294);
    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  // BIG BLACK BOX: JARVIS PRO APK (prominently placed on middle-top shelf, slightly angled toward viewer)
  var matBlackBoxSide = new THREE.MeshStandardMaterial({ color: 0x0B0C10, roughness: 0.28, metalness: 0.65 });
  var matJarvisFront = new THREE.MeshBasicMaterial({ map: makeApkBoxTexture('JARVIS PRO', 'PREMIUM APK', '#38BDF8', '#08090D') });
  var jarvisProBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.44, 0.38),
    [matBlackBoxSide, matBlackBoxSide, matBlackBoxSide, matBlackBoxSide, matJarvisFront, matBlackBoxSide]
  );
  jarvisProBox.position.set(-0.56, 1.56, 0.02);
  jarvisProBox.rotation.y = 0.14;
  jarvisProBox.castShadow = true;
  jarvisProBox.receiveShadow = true;
  jarvisProBox.userData = { type: 'apk-pro' };
  shelfGroup.add(jarvisProBox);

  // Subtle glowing accent strip under JARVIS PRO black box
  addSolidBox(0.76, 0.015, 0.36, matCyanLed, -0.56, 1.352, 0.02, shelfGroup);

  // FREE BOX: TIME J APK (sleek dark emerald/slate box on right side of middle-top shelf)
  var matTimeSide = new THREE.MeshStandardMaterial({ color: 0x11221E, roughness: 0.36, metalness: 0.45 });
  var matTimeFront = new THREE.MeshBasicMaterial({ map: makeApkBoxTexture('TIME J APK', 'FREE · NO PAYMENT', '#10B981', '#0B1A16') });
  var timeJBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.36, 0.34),
    [matTimeSide, matTimeSide, matTimeSide, matTimeSide, matTimeFront, matTimeSide]
  );
  timeJBox.position.set(0.62, 1.52, 0.02);
  timeJBox.rotation.y = -0.14;
  timeJBox.castShadow = true;
  timeJBox.receiveShadow = true;
  timeJBox.userData = { type: 'apk-timej' };
  shelfGroup.add(timeJBox);

  /* =========================================================
   * 7. INTERACTIVE WALL WHITEBOARD (West Wall)
   * ========================================================= */
  var wbCanvas = document.createElement('canvas');
  wbCanvas.width = 640; wbCanvas.height = 400;
  var wbCtx = wbCanvas.getContext('2d');
  var wbHistory = [];
  function pushWbHistory() {
    try {
      wbHistory.push(wbCtx.getImageData(0, 0, wbCanvas.width, wbCanvas.height));
      if (wbHistory.length > 20) wbHistory.shift();
    } catch (e) {}
  }
  function undoWhiteboard() {
    if (!wbHistory.length) {
      showStudioToast('Nothing to undo');
      return;
    }
    var prev = wbHistory.pop();
    wbCtx.putImageData(prev, 0, 0);
    if (wbTex) wbTex.needsUpdate = true;
    playSoftChime(440);
  }
  function saveWhiteboardPng() {
    try {
      var a = document.createElement('a');
      a.href = wbCanvas.toDataURL('image/png');
      a.download = 'jarvis-whiteboard.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      playSoftChime(660);
      showStudioToast('Whiteboard saved as PNG');
    } catch (e) {}
  }
  function clearWhiteboard() {
    pushWbHistory();
    wbCtx.fillStyle = '#F3F1EC';
    wbCtx.fillRect(0, 0, 640, 400);
    wbCtx.fillStyle = 'rgba(30,41,59,0.28)';
    wbCtx.font = '600 20px "Space Grotesk", sans-serif';
    wbCtx.fillText('JARVIS WHITEBOARD — TAP & DRAW', 24, 38);
    if (wbTex) wbTex.needsUpdate = true;
  }
  var wbTex = new THREE.CanvasTexture(wbCanvas);
  wbTex.encoding = THREE.sRGBEncoding;
  clearWhiteboard();

  var wbGroup = new THREE.Group();
  wbGroup.position.set(-4.58, 1.72, -1.85);
  wbGroup.rotation.y = Math.PI / 2;
  addSolidBox(1.76, 1.12, 0.045, matSilver, 0, 0, 0, wbGroup);
  var wbPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.66, 1.02), new THREE.MeshBasicMaterial({ map: wbTex }));
  wbPlane.position.z = 0.028;
  wbPlane.userData = { type: 'whiteboard' };
  wbGroup.add(wbPlane);
  roomGroup.add(wbGroup);

  /* =========================================================
   * 7B. ADJACENT ROOM: "JARVIS MEMORIES" (Password: 2408)
   * Amazing Spider-Man Wallpaper · Iron Man Gallery · Neon Red Theme
   * Interactive Ceiling Fans, Neon Lights & 3D Switch Board
   * ========================================================= */
  var memGroup = new THREE.Group();
  scene.add(memGroup);

  var spideyCanvas = document.createElement('canvas');
  spideyCanvas.width = 512; spideyCanvas.height = 512;
  var spCtx = spideyCanvas.getContext('2d');
  var spGrad = spCtx.createRadialGradient(256, 256, 30, 256, 256, 320);
  spGrad.addColorStop(0, '#2B0712');
  spGrad.addColorStop(0.55, '#12050B');
  spGrad.addColorStop(1, '#060308');
  spCtx.fillStyle = spGrad;
  spCtx.fillRect(0, 0, 512, 512);
  spCtx.strokeStyle = 'rgba(255, 28, 72, 0.24)';
  spCtx.lineWidth = 2;
  for (var wa = 0; wa < 12; wa++) {
    var rad = (wa / 12) * Math.PI * 2;
    spCtx.beginPath();
    spCtx.moveTo(256, 256);
    spCtx.lineTo(256 + Math.cos(rad) * 360, 256 + Math.sin(rad) * 360);
    spCtx.stroke();
  }
  for (var wr = 55; wr <= 280; wr += 55) {
    spCtx.beginPath();
    spCtx.arc(256, 256, wr, 0, Math.PI * 2);
    spCtx.stroke();
  }
  var spideyWallTex = new THREE.CanvasTexture(spideyCanvas);
  spideyWallTex.encoding = THREE.sRGBEncoding;
  var matMemoriesWall = new THREE.MeshStandardMaterial({
    map: spideyWallTex,
    roughness: 0.78,
    metalness: 0.08,
    transparent: false,
    opacity: 1
  });
  (function loadSpiderManWallpaper(idx) {
    if (idx >= SPIDERMAN_WALLPAPER_URLS.length) return;
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      var tex = new THREE.Texture(img);
      tex.encoding = THREE.sRGBEncoding;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.needsUpdate = true;
      matMemoriesWall.map = tex;
      matMemoriesWall.needsUpdate = true;
    };
    img.onerror = function () { loadSpiderManWallpaper(idx + 1); };
    img.src = SPIDERMAN_WALLPAPER_URLS[idx];
  })(0);

  var matMemFloor = new THREE.MeshStandardMaterial({ color: 0x100A0E, roughness: 0.42, metalness: 0.25 });
  var matMemCeil = new THREE.MeshStandardMaterial({ color: 0x0B0609, roughness: 0.85, metalness: 0.1 });
  var matNeonRedLed = new THREE.MeshStandardMaterial({
    color: 0xFF2A55,
    emissive: 0xFF0A3C,
    emissiveIntensity: 2.3,
    roughness: 0.2,
    metalness: 0.1
  });

  // Enclosed room shell (X: +4.88..+12.60, Z: -4.35..+4.10)
  addSolidBox(7.85, 0.14, 8.6, matMemFloor, 8.74, -0.07, -0.1, memGroup);
  addSolidBox(7.85, 0.14, 8.6, matMemCeil, 8.74, 3.55, -0.1, memGroup);
  addSolidBox(7.85, 3.6, 0.26, matMemoriesWall, 8.74, 1.75, -4.35, memGroup);
  addSolidBox(7.85, 3.6, 0.26, matMemoriesWall, 8.74, 1.75, 4.10, memGroup);
  addSolidBox(0.26, 3.6, 8.6, matMemoriesWall, 12.60, 1.75, -0.1, memGroup);
  addSolidBox(0.06, 3.6, 1.67, matMemoriesWall, 4.91, 1.75, -3.565, memGroup);
  addSolidBox(0.06, 3.6, 5.77, matMemoriesWall, 4.91, 1.75, 1.315, memGroup);
  addSolidBox(0.06, 1.24, 1.24, matMemoriesWall, 4.91, 2.96, -2.15, memGroup);

  // Door jamb & backlit "JARVIS MEMORIES" sign
  addSolidBox(0.32, 2.36, 0.12, matObsidian, 4.78, 1.18, -2.75, memGroup);
  addSolidBox(0.32, 2.36, 0.12, matObsidian, 4.78, 1.18, -1.55, memGroup);
  addSolidBox(0.32, 0.12, 1.32, matObsidian, 4.78, 2.38, -2.15, memGroup);

  addSolidBox(0.08, 0.30, 1.48, matMetalDark, 4.59, 2.74, -2.15, memGroup);
  var memSignFace = new THREE.Mesh(
    new THREE.PlaneGeometry(1.40, 0.24),
    new THREE.MeshBasicMaterial({ map: makeSignTexture('JARVIS MEMORIES') })
  );
  memSignFace.position.set(4.545, 2.74, -2.15);
  memSignFace.rotation.y = -Math.PI / 2;
  memGroup.add(memSignFace);

  // Hinged JARVIS MEMORIES Door
  var memDoorPivot = new THREE.Group();
  memDoorPivot.position.set(4.78, 0, -2.73);
  scene.add(memDoorPivot);
  var memDoorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.07, 2.32, 1.16), matObsidian);
  memDoorMesh.position.set(0, 1.16, 0.58);
  memDoorMesh.castShadow = true;
  memDoorMesh.userData = { type: 'mem_door' };
  memDoorPivot.add(memDoorMesh);
  [-0.04, 0.04].forEach(function (xOff) {
    addSolidBox(0.012, 1.96, 0.035, matNeonRedLed, xOff, 1.16, 0.14, memDoorPivot);
    addSolidBox(0.012, 1.96, 0.035, matNeonRedLed, xOff, 1.16, 1.02, memDoorPivot);
  });
  addSolidBox(0.06, 0.034, 0.18, matBrass, -0.055, 1.06, 0.98, memDoorPivot);
  addSolidBox(0.06, 0.034, 0.18, matBrass, 0.055, 1.06, 0.98, memDoorPivot);

  // Wall-mounted 3D Keypad (outside JARVIS MEMORIES door)
  var memKeypadGroup = new THREE.Group();
  memKeypadGroup.position.set(4.60, 1.38, -1.26);
  var memKeypadMesh = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.30, 0.20), matObsidian);
  memKeypadMesh.userData = { type: 'mem_keypad' };
  memKeypadGroup.add(memKeypadMesh);
  var memLockLedMat = new THREE.MeshBasicMaterial({ color: 0xFF1744 });
  var memLockLed = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.04, 0.12), memLockLedMat);
  memLockLed.position.set(-0.028, 0.09, 0);
  memKeypadGroup.add(memLockLed);
  var memKeyPadFace = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.14, 0.12), new THREE.MeshBasicMaterial({ color: 0x1F2937 }));
  memKeyPadFace.position.set(-0.028, -0.04, 0);
  memKeyPadFace.userData = { type: 'mem_keypad' };
  memKeypadGroup.add(memKeyPadFace);
  memGroup.add(memKeypadGroup);

  // Inside 3D Exit Keypad inside JARVIS MEMORIES (beside doorway, facing +X)
  var memInsideKeypadGroup = new THREE.Group();
  memInsideKeypadGroup.position.set(4.97, 1.38, -2.96);
  var memInsideKeypadMesh = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.30, 0.20), matObsidian);
  memInsideKeypadMesh.userData = { type: 'mem_keypad' };
  memInsideKeypadGroup.add(memInsideKeypadMesh);
  var memInsideLockLedMat = new THREE.MeshBasicMaterial({ color: 0xFF1744 });
  var memInsideLockLed = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.04, 0.12), memInsideLockLedMat);
  memInsideLockLed.position.set(0.028, 0.09, 0);
  memInsideKeypadGroup.add(memInsideLockLed);
  var memInsideKeyPadFace = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.14, 0.12), new THREE.MeshBasicMaterial({ color: 0x1F2937 }));
  memInsideKeyPadFace.position.set(0.028, -0.04, 0);
  memInsideKeyPadFace.userData = { type: 'mem_keypad' };
  memInsideKeypadGroup.add(memInsideKeyPadFace);
  memGroup.add(memInsideKeypadGroup);

  // Neon Red Ceiling Cove Strips & Corner Accent Columns
  function addNeonBar(w, h, d, x, y, z) {
    return addSolidBox(w, h, d, matNeonRedLed, x, y, z, memGroup);
  }
  addNeonBar(7.4, 0.045, 0.045, 8.74, 3.44, -4.18);
  addNeonBar(7.4, 0.045, 0.045, 8.74, 3.44, 3.92);
  addNeonBar(0.045, 0.045, 8.1, 12.42, 3.44, -0.12);
  addNeonBar(0.045, 0.045, 8.1, 5.02, 3.44, -0.12);
  addNeonBar(0.038, 3.2, 0.038, 12.42, 1.72, -4.18);
  addNeonBar(0.038, 3.2, 0.038, 12.42, 1.72, 3.92);

  // 4 Gallery Photo Frames of ONLY Iron Man inside JARVIS MEMORIES
  mountPhotoFrame(PHOTOS_CONFIG.memIron1, 12.42, 1.78, -1.55, -Math.PI / 2, 1.05, 1.38, memGroup);
  mountPhotoFrame(PHOTOS_CONFIG.memIron2, 12.42, 1.78, 1.45, -Math.PI / 2, 1.05, 1.38, memGroup);
  mountPhotoFrame(PHOTOS_CONFIG.memIron3, 8.75, 1.82, -4.18, 0, 1.10, 1.42, memGroup);
  mountPhotoFrame(PHOTOS_CONFIG.memIron4, 8.75, 1.82, 3.92, Math.PI, 1.10, 1.42, memGroup);

  // 2 Realistic 3D Animated Ceiling Fans inside JARVIS MEMORIES
  var memFanRotors = [];
  function createCeilingFan(x, z) {
    var fanG = new THREE.Group();
    fanG.position.set(x, 3.48, z);
    var rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.34, 14), matMetalDark);
    rod.position.y = -0.17;
    fanG.add(rod);
    var canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.06, 20), matObsidian);
    canopy.position.y = -0.03;
    fanG.add(canopy);
    var rotor = new THREE.Group();
    rotor.position.y = -0.35;
    var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.09, 24), matObsidian);
    rotor.add(hub);
    var hubGlow = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.012, 10, 32), matNeonRedLed);
    hubGlow.rotation.x = Math.PI / 2;
    hubGlow.position.y = -0.04;
    rotor.add(hubGlow);
    for (var b = 0; b < 4; b++) {
      var bWrap = new THREE.Group();
      bWrap.rotation.y = (b / 4) * Math.PI * 2;
      var blade = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.014, 0.15), matMetalDark);
      blade.position.set(0.52, 0, 0);
      blade.rotation.x = 0.14;
      bWrap.add(blade);
      var tip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.016, 0.15), matNeonRedLed);
      tip.position.set(0.95, 0, 0);
      tip.rotation.x = 0.14;
      bWrap.add(tip);
      rotor.add(bWrap);
    }
    fanG.add(rotor);
    memGroup.add(fanG);
    memFanRotors.push(rotor);
  }
  createCeilingFan(7.45, -1.25);
  createCeilingFan(10.15, 1.15);

  // Interactive 3D Wall Switch Board inside JARVIS MEMORIES
  var memSwitchBoard = new THREE.Group();
  memSwitchBoard.position.set(4.97, 1.38, -1.12);
  var swPlate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.34, 0.44), matObsidian);
  swPlate.userData = { type: 'mem_switchboard' };
  memSwitchBoard.add(swPlate);
  var swLabelCanvas = document.createElement('canvas');
  swLabelCanvas.width = 256; swLabelCanvas.height = 64;
  var swCtx = swLabelCanvas.getContext('2d');
  swCtx.fillStyle = '#0F1117';
  swCtx.fillRect(0, 0, 256, 64);
  swCtx.fillStyle = '#FF6B81';
  swCtx.font = '700 20px "Space Grotesk", sans-serif';
  swCtx.textAlign = 'center';
  swCtx.fillText('LIGHTS        FANS', 128, 40);
  var swLabelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.08), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(swLabelCanvas) }));
  swLabelMesh.position.set(0.022, 0.11, 0);
  swLabelMesh.rotation.y = Math.PI / 2;
  memSwitchBoard.add(swLabelMesh);

  var swLightMesh = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.11, 0.075), matSilver);
  swLightMesh.position.set(0.026, -0.02, -0.09);
  swLightMesh.rotation.z = -0.25;
  swLightMesh.userData = { type: 'mem_sw_lights' };
  memSwitchBoard.add(swLightMesh);

  var swFanMesh = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.11, 0.075), matSilver);
  swFanMesh.position.set(0.026, -0.02, 0.09);
  swFanMesh.rotation.z = -0.25;
  swFanMesh.userData = { type: 'mem_sw_fans' };
  memSwitchBoard.add(swFanMesh);

  var swLightLedMat = new THREE.MeshBasicMaterial({ color: 0x22C55E });
  var swLightLed = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 12), swLightLedMat);
  swLightLed.position.set(0.024, -0.11, -0.09);
  memSwitchBoard.add(swLightLed);

  var swFanLedMat = new THREE.MeshBasicMaterial({ color: 0x22C55E });
  var swFanLed = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 12), swFanLedMat);
  swFanLed.position.set(0.024, -0.11, 0.09);
  memSwitchBoard.add(swFanLed);
  memGroup.add(memSwitchBoard);

  // Neon Red Glowing Lighting System for JARVIS MEMORIES
  var memRedLight1 = new THREE.PointLight(0xFF1238, 2.2, 11);
  memRedLight1.position.set(7.45, 2.85, -1.25);
  scene.add(memRedLight1);
  var memRedLight2 = new THREE.PointLight(0xFF0A3C, 2.2, 11);
  memRedLight2.position.set(10.15, 2.85, 1.15);
  scene.add(memRedLight2);
  var memRedLight3 = new THREE.PointLight(0xDC0028, 1.45, 10);
  memRedLight3.position.set(11.2, 2.1, -0.1);
  scene.add(memRedLight3);

  var memUnlocked = false;
  var memDoorAngle = 0;
  var memDoorTargetAngle = 0;
  var memLightsOn = true;
  var memFansOn = true;
  var memFanSpeed = 6.8;
  var pendingMemStation = 'memories_center';

  function playSwitchClick(on) {
    ensureAudio();
    if (!audioCtx) return;
    var now = audioCtx.currentTime;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(on ? 720 : 420, now);
    osc.frequency.exponentialRampToValueAtTime(on ? 1100 : 240, now + 0.035);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  function updateMemoriesControlsUI() {
    var lBtn = document.getElementById('sw-lights-btn');
    var fBtn = document.getElementById('sw-fans-btn');
    if (lBtn) {
      lBtn.textContent = memLightsOn ? 'Neon Lights: ON' : 'Neon Lights: OFF';
      lBtn.classList.toggle('on', memLightsOn);
    }
    if (fBtn) {
      fBtn.textContent = memFansOn ? 'Ceiling Fans: ON' : 'Ceiling Fans: OFF';
      fBtn.classList.toggle('on', memFansOn);
    }
    swLightMesh.rotation.z = memLightsOn ? -0.25 : 0.25;
    swFanMesh.rotation.z = memFansOn ? -0.25 : 0.25;
    swLightLedMat.color.setHex(memLightsOn ? 0x22C55E : 0xEF4444);
    swFanLedMat.color.setHex(memFansOn ? 0x22C55E : 0xEF4444);
    matNeonRedLed.emissiveIntensity = memLightsOn ? 2.3 : 0.08;
  }
  function toggleMemLights() {
    memLightsOn = !memLightsOn;
    playSwitchClick(memLightsOn);
    updateMemoriesControlsUI();
    showStudioToast(memLightsOn ? 'JARVIS Memories Neon Lights ON' : 'JARVIS Memories Neon Lights OFF');
  }
  function toggleMemFans() {
    memFansOn = !memFansOn;
    playSwitchClick(memFansOn);
    updateMemoriesControlsUI();
    showStudioToast(memFansOn ? 'Ceiling Fans ON' : 'Ceiling Fans OFF');
  }
  document.getElementById('sw-lights-btn').addEventListener('click', toggleMemLights);
  document.getElementById('sw-fans-btn').addEventListener('click', toggleMemFans);
  document.getElementById('sw-close-btn').addEventListener('click', function () {
    document.getElementById('mem-switch-bar').classList.remove('open');
  });

  // Passcode Modal Logic (2408)
  var passEntered = '';
  function updatePassDots() {
    var dots = document.querySelectorAll('#pass-dots .pass-dot');
    dots.forEach(function (d, i) { d.classList.toggle('filled', i < passEntered.length); });
  }
  var memAutoLockTimer = null;
  var passMode = 'enter'; // 'enter' or 'exit'
  function isMemoriesStation(k) {
    return (k === 'memories_center' || k === 'memories_switches' || k === 'memories_gallery');
  }
  function scheduleMemAutoLock() {
    clearTimeout(memAutoLockTimer);
    memAutoLockTimer = setTimeout(function () {
      memUnlocked = false;
      memDoorTargetAngle = 0;
      memLockLedMat.color.setHex(0xFF1744);
      memInsideLockLedMat.color.setHex(0xFF1744);
      playSwitchClick(false);
      showStudioToast(isMemoriesStation(currentStation)
        ? 'Door auto-locked — enter 2408 to exit'
        : 'JARVIS Memories door auto-locked');
    }, 1150);
  }
  function openPasscodeModal(targetStation, mode) {
    pendingMemStation = targetStation || 'memories_center';
    passMode = mode || (isMemoriesStation(currentStation) ? 'exit' : 'enter');
    passEntered = '';
    updatePassDots();
    var badgeEl = document.getElementById('pass-badge');
    var subEl = document.getElementById('pass-subtitle');
    if (passMode === 'exit') {
      if (badgeEl) badgeEl.textContent = 'EXIT LOCKED';
      if (subEl) subEl.textContent = 'Door auto-locked — enter 4-digit passcode to exit';
    } else {
      if (badgeEl) badgeEl.textContent = 'LOCKED ROOM';
      if (subEl) subEl.textContent = 'Enter 4-digit passcode to unlock';
    }
    document.getElementById('pass-status').textContent = '';
    document.getElementById('passcode-modal').classList.add('open');
    playSoftChime(500);
  }
  function closePasscodeModal() {
    document.getElementById('passcode-modal').classList.remove('open');
  }
  document.getElementById('pass-close').addEventListener('click', closePasscodeModal);
  document.getElementById('pass-grid').addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.act === 'clear') {
      passEntered = '';
      updatePassDots();
      document.getElementById('pass-status').textContent = '';
      return;
    }
    if (btn.dataset.act === 'back') {
      passEntered = passEntered.slice(0, -1);
      updatePassDots();
      return;
    }
    if (btn.dataset.num && passEntered.length < 4) {
      passEntered += btn.dataset.num;
      playSwitchClick(true);
      updatePassDots();
      if (passEntered.length === 4) {
        if (passEntered === '2408') {
          memUnlocked = true;
          memLockLedMat.color.setHex(0x22C55E);
          memInsideLockLedMat.color.setHex(0x22C55E);
          memDoorTargetAngle = Math.PI * 0.58;
          document.getElementById('pass-status').style.color = '#4ADE80';
          document.getElementById('pass-status').textContent = (passMode === 'exit')
            ? 'Exit Unlocked · Returning to JARVIS Room'
            : 'Access Granted · Welcome to JARVIS Memories';
          playSoftChime(780);
          setTimeout(function () {
            closePasscodeModal();
            moveToStation(pendingMemStation, false);
            scheduleMemAutoLock();
          }, 520);
        } else {
          document.getElementById('pass-status').style.color = '#FF6B81';
          document.getElementById('pass-status').textContent = 'Incorrect passcode — try again';
          playSoftChime(220);
          var card = document.getElementById('pass-card');
          card.classList.remove('shake');
          void card.offsetWidth;
          card.classList.add('shake');
          setTimeout(function () {
            passEntered = '';
            updatePassDots();
          }, 420);
        }
      }
    }
  });

  /* =========================================================
   * 8. STUDIO LIGHTING & DAY / NIGHT CROSS-FADE
   * ========================================================= */
  var hemiLight = new THREE.HemisphereLight(0xFFF6EB, 0x3D3530, 0.98);
  scene.add(hemiLight);

  var hallLight = new THREE.PointLight(0xFFE7CC, 1.38, 15);
  hallLight.position.set(0, 3.15, 6.6);
  scene.add(hallLight);

  var roomMainLight = new THREE.PointLight(0xFFF1DD, 1.35, 16);
  roomMainLight.position.set(0, 2.95, -0.2);
  roomMainLight.castShadow = true;
  roomMainLight.shadow.mapSize.set(1024, 1024);
  scene.add(roomMainLight);

  var deskLight = new THREE.PointLight(0xFFDFB8, 0.78, 8);
  deskLight.position.set(2.25, 2.3, -2.8);
  scene.add(deskLight);

  var shelfLight = new THREE.PointLight(0xE0F2FE, 0.55, 7);
  shelfLight.position.set(3.2, 2.4, 0.75);
  scene.add(shelfLight);

  var nightAccentLight = new THREE.PointLight(0xE8453C, 0.0, 9);
  nightAccentLight.position.set(-1.6, 1.7, 1.1);
  scene.add(nightAccentLight);

  var orbLight = new THREE.PointLight(0xFF1744, 1.05, 6.2);
  orbLight.position.copy(orbGroup.position);
  scene.add(orbLight);

  var isNight = false;
  var lightTarget = { hemi: 0.98, main: 1.35, hall: 1.25, nightAccent: 0.0, bgR: 0.09, bgG: 0.095, bgB: 0.12 };

  function setNightMode(night) {
    isNight = night;
    if (isNight) {
      lightTarget = { hemi: 0.28, main: 0.42, hall: 0.48, nightAccent: 1.45, bgR: 0.04, bgG: 0.05, bgB: 0.11 };
      document.getElementById('theme-icon').innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    } else {
      lightTarget = { hemi: 0.98, main: 1.35, hall: 1.25, nightAccent: 0.0, bgR: 0.09, bgG: 0.095, bgB: 0.12 };
      document.getElementById('theme-icon').innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    }
    playSoftChime(isNight ? 380 : 620);
  }
  document.getElementById('theme-btn').addEventListener('click', function () { setNightMode(!isNight); updateAmbientTone(); });
  document.getElementById('ambient-btn').addEventListener('click', toggleAmbientSound);
  document.getElementById('snap-btn').addEventListener('click', captureStudioSnapshot);

  /* =========================================================
   * 9. FLOOR TELEPORT DOTS & UNCLAMPED 360° CAMERA
   * ========================================================= */
  var STATIONS = createStations(THREE);

  var dotMeshes = [];
  var dotRings = [];
  function createFloorDot(stationKey, x, z) {
    var ring = new THREE.Mesh(
      new THREE.RingGeometry(0.16, 0.21, 32),
      new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.88, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.028, z);
    scene.add(ring);
    dotRings.push(ring);

    var center = new THREE.Mesh(
      new THREE.CircleGeometry(0.06, 24),
      new THREE.MeshBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
    );
    center.rotation.x = -Math.PI / 2;
    center.position.set(x, 0.030, z);
    scene.add(center);

    var hit = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 12, 12),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hit.position.set(x, 0.18, z);
    hit.userData = { type: 'dot', station: stationKey };
    scene.add(hit);
    dotMeshes.push(hit);
  }

  createFloorDot('entrance', 0, 5.45);
  createFloorDot('assistant', -0.20, 0.55);
  createFloorDot('desk', 2.25, -1.25);
  createFloorDot('bookshelf', 2.35, 0.75);
  createFloorDot('whiteboard', -2.75, -1.85);
  createFloorDot('memories_door', 3.15, -2.15);
  createFloorDot('memories_center', 7.65, -0.25);
  createFloorDot('memories_switches', 6.30, -1.12);
  createFloorDot('memories_gallery', 10.35, -0.10);

  var currentStation = 'entrance';
  var isInsideRoom = false;
  var doorTargetAngle = 0;
  var doorAngle = 0;

  var camPos = STATIONS.entrance.pos.clone();
  var camTargetPos = STATIONS.entrance.pos.clone();
  var yaw = 0;
  var targetYaw = 0;
  var pitch = 0;
  var targetPitch = 0;

  function getTargetFov(stationKey) {
    var aspect = window.innerWidth / Math.max(window.innerHeight, 1);
    if (stationKey === 'entrance') {
      if (aspect < 0.72) return 82;
      if (aspect < 1.0) return 74;
      if (aspect < 1.35) return 66;
      return 62;
    }
    return aspect < 0.8 ? 64 : 58;
  }
  var targetFov = getTargetFov('entrance');
  camera.fov = targetFov;
  camera.updateProjectionMatrix();
  camera.position.copy(camPos);
  camera.rotation.order = 'YXZ';
  pitch = STATIONS.entrance.pitch;
  targetPitch = STATIONS.entrance.pitch;

  /* =========================================================
   * 9B. REAL 8-SECOND CINEMA VIDEO SCROLL & AUTO-FLY INTRO
   * Embedded fast-scrubbing MP4 with wind audio -> JARVIS ROOM Door
   * ========================================================= */
  var introVideo = document.getElementById('intro-video');
  var INTRO_VIDEO_SRC = studioConfig.introVideo.src;
  var introActive = true;
  var introProgress = 0.0;
  var introTargetProgress = 0.0;
  var introAutoFlying = false;
  var introDuration = 8.0;

  if (introVideo) {
    introVideo.src = INTRO_VIDEO_SRC;
    introVideo.load();
    introVideo.addEventListener('loadedmetadata', function () {
      if (introVideo.duration && isFinite(introVideo.duration)) introDuration = introVideo.duration;
      try { introVideo.currentTime = 0.01; } catch (e) {}
    });
    introVideo.addEventListener('ended', function () {
      if (introActive) finishMountainIntro();
    });
  }

  // Position 3D camera cleanly at the wide JARVIS ROOM door entrance behind the intro video
  camPos.copy(STATIONS.entrance.pos);
  camTargetPos.copy(STATIONS.entrance.pos);
  yaw = 0; targetYaw = 0;
  pitch = STATIONS.entrance.pitch; targetPitch = STATIONS.entrance.pitch;
  targetFov = getTargetFov('entrance');
  camera.fov = targetFov;
  camera.updateProjectionMatrix();
  camera.position.copy(camPos);
  camera.rotation.set(pitch, yaw, 0, 'YXZ');

  function playPortalTransitionSound() {
    ensureAudio();
    if (!audioCtx) return;
    var now = audioCtx.currentTime;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.35);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.72);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    var panner = audioEngine.createSpatialPanner(audioCtx, camPos);
    if (panner) { osc.connect(panner); panner.connect(gain); } else { osc.connect(gain); }
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.78);
  }

  function finishMountainIntro() {
    if (!introActive) return;
    introActive = false;
    introAutoFlying = false;
    introProgress = 1.0;
    introTargetProgress = 1.0;
    document.getElementById('intro-hud').classList.add('hidden');
    playPortalTransitionSound();
    portalEffects.trigger();

    // Cinematic cyan portal flash + zoom through the glowing cliffside doorway into the 3D JARVIS ROOM hallway
    var portal = document.getElementById('portal-transition');
    if (portal) portal.style.opacity = '0.94';
    if (introVideo) {
      try { introVideo.pause(); } catch (e) {}
      introVideo.style.transition = 'opacity 0.55s ease, transform 0.65s cubic-bezier(0.22,1,0.36,1), filter 0.55s ease';
      introVideo.style.transform = 'scale(1.38)';
      introVideo.style.filter = 'blur(6px) brightness(1.35)';
      introVideo.style.opacity = '0';
    }
    // Start 3D entrance camera slightly further back and smoothly glide forward as the portal clears
    camPos.set(0, 1.66, 9.25);
    camTargetPos.copy(STATIONS.entrance.pos);

    setTimeout(function () {
      if (introVideo) introVideo.style.display = 'none';
      if (portal) portal.style.opacity = '0';
      document.getElementById('door-label').textContent = 'KNOCK ON THE DOOR';
      document.getElementById('door-prompt').classList.remove('hidden');
    }, 460);
  }

  function startAutoFly() {
    if (!introActive || !introVideo) return;
    unlockSpeech();
    ensureAudio();
    introAutoFlying = true;
    introVideo.muted = false;
    introVideo.volume = 1.0;
    var p = introVideo.play();
    if (p && p.catch) {
      p.catch(function () {
        introVideo.muted = true;
        introVideo.play().catch(function () {});
      });
    }
    var btn = document.getElementById('intro-autofly');
    if (btn) btn.textContent = 'Flying...';
  }
  document.getElementById('intro-autofly').addEventListener('click', startAutoFly);
  document.getElementById('intro-skip').addEventListener('click', function () {
    unlockSpeech();
    finishMountainIntro();
  });

  // Scroll wheel scrubs the 8-second mountain flight video smoothly
  window.addEventListener('wheel', function (e) {
    if (!introActive) return;
    e.preventDefault();
    if (introAutoFlying && introVideo) {
      introAutoFlying = false;
      try { introVideo.pause(); } catch (err) {}
    }
    var delta = e.deltaY * 0.00055;
    introTargetProgress = Math.max(0, Math.min(1, introTargetProgress + delta));
  }, { passive: false });

  // Mobile vertical touch swipe scrubs the 8-second video smoothly
  var introTouchY = null;
  window.addEventListener('touchstart', function (e) {
    if (!introActive || !e.touches.length) return;
    if (e.target.closest('#intro-hud')) return;
    introTouchY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    if (!introActive || introTouchY === null || !e.touches.length) return;
    var dy = introTouchY - e.touches[0].clientY;
    introTouchY = e.touches[0].clientY;
    if (introAutoFlying && introVideo) {
      introAutoFlying = false;
      try { introVideo.pause(); } catch (err) {}
    }
    introTargetProgress = Math.max(0, Math.min(1, introTargetProgress + dy * 0.0022));
  }, { passive: true });
  window.addEventListener('touchend', function () { introTouchY = null; }, { passive: true });

  var isWhiteboardMode = false;
  var activeColor = '#1E293B';

  var hintTimer = null;
  function showSequentialHints() {
    var pill = document.getElementById('hint-pill');
    var title = document.getElementById('hint-title');
    var sub = document.getElementById('hint-sub');
    clearTimeout(hintTimer);
    title.textContent = 'Drag to look 360° around';
    sub.textContent = 'Tap the floor circles to move';
    pill.classList.add('visible');
    hintTimer = setTimeout(function () {
      title.textContent = 'Tap objects or ask JARVIS';
      sub.textContent = 'Desk screens, whiteboard & floor dots work';
      hintTimer = setTimeout(function () {
        pill.classList.remove('visible');
      }, 4200);
    }, 3800);
  }

  function moveToStation(key, openAssistant) {
    var fromMem = isMemoriesStation(currentStation);
    var toMem = isMemoriesStation(key);
    // Crossing into OR out of JARVIS MEMORIES requires unlocking with 2408!
    if (fromMem !== toMem && !memUnlocked) {
      openPasscodeModal(key, fromMem ? 'exit' : 'enter');
      return;
    }
    var st = STATIONS[key];
    if (!st) return;
    if (key !== currentStation) portalEffects.trigger();
    if (fromMem !== toMem && memUnlocked) {
      memDoorTargetAngle = Math.PI * 0.58;
      scheduleMemAutoLock();
    }
    currentStation = key;
    targetFov = getTargetFov(key);
    camTargetPos.copy(st.pos);

    var diff = st.yaw - targetYaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    targetYaw += diff;
    targetPitch = st.pitch;

    isWhiteboardMode = (key === 'whiteboard');
    document.getElementById('board-bar').classList.toggle('open', isWhiteboardMode);
    var inMemories = (key === 'memories_center' || key === 'memories_switches' || key === 'memories_gallery');
    document.getElementById('mem-switch-bar').classList.toggle('open', inMemories);

    if (key === 'entrance') {
      isInsideRoom = false;
      doorTargetAngle = 0;
      document.getElementById('assistant-card').classList.remove('open');
      stopJarvisVoice();
      document.getElementById('hint-pill').classList.remove('visible');
      setTimeout(function () {
        document.getElementById('door-label').textContent = 'KNOCK ON THE DOOR';
        document.getElementById('door-prompt').classList.remove('hidden');
      }, 650);
    } else {
      isInsideRoom = true;
      document.getElementById('door-prompt').classList.add('hidden');
      if (openAssistant) {
        document.getElementById('assistant-card').classList.add('open');
        speakJarvis(assistantMsg.textContent);
      } else if (key !== 'assistant') {
        document.getElementById('assistant-card').classList.remove('open');
        stopJarvisVoice();
      }
    }
    playSoftChime(460);
  }

  function handleDoorKnock() {
    if (isInsideRoom) return;
    unlockSpeech();
    playKnockSound();
    document.getElementById('door-label').textContent = 'COME IN!';
    setTimeout(function () {
      doorTargetAngle = -Math.PI * 0.62;
      document.getElementById('door-prompt').classList.add('hidden');
      setTimeout(function () {
        moveToStation('assistant', true);
        showSequentialHints();
      }, 420);
    }, 520);
  }

  document.getElementById('door-prompt').addEventListener('click', handleDoorKnock);

  /* =========================================================
   * 10. 6-STEP PERSONALIZED ROOM-AWARE ASSISTANT + APK MODALS
   * ========================================================= */
  var assistantMsg = document.getElementById('assistant-msg');
  var assistantChips = document.getElementById('assistant-chips');
  var assistantInput = document.getElementById('assistant-input');
  var stepDots = document.querySelectorAll('#step-dots .step-dot');

  var visitorProfile = { name: '', role: '', goal: '', platform: '', vibe: '' };
  var assistantStep = 0; // 0..5 (6 steps; step 5 = final "Where should we take you?")

  var jarvisVoiceEnabled = true;
  function setOrbSpeaking(speaking) {
    var dot = document.getElementById('assistant-orb-dot');
    if (dot) dot.classList.toggle('speaking', !!speaking);
  }
  var voiceGuide = createVoiceGuide(setOrbSpeaking);
  function stopJarvisVoice() { voiceGuide.stop(); }
  function unlockSpeech() { voiceGuide.unlock(); }
  function speakJarvis(text) { if (jarvisVoiceEnabled) voiceGuide.speak(text); }
  document.getElementById('assistant-voice').addEventListener('click', function () {
    jarvisVoiceEnabled = !jarvisVoiceEnabled;
    var btn = document.getElementById('assistant-voice');
    var icon = document.getElementById('assistant-voice-icon');
    btn.classList.toggle('muted', !jarvisVoiceEnabled);
    if (jarvisVoiceEnabled) {
      icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>';
      showStudioToast('JARVIS voice narration on');
      if (document.getElementById('assistant-card').classList.contains('open')) {
        speakJarvis(assistantMsg.textContent);
      }
    } else {
      icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';
      stopJarvisVoice();
      showStudioToast('JARVIS voice narration muted');
    }
  });

  function renderAssistantStep(step) {
    assistantStep = step;
    stepDots.forEach(function (d, idx) {
      d.classList.toggle('active', idx === step);
    });

    var n = visitorProfile.name || 'friend';
    if (step === 0) {
      assistantMsg.textContent = "Hi! I'm JARVIS, your studio assistant. What's your name?";
      assistantChips.innerHTML = '';
      assistantInput.placeholder = 'Type your name and press enter...';
    } else if (step === 1) {
      assistantMsg.textContent = 'Great to meet you, ' + n + '! Who are you visiting as today?';
      assistantChips.innerHTML =
        '<button class="chip-btn" type="button" data-answer="Developer">Developer</button>' +
        '<button class="chip-btn" type="button" data-answer="Creator">Creator</button>' +
        '<button class="chip-btn" type="button" data-answer="Founder">Founder</button>' +
        '<button class="chip-btn" type="button" data-answer="Student">Student</button>' +
        '<button class="chip-btn" type="button" data-answer="Explorer">Explorer</button>';
      assistantInput.placeholder = 'Or type your role...';
    } else if (step === 2) {
      assistantMsg.textContent = 'Awesome, ' + n + '. What brought you into JARVIS Room?';
      assistantChips.innerHTML =
        '<button class="chip-btn" type="button" data-answer="JARVIS PRO APK">JARVIS PRO APK</button>' +
        '<button class="chip-btn" type="button" data-answer="TIME J APK">TIME J APK</button>' +
        '<button class="chip-btn" type="button" data-answer="3D Web Design">3D Web Design</button>' +
        '<button class="chip-btn" type="button" data-answer="Just Exploring">Just Exploring</button>';
      assistantInput.placeholder = 'Or tell me what you are looking for...';
    } else if (step === 3) {
      assistantMsg.textContent = 'Which platform do you mostly use, ' + n + '?';
      assistantChips.innerHTML =
        '<button class="chip-btn" type="button" data-answer="Android">Android</button>' +
        '<button class="chip-btn" type="button" data-answer="Web & Desktop">Web &amp; Desktop</button>' +
        '<button class="chip-btn" type="button" data-answer="Termux / Linux">Termux / Linux</button>' +
        '<button class="chip-btn" type="button" data-answer="All of them">All of them</button>';
      assistantInput.placeholder = 'Or type your platform...';
    } else if (step === 4) {
      assistantMsg.textContent = 'Quick room vibe check, ' + n + ' — how do you want the studio lighting?';
      assistantChips.innerHTML =
        '<button class="chip-btn" type="button" data-vibe="day">Keep Bright Day Mode</button>' +
        '<button class="chip-btn" type="button" data-vibe="night">Switch to Night Mode</button>';
      assistantInput.placeholder = 'Type day or night...';
    } else {
      assistantMsg.textContent = 'All set, ' + n + '! Where should I take you first?';
      assistantChips.innerHTML =
        '<button class="chip-btn" type="button" data-go="bookshelf">Bookshelf (JARVIS PRO &amp; TIME J)</button>' +
        '<button class="chip-btn" type="button" data-go="desk">Workstation Desk</button>' +
        '<button class="chip-btn" type="button" data-go="whiteboard">Wall Whiteboard</button>' +
        '<button class="chip-btn" type="button" data-go="memories_center">JARVIS Memories (2408)</button>' +
        '<button class="chip-btn" type="button" data-action="theme">Day / Night</button>' +
        '<button class="chip-btn" type="button" data-go="entrance">Exit Room</button>';
      assistantInput.placeholder = 'Ask to go to Desk, Bookshelf, Whiteboard, or Exit...';
    }
    var cardEl = document.getElementById('assistant-card');
    if (cardEl && cardEl.classList.contains('open')) {
      speakJarvis(assistantMsg.textContent);
    }
  }
  renderAssistantStep(0);

  function handleAssistantAnswer(text) {
    var val = (text || '').trim();
    if (!val) return;
    if (assistantStep === 0) {
      visitorProfile.name = val.slice(0, 32);
      playSoftChime(560);
      renderAssistantStep(1);
    } else if (assistantStep === 1) {
      visitorProfile.role = val;
      playSoftChime(580);
      renderAssistantStep(2);
    } else if (assistantStep === 2) {
      visitorProfile.goal = val;
      playSoftChime(600);
      renderAssistantStep(3);
    } else if (assistantStep === 3) {
      visitorProfile.platform = val;
      playSoftChime(620);
      renderAssistantStep(4);
    } else if (assistantStep === 4) {
      var low = val.toLowerCase();
      if (low.indexOf('night') !== -1 || low.indexOf('dark') !== -1) setNightMode(true);
      else if (low.indexOf('day') !== -1 || low.indexOf('bright') !== -1) setNightMode(false);
      visitorProfile.vibe = isNight ? 'night' : 'day';
      renderAssistantStep(5);
    } else {
      runRoomNavigationQuery(val);
    }
  }

  function runRoomNavigationQuery(text) {
    var q = (text || '').toLowerCase().trim();
    var n = visitorProfile.name || 'friend';
    if (!q) return;
    if (q.indexOf('desk') !== -1 || q.indexOf('screen') !== -1 || q.indexOf('monitor') !== -1 || q.indexOf('tablet') !== -1 || q.indexOf('clock') !== -1) {
      assistantMsg.textContent = 'Taking you to the Workstation Desk, ' + n + ' — check the live IST clock and tap any screen.';
      setTimeout(function () { moveToStation('desk', false); }, 650);
    } else if (q.indexOf('book') !== -1 || q.indexOf('shelf') !== -1 || q.indexOf('apk') !== -1 || q.indexOf('jarvis pro') !== -1 || q.indexOf('time j') !== -1) {
      assistantMsg.textContent = 'Heading to the Bookshelf, ' + n + ' — tap the black JARVIS PRO box or the free TIME J box.';
      setTimeout(function () { moveToStation('bookshelf', false); }, 650);
    } else if (q.indexOf('memor') !== -1 || q.indexOf('spider') !== -1 || q.indexOf('2408') !== -1 || q.indexOf('red') !== -1) {
      assistantMsg.textContent = memUnlocked
        ? 'Taking you into JARVIS Memories, ' + n + '.'
        : 'Taking you to JARVIS Memories, ' + n + ' — enter passcode 2408 to unlock.';
      setTimeout(function () { moveToStation('memories_center', false); }, 700);
    } else if (q.indexOf('board') !== -1 || q.indexOf('draw') !== -1 || q.indexOf('write') !== -1) {
      assistantMsg.textContent = 'Opening the Wall Whiteboard, ' + n + ' — drag directly on it to draw.';
      setTimeout(function () { moveToStation('whiteboard', false); }, 650);
    } else if (q.indexOf('exit') !== -1 || q.indexOf('out') !== -1 || q.indexOf('door') !== -1 || q.indexOf('hall') !== -1) {
      assistantMsg.textContent = 'See you soon, ' + n + '! Heading outside and closing the wooden JARVIS Room door.';
      setTimeout(function () { moveToStation('entrance', false); }, 650);
    } else if (q.indexOf('night') !== -1 || q.indexOf('dark') !== -1 || q.indexOf('day') !== -1 || q.indexOf('light') !== -1) {
      setNightMode(!isNight);
      assistantMsg.textContent = isNight ? 'Switched to Night mode, ' + n + '.' : 'Switched to Day mode, ' + n + '.';
    } else {
      assistantMsg.textContent = 'Tell me where to take you, ' + n + ' (Desk, Bookshelf, Whiteboard, or Exit) — or close me and spin 360° from any floor circle.';
    }
    speakJarvis(assistantMsg.textContent);
  }

  document.getElementById('assistant-close').addEventListener('click', function () {
    document.getElementById('assistant-card').classList.remove('open');
    stopJarvisVoice();
  });

  assistantChips.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.answer) {
      handleAssistantAnswer(btn.dataset.answer);
      return;
    }
    if (btn.dataset.vibe) {
      setNightMode(btn.dataset.vibe === 'night');
      renderAssistantStep(5);
      return;
    }
    if (btn.dataset.action === 'theme') {
      setNightMode(!isNight);
      assistantMsg.textContent = isNight ? 'Night mode enabled.' : 'Day mode enabled.';
      speakJarvis(assistantMsg.textContent);
      return;
    }
    if (btn.dataset.go) moveToStation(btn.dataset.go, false);
  });

  document.getElementById('assistant-send').addEventListener('click', function () {
    handleAssistantAnswer(assistantInput.value);
    assistantInput.value = '';
  });
  assistantInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      handleAssistantAnswer(assistantInput.value);
      assistantInput.value = '';
    }
  });

  var checkout = initCheckout(PAYMENT_CONFIG, playSoftChime);
  var openProModal = checkout.openProModal;
  var openTimeJModal = checkout.openTimeJModal;

  /* =========================================================
   * 11. DESK SCREENS & WHITEBOARD TOOLBAR
   * ========================================================= */
  var activeScreenIdx = 0;
  function openScreenModal(idx) {
    activeScreenIdx = (idx + SCREENS_CONFIG.length) % SCREENS_CONFIG.length;
    var item = SCREENS_CONFIG[activeScreenIdx];
    document.getElementById('screen-tag').textContent = item.tag;
    var bodyEl = document.getElementById('screen-body');
    if (item.embed) {
      bodyEl.innerHTML =
        '<div class="screen-embed-wrap">' +
          '<iframe class="screen-iframe" src="' + item.url + '" title="' + item.title + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>' +
          '<div class="screen-link-bar">' +
            '<span class="screen-url-pill">' + item.displayUrl + '</span>' +
            '<a class="screen-open-btn" href="' + item.url + '" target="_blank" rel="noopener noreferrer">' + item.cta + '</a>' +
          '</div>' +
        '</div>';
    } else {
      bodyEl.innerHTML =
        '<div class="screen-social-card">' +
          '<h2>' + item.title + '</h2>' +
          '<p>' + item.body + '</p>' +
          '<div class="screen-url-pill" style="margin-bottom:6px;">' + item.displayUrl + '</div>' +
          '<a class="screen-open-btn' + (item.isIg ? ' ig' : '') + '" href="' + item.url + '" target="_blank" rel="noopener noreferrer">' + item.cta + '</a>' +
        '</div>';
    }
    document.getElementById('screen-modal').classList.add('open');
    playSoftChime(580);
  }
  function closeScreenModal() {
    document.getElementById('screen-modal').classList.remove('open');
    document.getElementById('screen-body').innerHTML = '';
  }
  document.getElementById('screen-close').addEventListener('click', closeScreenModal);
  document.getElementById('screen-back').addEventListener('click', closeScreenModal);
  document.getElementById('screen-prev').addEventListener('click', function () { openScreenModal(activeScreenIdx - 1); });
  document.getElementById('screen-next').addEventListener('click', function () { openScreenModal(activeScreenIdx + 1); });

  document.getElementById('board-bar').addEventListener('click', function (e) {
    var sw = e.target.closest('.swatch');
    if (sw) {
      activeColor = sw.dataset.color;
      document.querySelectorAll('.swatch').forEach(function (el) { el.classList.remove('active'); });
      sw.classList.add('active');
    }
  });
  document.getElementById('board-clear').addEventListener('click', clearWhiteboard);
  document.getElementById('board-undo').addEventListener('click', undoWhiteboard);
  document.getElementById('board-save').addEventListener('click', saveWhiteboardPng);
  document.getElementById('board-exit').addEventListener('click', function () { moveToStation('assistant', false); });

  /* =========================================================
   * 12. 360° DRAG LOOK + RAYCASTING + WHITEBOARD DRAWING
   * ========================================================= */
  var raycaster = new THREE.Raycaster();
  var pointer = new THREE.Vector2();
  var isDragging = false;
  var isDrawing = false;
  var dragDist = 0;
  var lastX = 0;
  var lastY = 0;
  var lastDrawPt = null;

  var interactiveTargets = [doorMesh, orbMesh, scr0, scr1, scr2, wbPlane, jarvisProBox, timeJBox, memDoorMesh, memKeypadMesh, memKeyPadFace, memInsideKeypadMesh, memInsideKeyPadFace, swPlate, swLightMesh, swFanMesh].concat(dotMeshes);

  function setPointer(e) {
    var rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function tryDrawOnBoard(e) {
    if (!isWhiteboardMode) return false;
    setPointer(e);
    raycaster.setFromCamera(pointer, camera);
    var hits = raycaster.intersectObject(wbPlane);
    if (!hits.length || !hits[0].uv) return false;
    var x = hits[0].uv.x * wbCanvas.width;
    var y = (1 - hits[0].uv.y) * wbCanvas.height;
    wbCtx.strokeStyle = activeColor;
    wbCtx.lineWidth = 6;
    wbCtx.lineCap = 'round';
    wbCtx.beginPath();
    if (lastDrawPt) {
      wbCtx.moveTo(lastDrawPt.x, lastDrawPt.y);
      wbCtx.lineTo(x, y);
    } else {
      wbCtx.moveTo(x, y);
      wbCtx.lineTo(x + 0.5, y + 0.5);
    }
    wbCtx.stroke();
    lastDrawPt = { x: x, y: y };
    wbTex.needsUpdate = true;
    return true;
  }

  canvas.addEventListener('pointerdown', function (e) {
    if (introActive) return;
    lastX = e.clientX;
    lastY = e.clientY;
    dragDist = 0;
    if (isWhiteboardMode) {
      pushWbHistory();
      if (tryDrawOnBoard(e)) {
        isDrawing = true;
        return;
      } else {
        wbHistory.pop();
      }
    }
    isDragging = true;
  });

  window.addEventListener('pointermove', function (e) {
    if (isDrawing) {
      tryDrawOnBoard(e);
      return;
    }
    if (!isDragging) return;
    var dx = e.clientX - lastX;
    var dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    dragDist += Math.hypot(dx, dy);

    if (isInsideRoom) {
      targetYaw += dx * 0.0046;
      targetPitch = Math.max(-1.12, Math.min(1.12, targetPitch + dy * 0.0038));
    } else {
      targetYaw = Math.max(-0.42, Math.min(0.42, targetYaw + dx * 0.0025));
      targetPitch = Math.max(-0.25, Math.min(0.25, targetPitch + dy * 0.0022));
    }
  });

  window.addEventListener('pointerup', function (e) {
    isDrawing = false;
    lastDrawPt = null;
    if (!isDragging) return;
    isDragging = false;
    if (dragDist > 8) return;

    setPointer(e);
    raycaster.setFromCamera(pointer, camera);
    var hits = raycaster.intersectObjects(interactiveTargets, false);
    if (!hits.length) return;
    var data = hits[0].object.userData;
    if (data.type === 'door') {
      if (!isInsideRoom) handleDoorKnock();
      else moveToStation('entrance', false);
    } else if (data.type === 'dot') {
      if (data.station === 'entrance' && !isInsideRoom) return;
      if (data.station !== 'entrance' && !isInsideRoom) { handleDoorKnock(); return; }
      moveToStation(data.station, data.station === 'assistant');
    } else if (data.type === 'assistant' && isInsideRoom) {
      unlockSpeech();
      var cardEl = document.getElementById('assistant-card');
      var isSpeakingNow = ('speechSynthesis' in window) && window.speechSynthesis.speaking;
      if (cardEl.classList.contains('open') && isSpeakingNow) {
        stopJarvisVoice();
        showStudioToast('JARVIS narration stopped');
      } else {
        cardEl.classList.add('open');
        speakJarvis(assistantMsg.textContent);
      }
      playSoftChime(540);
    } else if ((data.type === 'mem_door' || data.type === 'mem_keypad') && isInsideRoom) {
      if (isMemoriesStation(currentStation)) {
        if (!memUnlocked) openPasscodeModal('memories_door', 'exit');
        else moveToStation('memories_door', false);
      } else {
        if (!memUnlocked) openPasscodeModal('memories_center', 'enter');
        else moveToStation('memories_center', false);
      }
    } else if (data.type === 'mem_sw_lights' && isInsideRoom) {
      toggleMemLights();
      document.getElementById('mem-switch-bar').classList.add('open');
    } else if (data.type === 'mem_sw_fans' && isInsideRoom) {
      toggleMemFans();
      document.getElementById('mem-switch-bar').classList.add('open');
    } else if (data.type === 'mem_switchboard' && isInsideRoom) {
      document.getElementById('mem-switch-bar').classList.add('open');
      playSoftChime(520);
    } else if (data.type === 'screen' && isInsideRoom) {
      openScreenModal(data.index);
    } else if (data.type === 'whiteboard' && isInsideRoom) {
      moveToStation('whiteboard', false);
    } else if (data.type === 'apk-pro' && isInsideRoom) {
      openProModal();
    } else if (data.type === 'apk-timej' && isInsideRoom) {
      openTimeJModal();
    }
  });

  /* =========================================================
   * 13. MOLTEN WAVE PRELOADER REVEAL
   * ========================================================= */
  var waveCanvas = document.getElementById('wave-curtain');
  var wCtx = waveCanvas.getContext('2d');
  var waveProgress = 0;
  var waveActive = false;
  var sparks = [];

  function resizeWave() {
    waveCanvas.width = window.innerWidth;
    waveCanvas.height = window.innerHeight;
  }
  resizeWave();

  function startWaveReveal() {
    waveActive = true;
    waveProgress = 0;
    sparks = [];
    for (var i = 0; i < 65; i++) {
      sparks.push({
        x: Math.random() * waveCanvas.width,
        y: waveCanvas.height + Math.random() * 140,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -2.2 - Math.random() * 3.8,
        size: 1.5 + Math.random() * 3.2,
        alpha: 0.5 + Math.random() * 0.5
      });
    }
  }

  function renderWaveCurtain() {
    if (!waveActive) return;
    waveProgress += 0.018;
    var w = waveCanvas.width;
    var h = waveCanvas.height;
    wCtx.clearRect(0, 0, w, h);

    if (waveProgress >= 1.25) {
      waveActive = false;
      waveCanvas.style.display = 'none';
      return;
    }

    var baseY = h * (1 - waveProgress * 1.15);
    wCtx.beginPath();
    wCtx.moveTo(0, 0);
    wCtx.lineTo(w, 0);
    wCtx.lineTo(w, baseY);
    for (var x = w; x >= 0; x -= 16) {
      var wy = baseY + Math.sin(x * 0.012 + waveProgress * 10) * 22 + Math.cos(x * 0.025) * 10;
      wCtx.lineTo(x, wy);
    }
    wCtx.closePath();
    wCtx.fillStyle = '#000000';
    wCtx.fill();

    wCtx.beginPath();
    for (var x2 = 0; x2 <= w; x2 += 12) {
      var wy2 = baseY + Math.sin(x2 * 0.012 + waveProgress * 10) * 22 + Math.cos(x2 * 0.025) * 10;
      if (x2 === 0) wCtx.moveTo(x2, wy2); else wCtx.lineTo(x2, wy2);
    }
    wCtx.strokeStyle = '#FF8A3D';
    wCtx.lineWidth = 6;
    wCtx.shadowColor = '#E86A33';
    wCtx.shadowBlur = 24;
    wCtx.stroke();
    wCtx.shadowBlur = 0;

    sparks.forEach(function (sp) {
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.alpha *= 0.985;
      wCtx.fillStyle = 'rgba(255, 176, 103,' + sp.alpha.toFixed(2) + ')';
      wCtx.fillRect(sp.x, sp.y, sp.size, sp.size);
    });
  }

  setTimeout(function () { document.getElementById('load-fill').style.width = '55%'; }, 120);
  setTimeout(function () { document.getElementById('load-fill').style.width = '100%'; }, 420);
  setTimeout(function () {
    document.getElementById('preloader').classList.add('hidden');
    startWaveReveal();
  }, 680);

  /* =========================================================
   * 14. MAIN RENDER LOOP
   * ========================================================= */
  var clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();
    if (arcReactorShaderEffect) arcReactorShaderEffect.update(t);

    if (introActive) {
      if (introAutoFlying && introVideo) {
        introProgress = introDuration > 0 ? Math.min(1, introVideo.currentTime / introDuration) : 0;
        introTargetProgress = introProgress;
      } else {
        introProgress += (introTargetProgress - introProgress) * 0.14;
        if (introVideo && introVideo.readyState >= 2) {
          var desiredT = Math.max(0.01, Math.min(introDuration - 0.04, introProgress * introDuration));
          if (Math.abs(introVideo.currentTime - desiredT) > 0.018) {
            try { introVideo.currentTime = desiredT; } catch (e) {}
          }
        }
      }
      var clampedP = Math.max(0, Math.min(1.0, introProgress));
      // Smooth push-in zoom & cross-dissolve into the 3D JARVIS ROOM door in final 10%
      if (introVideo) {
        if (clampedP > 0.89) {
          var fadeT = (clampedP - 0.89) / 0.11;
          introVideo.style.opacity = String(Math.max(0, 1 - fadeT));
          introVideo.style.transform = 'scale(' + (1 + fadeT * 0.16).toFixed(3) + ')';
        } else {
          introVideo.style.opacity = '1';
          introVideo.style.transform = 'scale(1)';
        }
      }
      var fillEl = document.getElementById('intro-fill');
      if (fillEl) fillEl.style.width = Math.round(clampedP * 100) + '%';

      if (clampedP >= 0.992) {
        finishMountainIntro();
      }
    } else {
      camPos.lerp(camTargetPos, 0.075);
      camera.position.copy(camPos);
      if (Math.abs(camera.fov - targetFov) > 0.05) { camera.fov += (targetFov - camera.fov) * 0.08; camera.updateProjectionMatrix(); }
      yaw += (targetYaw - yaw) * 0.11;
      pitch += (targetPitch - pitch) * 0.11;
      camera.rotation.y = yaw;
      camera.rotation.x = pitch;
    }

    doorAngle += (doorTargetAngle - doorAngle) * 0.09;
    doorPivot.rotation.y = doorAngle;
    memDoorAngle += (memDoorTargetAngle - memDoorAngle) * 0.08;
    memDoorPivot.rotation.y = memDoorAngle;
    var targetFanSpeed = memFansOn ? 6.8 : 0.0;
    memFanSpeed += (targetFanSpeed - memFanSpeed) * 0.04;
    if (memFanSpeed > 0.005) {
      for (var fi = 0; fi < memFanRotors.length; fi++) {
        memFanRotors[fi].rotation.y += memFanSpeed * 0.016;
      }
    }
    var targetMemLight = memLightsOn ? (2.15 + Math.sin(t * 2.4) * 0.18) : 0.08;
    memRedLight1.intensity += (targetMemLight - memRedLight1.intensity) * 0.08;
    memRedLight2.intensity += (targetMemLight - memRedLight2.intensity) * 0.08;
    memRedLight3.intensity += ((memLightsOn ? 1.45 : 0.05) - memRedLight3.intensity) * 0.08;

    hemiLight.intensity += (lightTarget.hemi - hemiLight.intensity) * 0.06;
    roomMainLight.intensity += (lightTarget.main - roomMainLight.intensity) * 0.06;
    hallLight.intensity += (lightTarget.hall - hallLight.intensity) * 0.06;
    nightAccentLight.intensity += (lightTarget.nightAccent - nightAccentLight.intensity) * 0.06;
    scene.background.r += (lightTarget.bgR - scene.background.r) * 0.06;
    scene.background.g += (lightTarget.bgG - scene.background.g) * 0.06;
    scene.background.b += (lightTarget.bgB - scene.background.b) * 0.06;

    orbGroup.position.y = 1.24 + Math.sin(t * 2.2) * 0.055;
    orbGroup.lookAt(camera.position.x, orbGroup.position.y, camera.position.z);
    if (typeof arcRotor !== 'undefined') {
      arcRotor.rotation.y = t * 0.65;
      arcRotor.position.y = 1.48 + Math.sin(t * 1.8) * 0.04;
    }
    if (typeof doomCrystal !== 'undefined') {
      doomCrystal.rotation.y = t * 0.9;
      doomCrystal.rotation.x = Math.sin(t * 0.7) * 0.25;
      doomCrystal.position.y = 1.54 + Math.sin(t * 2.1 + 1.0) * 0.045;
      doomRingA.rotation.z = t * 0.85;
      doomRingA.rotation.y = t * 0.45;
      doomRingB.rotation.z = -t * 0.6;
      doomRingB.rotation.x = -0.55 + Math.cos(t * 0.5) * 0.2;
    }
    if (typeof holoGlobe !== 'undefined') {
      holoGlobe.rotation.y = t * 0.45;
      holoGlobe.position.y = 1.38 + Math.sin(t * 1.6 + 2.0) * 0.035;
      holoOrbit.rotation.z = t * 0.75;
    }
    var blink = (Math.sin(t * 1.4) > 0.96) ? 0.12 : 1.0;
    eyeL.scale.y = blink;
    eyeR.scale.y = blink;
    var pulse = 1 + Math.sin(t * 3.0) * 0.10;
    haloRing.scale.set(pulse, pulse, 1);

    dotRings.forEach(function (ring, idx) {
      var s = 1 + Math.sin(t * 2.6 + idx) * 0.08;
      ring.scale.set(s, s, 1);
    });

    renderWaveCurtain();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    targetFov = getTargetFov(currentStation);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    resizeWave();
  });
})();
