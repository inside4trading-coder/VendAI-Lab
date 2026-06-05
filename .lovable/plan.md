# Renovar el motion del Hero con `VendaiVendingLogo` (R3F)

## Contexto

El usuario adjuntó `VendaiVendingLogo.tsx` (525 líneas), un componente React 3D auto-contenido basado en **three + @react-three/fiber**. Fondo transparente, loop infinito, ciclo de dispensación (LEDs rojo → amarillo → verde). Sustituye al vídeo `vending.webm/mp4` actual con calidad vectorial, peso ligero (sin assets de vídeo) y sin artefactos de chroma-key.

## Cambios

### 1. Dependencias

Añadir:
- `three`
- `@react-three/fiber`
- `@types/three` (dev)

### 2. Nuevo archivo `src/components/brand/VendaiVendingLogo.tsx`

Copiar el contenido del adjunto tal cual. Es self-contained, fondo transparente, exporta `VendaiVendingLogo`.

### 3. `src/components/brand/AnimatedChip.tsx`

Sustituir el `<video>` por `<VendaiVendingLogo />` dentro del wrapper cuadrado:

- Quitar `<video>`, `<source>` y `mixBlendMode: "screen"` (ya no hay fondo negro).
- Mantener API (`className`, `size`, `title`) y fallback `prefers-reduced-motion` → `<ChipLogo>` estático.
- Wrapper sigue siendo `relative aspect-square` con `role="img"` y `aria-label`.
- Lazy-load del componente con `React.lazy` + `Suspense` (fallback al `ChipLogo`) para no cargar three.js en el bundle inicial.

### 4. `src/components/landing/Hero.tsx`

- Mantener tamaño `w-[280px] md:w-[360px]`.
- Bajar la opacidad del aura de `0.5` a `~0.35` (el componente 3D ya tiene su propio bezel-glow azul, no queremos saturar).
- Mantener `animate-chip-float` (la flotación CSS sigue bien sobre el canvas).

### 5. Limpieza

Borrar:
- `public/brand/vending.webm`
- `public/brand/vending.mp4`
- `public/brand/vending-poster.png`

### 6. `tailwind.config.ts`

Sin cambios (mantener `chip-float` con rotación ±1°).

## Rendimiento

- three + r3f pesan ~150 KB gzip. Lazy-load con `React.lazy` para que no bloqueen el LCP del Hero; el SVG `ChipLogo` se muestra durante el chunk fetch.
- Canvas transparente (`gl={{ alpha: true }}`, ya está en el componente).
- `prefers-reduced-motion` → fallback SVG estático, sin three.js cargado.

## Accesibilidad

- `aria-label="VendAI — máquina de vending"` en el wrapper.
- Canvas decorativo (`aria-hidden` implícito vía rol del padre).

## Validación

Tras instalar deps y renderizar:
1. Canvas se ve sin caja negra, sobre el aura azul del Hero.
2. Loop de dispensación visible cada ~5–6s.
3. Fallback funciona con `prefers-reduced-motion: reduce`.
4. Bundle inicial no incluye three (verificar con el chunk lazy).

## Archivos

- **Nuevo**: `src/components/brand/VendaiVendingLogo.tsx`.
- **Editar**: `src/components/brand/AnimatedChip.tsx`, `src/components/landing/Hero.tsx`, `package.json`.
- **Borrar**: `public/brand/vending.{webm,mp4}`, `public/brand/vending-poster.png`.

## Fuera de alcance

- Cambiar header/footer/favicon.
- Modificar otras secciones de la landing.
- Personalizar la paleta del componente 3D (usa azules ya alineados con `signal-blue`).
