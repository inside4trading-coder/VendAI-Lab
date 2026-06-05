/**
 * VendAI — Animated 3D Vending Machine Logo
 * ────────────────────────────────────────────────────────────────────────────
 * Self-contained React component. Transparent background, infinite seamless
 * loop. Drop into any React / Vite / Next project.
 *
 * INSTALL (one-time):
 *   npm i three @react-three/fiber
 *
 * USAGE:
 *   import { VendaiVendingLogo } from "./VendaiVendingLogo";
 *
 *   // Fills its parent — set the size on the wrapper (use a ~square box):
 *   <div style={{ width: 520, height: 520 }}>
 *     <VendaiVendingLogo />
 *   </div>
 *
 *   // With a soft CSS glow behind it (matches the VendAI hero):
 *   <div className="relative w-[520px] h-[520px]">
 *     <div className="absolute inset-0 rounded-full blur-2xl
 *          bg-[radial-gradient(circle,_rgba(96,165,250,0.35)_0%,_transparent_70%)]" />
 *     <VendaiVendingLogo />
 *   </div>
 *
 * NOTES:
 *   - Canvas is transparent; the page background / CSS glow shows through.
 *   - Builds in once on mount, then loops a dispense cycle forever
 *     (red → yellow → green status LEDs while a product is dispensed).
 *   - Next.js App Router: add "use client" at the top of the importing file.
 *   - Use a roughly square container so the side POS terminal isn't clipped.
 * ────────────────────────────────────────────────────────────────────────────
 */
// "use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

// ─── Palette ──────────────────────────────────────────────────────────────
const C = {
  shellDark: "#111827",
  shellMid:  "#1E2A44",
  shellRim:  "#2D3F5E",
  bezel:     "#3B82F6",
  bezelGlow: "#60A5FA",
  led:       "#22D3EE",
  glass:     "#DBEAFE",
  slot:      "#060E1A",
};
const PRODUCT_PALETTE = ["#22D3EE", "#0EA5E9", "#3B82F6", "#60A5FA", "#7DD3FC", "#BAE6FD"];

// ─── Easing / helpers ───────────────────────────────────────────────────────
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutBack = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const hash01 = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
// range in arbitrary units → 0..1 clamped
const rg = (x: number, a: number, b: number) => clamp((x - a) / (b - a));

// ─── Geometry builders ──────────────────────────────────────────────────────
const traceRR = (path: THREE.Path | THREE.Shape, w: number, h: number, r: number) => {
  const hw = w / 2, hh = h / 2, rr = Math.min(r, hw, hh);
  path.moveTo(-hw + rr, -hh);
  path.lineTo(hw - rr, -hh); path.quadraticCurveTo(hw, -hh, hw, -hh + rr);
  path.lineTo(hw, hh - rr);  path.quadraticCurveTo(hw, hh, hw - rr, hh);
  path.lineTo(-hw + rr, hh); path.quadraticCurveTo(-hw, hh, -hw, hh - rr);
  path.lineTo(-hw, -hh + rr);path.quadraticCurveTo(-hw, -hh, -hw + rr, -hh);
};
const frameGeo = (oW: number, oH: number, oR: number, iW: number, iH: number, iR: number, depth: number, bevel = 0.04) => {
  const shape = new THREE.Shape(); traceRR(shape, oW, oH, oR);
  const hole = new THREE.Path(); traceRR(hole, iW, iH, iR); shape.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 24 });
  g.translate(0, 0, -depth / 2); g.computeVertexNormals(); return g;
};
const plateGeo = (w: number, h: number, r: number, depth: number, bevel = 0.03) => {
  const shape = new THREE.Shape(); traceRR(shape, w, h, r);
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 20 });
  g.translate(0, 0, -depth / 2); g.computeVertexNormals(); return g;
};
// Additive radial sprite for faking bloom glow (transparent-safe).
const radialTex = (r: number, g: number, b: number) => {
  const sz = 128;
  const c = document.createElement("canvas"); c.width = c.height = sz;
  const ctx = c.getContext("2d")!;
  const grd = ctx.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
  grd.addColorStop(0, `rgba(${r},${g},${b},1)`);
  grd.addColorStop(0.4, `rgba(${r},${g},${b},0.4)`);
  grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grd; ctx.fillRect(0, 0, sz, sz);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
};

// ─── Dimensions ──────────────────────────────────────────────────────────────
const CAB_W = 2.8, CAB_H = 4.2, CAB_D = 0.52, CAB_R = 0.28;
const ZONE_HEADER_Y = 1.68, ZONE_GLASS_Y = 0.08;
const GLASS_W = 2.2, GLASS_H = 2.9, GLASS_R = 0.14;
const HDR_W = 2.1, HDR_H = 0.44;
const SLOT_W = 1.4, SLOT_H = 0.28, SLOT_Y = -1.48;
const PAY_W = 0.5, PAY_H = 1.15, PAY_X = 1.55, PAY_Y = -0.1, PAY_TILT = -0.3;
const GCOLS = 3, GROWS = 4, GCNT = GCOLS * GROWS;
const GX_STEP = 0.67, GY_STEP = 0.62;
const PROD_W = 0.46, PROD_H = 0.48, PROD_D = 0.16;
const gx = (c: number) => (c - (GCOLS - 1) / 2) * GX_STEP;
const gy = (r: number) => ZONE_GLASS_Y + ((GROWS - 1) / 2 - r) * GY_STEP;
const DISPENSE_IDX = 5;

// ─── Timing (seconds) ─────────────────────────────────────────────────────────
// Build-in is a one-shot from absolute time. The dispense cycle loops forever.
const INTRO = {
  cabinet: [0.0, 1.0], slot: [0.4, 1.33], traffic: [0.47, 1.4],
  header: [0.6, 1.5], bezel: [0.83, 1.83], shelves: [0.93, 2.0],
  grid: 1.0, payPanel: [1.33, 2.17],
};
const DISPENSE_START = 3.0;
const CYCLE = 6.0;
// Phase windows WITHIN a cycle (seconds):
const P = {
  highlight: [2.0, 2.8],
  fall:      [2.8, 3.9],
  deliver:   [3.85, 4.35],
  fade:      [4.3, 4.9],
  restock:   [4.9, 5.6],
};
// Returns the position within the current dispense cycle (or -10 before the
// first cycle, so all phases read as idle / grid-full).
const cycleTime = (t: number) =>
  t < DISPENSE_START ? -10 : (t - DISPENSE_START) % CYCLE;

// ─── Camera rig ───────────────────────────────────────────────────────────────
const CameraRig = () => {
  const camera = useThree((s) => s.camera);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const dolly = easeOutCubic(rg(t, 0, 1.5));
    camera.position.set(0, 0.08 + Math.sin(t * 0.22) * 0.025, 8.6 - dolly * 0.55);
    camera.lookAt(0, 0, 0);
  });
  return null;
};

// ─── Cabinet ────────────────────────────────────────────────────────────────
const Cabinet = () => {
  const shellGeo = useMemo(() => frameGeo(CAB_W, CAB_H, CAB_R, CAB_W - 0.2, CAB_H - 0.2, CAB_R - 0.06, CAB_D, 0.05), []);
  const backGeo = useMemo(() => plateGeo(CAB_W - 0.2, CAB_H - 0.2, CAB_R - 0.06, 0.06), []);
  const divGeo = useMemo(() => plateGeo(CAB_W - 0.2, 0.07, 0.03, 0.12), []);
  const doorSeamGeo = useMemo(() => frameGeo(CAB_W - 0.1, CAB_H - 0.1, CAB_R - 0.02, CAB_W - 0.15, CAB_H - 0.15, CAB_R - 0.04, 0.04, 0.01), []);
  const hingeGeo = useMemo(() => plateGeo(0.03, CAB_H - 0.55, 0.015, 0.05), []);

  const grp = useRef<THREE.Group>(null);
  const shellMat = useRef<THREE.MeshStandardMaterial>(null);
  const backMat = useRef<THREE.MeshStandardMaterial>(null);
  const seamMat = useRef<THREE.MeshStandardMaterial>(null);
  const hingeMat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const intro = rg(t, INTRO.cabinet[0], INTRO.cabinet[1]);
    if (grp.current) {
      grp.current.scale.setScalar(easeOutBack(intro));
      grp.current.rotation.set(Math.cos(t * 0.28) * 0.022, Math.sin(t * 0.38) * 0.045, 0);
    }
    if (shellMat.current) shellMat.current.opacity = clamp(intro * 2.5);
    if (backMat.current) backMat.current.opacity = clamp(intro * 2);
    if (seamMat.current) seamMat.current.opacity = clamp(intro * 2.5);
    if (hingeMat.current) hingeMat.current.opacity = clamp(intro * 2.5);
  });

  return (
    <group ref={grp} scale={0.001}>
      <mesh geometry={shellGeo}>
        <meshStandardMaterial ref={shellMat} color={C.shellDark} emissive={C.shellRim} emissiveIntensity={0.1} metalness={0.9} roughness={0.25} transparent opacity={0} />
      </mesh>
      <mesh geometry={backGeo} position={[0, 0, -CAB_D / 2 + 0.03]}>
        <meshStandardMaterial ref={backMat} color={C.shellMid} metalness={0.55} roughness={0.6} transparent opacity={0} />
      </mesh>
      <mesh geometry={divGeo} position={[0, ZONE_GLASS_Y + GLASS_H / 2 + 0.04, -0.05]}>
        <meshStandardMaterial color={C.shellRim} metalness={0.8} roughness={0.3} emissive={C.bezel} emissiveIntensity={0.15} />
      </mesh>
      <mesh geometry={divGeo} position={[0, ZONE_GLASS_Y - GLASS_H / 2 - 0.04, -0.05]}>
        <meshStandardMaterial color={C.shellRim} metalness={0.8} roughness={0.3} emissive={C.bezel} emissiveIntensity={0.15} />
      </mesh>
      <mesh geometry={doorSeamGeo} position={[0, 0, CAB_D / 2 + 0.02]}>
        <meshStandardMaterial ref={seamMat} color={C.shellRim} emissive={C.bezelGlow} emissiveIntensity={0.28} metalness={0.9} roughness={0.32} transparent opacity={0} />
      </mesh>
      <mesh geometry={hingeGeo} position={[-(CAB_W / 2 - 0.18), 0, CAB_D / 2 + 0.02]}>
        <meshStandardMaterial ref={hingeMat} color={C.shellRim} emissive={C.bezelGlow} emissiveIntensity={0.22} metalness={0.9} roughness={0.32} transparent opacity={0} />
      </mesh>
    </group>
  );
};

// ─── Header / brand LED ───────────────────────────────────────────────────────
const HeaderPanel = () => {
  const bgGeo = useMemo(() => plateGeo(HDR_W, HDR_H, 0.1, 0.04), []);
  const screenGeo = useMemo(() => plateGeo(HDR_W - 0.12, HDR_H - 0.1, 0.07, 0.03), []);
  const dotMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#ECFEFF", transparent: true, opacity: 0, toneMapped: false }), []);
  const haloTex = useMemo(() => radialTex(34, 211, 238), []);

  const grp = useRef<THREE.Group>(null);
  const screenMat = useRef<THREE.MeshStandardMaterial>(null);
  const haloMat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const appear = easeOutCubic(rg(t, INTRO.header[0], INTRO.header[1]));
    const flicker = 1.1 + Math.sin(t * 7.2) * 0.09 + Math.sin(t * 13.5) * 0.04;
    const glitch = Math.sin(t * 0.42) > 0.93 ? 0.55 : 1.0;
    if (grp.current) grp.current.scale.setScalar(appear);
    if (screenMat.current) screenMat.current.emissiveIntensity = flicker * glitch * appear;
    dotMat.opacity = 0.85 * appear * glitch;
    if (haloMat.current) haloMat.current.opacity = 0.5 * appear * glitch;
  });

  return (
    <group ref={grp} position={[0, ZONE_HEADER_Y, 0.06]} scale={0.001}>
      {/* Additive glow halo behind the LED (fakes bloom) */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[HDR_W + 0.9, HDR_H + 0.9]} />
        <meshBasicMaterial ref={haloMat} map={haloTex} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh geometry={bgGeo}>
        <meshStandardMaterial color={"#060E1C"} metalness={0.7} roughness={0.45} />
      </mesh>
      <mesh geometry={screenGeo} position={[0, 0, 0.02]}>
        <meshStandardMaterial ref={screenMat} color={C.led} emissive={C.led} emissiveIntensity={1} metalness={0} roughness={0.5} toneMapped={false} />
      </mesh>
      {[-0.62, -0.4, -0.22, 0, 0.18, 0.36, 0.56].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.04]} material={dotMat}>
          <boxGeometry args={[0.06, 0.1, 0.01]} />
        </mesh>
      ))}
    </group>
  );
};

// ─── Glass bezel ────────────────────────────────────────────────────────────
const GlassBezel = () => {
  const bezelGeo = useMemo(() => frameGeo(GLASS_W + 0.12, GLASS_H + 0.12, GLASS_R + 0.04, GLASS_W, GLASS_H, GLASS_R, 0.08, 0.04), []);
  const glassGeo = useMemo(() => plateGeo(GLASS_W, GLASS_H, GLASS_R, 0.025), []);
  const grp = useRef<THREE.Group>(null);
  const bezelMat = useRef<THREE.MeshStandardMaterial>(null);
  const glassMat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const appear = easeOutCubic(rg(t, INTRO.bezel[0], INTRO.bezel[1]));
    const emBase = 0.6 + Math.sin(t * 1.8) * 0.08;
    const sweep = (t * 0.22) % 1.0;
    const shine = Math.exp(-Math.pow((sweep - 0.5) * 5, 2)) * 0.12;
    if (grp.current) grp.current.scale.setScalar(appear);
    if (bezelMat.current) { bezelMat.current.emissiveIntensity = emBase; bezelMat.current.opacity = appear; }
    if (glassMat.current) glassMat.current.opacity = (0.14 + shine) * appear;
  });

  return (
    <group ref={grp} position={[0, ZONE_GLASS_Y, 0.04]} scale={0.001}>
      <mesh geometry={bezelGeo}>
        <meshStandardMaterial ref={bezelMat} color={C.bezel} emissive={C.bezelGlow} emissiveIntensity={0.6} metalness={0.5} roughness={0.3} transparent opacity={0} toneMapped={false} />
      </mesh>
      <mesh geometry={glassGeo} position={[0, 0, 0.02]}>
        <meshStandardMaterial ref={glassMat} color={C.glass} metalness={0} roughness={0.08} emissive={"#BFD9FF"} emissiveIntensity={0.05} transparent opacity={0} />
      </mesh>
    </group>
  );
};

// ─── Shelves ──────────────────────────────────────────────────────────────────
const Shelves = () => {
  const shelfGeo = useMemo(() => plateGeo(GLASS_W - 0.1, 0.04, 0.02, 0.14), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: C.shellRim, metalness: 0.75, roughness: 0.35, emissive: new THREE.Color(C.bezel), emissiveIntensity: 0.08, transparent: true, opacity: 0 }), []);
  const positions = [
    gy(0) + GY_STEP / 2 + 0.01, gy(1) + GY_STEP / 2 + 0.01, gy(2) + GY_STEP / 2 + 0.01,
    gy(3) + GY_STEP / 2 + 0.01, gy(3) - GY_STEP / 2 - 0.01,
  ];
  useFrame(({ clock }) => {
    mat.opacity = easeOutCubic(rg(clock.getElapsedTime(), INTRO.shelves[0], INTRO.shelves[1])) * 0.9;
  });
  return <>{positions.map((y, i) => <mesh key={i} geometry={shelfGeo} position={[0, y, 0]} material={mat} />)}</>;
};

// ─── Product grid ───────────────────────────────────────────────────────────
const ProductGrid = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const geo = useMemo(() => plateGeo(PROD_W, PROD_H, 0.09, PROD_D, 0.022), []);
  const slots = useMemo(() => Array.from({ length: GCNT }, (_, i) => {
    const col = i % GCOLS, row = Math.floor(i / GCOLS);
    return {
      x: gx(col), y: gy(row),
      color: new THREE.Color(PRODUCT_PALETTE[Math.floor(hash01(i * 7.7) * PRODUCT_PALETTE.length)]),
      delaySec: (row * 5 + col * 2) / 30,
    };
  }), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const cyc = cycleTime(t);
    const fall = rg(cyc, P.fall[0], P.fall[1]);
    const fade = rg(cyc, P.fade[0], P.fade[1]);
    const restock = rg(cyc, P.restock[0], P.restock[1]);
    const high = rg(cyc, P.highlight[0], P.highlight[1]);

    for (let i = 0; i < GCNT; i++) {
      const s = slots[i];
      const introT = rg(t, INTRO.grid + s.delaySec, INTRO.grid + s.delaySec + 0.27);
      let sc = easeOutCubic(introT);
      if (i === DISPENSE_IDX) {
        if (fall > 0 && fade < 1) sc = 0;
        else if (restock > 0 && restock < 1) sc = easeOutBack(restock);
        else if (restock >= 1) sc = 1;
        else if (fade >= 1 && restock === 0) sc = 0;
      }
      dummy.position.set(s.x, s.y, -0.04);
      dummy.scale.setScalar(sc);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      const bright = i === DISPENSE_IDX ? 1 + easeInOutCubic(high) * 0.8 : 1;
      tmp.copy(s.color).multiplyScalar(bright);
      meshRef.current.setColorAt(i, tmp);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geo, undefined, GCNT]} frustumCulled={false}>
      <meshStandardMaterial metalness={0.3} roughness={0.4} />
    </instancedMesh>
  );
};

// ─── Falling product ──────────────────────────────────────────────────────────
const FallingProduct = () => {
  const geo = useMemo(() => plateGeo(PROD_W, PROD_H, 0.09, PROD_D, 0.022), []);
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const color = PRODUCT_PALETTE[DISPENSE_IDX % PRODUCT_PALETTE.length];
  const startX = gx(DISPENSE_IDX % GCOLS);
  const startY = gy(Math.floor(DISPENSE_IDX / GCOLS));
  const endY = SLOT_Y + 0.1;

  useFrame(({ clock }) => {
    if (!meshRef.current || !matRef.current) return;
    const cyc = cycleTime(clock.getElapsedTime());
    const fall = rg(cyc, P.fall[0], P.fall[1]);
    const fade = rg(cyc, P.fade[0], P.fade[1]);
    const visible = fall > 0 && fade < 1;
    meshRef.current.visible = visible;
    if (!visible) return;
    const y = startY + (endY - startY) * (fall * fall);
    const past = cyc - P.fall[1];
    const bounce = fall >= 1 ? Math.sin(past * 27) * Math.exp(-past * 5.4) * 0.05 : 0;
    meshRef.current.position.set(startX, y + bounce, 0.12);
    meshRef.current.rotation.z = Math.sin(fall * Math.PI * 2.0) * 0.22;
    matRef.current.opacity = 1 - easeInOutCubic(fade);
  });

  return (
    <mesh ref={meshRef} geometry={geo} visible={false}>
      <meshStandardMaterial ref={matRef} color={color} emissive={color} emissiveIntensity={0.55} metalness={0.3} roughness={0.38} transparent />
    </mesh>
  );
};

// ─── Dispenser slot ─────────────────────────────────────────────────────────
const DispenserSlot = () => {
  const recessGeo = useMemo(() => plateGeo(SLOT_W, SLOT_H, 0.07, 0.06, 0.02), []);
  const borderGeo = useMemo(() => frameGeo(SLOT_W + 0.1, SLOT_H + 0.08, 0.08, SLOT_W, SLOT_H, 0.07, 0.04), []);
  const flapGeo = useMemo(() => plateGeo(SLOT_W, 0.06, 0.03, 0.04), []);
  const grp = useRef<THREE.Group>(null);
  const flap = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (grp.current) grp.current.scale.setScalar(easeOutCubic(rg(t, INTRO.slot[0], INTRO.slot[1])));
    const fall = rg(cycleTime(t), P.fall[0], P.fall[1]);
    if (flap.current)
      flap.current.rotation.x = easeInOutCubic(Math.min(fall * 2, 1)) * 0.4 - easeInOutCubic(Math.max((fall - 0.5) * 2, 0)) * 0.4;
  });

  return (
    <group ref={grp} position={[0, SLOT_Y, 0.05]} scale={0.001}>
      <mesh geometry={recessGeo}><meshStandardMaterial color={C.slot} metalness={0.4} roughness={0.7} /></mesh>
      <mesh geometry={borderGeo}><meshStandardMaterial color={C.bezel} emissive={C.bezelGlow} emissiveIntensity={0.5} metalness={0.6} roughness={0.3} toneMapped={false} /></mesh>
      <mesh ref={flap} geometry={flapGeo} position={[0, SLOT_H / 2 + 0.01, 0.04]}><meshStandardMaterial color={C.shellRim} metalness={0.7} roughness={0.35} /></mesh>
    </group>
  );
};

// ─── Payment terminal (side POS) ──────────────────────────────────────────────
const PaymentTerminal = () => {
  const bodyGeo = useMemo(() => plateGeo(PAY_W, PAY_H, 0.1, 0.1, 0.03), []);
  const screenGeo = useMemo(() => plateGeo(PAY_W - 0.14, 0.26, 0.05, 0.03), []);
  const nfcGeo = useMemo(() => new THREE.CircleGeometry(0.05, 24), []);
  const keyGeo = useMemo(() => plateGeo(0.1, 0.085, 0.022, 0.025), []);
  const swipeGeo = useMemo(() => plateGeo(0.04, PAY_H - 0.34, 0.02, 0.06), []);
  const bracketGeo = useMemo(() => plateGeo(0.3, 0.32, 0.05, 0.13), []);
  const keyMatStatic = useMemo(() => new THREE.MeshStandardMaterial({ color: "#AECBEA", emissive: new THREE.Color(C.bezelGlow), emissiveIntensity: 0.35, metalness: 0.3, roughness: 0.45 }), []);

  const grp = useRef<THREE.Group>(null);
  const screenMat = useRef<THREE.MeshStandardMaterial>(null);
  const nfcMat = useRef<THREE.MeshBasicMaterial>(null);
  const okKeyMat = useRef<THREE.MeshStandardMaterial>(null);

  const keys = Array.from({ length: 12 }, (_, i) => ({
    kx: ((i % 3) - 1) * 0.125,
    ky: -0.1 - Math.floor(i / 3) * 0.115,
  }));

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const appear = easeOutCubic(rg(t, INTRO.payPanel[0], INTRO.payPanel[1]));
    if (grp.current) grp.current.scale.setScalar(appear);
    const deliver = rg(cycleTime(t), P.deliver[0], P.deliver[1]);
    const flash = deliver > 0 && deliver < 1 ? Math.exp(-Math.pow((deliver - 0.2) * 4, 2)) * 1.3 : 0;
    if (screenMat.current) screenMat.current.emissiveIntensity = 0.75 + Math.sin(t * 4.5) * 0.1 + flash * 0.6;
    if (nfcMat.current) nfcMat.current.opacity = clamp(0.7 + (0.5 + Math.sin(t * 3.5) * 0.12 + flash) * 0.3);
    if (okKeyMat.current) okKeyMat.current.emissiveIntensity = 0.35 + flash * 1.2;
  });

  return (
    <group ref={grp} position={[PAY_X, PAY_Y, 0.28]} rotation={[0, PAY_TILT, 0]} scale={0.001}>
      <mesh geometry={bracketGeo} position={[-PAY_W / 2 - 0.04, 0, -0.16]}><meshStandardMaterial color={C.shellRim} metalness={0.85} roughness={0.3} /></mesh>
      <mesh geometry={bodyGeo}><meshStandardMaterial color={"#16243A"} emissive={C.bezel} emissiveIntensity={0.1} metalness={0.62} roughness={0.42} /></mesh>
      <mesh geometry={screenGeo} position={[0, PAY_H / 2 - 0.22, 0.055]}><meshStandardMaterial ref={screenMat} color={C.led} emissive={C.led} emissiveIntensity={0.75} metalness={0} roughness={0.5} toneMapped={false} /></mesh>
      <mesh geometry={nfcGeo} position={[0, PAY_H / 2 - 0.46, 0.055]}><meshBasicMaterial ref={nfcMat} color={C.led} transparent opacity={0.8} toneMapped={false} /></mesh>
      {keys.map((k, i) => (
        <mesh key={i} geometry={keyGeo} position={[k.kx, k.ky, 0.05]} material={i === 10 ? undefined : keyMatStatic}>
          {i === 10 && <meshStandardMaterial ref={okKeyMat} color={"#AECBEA"} emissive={C.bezelGlow} emissiveIntensity={0.35} metalness={0.3} roughness={0.45} />}
        </mesh>
      ))}
      <mesh geometry={swipeGeo} position={[PAY_W / 2 - 0.02, 0.02, 0.05]}><meshStandardMaterial color={C.slot} metalness={0.3} roughness={0.7} /></mesh>
    </group>
  );
};

// ─── Status traffic light (red / yellow / green) ────────────────────────────────
const StatusTrafficLight = () => {
  const housingGeo = useMemo(() => plateGeo(0.18, 0.5, 0.07, 0.06, 0.02), []);
  const ledGeo = useMemo(() => new THREE.CircleGeometry(0.046, 24), []);
  const haloTex = useMemo(() => radialTex(120, 255, 160), []);
  const grp = useRef<THREE.Group>(null);
  const redRef = useRef<THREE.MeshBasicMaterial>(null);
  const yelRef = useRef<THREE.MeshBasicMaterial>(null);
  const grnRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (grp.current) grp.current.scale.setScalar(easeOutCubic(rg(t, INTRO.traffic[0], INTRO.traffic[1])));
    const cyc = cycleTime(t);
    const blink = 0.35 + 0.65 * Math.abs(Math.sin(t * 9.0));
    const idle = cyc < P.highlight[0] || cyc >= P.deliver[1];
    const red = cyc >= P.highlight[0] && cyc < P.highlight[1] ? blink : 0.05;
    const yellow = cyc >= P.fall[0] && cyc < P.fall[1] ? blink : 0.05;
    const green = cyc >= P.deliver[0] && cyc < P.deliver[1] ? blink : (idle ? 0.7 : 0.05);
    if (redRef.current) redRef.current.color.setRGB(1.0 * red, 0.16 * red, 0.12 * red);
    if (yelRef.current) yelRef.current.color.setRGB(1.0 * yellow, 0.78 * yellow, 0.1 * yellow);
    if (grnRef.current) grnRef.current.color.setRGB(0.2 * green, 0.95 * green, 0.32 * green);
  });

  return (
    <group ref={grp} position={[-1.0, -1.62, 0.08]} scale={0.001}>
      <mesh geometry={housingGeo}><meshStandardMaterial color={"#080F1C"} metalness={0.6} roughness={0.5} /></mesh>
      <mesh geometry={ledGeo} position={[0, 0.15, 0.09]}><meshBasicMaterial ref={redRef} toneMapped={false} /></mesh>
      <mesh geometry={ledGeo} position={[0, 0, 0.09]}><meshBasicMaterial ref={yelRef} toneMapped={false} /></mesh>
      <mesh geometry={ledGeo} position={[0, -0.15, 0.09]}><meshBasicMaterial ref={grnRef} toneMapped={false} /></mesh>
      {/* subtle shared halo to make the lit LED bloom a little */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[0.55, 0.8]} />
        <meshBasicMaterial map={haloTex} transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ─── Scene ──────────────────────────────────────────────────────────────────
const Scene = () => (
  <>
    <CameraRig />
    <ambientLight intensity={0.42} />
    <pointLight position={[0, ZONE_HEADER_Y, 0.5]} intensity={2.4} color={C.led} distance={3.8} decay={1.9} />
    <pointLight position={[0, ZONE_GLASS_Y, 0.3]} intensity={0.9} color={C.bezelGlow} distance={2.5} decay={2.0} />
    <directionalLight position={[4, 5, 4]} intensity={1.0} color={"#BFE3FF"} />
    <directionalLight position={[-3, -2, 3]} intensity={0.45} color={"#3B82F6"} />
    <directionalLight position={[0, 1, -4]} intensity={0.55} color={"#7DD3FC"} />

    <Cabinet />
    <Shelves />
    <ProductGrid />
    <FallingProduct />
    <GlassBezel />
    <HeaderPanel />
    <DispenserSlot />
    <PaymentTerminal />
    <StatusTrafficLight />
  </>
);

// ─── Public component ─────────────────────────────────────────────────────────
type Props = { className?: string };

export const VendaiVendingLogo: React.FC<Props> = ({ className }) => (
  <div className={className} style={{ width: "100%", height: "100%" }}>
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
      camera={{ fov: 34, position: [0, 0.08, 8.6], near: 0.1, far: 60 }}
      style={{ background: "transparent" }}
    >
      <Scene />
    </Canvas>
  </div>
);

export default VendaiVendingLogo;
