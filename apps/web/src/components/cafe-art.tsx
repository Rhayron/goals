import { clsx } from '../lib/utils'
import { ArtFrame, BookStack, Ground, line, Mug, paint, Steam, useArtId, type ArtProps } from './illustration-parts'

export { LofiScene as CafeSceneArt } from './LofiScene'

export function FillingCup({ level, className }: { level: number; className?: string }) {
  const clip = useArtId('coffee-fill')
  const amount = Math.max(0, Math.min(1, level))
  return <ArtFrame viewBox="0 0 160 160" title={`Xícara ${Math.round(amount * 100)}% cheia`} className={className}>
    <defs><clipPath id={clip}><path d="M29 62h86v44c0 20-20 29-43 29s-43-9-43-29z" /></clipPath></defs>
    <ellipse cx="77" cy="144" rx="63" ry="8" fill={paint.ink} opacity=".1" />
    <ellipse cx="74" cy="136" rx="62" ry="9" fill={paint.cream} {...line} />
    <path d="M115 72h10c28 0 26 39-3 39h-8" fill="none" stroke={paint.ink} strokeWidth="9" />
    <path d="M115 72h10c28 0 26 39-3 39h-8" fill="none" stroke={paint.cream} strokeWidth="5" />
    <path d="M29 62h86v44c0 20-20 29-43 29s-43-9-43-29z" fill={paint.paper} {...line} />
    <g clipPath={`url(#${clip})`}><g style={{ transform: `translateY(${130 - amount * 68}px)`, transition: 'transform 800ms ease' }}>
      <path d="M-30 0q20-5 40 0t40 0t40 0t40 0t40 0v100H-30z" fill={paint.clay} className="coado-coffee-surface" />
      <path d="M-30 5h230v90H-30" fill="#926245" opacity=".35" />
    </g></g>
    <path d="M38 72v28q0 14 12 19" fill="none" stroke="#fff9ed" strokeWidth="5" strokeLinecap="round" opacity=".65" />
    <ellipse cx="72" cy="62" rx="43" ry="8" fill={paint.cream} {...line} />
    <ellipse cx="72" cy="63" rx="36" ry="4" fill={paint.ink} opacity=".65" />
    <path d="M65 95q7-8 14 0q-2 8-7 11q-6-4-7-11" fill={paint.paper} opacity=".8" />
    <Steam x={57} y={44} />
  </ArtFrame>
}

export function BeanJarArt({ className, title = 'Grãos de café, cadernos e matérias para organizar' }: ArtProps) {
  return <ArtFrame title={title} className={className}>
    <Ground />
    <g transform="translate(113 76) scale(.85)"><BookStack /></g>
    <rect x="36" y="49" width="84" height="106" rx="19" fill={paint.paper} fillOpacity=".8" {...line} />
    {Array.from({length: 12}, (_, i) => <g key={i} transform={`translate(${50+i%4*18} ${104+Math.floor(i/4)*14}) rotate(${i*38})`}>
      <ellipse rx="8" ry="5" fill={paint.clay} {...line} strokeWidth="1" /><path d="M-5 0q5-4 10 0" stroke={paint.cream} fill="none" strokeWidth="1" />
    </g>)}
    <rect x="32" y="38" width="92" height="18" rx="6" fill={paint.ink} />
    <rect x="48" y="67" width="60" height="29" rx="5" fill={paint.sage} {...line} strokeWidth="1" />
    <path d="M60 77h35m-35 8h24" stroke={paint.paper} strokeWidth="3" strokeLinecap="round" />
    <path d="M44 61v54" stroke="#fff9ed" strokeWidth="4" opacity=".7" strokeLinecap="round" />
  </ArtFrame>
}

export function PourOverArt({ className, title = 'Café sendo coado com calma' }: ArtProps) {
  return <ArtFrame title={title} className={className}>
    <Ground />
    <path d="M73 91h78l12 52q2 14-16 14H77q-18 0-16-14z" fill={paint.paper} fillOpacity=".8" {...line} />
    <path d="M65 128h95l3 15q2 14-16 14H77q-18 0-16-14z" fill={paint.clay} />
    <path d="M157 103h13q27 19 0 36h-10" fill="none" {...line} strokeWidth="5" />
    <path d="M67 41h91l-32 48H99z" fill={paint.sage} {...line} />
    <ellipse cx="112" cy="41" rx="46" ry="10" fill={paint.paper} {...line} />
    <ellipse cx="112" cy="42" rx="33" ry="6" fill={paint.ink} />
    <path d="M83 50l19 30m-3-27l9 30m22-29l-12 29m30-30l-23 29" fill="none" stroke={paint.sageDark} strokeWidth="2" />
    <rect x="91" y="87" width="43" height="7" rx="3" fill={paint.cream} {...line} />
    <path d="M112 97v7" className="coado-drip" stroke={paint.clay} strokeWidth="4" strokeLinecap="round" />
    <path d="M76 105l-6 32" fill="none" stroke="#fff9ed" strokeWidth="4" strokeLinecap="round" />
    <g transform="translate(176 115)"><circle r="25" fill={paint.cream} {...line} /><circle r="20" fill={paint.paper} /><path d="M0-13V0l9 5" fill="none" {...line} /><circle r="2.5" fill={paint.clay} /></g>
  </ArtFrame>
}

export function CycleCupsArt({ className, title = 'Ciclo de estudos entre livros e uma pausa para café' }: ArtProps) {
  return <ArtFrame title={title} className={className}>
    <path d="M55 100Q35 20 120 20Q205 20 190 106Q175 168 92 145" fill="none" stroke={paint.sageDark} strokeWidth="2.5" strokeDasharray="5 8" className="coado-cycle" />
    <g transform="translate(18 81) scale(.7)"><Mug color={paint.sage} /></g>
    <g transform="translate(104 65) scale(.9)"><BookStack /></g>
    {[[68,37,'1'],[170,38,'2'],[190,148,'3']].map(([x,y,n]) => <g key={n}><circle cx={x} cy={y} r="14" fill={paint.paper} {...line} /><text x={x} y={Number(y)+5} textAnchor="middle" fontSize="14" fontWeight="700" fill={paint.ink}>{n}</text></g>)}
  </ArtFrame>
}

export function CalendarCupArt({ className, title = 'Calendário de revisões com páginas marcadas' }: ArtProps) {
  return <ArtFrame title={title} className={className}>
    <Ground />
    <rect x="36" y="24" width="160" height="132" rx="11" fill={paint.cream} {...line} />
    <rect x="30" y="18" width="160" height="132" rx="11" fill={paint.paper} {...line} />
    <path d="M41 18h138q11 0 11 11v28H30V29q0-11 11-11" fill={paint.sage} />
    <path d="M30 57h160" {...line} />
    {[58,164].map(x => <path key={x} d={`M${x} 10v20`} stroke={paint.ink} strokeWidth="6" strokeLinecap="round" />)}
    {Array.from({length:15},(_,i) => <g key={i} transform={`translate(${52+i%5*29} ${78+Math.floor(i/5)*26})`}>
      <rect x="-8" y="-8" width="16" height="16" rx="4" fill={[0,7,14].includes(i)?paint.sage:paint.cream} />
      {[0,7,14].includes(i)&&<path d="M-4 0l3 3l6-7" fill="none" stroke={paint.paper} strokeWidth="2" strokeLinecap="round" />}
    </g>)}
    <g transform="translate(165 112) scale(.53)"><Mug color={paint.clay} steam={false} /></g>
  </ArtFrame>
}

export function MugChartArt({ className, title = 'Progresso nos estudos, um livro de cada vez' }: ArtProps) {
  return <ArtFrame title={title} className={className}>
    <Ground />
    {[2,3,5,7].map((n,i) => <g key={i} className="coado-books-enter" style={{animationDelay:`${i*.12}s`}}>
      {Array.from({length:n},(_,j) => <g key={j}><rect x={30+i*46} y={146-j*15} width="37" height="13" rx="3" fill={[paint.clay,paint.sage,paint.blue,paint.lilac][i]} {...line} strokeWidth="1.3" /><path d={`M${36+i*46} ${152-j*15}h23`} stroke={paint.paper} opacity=".65" /></g>)}
    </g>)}
    <path d="M38 105q44-8 69-33t74-42m-9-4l11 3l-2 12" fill="none" stroke={paint.sageDark} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </ArtFrame>
}

export function EnvelopeArt({ className, title = 'Resumos e materiais guardados em uma pasta' }: ArtProps) {
  return <ArtFrame title={title} className={className}>
    <Ground />
    <path d="M27 69h64l10 12h111v67a9 9 0 0 1-9 9H36a9 9 0 0 1-9-9z" fill={paint.sageDark} {...line} />
    <g transform="rotate(-8 93 83)"><rect x="50" y="25" width="86" height="112" rx="5" fill={paint.paper} {...line} /><path d="M64 43h45m-45 12h56m-56 12h52m-52 12h33" stroke={paint.blue} strokeWidth="3" strokeLinecap="round" opacity=".7" /></g>
    <g transform="rotate(7 155 90)"><rect x="117" y="37" width="72" height="105" rx="5" fill={paint.cream} {...line} /><rect x="131" y="51" width="43" height="33" rx="4" fill={paint.clay} /><path d="M141 67l8 8l15-18" stroke={paint.paper} fill="none" strokeWidth="3" strokeLinecap="round" /><path d="M132 98h40m-40 10h29" stroke={paint.ink} strokeWidth="2" opacity=".35" /></g>
    <path d="M20 102h195l-12 48q-2 7-10 7H39q-8 0-10-7z" fill={paint.sage} {...line} />
    <rect x="85" y="115" width="65" height="22" rx="5" fill={paint.paper} /><path d="M98 126h39" stroke={paint.sageDark} strokeWidth="3" strokeLinecap="round" />
  </ArtFrame>
}

export function VinylArt({ className, spinning = true }: { className?: string; spinning?: boolean }) {
  return <svg viewBox="0 0 64 64" className={clsx('coado-art block', className)} aria-hidden>
    <g className={spinning ? 'coado-vinyl' : undefined} style={{transformOrigin:'32px 32px'}}>
      <circle cx="32" cy="32" r="30" fill="#34303a" stroke="#191b26" strokeWidth="2" />
      {[26,22,18].map(r=><circle key={r} cx="32" cy="32" r={r} fill="none" stroke="#59515a" strokeWidth=".8" />)}
      <path d="M10 22q5-12 18-15M54 42q-5 12-18 15" fill="none" stroke="#8b7d85" strokeWidth="3" opacity=".4" />
      <circle cx="32" cy="32" r="12" fill={paint.sage} /><path d="M24 32q8-7 16 0v4H24z" fill={paint.cream} /><circle cx="32" cy="32" r="2.5" fill="#34303a" />
    </g>
  </svg>
}

export function Equalizer({ className, bars = 4 }: { className?: string; bars?: number }) {
  return <span className={clsx('inline-flex h-3.5 items-end gap-[3px]', className)} aria-hidden>
    {Array.from({length:bars},(_,i)=><span key={i} className="coado-equalizer w-[3px] origin-bottom rounded-full bg-current" style={{height:'100%',animationDelay:`${i*-.23}s`}} />)}
  </span>
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
