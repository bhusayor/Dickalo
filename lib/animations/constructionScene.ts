import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/** Coalesce scroll/refresh updates so only the final state reaches the canvas. */
export function createConstructionFrames(
  draw: (progress: number) => void,
  request: (callback: () => void) => number,
  cancel: (id: number) => void,
) {
  let progress = 0;
  let frame: number | undefined;
  let ready = false;
  let disposed = false;

  function flush() {
    if (frame !== undefined) cancel(frame);
    frame = undefined;
    if (ready && !disposed) draw(progress);
  }

  function redraw() {
    if (ready && !disposed && frame === undefined) frame = request(flush);
  }

  return {
    update(value: number) {
      progress = value;
      redraw();
    },
    redraw,
    start() {
      ready = true;
      flush();
    },
    dispose() {
      disposed = true;
      if (frame !== undefined) cancel(frame);
      frame = undefined;
    },
  };
}

type Axis = 'x' | 'y' | 'z';
type GrowingPart = {
  object: THREE.Object3D;
  start: number;
  end: number;
  axis: Axis | 'all';
  position: THREE.Vector3;
  scale: THREE.Vector3;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => value * value * (3 - 2 * value);

/** One persistent model: progress changes geometry, never photographs or opacity. */
export function createConstructionModel() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#c8d7dc');
  scene.fog = new THREE.Fog('#c8d7dc', 48, 130);
  const parts: GrowingPart[] = [];
  const materials: THREE.Material[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const textures: THREE.Texture[] = [];

  const material = (color: string, roughness = 0.8, metalness = 0) => {
    const result = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    materials.push(result);
    return result;
  };
  // Deterministic mineral grain; all textures are local and generated in memory.
  const grain = new Uint8Array(64 * 64 * 4);
  for (let i = 0; i < 64 * 64; i++) {
    const tone = 205 + ((i * 137 + Math.floor(i / 64) * 31) % 50);
    grain.set([tone, tone, tone, 255], i * 4);
  }
  const stoneTexture = new THREE.DataTexture(grain, 64, 64);
  stoneTexture.wrapS = stoneTexture.wrapT = THREE.RepeatWrapping;
  stoneTexture.repeat.set(3, 3);
  stoneTexture.needsUpdate = true;
  textures.push(stoneTexture);

  const limestone = material('#d8c9ab');
  limestone.map = stoneTexture;
  const concrete = material('#a8a391');
  concrete.map = stoneTexture;
  const plaster = material('#eee8d7');
  const bronze = material('#323c35', 0.35, 0.65);
  const earth = material('#887b63');
  const path = material('#c7bfa6');
  const wood = material('#866247');
  const green = material('#385b33');
  const lightGreen = material('#66864a');
  const lawn = material('#61774a');
  const glass = material('#3e6261', 0.15, 0.65);
  const water = material('#447a78', 0.13, 0.5);
  const warm = material('#ffe2a1');
  warm.emissive = new THREE.Color('#ffb653');
  warm.emissiveIntensity = 0;

  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const sphereGeometry = new THREE.IcosahedronGeometry(1, 2);
  const trunkGeometry = new THREE.CylinderGeometry(0.08, 0.14, 1, 7);
  const leafGeometry = new THREE.SphereGeometry(1, 8, 5);
  geometries.push(boxGeometry, sphereGeometry, trunkGeometry, leafGeometry);

  function box(
    size: [number, number, number],
    position: [number, number, number],
    surface: THREE.Material,
    parent: THREE.Object3D = scene,
  ) {
    const mesh = new THREE.Mesh(boxGeometry, surface);
    mesh.scale.set(...size);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function grow(object: THREE.Object3D, start: number, end: number, axis: Axis | 'all' = 'y') {
    parts.push({
      object,
      start,
      end,
      axis,
      position: object.position.clone(),
      scale: object.scale.clone(),
    });
    return object;
  }

  const ambient = new THREE.HemisphereLight('#e5efff', '#82745b', 2.5);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight('#ffecd0', 3.4);
  sun.position.set(-12, 22, 15);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -24;
  sun.shadow.camera.right = 24;
  sun.shadow.camera.top = 24;
  sun.shadow.camera.bottom = -24;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);

  box([200, 0.2, 200], [0, -0.8, 0], material('#b2b5a0'));
  box([25, 0.5, 19], [0, -0.45, 0], earth);
  // A foundation stays visible from the first frame, with reinforcement in place.
  box([14, 0.22, 8], [1, -0.03, -1], concrete);
  for (let x = -5.7; x < 8; x += 0.65) box([0.025, 0.028, 7.8], [x, 0.095, -1], bronze);
  for (let z = -4.8; z < 3; z += 0.65) box([13.8, 0.028, 0.025], [1, 0.1, z], bronze);
  grow(box([14.4, 0.25, 8.4], [1, 0.26, -1], limestone), 0, 0.14, 'x');
  // Ground-floor frame: exposed columns precede the slabs and wall panels.
  const columnXs = [-5.6, -1.6, 2.5, 7.6];
  for (const [i, x] of columnXs.entries()) {
    for (const z of [-4.6, 2.6]) {
      grow(box([0.32, 3.4, 0.32], [x, 2.06, z], concrete), 0.1 + i * 0.018, 0.29 + i * 0.018);
      grow(box([0.85, 0.18, 0.85], [x, 0.14, z], concrete), 0, 0.09);
    }
  }
  for (const z of [-4.6, 2.6]) {
    grow(box([13.8, 0.4, 0.36], [1, 3.63, z], concrete), 0.24, 0.38, 'x');
  }
  for (const x of columnXs) {
    grow(box([0.36, 0.4, 7.5], [x, 3.63, -1], concrete), 0.25, 0.4, 'z');
  }
  grow(box([15.2, 0.38, 9.1], [1, 3.98, -1], plaster), 0.32, 0.47, 'x');
  // An offset upper storey creates a shaded terrace beneath the cantilever.
  for (const [i, x] of [-0.8, 3.2, 7.5].entries()) {
    for (const z of [-4.3, 1.8]) {
      grow(box([0.28, 3, 0.28], [x, 5.67, z], concrete), 0.4 + i * 0.015, 0.55 + i * 0.015);
    }
  }
  grow(box([9.6, 0.32, 7.4], [3.3, 7.32, -1.1], plaster), 0.53, 0.67, 'x');
  grow(box([9.2, 0.45, 0.22], [3.3, 7.62, -4.65], plaster), 0.6, 0.7, 'x');
  grow(box([0.28, 3.2, 7.5], [7.6, 2.01, -1], limestone), 0.35, 0.57);
  grow(box([13.5, 3.2, 0.28], [1, 2.01, -4.6], plaster), 0.36, 0.58);
  grow(box([0.28, 3.2, 7.5], [-5.6, 2.01, -1], plaster), 0.39, 0.6);
  grow(box([9, 2.95, 0.25], [3.3, 5.64, -4.3], limestone), 0.51, 0.69);
  grow(box([0.3, 2.95, 6.4], [7.6, 5.64, -1.1], limestone), 0.52, 0.7);
  grow(box([0.3, 2.95, 6.4], [-0.8, 5.64, -1.1], plaster), 0.54, 0.72);
  // Stone stair tower and distinct facade joints add depth to the final elevation.
  grow(box([1.6, 6.9, 1.3], [5.9, 3.8, 1.9], limestone), 0.47, 0.72);
  for (let y = 0.8; y < 7.1; y += 0.46) {
    grow(box([1.61, 0.018, 0.016], [5.9, y, 2.558], path), 0.68, 0.77, 'x');
  }
  // Glazing rises into the existing openings, then mullions and timber fins follow.
  for (let x = -4.8; x < 5.2; x += 1.4) {
    grow(box([1.32, 2.85, 0.08], [x, 1.98, 2.58], glass), 0.65, 0.8);
    grow(box([0.045, 2.92, 0.14], [x - 0.67, 2.0, 2.6], bronze), 0.68, 0.81);
  }
  for (let x = -0.12; x < 5.3; x += 1.3) {
    grow(box([1.24, 2.62, 0.08], [x, 5.64, 1.85], glass), 0.68, 0.83);
    grow(box([0.045, 2.7, 0.14], [x - 0.63, 5.65, 1.9], bronze), 0.7, 0.84);
  }
  for (let x = 6.15; x < 7.7; x += 0.22) {
    grow(box([0.08, 2.95, 0.25], [x, 5.64, 2.1], wood), 0.7, 0.85);
  }
  // Terrace, garden steps, railings and a reflecting pool are built in the same scene.
  grow(box([16, 0.2, 2.4], [1, 0.2, 4.1], limestone), 0.74, 0.85, 'x');
  for (let i = 0; i < 3; i++) {
    grow(box([4.2, 0.12, 0.6], [-3.5, 0.1 - i * 0.1, 5.5 + i * 0.6], path), 0.77, 0.88, 'x');
  }
  grow(box([4.7, 0.9, 0.06], [-3.45, 4.65, 2.8], glass), 0.75, 0.87);
  grow(box([4.9, 0.04, 0.07], [-3.45, 5.12, 2.8], bronze), 0.77, 0.88, 'x');
  grow(box([8, 0.16, 3.4], [4.8, -0.08, 6.6], limestone), 0.8, 0.89, 'x');
  grow(box([7.5, 0.04, 2.9], [4.8, 0.02, 6.6], water), 0.86, 0.97, 'x');
  grow(box([24, 0.05, 5.5], [0, -0.17, -7], lawn), 0.82, 0.98, 'x');
  grow(box([4, 0.05, 13], [-10, -0.17, 2.3], lawn), 0.82, 0.98, 'z');

  function shrub(x: number, z: number, size: number, start: number) {
    const plant = new THREE.Group();
    plant.position.set(x, -0.14, z);
    for (let i = 0; i < 4; i++) {
      const mesh = new THREE.Mesh(sphereGeometry, i % 2 ? green : lightGreen);
      mesh.scale.set(size * 0.65, size * (0.6 + i * 0.07), size * 0.6);
      mesh.position.set(Math.cos(i * 2.4) * size * 0.3, size * 0.5, Math.sin(i * 2.4) * size * 0.3);
      mesh.castShadow = true;
      plant.add(mesh);
    }
    scene.add(plant);
    grow(plant, start, Math.min(1, start + 0.14), 'all');
  }
  for (let i = 0; i < 14; i++) shrub(-9.2 + i * 1.4, -6.1, 0.7, 0.83 + (i % 4) * 0.01);
  for (let i = 0; i < 7; i++) shrub(10, -3 + i * 1.6, 0.85, 0.85 + (i % 3) * 0.01);

  function palm(x: number, z: number, height: number, animate: boolean) {
    const plant = new THREE.Group();
    plant.position.set(x, -0.15, z);
    const trunk = new THREE.Mesh(trunkGeometry, wood);
    trunk.scale.y = height;
    trunk.position.y = height / 2;
    trunk.castShadow = true;
    plant.add(trunk);
    for (let i = 0; i < 9; i++) {
      const frond = new THREE.Mesh(leafGeometry, i % 2 ? green : lightGreen);
      const angle = (i / 9) * Math.PI * 2;
      frond.scale.set(0.3, 0.1, 1.8);
      frond.rotation.set(0.24, angle, 0);
      frond.position.set(Math.sin(angle) * 1.15, height + 0.15, Math.cos(angle) * 1.15);
      frond.castShadow = true;
      plant.add(frond);
    }
    scene.add(plant);
    if (animate) grow(plant, 0.84, 1, 'all');
  }
  palm(-9, -4, 5.5, true);
  palm(11, -4, 6.8, true);
  palm(10.5, 4, 5, true);
  // Existing boundary vegetation anchors the view throughout construction.
  for (let i = 0; i < 12; i++) palm(-24 + i * 4.4, -19 - (i % 3) * 2, 4 + (i % 4), false);

  const lights = [
    grow(box([11, 0.05, 0.05], [0.4, 3.67, 2.4], warm), 0.84, 0.94, 'x'),
    grow(box([6.3, 0.04, 0.05], [2.3, 7.11, 1.75], warm), 0.85, 0.95, 'x'),
  ];
  lights.forEach((mesh) => {
    mesh.castShadow = false;
  });
  const interiorLight = new THREE.PointLight('#ffc77b', 0, 16, 2);
  interiorLight.position.set(1, 2.5, 3.5);
  scene.add(interiorLight);

  function setProgress(progress: number) {
    const p = clamp(progress);
    for (const part of parts) {
      const amount = smooth(clamp((p - part.start) / (part.end - part.start)));
      part.object.visible = amount > 0;
      part.object.position.copy(part.position);
      part.object.scale.copy(part.scale);
      if (part.axis === 'all') {
        part.object.scale.multiplyScalar(amount);
      } else {
        part.object.scale[part.axis] = part.scale[part.axis] * amount;
        part.object.position[part.axis] -= (part.scale[part.axis] * (1 - amount)) / 2;
      }
    }
    const life = smooth(clamp((p - 0.82) / 0.18));
    warm.emissiveIntensity = life * 3;
    interiorLight.intensity = life * 18;
    sun.intensity = 3.4 + life * 0.6;
  }
  setProgress(0);

  return {
    scene,
    parts,
    setProgress,
    dispose() {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((surface) => surface.dispose());
      textures.forEach((texture) => texture.dispose());
      sun.shadow.dispose();
      scene.clear();
    },
  };
}

/** Camera framing changes only on resize, never with construction progress. */
export function frameConstructionCamera(
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number,
) {
  camera.aspect = width / height;
  if (camera.aspect < 0.8) {
    const distance = Math.max(1, 0.6 / camera.aspect);
    camera.position.set(29 * distance, 24 * distance, 39 * distance);
    camera.lookAt(1, 1.6, 0);
  } else {
    camera.position.set(23, 15, 27);
    camera.lookAt(-2.8, 2.3, 0);
  }
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
}

export function mountConstructionScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const model = createConstructionModel();
  const environmentSource = new RoomEnvironment();
  const environmentGenerator = new THREE.PMREMGenerator(renderer);
  const environment = environmentGenerator.fromScene(environmentSource, 0.04);
  model.scene.environment = environment.texture;
  model.scene.environmentIntensity = 0.55;
  environmentSource.dispose();
  environmentGenerator.dispose();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 160);
  let disposed = false;
  let width = 0;
  let height = 0;

  function resizeBuffer() {
    const nextWidth = canvas.clientWidth;
    const nextHeight = canvas.clientHeight;
    if (!nextWidth || !nextHeight || (nextWidth === width && nextHeight === height)) return;
    width = nextWidth;
    height = nextHeight;
    renderer.setSize(width, height, false);
    frameConstructionCamera(camera, width, height);
  }
  const frames = createConstructionFrames(
    (progress) => {
      // Resize and draw together: never expose a cleared drawing buffer.
      resizeBuffer();
      model.setProgress(progress);
      renderer.render(model.scene, camera);
    },
    (callback) => requestAnimationFrame(callback),
    (id) => cancelAnimationFrame(id),
  );
  const observer = new ResizeObserver(() => {
    if (canvas.clientWidth !== width || canvas.clientHeight !== height) frames.redraw();
  });
  observer.observe(canvas);
  resizeBuffer();
  return {
    async prepare() {
      // Warm every material, geometry upload and shadow pass while hidden.
      // Otherwise later construction stages compile on their first scroll frame.
      model.setProgress(1);
      await renderer.compileAsync(model.scene, camera);
      if (disposed) return;
      renderer.render(model.scene, camera);
      frames.start();
    },
    render(progress: number) {
      frames.update(progress);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      frames.dispose();
      observer.disconnect();
      model.dispose();
      environment.dispose();
      renderer.dispose();
    },
  };
}
