export function createAudioEngine() {
  let context = null;
  function unlock() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!context) context = new AudioContextClass();
    if (context.state === 'suspended') context.resume().catch(() => {});
    return context;
  }
  function createSpatialPanner(audioContext, position) {
    if (!audioContext || typeof audioContext.createPanner !== 'function') return null;
    const panner = audioContext.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 18;
    panner.rolloffFactor = 1.15;
    const x = Number(position.x) || 0;
    const y = Number(position.y) || 0;
    const z = Number(position.z) || 0;
    if (panner.positionX) {
      panner.positionX.value = x; panner.positionY.value = y; panner.positionZ.value = z;
    } else panner.setPosition(x, y, z);
    return panner;
  }
  return { unlock, getContext: () => context, createSpatialPanner };
}
