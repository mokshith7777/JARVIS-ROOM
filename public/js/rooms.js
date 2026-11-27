export function createStations(THREE) {
  return {
    entrance: { pos: new THREE.Vector3(0, 1.64, 8.35), yaw: 0, pitch: 0.035 },
    assistant: { pos: new THREE.Vector3(-0.20, 1.54, 0.55), yaw: 0.68, pitch: -0.08 },
    desk: { pos: new THREE.Vector3(2.25, 1.52, -1.25), yaw: 0, pitch: -0.10 },
    bookshelf: { pos: new THREE.Vector3(2.35, 1.52, 0.75), yaw: -Math.PI / 2, pitch: -0.05 },
    whiteboard: { pos: new THREE.Vector3(-2.75, 1.66, -1.85), yaw: Math.PI / 2, pitch: 0 },
    memories_door: { pos: new THREE.Vector3(3.15, 1.54, -2.15), yaw: -Math.PI / 2, pitch: 0.02 },
    memories_center: { pos: new THREE.Vector3(7.65, 1.56, -0.25), yaw: -Math.PI / 2, pitch: 0 },
    memories_switches: { pos: new THREE.Vector3(6.30, 1.50, -1.12), yaw: Math.PI / 2, pitch: -0.04 },
    memories_gallery: { pos: new THREE.Vector3(10.35, 1.56, -0.10), yaw: -Math.PI / 2, pitch: 0.02 }
  };
}
