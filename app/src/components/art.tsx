import { clsx } from '../lib/utils'

/*
 * Ilustrações em SVG com traço "feito à mão", nos tons do tema (brand = mocha).
 * Todas aceitam className para dimensionar (ex.: "h-24") e seguem o modo claro/noturno via tokens.
 */

type ArtProps = { className?: string; title?: string }

const ink = 'var(--app-ink)'
const stroke = { stroke: ink, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const

/** Xícara de café com vapor animado */
export function CupArt({ className, title = 'Xícara de café' }: ArtProps) {
  return (
    <svg viewBox="0 0 120 110" className={clsx('block', className)} role="img" aria-label={title}>
      <ellipse cx="60" cy="100" rx="40" ry="5" fill={ink} opacity="0.08" />
      <path d="M26 46h60v24a22 22 0 0 1-22 22H48a22 22 0 0 1-22-22z" fill="var(--color-brand-100)" />
      <path d="M26 46h60v24a22 22 0 0 1-22 22H48a22 22 0 0 1-22-22z" {...stroke} />
      <path d="M86 52h8a9 9 0 0 1 0 18h-8" {...stroke} />
      <ellipse cx="56" cy="46" rx="30" ry="5" fill="var(--color-brand-600)" />
      <ellipse cx="56" cy="46" rx="30" ry="5" {...stroke} />
      <path d="M44 58c6 4 18 4 24 0" {...stroke} strokeOpacity="0.35" />
      {[42, 56, 70].map((x, i) => (
        <path
          key={x}
          d={`M${x} 34c-5-6 5-8 0-14`}
          {...stroke}
          strokeOpacity="0.55"
          className="animate-steam"
          style={{ animationDelay: `${i * 0.9}s`, transformOrigin: `${x}px 34px` }}
        />
      ))}
    </svg>
  )
}

/** Gato na janela, lua, plantinha — cena do rodapé da sidebar */
export function CatWindowArt({ className, title = 'Gato na janela' }: ArtProps) {
  return (
    <svg viewBox="0 0 200 120" className={clsx('block', className)} role="img" aria-label={title}>
      {/* janela */}
      <rect x="30" y="8" width="110" height="82" rx="6" fill="var(--color-brand-200)" opacity="0.6" />
      <rect x="30" y="8" width="110" height="82" rx="6" {...stroke} />
      <path d="M85 8v82M30 49h110" {...stroke} strokeOpacity="0.5" />
      <circle cx="112" cy="30" r="9" fill="var(--color-brand-50)" />
      <circle cx="116" cy="27" r="8" fill="var(--color-brand-200)" opacity="0.6" />
      {[
        [48, 20],
        [62, 34],
        [100, 44],
      ].map(([x, y]) => (
        <path key={x} d={`M${x} ${y - 3}v6M${x - 3} ${y}h6`} {...stroke} strokeWidth={1.5} strokeOpacity="0.6" />
      ))}
      {/* peitoril */}
      <rect x="22" y="90" width="126" height="8" rx="3" fill="var(--color-brand-300)" />
      <rect x="22" y="90" width="126" height="8" rx="3" {...stroke} />
      {/* gato */}
      <g className="animate-float">
        <path d="M58 90c-2-14 4-26 16-26s18 12 16 26z" fill="var(--color-brand-700)" />
        <path d="M58 90c-2-14 4-26 16-26s18 12 16 26z" {...stroke} />
        <path d="M64 66l-2-12 8 7M84 66l2-12-8 7" {...stroke} fill="var(--color-brand-700)" />
        <path d="M90 84c8-2 14 4 10 10" {...stroke} />
        <g style={{ transformOrigin: '74px 73px' }} className="animate-blink">
          <path d="M70 73h2M78 73h2" {...stroke} strokeWidth={2.5} />
        </g>
      </g>
      {/* planta */}
      <path d="M156 98h20l-3 14h-14z" fill="var(--color-brand-100)" />
      <path d="M156 98h20l-3 14h-14z" {...stroke} />
      <path d="M166 98c-10-6-10-18-2-24c8 6 10 16 2 24zM166 98c10-2 16-12 10-20c-8 2-12 12-10 20zM166 98c-10 0-18-8-14-16c8 0 14 8 14 16z" fill="var(--app-ok)" opacity="0.8" />
      <path d="M166 98c-10-6-10-18-2-24M166 98c10-2 16-12 10-20M166 98c-10 0-18-8-14-16" {...stroke} strokeOpacity="0.6" />
    </svg>
  )
}

/** Pilha de livros com caneca — estados vazios */
export function BooksMugArt({ className, title = 'Livros e caneca' }: ArtProps) {
  return (
    <svg viewBox="0 0 160 110" className={clsx('block', className)} role="img" aria-label={title}>
      <ellipse cx="80" cy="102" rx="60" ry="5" fill={ink} opacity="0.08" />
      <rect x="26" y="78" width="80" height="18" rx="3" fill="var(--color-brand-300)" />
      <rect x="26" y="78" width="80" height="18" rx="3" {...stroke} />
      <rect x="34" y="60" width="70" height="18" rx="3" fill="var(--app-ok)" opacity="0.7" />
      <rect x="34" y="60" width="70" height="18" rx="3" {...stroke} />
      <rect x="30" y="42" width="62" height="18" rx="3" fill="var(--color-brand-100)" />
      <rect x="30" y="42" width="62" height="18" rx="3" {...stroke} />
      <path d="M40 51h30M44 69h40M38 87h50" {...stroke} strokeOpacity="0.4" />
      {/* caneca */}
      <path d="M110 62h28v26a8 8 0 0 1-8 8h-12a8 8 0 0 1-8-8z" fill="var(--color-brand-600)" />
      <path d="M110 62h28v26a8 8 0 0 1-8 8h-12a8 8 0 0 1-8-8z" {...stroke} />
      <path d="M138 68h4a6 6 0 0 1 0 12h-4" {...stroke} />
      {[118, 130].map((x, i) => (
        <path key={x} d={`M${x} 52c-4-5 4-7 0-12`} {...stroke} strokeOpacity="0.5" className="animate-steam" style={{ animationDelay: `${i * 1.1}s`, transformOrigin: `${x}px 52px` }} />
      ))}
      {/* óculos pousados */}
      <circle cx="52" cy="32" r="7" {...stroke} />
      <circle cx="70" cy="32" r="7" {...stroke} />
      <path d="M59 32h4" {...stroke} />
    </svg>
  )
}

/** Fita cassete — estatísticas / histórico */
export function CassetteArt({ className, title = 'Fita cassete' }: ArtProps) {
  return (
    <svg viewBox="0 0 160 100" className={clsx('block', className)} role="img" aria-label={title}>
      <rect x="16" y="16" width="128" height="72" rx="8" fill="var(--color-brand-200)" />
      <rect x="16" y="16" width="128" height="72" rx="8" {...stroke} />
      <rect x="30" y="26" width="100" height="30" rx="5" fill="var(--color-brand-50)" />
      <rect x="30" y="26" width="100" height="30" rx="5" {...stroke} strokeOpacity="0.6" />
      <circle cx="58" cy="41" r="7" {...stroke} fill="var(--app-surface)" />
      <circle cx="102" cy="41" r="7" {...stroke} fill="var(--app-surface)" />
      <path d="M65 41h30" {...stroke} strokeOpacity="0.5" />
      <path d="M40 76h80" {...stroke} strokeOpacity="0.4" />
      <path d="M42 62h30" {...stroke} strokeWidth={3} stroke="var(--app-bad)" strokeOpacity="0.7" />
      <path d="M76 62h30" {...stroke} strokeWidth={3} stroke="var(--app-ok)" strokeOpacity="0.7" />
    </svg>
  )
}

/** Fone de ouvido — revisões / planejamento */
export function HeadphonesArt({ className, title = 'Fone de ouvido' }: ArtProps) {
  return (
    <svg viewBox="0 0 140 110" className={clsx('block', className)} role="img" aria-label={title}>
      <path d="M28 70V54a42 42 0 0 1 84 0v16" {...stroke} strokeWidth={4} />
      <rect x="18" y="60" width="22" height="36" rx="8" fill="var(--color-brand-600)" />
      <rect x="18" y="60" width="22" height="36" rx="8" {...stroke} />
      <rect x="100" y="60" width="22" height="36" rx="8" fill="var(--color-brand-600)" />
      <rect x="100" y="60" width="22" height="36" rx="8" {...stroke} />
      <path d="M52 80c6-8 12 8 18 0s12 8 18 0" {...stroke} strokeOpacity="0.6" />
      <path d="M70 24v-6M84 30l4-5M56 30l-4-5" {...stroke} strokeOpacity="0.5" />
    </svg>
  )
}

/** Janela com chuva — fundo do cronômetro (modo noturno) */
export function RainWindowArt({ className, title = 'Janela com chuva' }: ArtProps) {
  const drops = Array.from({ length: 22 }, (_, i) => ({ x: 14 + ((i * 37) % 212), d: (i % 7) * 0.16, l: 10 + (i % 3) * 6 }))
  return (
    <svg viewBox="0 0 240 180" className={clsx('block', className)} role="img" aria-label={title}>
      <defs>
        <clipPath id="rain-window">
          <rect x="20" y="14" width="200" height="140" rx="10" />
        </clipPath>
      </defs>
      <rect x="20" y="14" width="200" height="140" rx="10" fill="#2b2a3f" />
      <circle cx="170" cy="56" r="18" fill="#f1e6d7" opacity="0.9" />
      <circle cx="178" cy="50" r="16" fill="#2b2a3f" opacity="0.9" />
      {[
        [50, 40],
        [80, 70],
        [120, 36],
        [60, 100],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="1.6" fill="#f1e6d7" opacity="0.8" />
      ))}
      {/* prédios ao longe */}
      <path d="M20 154V120h18v-14h16v22h14v-30h20v40h12v-18h18v18h22v-26h16v34h20v-12h14v22z" fill="#1f1e2e" />
      {[
        [44, 128],
        [72, 136],
        [94, 118],
        [150, 142],
        [184, 132],
      ].map(([x, y]) => (
        <rect key={x} x={x} y={y} width="4" height="5" fill="#e2b55e" opacity="0.8" />
      ))}
      <g clipPath="url(#rain-window)">
        {drops.map((r, i) => (
          <line
            key={i}
            x1={r.x}
            y1={0}
            x2={r.x - 3}
            y2={r.l}
            stroke="#c9d3ee"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="animate-rain"
            style={{ animationDelay: `-${r.d}s`, transform: `translateY(${(i * 23) % 150}px)` }}
          />
        ))}
      </g>
      <rect x="20" y="14" width="200" height="140" rx="10" fill="none" stroke="#5c3d24" strokeWidth="6" />
      <path d="M120 14v140M20 84h200" stroke="#5c3d24" strokeWidth="5" />
      <rect x="10" y="154" width="220" height="10" rx="4" fill="#5c3d24" />
    </svg>
  )
}

export type ArtName = 'cup' | 'cat' | 'books' | 'cassette' | 'headphones' | 'none'

export function Art({ name, className }: { name: ArtName; className?: string }) {
  switch (name) {
    case 'cup':
      return <CupArt className={className} />
    case 'cat':
      return <CatWindowArt className={className} />
    case 'books':
      return <BooksMugArt className={className} />
    case 'cassette':
      return <CassetteArt className={className} />
    case 'headphones':
      return <HeadphonesArt className={className} />
    default:
      return null
  }
}
