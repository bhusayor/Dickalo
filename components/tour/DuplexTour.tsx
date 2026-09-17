'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type Storey = {
  id: string;
  name: string;
  elevation: number;
  cameraHeight: number;
};

type Room = {
  id: string;
  code: string;
  name: string;
  unit: 'A' | 'B' | 'Shared';
  storey: string;
  position: [number, number, number];
};

type TourData = {
  model: string;
  title: string;
  source: string;
  sourceUrl: string;
  license: string;
  changes: string;
  storeys: Storey[];
  rooms: Room[];
};

type TourApi = {
  goToRoom: (room: Room) => void;
  overview: () => void;
};

const OCCUPIED_FLOORS = ['Level 1', 'Level 2'];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path d="M3 9h11M10 4l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FloorIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="m3 7 7-4 7 4-7 4-7-4Zm0 4 7 4 7-4M3 15l7 4 7-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M7 3H3v4m10-4h4v4M7 17H3v-4m10 4h4v-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function DuplexTour() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<TourApi | null>(null);
  const startedRef = useRef(false);
  const [data, setData] = useState<TourData | null>(null);
  const [loading, setLoading] = useState(0);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [unit, setUnit] = useState<'A' | 'B'>('A');
  const [floorName, setFloorName] = useState('Level 1');
  const [panelOpen, setPanelOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    startedRef.current = started;
  }, [started]);

  useEffect(() => {
    let cancelled = false;
    fetch('/models/duplex-tour/rooms.json')
      .then((response) => {
        if (!response.ok) throw new Error('Tour metadata could not be loaded');
        return response.json() as Promise<TourData>;
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host || !data) return;

    let disposed = false;
    let frame = 0;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a241d, 0.018);

    const camera = new THREE.PerspectiveCamera(56, 1, 0.08, 120);
    camera.position.set(15, 10, 18);
    camera.rotation.order = 'YXZ';
    camera.lookAt(0, 3.4, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = 'tour-canvas';
    renderer.domElement.setAttribute('aria-label', 'Interactive three-dimensional duplex model');
    renderer.domElement.setAttribute('role', 'img');
    host.appendChild(renderer.domElement);

    const hemisphere = new THREE.HemisphereLight(0xdce7db, 0x4a3f34, 2.2);
    scene.add(hemisphere);
    const sun = new THREE.DirectionalLight(0xfff1d3, 4.4);
    sun.position.set(-11, 18, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -18;
    sun.shadow.camera.right = 18;
    sun.shadow.camera.top = 18;
    sun.shadow.camera.bottom = -18;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x87a99a, 1.3);
    fill.position.set(12, 8, -14);
    scene.add(fill);

    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x34483a, roughness: 0.96 });
    const ground = new THREE.Mesh(new THREE.CircleGeometry(32, 72), groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.025;
    ground.receiveShadow = true;
    scene.add(ground);

    const walls: THREE.Object3D[] = [];
    const keys = new Set<string>();
    let yaw = camera.rotation.y;
    let pitch = camera.rotation.x;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastFrame = performance.now();
    let model: THREE.Group | null = null;
    const raycaster = new THREE.Raycaster();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const move = new THREE.Vector3();
    const candidate = new THREE.Vector3();

    const updateSize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(host);
    updateSize();

    const setLook = (nextYaw: number, nextPitch: number) => {
      yaw = nextYaw;
      pitch = THREE.MathUtils.clamp(nextPitch, -1.18, 1.18);
      camera.rotation.set(pitch, yaw, 0, 'YXZ');
    };

    const blocked = (from: THREE.Vector3, to: THREE.Vector3) => {
      const distance = from.distanceTo(to);
      if (!distance || !walls.length) return false;
      const direction = to.clone().sub(from).normalize();
      raycaster.set(from, direction);
      raycaster.near = 0;
      raycaster.far = distance + 0.23;
      return raycaster.intersectObjects(walls, false).length > 0;
    };

    const goToRoom = (room: Room) => {
      const [x, y, z] = room.position;
      const targetYaw = Math.atan2(x, z);
      const yawState = { value: yaw };
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(yawState);
      gsap.to(camera.position, {
        x,
        y,
        z,
        duration: 1.25,
        ease: 'power3.inOut',
      });
      gsap.to(yawState, {
        value: targetYaw,
        duration: 1.25,
        ease: 'power3.inOut',
        onUpdate: () => setLook(yawState.value, 0),
      });
    };

    const overview = () => {
      const yawState = { value: yaw };
      const targetPosition = new THREE.Vector3(15, 10, 18);
      const dummy = new THREE.Object3D();
      dummy.position.copy(targetPosition);
      dummy.rotation.order = 'YXZ';
      dummy.lookAt(0, 3.4, 0);
      gsap.to(camera.position, { x: 15, y: 10, z: 18, duration: 1.2, ease: 'power3.inOut' });
      gsap.to(yawState, {
        value: dummy.rotation.y,
        duration: 1.2,
        ease: 'power3.inOut',
        onUpdate: () => setLook(yawState.value, dummy.rotation.x),
      });
    };
    apiRef.current = { goToRoom, overview };

    const loader = new GLTFLoader();
    loader.load(
      data.model,
      (gltf) => {
        if (disposed) return;
        model = gltf.scene;
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.castShadow = !String(child.userData.ifcType).includes('Window');
          child.receiveShadow = true;
          const type = String(child.userData.ifcType || child.name);
          if (type.includes('IfcWall')) walls.push(child);
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          for (const material of materials) {
            if (material instanceof THREE.MeshStandardMaterial) {
              material.envMapIntensity = 0.45;
              if (type.includes('IfcWindow')) {
                material.transparent = true;
                material.opacity = 0.34;
                material.depthWrite = false;
              }
            }
          }
        });
        scene.add(model);
        setReady(true);
        setLoading(100);
      },
      (event) => {
        if (event.total) setLoading(Math.min(99, Math.round((event.loaded / event.total) * 100)));
      },
      () => setLoadError(true),
    );

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        event.preventDefault();
        keys.add(key);
      }
    };
    const onKeyUp = (event: KeyboardEvent) => keys.delete(event.key.toLowerCase());
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
      renderer.domElement.classList.add('is-dragging');
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const movementX = event.clientX - lastX;
      const movementY = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      setLook(yaw - movementX * 0.004, pitch - movementY * 0.0032);
    };
    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      renderer.domElement.classList.remove('is-dragging');
      if (renderer.domElement.hasPointerCapture(event.pointerId))
        renderer.domElement.releasePointerCapture(event.pointerId);
    };
    const onWheel = (event: WheelEvent) => {
      if (!startedRef.current) return;
      event.preventDefault();
      keys.add(event.deltaY > 0 ? 's' : 'w');
      window.setTimeout(() => keys.delete(event.deltaY > 0 ? 's' : 'w'), 90);
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    const animate = (time: number) => {
      const delta = Math.min((time - lastFrame) / 1000, 0.05);
      lastFrame = time;
      move.set(0, 0, 0);
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      right.crossVectors(forward, camera.up).normalize();
      if (keys.has('w') || keys.has('arrowup')) move.add(forward);
      if (keys.has('s') || keys.has('arrowdown')) move.sub(forward);
      if (keys.has('d') || keys.has('arrowright')) move.add(right);
      if (keys.has('a') || keys.has('arrowleft')) move.sub(right);
      if (move.lengthSq() > 0 && startedRef.current) {
        move.normalize().multiplyScalar(delta * (keys.has('shift') ? 4.1 : 2.25));
        candidate.copy(camera.position).add(move);
        candidate.x = THREE.MathUtils.clamp(candidate.x, -5.4, 5.4);
        candidate.z = THREE.MathUtils.clamp(candidate.z, -14.2, 14.2);
        if (!blocked(camera.position, candidate)) camera.position.copy(candidate);
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      apiRef.current = null;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      gsap.killTweensOf(camera.position);
      scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [data]);

  const rooms = useMemo(() => {
    if (!data) return [];
    const storey = data.storeys.find((item) => item.name === floorName);
    return data.rooms
      .filter((room) => room.unit === unit && room.storey === storey?.id)
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [data, floorName, unit]);

  const enterTour = useCallback(() => {
    if (!data || !ready) return;
    const foyer = data.rooms.find((room) => room.code === 'A101');
    setStarted(true);
    setActiveRoom(foyer || null);
    if (foyer) window.setTimeout(() => apiRef.current?.goToRoom(foyer), 0);
  }, [data, ready]);

  const visitRoom = (room: Room) => {
    setActiveRoom(room);
    setStarted(true);
    setPanelOpen(false);
    apiRef.current?.goToRoom(room);
  };

  const chooseFloor = (name: string) => {
    setFloorName(name);
    const storey = data?.storeys.find((item) => item.name === name);
    const first = data?.rooms.find((room) => room.unit === unit && room.storey === storey?.id);
    if (first) {
      setActiveRoom(first);
      apiRef.current?.goToRoom(first);
    }
  };

  const chooseUnit = (nextUnit: 'A' | 'B') => {
    setUnit(nextUnit);
    const storey = data?.storeys.find((item) => item.name === floorName);
    const first = data?.rooms.find((room) => room.unit === nextUnit && room.storey === storey?.id);
    if (first) {
      setActiveRoom(first);
      apiRef.current?.goToRoom(first);
    }
  };

  const toggleFullscreen = async () => {
    const stage = stageRef.current;
    if (!stage) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await stage.requestFullscreen();
  };

  return (
    <div className="tour-page">
      <section ref={stageRef} className="tour-stage on-inverse" data-lenis-prevent>
        <div ref={canvasHostRef} className="tour-canvas-host">
          <Image
            src="/images/tour/duplex-preview.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className={`tour-poster ${ready ? 'is-hidden' : ''}`}
          />
        </div>
        <div className="tour-atmosphere" aria-hidden="true" />

        {!ready && !loadError ? (
          <div className="tour-loader" role="status" aria-live="polite">
            <span className="micro-label">Preparing the building</span>
            <strong>{loading}%</strong>
            <span className="tour-loader-track">
              <span style={{ width: `${loading}%` }} />
            </span>
          </div>
        ) : null}

        {loadError ? (
          <div className="tour-error" role="alert">
            <span className="micro-label">Virtual tour</span>
            <h1>The model could not be opened.</h1>
            <p>Please refresh the page or return to our projects.</p>
            <Link href="/projects" className="tour-primary-action">
              Back to projects
            </Link>
          </div>
        ) : null}

        {ready && !started ? (
          <div className="tour-intro">
            <span className="tour-intro-index">01 / digital building study</span>
            <p className="micro-label">Interactive residential experience</p>
            <h1>
              Walk through the
              <br />
              duplex before it is built.
            </h1>
            <p className="tour-intro-copy">
              Explore a complete two-storey BIM model at human scale. Move through the rooms, switch
              floors and understand the plan from the inside.
            </p>
            <button type="button" className="tour-primary-action" onClick={enterTour}>
              Enter the duplex <ArrowIcon />
            </button>
            <p className="tour-intro-note">Works with mouse, keyboard and touch</p>
          </div>
        ) : null}

        {started ? (
          <>
            <div className="tour-topbar">
              <div className="tour-location" aria-live="polite">
                <span>{floorName === 'Level 1' ? 'Ground floor' : 'Upper floor'}</span>
                <strong>{activeRoom?.name || 'Free walk'}</strong>
              </div>
              <div className="tour-top-actions">
                <button
                  type="button"
                  onClick={() => setHelpOpen((value) => !value)}
                  aria-expanded={helpOpen}
                >
                  How to move
                </button>
                <button
                  type="button"
                  className="tour-icon-button"
                  onClick={toggleFullscreen}
                  aria-label="Toggle full screen"
                >
                  <ExpandIcon />
                </button>
              </div>
            </div>

            <button type="button" className="tour-room-trigger" onClick={() => setPanelOpen(true)}>
              <FloorIcon /> Explore rooms
            </button>

            <aside
              className={`tour-room-panel ${panelOpen ? 'is-open' : ''}`}
              aria-label="Room navigator"
            >
              <div className="tour-panel-heading">
                <div>
                  <span className="micro-label">Room navigator</span>
                  <strong>Choose where to go</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  aria-label="Close room navigator"
                >
                  ×
                </button>
              </div>
              <div className="tour-segmented" aria-label="Choose duplex unit">
                {(['A', 'B'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={unit === item ? 'is-active' : ''}
                    onClick={() => chooseUnit(item)}
                  >
                    Home {item}
                  </button>
                ))}
              </div>
              <div className="tour-floor-tabs" aria-label="Choose floor">
                {OCCUPIED_FLOORS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={floorName === name ? 'is-active' : ''}
                    onClick={() => chooseFloor(name)}
                  >
                    {name === 'Level 1' ? 'Ground floor' : 'Upper floor'}
                  </button>
                ))}
              </div>
              <div className="tour-room-list">
                {rooms.map((room, index) => (
                  <button
                    key={room.id}
                    type="button"
                    className={activeRoom?.id === room.id ? 'is-active' : ''}
                    onClick={() => visitRoom(room)}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{room.name}</strong>
                    <ArrowIcon />
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="tour-overview-button"
                onClick={() => {
                  setActiveRoom(null);
                  setPanelOpen(false);
                  apiRef.current?.overview();
                }}
              >
                View building exterior
              </button>
            </aside>

            {helpOpen ? (
              <div className="tour-help">
                <button
                  type="button"
                  onClick={() => setHelpOpen(false)}
                  aria-label="Close movement instructions"
                >
                  ×
                </button>
                <span className="micro-label">Move through the space</span>
                <div>
                  <kbd>Drag</kbd>
                  <p>Look around</p>
                </div>
                <div>
                  <kbd>W A S D</kbd>
                  <p>Walk</p>
                </div>
                <div>
                  <kbd>Scroll</kbd>
                  <p>Move forward or back</p>
                </div>
              </div>
            ) : null}

            <div className="tour-mobile-controls" aria-label="Movement controls">
              {[
                ['w', '↑', 'Walk forward'],
                ['a', '←', 'Move left'],
                ['s', '↓', 'Walk backward'],
                ['d', '→', 'Move right'],
              ].map(([key, label, aria]) => (
                <button
                  key={key}
                  type="button"
                  aria-label={aria}
                  onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { key }))}
                  onPointerUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { key }))}
                  onPointerCancel={() => window.dispatchEvent(new KeyboardEvent('keyup', { key }))}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        ) : null}

        <div className="tour-credit">
          <span>Prototype model</span>
          <a href={data?.sourceUrl} target="_blank" rel="noreferrer">
            buildingSMART · CC BY 4.0
          </a>
        </div>
      </section>

      <section className="tour-afterword">
        <div>
          <span className="micro-label">From drawing to experience</span>
          <h2>A plan tells you the dimensions. A tour lets you feel the space.</h2>
        </div>
        <div>
          <p>
            This study uses a licensed sample BIM model to demonstrate how a client can review
            circulation, room relationships and scale before construction begins. A DICKALO project
            would use the client&apos;s approved design, materials and furniture direction.
          </p>
          <Link href="/contact" className="brand-button">
            Discuss your virtual tour <ArrowIcon />
          </Link>
        </div>
      </section>
    </div>
  );
}
