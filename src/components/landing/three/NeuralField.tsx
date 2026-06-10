/**
 * NeuralField — campo de partículas tipo red neuronal para el fondo del hero.
 * Paleta de marca (signal-blue → cyan → aqua), conexiones entre nodos cercanos
 * y parallax/atracción sutil hacia el cursor. Canvas transparente: la aura CSS
 * del hero se ve a través y actúa de fallback estático.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

// Paleta de marca (hex de los tokens HSL de index.css)
const PALETTE = ["#1A8CFF", "#22C9E6", "#46E4CF", "#16D399"];

const COUNT = 110;
const FIELD_W = 22; // ancho del volumen (unidades de escena)
const FIELD_H = 10;
const FIELD_D = 5;
const LINK_DIST = 3.2; // distancia máxima para conectar dos nodos
const MAX_LINKS = 320;

// Sprite radial para puntos redondos con glow (sin texturas externas)
function makeDotTexture() {
  const sz = 64;
  const c = document.createElement("canvas");
  c.width = c.height = sz;
  const ctx = c.getContext("2d")!;
  const grd = ctx.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.35, "rgba(255,255,255,0.7)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, sz, sz);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

type Node = {
  base: THREE.Vector3;
  phase: number;
  speed: number;
  amp: number;
};

function Field({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  const dotTex = useMemo(makeDotTexture, []);

  const { nodes, links, pointPositions, pointColors, linkPositions, linkColors } = useMemo(() => {
    const rng = (seed: number) => {
      // PRNG determinista para layout estable entre renders
      const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
      return s - Math.floor(s);
    };

    const nodes: Node[] = Array.from({ length: COUNT }, (_, i) => ({
      base: new THREE.Vector3(
        (rng(i * 3 + 1) - 0.5) * FIELD_W,
        (rng(i * 3 + 2) - 0.5) * FIELD_H,
        (rng(i * 3 + 3) - 0.5) * FIELD_D,
      ),
      phase: rng(i * 7 + 5) * Math.PI * 2,
      speed: 0.25 + rng(i * 11 + 9) * 0.35,
      amp: 0.35 + rng(i * 13 + 4) * 0.55,
    }));

    // Topología estática: pares de nodos cuya posición base está cerca
    const links: Array<[number, number]> = [];
    for (let i = 0; i < COUNT && links.length < MAX_LINKS; i++) {
      for (let j = i + 1; j < COUNT && links.length < MAX_LINKS; j++) {
        if (nodes[i].base.distanceTo(nodes[j].base) < LINK_DIST) links.push([i, j]);
      }
    }

    const pointPositions = new Float32Array(COUNT * 3);
    const pointColors = new Float32Array(COUNT * 3);
    const tmp = new THREE.Color();
    for (let i = 0; i < COUNT; i++) {
      tmp.set(PALETTE[Math.floor(rng(i * 17 + 2) * PALETTE.length)]);
      pointColors.set([tmp.r, tmp.g, tmp.b], i * 3);
    }

    const linkPositions = new Float32Array(links.length * 6);
    const linkColors = new Float32Array(links.length * 6);
    for (let l = 0; l < links.length; l++) {
      const [a, b] = links[l];
      linkColors.set(pointColors.slice(a * 3, a * 3 + 3), l * 6);
      linkColors.set(pointColors.slice(b * 3, b * 3 + 3), l * 6 + 3);
    }

    return { nodes, links, pointPositions, pointColors, linkPositions, linkColors };
  }, []);

  const current = useMemo(
    () => Array.from({ length: COUNT }, () => new THREE.Vector3()),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const mx = pointer.current.x;
    const my = pointer.current.y;

    // Parallax suave de todo el grupo hacia el cursor
    if (groupRef.current) {
      groupRef.current.rotation.y += (mx * 0.12 - groupRef.current.rotation.y) * 0.04;
      groupRef.current.rotation.x += (-my * 0.08 - groupRef.current.rotation.x) * 0.04;
    }

    // Cursor proyectado al plano del campo (z=0)
    const cursorX = mx * (viewport.width / 2);
    const cursorY = my * (viewport.height / 2);

    const pos = pointsRef.current?.geometry.getAttribute("position") as
      | THREE.BufferAttribute
      | undefined;
    if (!pos) return;

    for (let i = 0; i < COUNT; i++) {
      const n = nodes[i];
      const p = current[i];
      p.set(
        n.base.x + Math.sin(t * n.speed + n.phase) * n.amp,
        n.base.y + Math.cos(t * n.speed * 0.8 + n.phase * 1.7) * n.amp * 0.8,
        n.base.z + Math.sin(t * n.speed * 0.6 + n.phase * 0.6) * n.amp * 0.5,
      );
      // Atracción sutil hacia el cursor en un radio limitado
      const dx = cursorX - p.x;
      const dy = cursorY - p.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 16) {
        const f = (1 - d2 / 16) * 0.6;
        p.x += dx * f * 0.25;
        p.y += dy * f * 0.25;
      }
      pos.setXYZ(i, p.x, p.y, p.z);
    }
    pos.needsUpdate = true;

    // Reposicionar segmentos de conexión
    const lpos = linesRef.current?.geometry.getAttribute("position") as
      | THREE.BufferAttribute
      | undefined;
    if (lpos) {
      for (let l = 0; l < links.length; l++) {
        const a = current[links[l][0]];
        const b = current[links[l][1]];
        lpos.setXYZ(l * 2, a.x, a.y, a.z);
        lpos.setXYZ(l * 2 + 1, b.x, b.y, b.z);
      }
      lpos.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pointPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[pointColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          map={dotTex}
          vertexColors
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
      <lineSegments ref={linesRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linkPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[linkColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

export default function NeuralField() {
  const pointer = useRef({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // El canvas es pointer-events:none — escuchamos el cursor en window
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Pausar el render loop cuando el hero sale del viewport
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 pointer-events-none" aria-hidden>
      <Canvas
        dpr={[1, 2]}
        frameloop={visible ? "always" : "never"}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: 50, position: [0, 0, 9], near: 0.1, far: 40 }}
        style={{ background: "transparent" }}
      >
        <Field pointer={pointer} />
      </Canvas>
    </div>
  );
}
