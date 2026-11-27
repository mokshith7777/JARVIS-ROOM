export function createVoiceGuide(onSpeaking = () => {}) {
  let preferredVoice = null;
  let speechUnlocked = false;
  const preferences = ['Google UK English Male', 'Google US English', 'Daniel', 'Samantha', 'Microsoft Guy', 'Microsoft Aria'];
  function pickVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;
    for (const preferred of preferences) {
      const match = voices.find(voice => voice.name && voice.name.includes(preferred));
      if (match) return match;
    }
    return voices.find(voice => voice.lang && voice.lang.toLowerCase().startsWith('en')) || voices[0];
  }
  function refreshVoice() { preferredVoice = pickVoice(); }
  if ('speechSynthesis' in window) {
    refreshVoice();
    window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoice);
    window.speechSynthesis.onvoiceschanged = refreshVoice;
  }
  function stop() {
    onSpeaking(false);
    try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch (error) {}
  }
  function unlock() {
    if (speechUnlocked || !('speechSynthesis' in window)) return;
    speechUnlocked = true;
    try {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      const silent = new SpeechSynthesisUtterance(' ');
      silent.volume = 0; silent.rate = 10;
      window.speechSynthesis.speak(silent);
    } catch (error) {}
  }
  function speak(text) {
    if (!text || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = String(text).replace(/[—·]/g, ', ').replace(/360°/g, '360 degrees');
      const utterance = new SpeechSynthesisUtterance(clean);
      if (!preferredVoice) preferredVoice = pickVoice();
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.lang = (preferredVoice && preferredVoice.lang) || 'en-US';
      utterance.rate = 0.98; utterance.pitch = 0.96; utterance.volume = 1;
      utterance.onstart = () => onSpeaking(true);
      utterance.onend = () => onSpeaking(false);
      utterance.onerror = () => onSpeaking(false);
      window._jarvisUtter = utterance;
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    } catch (error) { onSpeaking(false); }
  }
  return { speak, stop, unlock, refreshVoice };
}
