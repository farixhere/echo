'use client';

import { useEffect, useRef } from 'react';

type Props = {
  orbTaken: boolean;
  windowOpened: boolean;
  stoneMoved: boolean;
  playerX: number;
  playerY: number;
  enabled: boolean;
  onReady?: (ready: boolean) => void;
};

/**
 * Real 3D backdrop for the room. Renders behind the existing CSS/DOM game UI,
 * which keeps all hotspots, cards, menus and controls exactly as they are.
 * Loaded lazily; if WebGL is unavailable or `enabled` is false, nothing mounts
 * and the CSS room stays visible.
 */
export default function Room3D({ orbTaken, windowOpened, stoneMoved, playerX, playerY, enabled, onReady }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const latest = useRef({ orbTaken, windowOpened, stoneMoved, playerX, playerY });
  latest.current = { orbTaken, windowOpened, stoneMoved, playerX, playerY };
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  useEffect(() => {
    if (!enabled || !mountRef.current) return;
    // Low graphics preset keeps the CSS room only (performance on older phones)
    if (document.documentElement.classList.contains('gfx-low')) return;
    const mount = mountRef.current;
    let disposed = false;
    let frame = 0;
    let cleanup: (() => void) | undefined;

    (async () => {
      let THREE: typeof import('three');
      try {
        THREE = await import('three');
      } catch {
        return;
      }
      if (disposed) return;

      let renderer: import('three').WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      } catch {
        return; // no WebGL — CSS room remains
      }
      readyRef.current?.(true);

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(pixelRatio);
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.inset = '0';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.zIndex = '0';
      renderer.domElement.setAttribute('aria-hidden', 'true');
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0b1216, 0.085);

      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 2.6, 9);
      camera.lookAt(0, 1.2, 0);

      // Cinematic lighting: cool moonlight key, dim warm fill, a soft point light for the orb
      scene.add(new THREE.AmbientLight(0x1a2630, 0.9));
      const moon = new THREE.DirectionalLight(0x8fb6d8, 1.1);
      moon.position.set(-6, 9, 5);
      scene.add(moon);
      const warm = new THREE.PointLight(0xd9a964, 0.7, 14, 2);
      warm.position.set(6, 3, 2);
      scene.add(warm);
      const orbLight = new THREE.PointLight(0x9fe0d9, 0, 6, 2);
      orbLight.position.set(1.4, 0.9, 1.2);
      scene.add(orbLight);

      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x3a3c33, roughness: 0.9, metalness: 0 });
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x151812, roughness: 1 });
      const floorMat = new THREE.MeshStandardMaterial({ color: 0x1d2019, roughness: 0.55, metalness: 0.05 });

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), floorMat);
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      const back = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), wallMat);
      back.position.set(0, 5, -4);
      scene.add(back);

      // window: a pale moonlit pane that brightens when opened
      const windowMat = new THREE.MeshStandardMaterial({ color: 0x2a3f4c, emissive: 0x8fb6d8, emissiveIntensity: 0.25 });
      const windowPane = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.2), windowMat);
      windowPane.position.set(-3.4, 2.8, -3.9);
      scene.add(windowPane);

      // door on the right
      const doorMat = new THREE.MeshStandardMaterial({ color: 0x2a271d, roughness: 0.8, emissive: 0xd9a964, emissiveIntensity: 0.08 });
      const door = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.8, 0.2), doorMat);
      door.position.set(3.6, 1.9, -3.85);
      scene.add(door);

      // the stone: sits on the floor, slides aside when moved
      const stone = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 16), stoneMat);
      stone.scale.set(1.3, 0.55, 1);
      stone.position.set(-2.2, 0.25, 1.6);
      scene.add(stone);

      // the orb: glowing sphere, disappears when taken
      const orbMat = new THREE.MeshStandardMaterial({ color: 0xcfe3df, emissive: 0x9fe0d9, emissiveIntensity: 1.2, roughness: 0.2 });
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), orbMat);
      orb.position.set(1.4, 1.1, 1.2);
      scene.add(orb);

      // the player: a simple grounded figure that follows the 2D coordinates
      const player = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.22, 0.7, 4, 12),
        new THREE.MeshStandardMaterial({ color: 0x4d5148, roughness: 0.9 }),
      );
      scene.add(player);

      const resize = () => {
        const w = mount.clientWidth || 1;
        const h = mount.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(mount);

      const start = performance.now();
      const tick = () => {
        if (disposed) return;
        const t = (performance.now() - start) / 1000;
        const s = latest.current;

        // map 2D room percentages onto the floor plane
        player.position.set((s.playerX - 50) / 9, 0.6, ((s.playerY - 50) / 9) + 2.2);
        orb.visible = !s.orbTaken;
        orbLight.intensity = s.orbTaken ? 0 : 0.9 + Math.sin(t * 1.6) * 0.15;
        orb.position.y = 1.1 + Math.sin(t * 1.1) * 0.06;
        windowMat.emissiveIntensity = s.windowOpened ? 0.9 : 0.25;
        stone.position.x = s.stoneMoved ? 1.8 : -2.2;
        stone.position.z = s.stoneMoved ? 0.6 : 1.6;

        // slow drifting camera for atmosphere
        camera.position.x = Math.sin(t * 0.12) * 0.35;
        camera.lookAt(0, 1.2, 0);

        renderer.render(scene, camera);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);

      cleanup = () => {
        cancelAnimationFrame(frame);
        ro.disconnect();
        scene.traverse((obj) => {
          const mesh = obj as import('three').Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const mat = mesh.material as import('three').Material | import('three').Material[] | undefined;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else if (mat) mat.dispose();
        });
        renderer.dispose();
        renderer.domElement.remove();
        readyRef.current?.(false);
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [enabled]);

  return <div ref={mountRef} className="room-3d" aria-hidden="true" />;
}
