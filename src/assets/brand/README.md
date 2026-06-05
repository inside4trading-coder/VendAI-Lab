# VendAI · Manual de Marca (referencia)

Esta carpeta contiene la fuente de verdad del sistema visual de VendAI:

- `VendAI_Manual_de_Marca.html` + `manual.css` — manual completo (tipografía, colores, degradados, espaciados).
- `VendAI_Logos.html` + `logo-app.jsx` — propuestas de logo (isotipo chip + wordmark Vend/AI).
- `design-canvas.jsx` — wrapper de canvas tipo Figma usado en los HTML de referencia.

## Uso

Material de consulta únicamente. **No importar en runtime.** Al construir componentes (Tailwind config, `index.css`, Logo, isotipo, etc.) se replican aquí los tokens — esta carpeta sirve para verificar fidelidad.

Tokens clave:
- Neutros: ink `#0E1116`, ink-2 `#363C45`, muted `#737A84`, faint `#A6ACB5`, line `#E7E9ED`, panel `#F5F6F8`, paper `#FFFFFF`.
- Marca: signal-blue `#1A8CFF`, cyan `#22C9E6`, aqua `#46E4CF`, crypto-green `#16D399`, violet `#7C5CFC`.
- Degradado Signal: `linear-gradient(120deg,#2B7FF5 0%,#1FB6E8 52%,#46E4CF 100%)`.
- Degradado Crypto: `linear-gradient(120deg,#1FB6E8 0%,#19D2BC 50%,#16D399 100%)`.
- Wordmark stroke: `#B8BEC8`.
- Tipografías: Unbounded (display), Familjen Grotesk (body), JetBrains Mono (mono/eyebrows).
