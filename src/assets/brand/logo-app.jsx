// VendAI — 5 propuestas de logo
// Cada propuesta: isotipo geométrico + wordmark (Vend contorno / AI sólido)

const { useState } = React;

/* ---------- Sistema de degradados ---------- */
// variant: 'aqua' (cian→azul base) | 'violet' (azul→violeta) | 'crypto' (teal→verde)
function gradStops(variant) {
  switch (variant) {
    case 'violet': return [['#2B7FF5', 0], ['#5A6CF8', 0.55], ['#7C5CFC', 1]];
    case 'crypto': return [['#1FB6E8', 0], ['#19D2BC', 0.55], ['#16D399', 1]];
    default:       return [['#2B7FF5', 0], ['#1FB6E8', 0.55], ['#46E4CF', 1]];
  }
}
function Grad({ id, variant, vertical }) {
  const coords = vertical
    ? { x1: '0', y1: '100%', x2: '0', y2: '0' }
    : { x1: '0', y1: '100%', x2: '100%', y2: '0' };
  return (
    <linearGradient id={id} {...coords}>
      {gradStops(variant).map(([c, o], i) => <stop key={i} offset={o} stopColor={c} />)}
    </linearGradient>
  );
}
function cssGrad(variant) {
  const s = gradStops(variant);
  return `linear-gradient(40deg, ${s[0][0]} 0%, ${s[1][0]} 55%, ${s[2][0]} 100%)`;
}

/* ---------- 5 isotipos ---------- */
function MarkFlow({ size = 92, variant = 'aqua' }) {
  return (
    <svg width={size} height={size * 0.64} viewBox="0 0 156 100" aria-hidden="true">
      <defs><Grad id="g-flow" variant={variant} /></defs>
      <g fill="none" stroke="url(#g-flow)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="28" x2="66" y2="28" />
        <line x1="9" y1="50" x2="98" y2="50" />
        <line x1="9" y1="72" x2="50" y2="72" />
        <polyline points="92,20 130,50 92,80" />
      </g>
    </svg>
  );
}
function MarkNode({ size = 92, variant = 'violet' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 104" aria-hidden="true">
      <defs><Grad id="g-node" variant={variant} /></defs>
      <g fill="none" stroke="url(#g-node)" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="24" x2="60" y2="84" />
        <line x1="102" y1="24" x2="60" y2="84" />
      </g>
      <circle cx="18" cy="24" r="11" fill="#2B7FF5" />
      <circle cx="102" cy="24" r="11" fill="#7C5CFC" />
      <circle cx="60" cy="84" r="12" fill="#1FB6E8" />
    </svg>
  );
}
function MarkChip({ size = 88, variant = 'crypto' }) {
  const pins = [];
  // top & bottom pins
  [30, 55, 80].forEach((x) => {
    pins.push(<line key={'t' + x} x1={x} y1="6" x2={x} y2="20" />);
    pins.push(<line key={'b' + x} x1={x} y1="90" x2={x} y2="104" />);
  });
  [30, 55, 80].forEach((y) => {
    pins.push(<line key={'l' + y} x1="6" y1={y} x2="20" y2={y} />);
    pins.push(<line key={'r' + y} x1="90" y1={y} x2="104" y2={y} />);
  });
  return (
    <svg width={size} height={size} viewBox="0 0 110 110" aria-hidden="true">
      <defs><Grad id="g-chip" variant={variant} /></defs>
      <g stroke="url(#g-chip)" strokeWidth="7" strokeLinecap="round" fill="none">{pins}</g>
      <rect x="20" y="20" width="70" height="70" rx="16" fill="none" stroke="url(#g-chip)" strokeWidth="7" />
      <rect x="40" y="40" width="30" height="30" rx="8" fill="url(#g-chip)" />
    </svg>
  );
}
function MarkPrism({ size = 96, variant = 'violet' }) {
  return (
    <svg width={size} height={size * 0.82} viewBox="0 0 140 110" aria-hidden="true">
      <defs><Grad id="g-prism" variant={variant} /></defs>
      <path d="M58 12 L102 55 L58 98 L14 55 Z" fill="none" stroke="url(#g-prism)" strokeWidth="8" strokeLinejoin="round" />
      <g stroke="url(#g-prism)" strokeWidth="7" strokeLinecap="round">
        <line x1="100" y1="42" x2="132" y2="34" />
        <line x1="102" y1="55" x2="136" y2="55" />
        <line x1="100" y1="68" x2="132" y2="76" />
      </g>
    </svg>
  );
}
function MarkBars({ size = 90, variant = 'aqua' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 104" aria-hidden="true">
      <defs><Grad id="g-bars" variant={variant} vertical /></defs>
      <g fill="url(#g-bars)" transform="skewX(-7)">
        <rect x="14" y="64" width="17" height="30" rx="8" />
        <rect x="42" y="46" width="17" height="48" rx="8" />
        <rect x="70" y="28" width="17" height="66" rx="8" />
        <rect x="98" y="10" width="17" height="84" rx="8" />
      </g>
    </svg>
  );
}

/* ---------- Wordmark ---------- */
function Wordmark({ font, variant = 'aqua', size = 58 }) {
  const aiStyle = {
    backgroundImage: cssGrad(variant),
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
  };
  return (
    <span style={{
      fontFamily: font, fontSize: size, fontWeight: 600,
      letterSpacing: '-0.01em', lineHeight: 1, whiteSpace: 'nowrap',
      display: 'inline-flex', alignItems: 'baseline',
    }}>
      <span style={{
        WebkitTextStroke: '1.4px #B5BCC6', color: 'transparent',
        WebkitTextFillColor: 'transparent',
      }}>Vend</span>
      <span style={aiStyle}>AI</span>
    </span>
  );
}

/* ---------- Tarjeta de logo ---------- */
function LogoCard({ mark, font, variant, name, tagline, fontLabel, layout = 'left', markSize }) {
  const stack = layout === 'top';
  return (
    <div style={{
      width: '100%', height: '100%', background: '#FFFFFF',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* zona del lockup */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: stack ? 'column' : 'row',
        gap: stack ? 24 : 30, padding: '40px 44px',
      }}>
        {layout !== 'right' && mark}
        <Wordmark font={font} variant={variant} />
        {layout === 'right' && mark}
      </div>
      {/* pie: isotipo mini + concepto */}
      <div style={{
        borderTop: '1px solid #ECEEF1', padding: '16px 26px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 11, background: '#F6F7F9',
            border: '1px solid #ECEEF1', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ transform: 'scale(0.42)' }}>{markSize || mark}</div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D21', letterSpacing: '0.01em' }}>{name}</div>
            <div style={{ fontSize: 11, color: '#8A9099', marginTop: 3, maxWidth: 320 }}>{tagline}</div>
          </div>
        </div>
        <div style={{
          fontSize: 10, color: '#A4AAB3', textTransform: 'uppercase', letterSpacing: '0.08em',
          textAlign: 'right', whiteSpace: 'nowrap',
        }}>
          <div style={{ color: '#C7CCD3' }}>type</div>
          <div style={{ color: '#7A828C', marginTop: 2 }}>{fontLabel}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- App ---------- */
const AW = 660, AH = 380;
function App() {
  return (
    <DesignCanvas>
      <DCSection id="logos" title="VendAI · Propuestas de logo"
        subtitle="5 direcciones — isotipo + wordmark. Vend en contorno / AI sólido. Base cian→azul, acentos explorados.">

        <DCArtboard id="flow" label="01 · Flow" width={AW} height={AH}>
          <LogoCard
            mark={<MarkFlow variant="aqua" />}
            font="'Space Grotesk', sans-serif"
            variant="aqua" layout="right"
            name="FLOW — la flecha refinada"
            tagline="Fiel a la referencia. Momentum, “ship forward”. Versátil para todas las verticales."
            fontLabel="Space Grotesk" />
        </DCArtboard>

        <DCArtboard id="node" label="02 · Nodo-V" width={AW} height={AH}>
          <LogoCard
            mark={<MarkNode variant="violet" />}
            font="'Chakra Petch', sans-serif"
            variant="violet" layout="left"
            name="NODO — la V de red"
            tagline="Una “V” formada por nodos. El laboratorio conectando AI · Crypto · tradicional. Acento violeta."
            fontLabel="Chakra Petch" />
        </DCArtboard>

        <DCArtboard id="chip" label="03 · Núcleo" width={AW} height={AH}>
          <LogoCard
            mark={<MarkChip variant="crypto" />}
            font="'JetBrains Mono', monospace"
            variant="crypto" layout="left"
            name="NÚCLEO — el chip"
            tagline="Silicio / cómputo. La máquina como núcleo de IA. Acento verde-cripto, tono mono."
            fontLabel="JetBrains Mono" />
        </DCArtboard>

        <DCArtboard id="prism" label="04 · Prisma" width={AW} height={AH}>
          <LogoCard
            mark={<MarkPrism variant="violet" />}
            font="'Sora', sans-serif"
            variant="violet" layout="top"
            name="PRISMA — el laboratorio"
            tagline="Un input refractado en múltiples salidas: la tesis del lab. Lockup vertical, acento violeta."
            fontLabel="Sora" />
        </DCArtboard>

        <DCArtboard id="bars" label="05 · Ascenso" width={AW} height={AH}>
          <LogoCard
            mark={<MarkBars variant="aqua" />}
            font="'Space Grotesk', sans-serif"
            variant="aqua" layout="left"
            name="ASCENSO — las barras"
            tagline="Las líneas de movimiento como barras en crecimiento. Tracción, dispensado, momentum."
            fontLabel="Space Grotesk" />
        </DCArtboard>

      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
