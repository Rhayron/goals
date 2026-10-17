import { useId, type CSSProperties } from 'react'
import { clsx } from '../lib/utils'

/*
 * Ilustrações das telas de entrada, boas-vindas e conta — mesmo traço "feito à mão" de art.tsx
 * (contorno na cor da tinta, preenchimentos nos tons mocha) e seguem o modo claro/noturno.
 */

type ArtProps = { className?: string; title?: string }

const ink = 'var(--app-ink)'
const stroke = { stroke: ink, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const

/** id seguro para clipPath/gradiente (useId do React traz caracteres que não servem em url(#…)) */
const useSvgId = (prefix: string) => `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

function Steam({ xs, y, delay = 0.9 }: { xs: number[]; y: number; delay?: number }) {
  return (
    <>
      {xs.map((x, i) => (
        <path
          key={x}
          d={`M${x} ${y}c-5-6 5-8 0-14`}
          {...stroke}
          strokeOpacity="0.5"
          className="animate-steam"
          style={{ animationDelay: `${i * delay}s`, transformOrigin: `${x}px ${y}px` }}
        />
      ))}
    </>
  )
}

/** Cena principal da entrada: janela à noite, luminárias, estante e a xícara no balcão */
export function CafeSceneArt({ className, title = 'Cafeteria à noite' }: ArtProps) {
  const clip = useSvgId('cafe-window')
  const glow = useSvgId('cafe-glow')

  return (
    <svg viewBox="0 0 480 440" className={clsx('block', className)} role="img" aria-label={title}>
      <defs>
        <clipPath id={clip}>
          <path d="M70 250V120a125 100 0 0 1 250 0v130z" />
        </clipPath>
        <radialGradient id={glow}>
          <stop offset="0%" stopColor="#ffd98a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* janela em arco: cidade à noite */}
      <path d="M70 250V120a125 100 0 0 1 250 0v130z" fill="#2b2a3f" />
      <g clipPath={`url(#${clip})`}>
        <circle cx="255" cy="80" r="20" fill="#f1e6d7" opacity="0.9" />
        <circle cx="264" cy="73" r="18" fill="#2b2a3f" />
        {[
          [110, 70],
          [150, 50],
          [200, 95],
          [290, 120],
          [130, 110],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#f1e6d7" opacity="0.7" />
        ))}
        <path d="M70 250v-62h26v-20h22v34h18v-48h28v58h16v-26h24v26h30v-38h22v50h26v-20h20v46z" fill="#1f1e2e" />
        {[
          [80, 200],
          [104, 186],
          [146, 168],
          [152, 200],
          [210, 210],
          [262, 196],
          [300, 218],
        ].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="5" height="6" fill="#e2b55e" opacity="0.85" />
        ))}
      </g>
      <path d="M70 250V120a125 100 0 0 1 250 0v130z" fill="none" stroke="#5c3d24" strokeWidth="8" />
      <path d="M195 20v230M70 150h250" stroke="#5c3d24" strokeWidth="6" />

      {/* luminárias pendentes */}
      {[
        [370, 70, 0],
        [430, 110, 1.6],
      ].map(([x, len, d]) => (
        <g key={x} className="animate-float" style={{ animationDelay: `${d}s`, transformOrigin: `${x}px 0px` }}>
          <ellipse cx={x} cy={len + 46} rx="46" ry="34" fill={`url(#${glow})`} />
          <path d={`M${x} 0v${len}`} {...stroke} strokeWidth={1.5} />
          <path d={`M${x - 18} ${len + 22}a18 18 0 0 1 36 0z`} fill="var(--color-brand-600)" />
          <path d={`M${x - 18} ${len + 22}a18 18 0 0 1 36 0z`} {...stroke} />
          <circle cx={x} cy={len + 25} r="4" fill="#ffd98a" />
        </g>
      ))}

      {/* prateleira com potes e planta */}
      <rect x="340" y="250" width="120" height="7" rx="3" fill="var(--color-brand-300)" />
      <rect x="340" y="250" width="120" height="7" rx="3" {...stroke} />
      {[
        [350, 'var(--color-brand-200)'],
        [378, 'var(--color-brand-100)'],
      ].map(([x, fill]) => (
        <g key={x}>
          <rect x={Number(x)} y="222" width="22" height="28" rx="5" fill={String(fill)} />
          <rect x={Number(x)} y="222" width="22" height="28" rx="5" {...stroke} />
          <rect x={Number(x) + 3} y="216" width="16" height="7" rx="2" fill="var(--color-brand-600)" />
          <rect x={Number(x) + 3} y="216" width="16" height="7" rx="2" {...stroke} />
          {[0, 1, 2].map((k) => (
            <ellipse key={k} cx={Number(x) + 7 + k * 4} cy={240 - (k % 2) * 6} rx="2.4" ry="1.6" fill="var(--color-brand-800)" />
          ))}
        </g>
      ))}
      <path d="M420 228h24l-3 22h-18z" fill="var(--color-brand-100)" />
      <path d="M420 228h24l-3 22h-18z" {...stroke} />
      <path d="M432 228c-14-6-16-24-4-32c10 8 12 22 4 32zM432 228c14-2 22-16 14-28c-10 4-16 16-14 28zM432 228c-4 6-22 10-26 0c6-8 20-8 26 0z" fill="var(--app-ok)" opacity="0.85" />
      <path d="M432 228c-14-6-16-24-4-32M432 228c14-2 22-16 14-28" {...stroke} strokeOpacity="0.6" />

      {/* balcão */}
      <rect x="20" y="300" width="440" height="16" rx="6" fill="var(--color-brand-700)" />
      <rect x="20" y="300" width="440" height="16" rx="6" {...stroke} />
      <path d="M36 316v110M444 316v110" {...stroke} strokeOpacity="0.4" />

      {/* livros */}
      <rect x="60" y="282" width="96" height="18" rx="3" fill="var(--color-brand-300)" />
      <rect x="60" y="282" width="96" height="18" rx="3" {...stroke} />
      <rect x="68" y="264" width="80" height="18" rx="3" fill="var(--app-ok)" opacity="0.75" />
      <rect x="68" y="264" width="80" height="18" rx="3" {...stroke} />
      <path d="M78 273h40M72 291h50" {...stroke} strokeOpacity="0.4" />

      {/* xícara com vapor, apoiada no balcão */}
      <g transform="translate(109 135) scale(0.55)">
        <ellipse cx="248" cy="300" rx="52" ry="6" fill={ink} opacity="0.1" />
        <path d="M206 236h72v30a26 26 0 0 1-26 26h-20a26 26 0 0 1-26-26z" fill="var(--color-brand-100)" />
        <path d="M206 236h72v30a26 26 0 0 1-26 26h-20a26 26 0 0 1-26-26z" {...stroke} />
        <path d="M278 244h8a11 11 0 0 1 0 22h-8" {...stroke} />
        <ellipse cx="242" cy="236" rx="36" ry="6" fill="var(--color-brand-600)" />
        <ellipse cx="242" cy="236" rx="36" ry="6" {...stroke} />
        <path d="M232 233c4-3 10-3 12 0c2 3-6 5-12 0z" fill="var(--color-brand-100)" opacity="0.9" />
        <ellipse cx="242" cy="294" rx="50" ry="6" fill="var(--color-brand-200)" />
        <ellipse cx="242" cy="294" rx="50" ry="6" {...stroke} />
        <Steam xs={[226, 242, 258]} y={222} />
      </g>

      {/* rádio tocando lofi */}
      <rect x="330" y="262" width="78" height="38" rx="8" fill="var(--color-brand-200)" />
      <rect x="330" y="262" width="78" height="38" rx="8" {...stroke} />
      <circle cx="352" cy="281" r="10" fill="var(--app-surface)" />
      <circle cx="352" cy="281" r="10" {...stroke} />
      <circle cx="352" cy="281" r="3" fill={ink} opacity="0.6" />
      <path d="M372 274h26M372 281h26M372 288h18" {...stroke} strokeOpacity="0.5" />
      <path d="M392 262l10-14" {...stroke} />
      {[
        ['M340 246c0-6 6-6 6-10v14a3 3 0 1 1-3-3', 0],
        ['M384 236c0-6 6-6 6-10v14a3 3 0 1 1-3-3', 1.4],
      ].map(([d, delay]) => (
        <path key={String(delay)} d={String(d)} {...stroke} strokeOpacity="0.55" className="animate-steam" style={{ animationDelay: `${delay}s`, animationDuration: '4.5s' }} />
      ))}

      {/* gato dormindo no canto do balcão */}
      <path d="M100 300c0-16 14-24 30-22s24 12 22 22z" fill="var(--color-brand-800)" />
      <path d="M100 300c0-16 14-24 30-22s24 12 22 22z" {...stroke} />
      <path d="M106 284l-2-10 9 6" {...stroke} fill="var(--color-brand-800)" />
      <path d="M112 291c2 1 5 1 7 0" {...stroke} strokeWidth={1.5} />
      <path d="M152 298c10 0 14-8 8-12" {...stroke} />
      <text x="150" y="268" fontSize="12" fill={ink} opacity="0.5" className="animate-steam" style={{ animationDuration: '5s' }}>
        z
      </text>
    </svg>
  )
}

/** Xícara que enche conforme o progresso (0–1) */
export function FillingCup({ level, className }: { level: number; className?: string }) {
  const clip = useSvgId('fill-cup')
  const l = Math.max(0, Math.min(1, level))
  const style: CSSProperties = { transform: `translateY(${(1 - l) * 50}px)`, transition: 'transform 700ms cubic-bezier(.4,1.4,.6,1)' }
  return (
    <svg viewBox="0 0 120 120" className={clsx('block', className)} role="img" aria-label={`Xícara ${Math.round(l * 100)}% cheia`}>
      <defs>
        <clipPath id={clip}>
          <path d="M26 46h60v24a22 22 0 0 1-22 22H48a22 22 0 0 1-22-22z" />
        </clipPath>
      </defs>
      <ellipse cx="58" cy="104" rx="42" ry="5" fill={ink} opacity="0.08" />
      <ellipse cx="56" cy="96" rx="40" ry="5" fill="var(--color-brand-200)" />
      <ellipse cx="56" cy="96" rx="40" ry="5" {...stroke} />
      <path d="M26 46h60v24a22 22 0 0 1-22 22H48a22 22 0 0 1-22-22z" fill="var(--app-surface)" />
      <g clipPath={`url(#${clip})`}>
        <g style={style}>
          <path d="M0 44q10-5 20 0t20 0t20 0t20 0t20 0t20 0v60H0z" fill="var(--color-brand-600)" className="animate-wave" />
          <path d="M14 52c6 4 18 4 24 0" {...stroke} stroke="var(--color-brand-200)" strokeOpacity="0.6" />
        </g>
      </g>
      <path d="M26 46h60v24a22 22 0 0 1-22 22H48a22 22 0 0 1-22-22z" {...stroke} />
      <path d="M86 52h8a9 9 0 0 1 0 18h-8" {...stroke} />
      <g style={{ opacity: l >= 1 ? 1 : 0, transition: 'opacity 600ms' }}>
        <Steam xs={[44, 58, 72]} y={36} />
      </g>
    </svg>
  )
}

/** Pote de grãos com etiquetas coloridas — planos e disciplinas */
export function BeanJarArt({ className, title = 'Pote de grãos' }: ArtProps) {
  const beans = [
    [44, 96, 'var(--color-brand-800)'],
    [58, 102, 'var(--color-brand-700)'],
    [74, 96, 'var(--color-brand-800)'],
    [88, 103, 'var(--color-brand-700)'],
    [50, 84, 'var(--color-brand-700)'],
    [66, 88, 'var(--color-brand-800)'],
    [82, 84, 'var(--color-brand-700)'],
    [58, 74, 'var(--color-brand-800)'],
    [74, 72, 'var(--color-brand-700)'],
  ] as const
  return (
    <svg viewBox="0 0 160 130" className={clsx('block', className)} role="img" aria-label={title}>
      <ellipse cx="68" cy="122" rx="48" ry="5" fill={ink} opacity="0.08" />
      <rect x="30" y="40" width="76" height="78" rx="14" fill="var(--color-brand-50)" />
      {beans.map(([x, y, fill], i) => (
        <g key={i} transform={`rotate(${i * 37} ${x} ${y})`}>
          <ellipse cx={x} cy={y} rx="6" ry="4" fill={fill} />
          <path d={`M${x - 4} ${y}q4 -2 8 0`} stroke="var(--color-brand-300)" strokeWidth="1" fill="none" />
        </g>
      ))}
      <rect x="30" y="40" width="76" height="78" rx="14" {...stroke} />
      <rect x="36" y="26" width="64" height="16" rx="4" fill="var(--color-brand-600)" />
      <rect x="36" y="26" width="64" height="16" rx="4" {...stroke} />
      <rect x="44" y="52" width="48" height="16" rx="3" fill="var(--app-kraft)" />
      <rect x="44" y="52" width="48" height="16" rx="3" {...stroke} strokeWidth={1.5} />
      <path d="M52 60h32" {...stroke} strokeOpacity="0.5" />
      {/* etiquetas das disciplinas */}
      {[
        [116, 46, '#e8a598'],
        [122, 70, '#9cc3a0'],
        [116, 94, '#a9bde0'],
      ].map(([x, y, c], i) => (
        <g key={i} className="animate-float" style={{ animationDelay: `${i * 0.8}s` }}>
          <rect x={Number(x)} y={Number(y)} width="34" height="14" rx="7" fill={String(c)} />
          <rect x={Number(x)} y={Number(y)} width="34" height="14" rx="7" {...stroke} strokeWidth={1.5} />
          <circle cx={Number(x) + 7} cy={Number(y) + 7} r="2" fill={ink} opacity="0.6" />
        </g>
      ))}
    </svg>
  )
}

/** Coador (V60) pingando na jarra — cronômetro e registro */
export function PourOverArt({ className, title = 'Café coado' }: ArtProps) {
  return (
    <svg viewBox="0 0 140 140" className={clsx('block', className)} role="img" aria-label={title}>
      <ellipse cx="70" cy="132" rx="44" ry="5" fill={ink} opacity="0.08" />
      {/* chaleira */}
      <path d="M8 22h22v18H8z" fill="var(--color-brand-300)" />
      <path d="M8 22h22v18H8z" {...stroke} />
      <path d="M30 26c10 0 14 4 22 12" {...stroke} />
      <path d="M52 38c2 4 2 8 0 10" {...stroke} stroke="#a9c7e8" strokeDasharray="2 4" className="animate-drip" />
      {/* coador */}
      <path d="M40 46h60l-20 30H60z" fill="var(--color-brand-100)" />
      <path d="M40 46h60l-20 30H60z" {...stroke} />
      <path d="M50 52h40" {...stroke} strokeOpacity="0.4" />
      <path d="M56 76h28v6H56z" fill="var(--color-brand-300)" />
      <path d="M56 76h28v6H56z" {...stroke} />
      {/* gotas */}
      {[0, 0.6, 1.2].map((d) => (
        <circle key={d} cx="70" cy="88" r="2.2" fill="var(--color-brand-700)" className="animate-drip" style={{ animationDelay: `${d}s` }} />
      ))}
      {/* jarra */}
      <path d="M44 92h52l-4 34a6 6 0 0 1-6 5H54a6 6 0 0 1-6-5z" fill="var(--app-surface)" />
      <path d="M47 110h46l-1.6 16a6 6 0 0 1-6 5H54.6a6 6 0 0 1-6-5z" fill="var(--color-brand-600)" opacity="0.9" />
      <path d="M44 92h52l-4 34a6 6 0 0 1-6 5H54a6 6 0 0 1-6-5z" {...stroke} />
      <path d="M96 98h6a8 8 0 0 1 0 16h-8" {...stroke} />
      {/* relógio */}
      <circle cx="116" cy="34" r="14" fill="var(--app-surface)" />
      <circle cx="116" cy="34" r="14" {...stroke} />
      <path d="M116 26v8l5 4" {...stroke} />
      <path d="M112 18h8" {...stroke} />
    </svg>
  )
}

/** Xícaras em roda — ciclo de estudos */
export function CycleCupsArt({ className, title = 'Ciclo de xícaras' }: ArtProps) {
  const colors = ['#e8a598', '#f2cf8a', '#9cc3a0', '#a9bde0', '#c9b1d9', '#e4c7a8']
  return (
    <svg viewBox="0 0 140 140" className={clsx('block', className)} role="img" aria-label={title}>
      <circle cx="70" cy="70" r="44" {...stroke} strokeDasharray="4 7" strokeOpacity="0.45" />
      <g className="animate-spin-slow" style={{ transformOrigin: '70px 70px' }}>
        {colors.map((c, i) => {
          const a = (i / colors.length) * Math.PI * 2 - Math.PI / 2
          const x = 70 + Math.cos(a) * 44
          const y = 70 + Math.sin(a) * 44
          return (
            <g key={c} transform={`translate(${x - 10} ${y - 9})`}>
              <path d="M2 4h16v7a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6z" fill={c} />
              <path d="M2 4h16v7a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6z" {...stroke} strokeWidth={1.6} />
              <path d="M18 6h2a3 3 0 0 1 0 6h-2" {...stroke} strokeWidth={1.6} />
            </g>
          )
        })}
      </g>
      <path d="M57 70a13 13 0 1 1 4 9.5" {...stroke} />
      <path d="M57 63v7h7" {...stroke} />
    </svg>
  )
}

/** Calendário com xícaras marcadas — revisões espaçadas */
export function CalendarCupArt({ className, title = 'Calendário de revisões' }: ArtProps) {
  const marks = new Set([1, 8, 16])
  return (
    <svg viewBox="0 0 150 130" className={clsx('block', className)} role="img" aria-label={title}>
      <ellipse cx="72" cy="122" rx="52" ry="5" fill={ink} opacity="0.08" />
      <rect x="18" y="20" width="110" height="96" rx="10" fill="var(--app-surface)" />
      <rect x="18" y="20" width="110" height="24" rx="10" fill="var(--color-brand-600)" />
      <rect x="18" y="20" width="110" height="96" rx="10" {...stroke} />
      <path d="M18 44h110" {...stroke} />
      <path d="M42 12v14M104 12v14" {...stroke} strokeWidth={3} />
      {Array.from({ length: 20 }, (_, i) => {
        const x = 30 + (i % 5) * 20
        const y = 54 + Math.floor(i / 5) * 15
        return marks.has(i) ? (
          <g key={i}>
            <circle cx={x + 2} cy={y + 3} r="7" fill="var(--color-brand-200)" />
            <path d={`M${x - 3} ${y}h9v3a4 4 0 0 1-4 4h-1a4 4 0 0 1-4-4z`} {...stroke} strokeWidth={1.4} />
          </g>
        ) : (
          <circle key={i} cx={x + 2} cy={y + 3} r="1.8" fill={ink} opacity="0.25" />
        )
      })}
      <path d="M32 57c20-14 26 18 50 6s20 14 30 20" {...stroke} strokeDasharray="3 5" strokeOpacity="0.5" />
      <g className="animate-float">
        <circle cx="128" cy="104" r="15" fill="var(--color-brand-100)" />
        <circle cx="128" cy="104" r="15" {...stroke} />
        <path d="M121 104a7 7 0 1 0 2-5" {...stroke} />
        <path d="M121 97v5h5" {...stroke} />
      </g>
    </svg>
  )
}

/** Gráfico de barras feito de canecas empilhadas — estatísticas e simulados */
export function MugChartArt({ className, title = 'Gráfico de canecas' }: ArtProps) {
  const bars = [2, 3, 1, 4]
  return (
    <svg viewBox="0 0 150 130" className={clsx('block', className)} role="img" aria-label={title}>
      <path d="M14 116h124" {...stroke} />
      <path d="M14 116V20" {...stroke} strokeOpacity="0.4" />
      {bars.map((n, i) =>
        Array.from({ length: n }, (_, k) => {
          const x = 26 + i * 28
          const y = 100 - k * 20
          return (
            <g key={`${i}-${k}`} className="animate-pop" style={{ animationDelay: `${(i + k) * 0.12}s` }}>
              <path d={`M${x} ${y}h18v9a6 6 0 0 1-6 6h-6a6 6 0 0 1-6-6z`} fill={k % 2 ? 'var(--color-brand-300)' : 'var(--color-brand-600)'} />
              <path d={`M${x} ${y}h18v9a6 6 0 0 1-6 6h-6a6 6 0 0 1-6-6z`} {...stroke} strokeWidth={1.6} />
              <path d={`M${x + 18} ${y + 2}h2a3.5 3.5 0 0 1 0 7h-2`} {...stroke} strokeWidth={1.6} />
            </g>
          )
        }),
      )}
      <path d="M30 80l28-18l28 30l32-58" {...stroke} stroke="var(--app-ok)" strokeWidth={2.5} />
      <path d="M110 32l8 2l-1 8" {...stroke} stroke="var(--app-ok)" strokeWidth={2.5} />
    </svg>
  )
}

/** Envelope kraft com papéis e um selo — conta, perfil e arquivos */
export function EnvelopeArt({ className, title = 'Envelope com seus arquivos' }: ArtProps) {
  return (
    <svg viewBox="0 0 150 130" className={clsx('block', className)} role="img" aria-label={title}>
      <ellipse cx="75" cy="122" rx="54" ry="5" fill={ink} opacity="0.08" />
      {/* papéis saindo */}
      <g className="animate-float">
        <rect x="34" y="18" width="52" height="66" rx="4" fill="var(--app-surface)" transform="rotate(-8 60 50)" />
        <rect x="34" y="18" width="52" height="66" rx="4" {...stroke} transform="rotate(-8 60 50)" />
        <path d="M42 34h30M42 42h36M42 50h24" {...stroke} strokeOpacity="0.4" transform="rotate(-8 60 50)" />
      </g>
      <g className="animate-float" style={{ animationDelay: '1.2s' }}>
        <rect x="66" y="14" width="50" height="64" rx="4" fill="var(--color-brand-50)" transform="rotate(7 90 46)" />
        <rect x="66" y="14" width="50" height="64" rx="4" {...stroke} transform="rotate(7 90 46)" />
        <rect x="74" y="24" width="18" height="22" rx="2" fill="#e8a598" transform="rotate(7 90 46)" />
        <text x="76" y="40" fontSize="8" fontWeight="800" fill={ink} transform="rotate(7 90 46)">
          PDF
        </text>
        <path d="M74 56h30M74 64h22" {...stroke} strokeOpacity="0.4" transform="rotate(7 90 46)" />
      </g>
      {/* envelope */}
      <path d="M20 58h110v54a6 6 0 0 1-6 6H26a6 6 0 0 1-6-6z" fill="var(--app-kraft)" />
      <path d="M20 58l55 34l55-34" fill="var(--color-brand-200)" />
      <path d="M20 58h110v54a6 6 0 0 1-6 6H26a6 6 0 0 1-6-6zM20 58l55 34l55-34" {...stroke} />
      <path d="M20 118l42-32M130 118l-42-32" {...stroke} strokeOpacity="0.35" />
      {/* selo de café */}
      <circle cx="112" cy="100" r="11" fill="var(--color-brand-600)" />
      <circle cx="112" cy="100" r="11" {...stroke} />
      <ellipse cx="112" cy="100" rx="3.5" ry="5.5" fill="var(--color-brand-100)" transform="rotate(30 112 100)" />
      <path d="M110 96q3 4 0 8" stroke="var(--color-brand-600)" strokeWidth="1.2" fill="none" />
    </svg>
  )
}

/** Disco de vinil girando — "tocando agora" */
export function VinylArt({ className, spinning = true }: { className?: string; spinning?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className={clsx('block', className)} aria-hidden>
      <g className={spinning ? 'animate-spin-slow' : undefined} style={{ transformOrigin: '24px 24px' }}>
        <circle cx="24" cy="24" r="22" fill="#2a1f19" />
        <circle cx="24" cy="24" r="16" fill="none" stroke="#4a3a30" strokeWidth="1" />
        <circle cx="24" cy="24" r="12" fill="none" stroke="#4a3a30" strokeWidth="1" />
        <circle cx="24" cy="24" r="8" fill="var(--color-brand-400)" />
        <path d="M20 21a5 5 0 0 1 6-2" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.2" fill="none" />
        <circle cx="24" cy="24" r="1.6" fill="#2a1f19" />
      </g>
    </svg>
  )
}

/** Barras de equalizador animadas */
export function Equalizer({ className, bars = 4 }: { className?: string; bars?: number }) {
  return (
    <span className={clsx('inline-flex h-3.5 items-end gap-[3px]', className)} aria-hidden>
      {Array.from({ length: bars }, (_, i) => (
        <span key={i} className="w-[3px] origin-bottom rounded-full bg-current animate-eq" style={{ height: '100%', animationDelay: `${(i * 0.23) % 1}s` }} />
      ))}
    </span>
  )
}

/** "G" oficial do Google (usado no botão de entrar, conforme a identidade da marca) */
export function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}
