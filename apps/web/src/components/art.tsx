import { ArtFrame, BookStack, CozyCat, Ground, line, Mug, NightWindow, OpenBook, paint, Plant, type ArtProps } from './illustration-parts'

export function CupArt({ className, title = 'Café quentinho para acompanhar o estudo' }: ArtProps) {
  return <ArtFrame title={title} className={className}>
    <Ground />
    <g transform="translate(33 89) scale(.78)"><BookStack /></g>
    <g transform="translate(104 59) scale(1.14)"><Mug color={paint.sage} /></g>
    <path d="M184 145l24-16" {...line} strokeWidth="5" /><path d="M205 130l7-5" stroke={paint.gold} strokeWidth="5" strokeLinecap="round" />
  </ArtFrame>
}

export function CatWindowArt({ className, title, showCat = true }: ArtProps & { showCat?: boolean }) {
  return <ArtFrame title={title ?? (showCat ? 'Gato laranja descansando entre livros na janela' : 'Livros e lua na janela')} className={className}>
    <NightWindow />
    <g transform="translate(12 98) scale(.61)"><BookStack /></g>
    {showCat && <g transform="translate(75 53) scale(.91)"><CozyCat /></g>}
    <path d="M15 167h212" stroke={paint.ink} strokeWidth="3" strokeLinecap="round" />
  </ArtFrame>
}

export function BooksMugArt({ className, title = 'Livros, caderno aberto e café na mesa' }: ArtProps) {
  return <ArtFrame title={title} className={className}>
    <Ground />
    <g transform="translate(22 42) scale(.87)"><BookStack /></g>
    <g transform="translate(151 47) scale(.75)"><Mug /></g>
    <g transform="translate(55 88) scale(.92)"><OpenBook /></g>
    <path d="M174 152l28-29" stroke={paint.clay} strokeWidth="5" strokeLinecap="round" />
    <path d="M199 125l5-5" stroke={paint.ink} strokeWidth="3" strokeLinecap="round" />
  </ArtFrame>
}

export function CassetteArt({ className, title = 'Fita cassete de lo-fi sobre um caderno' }: ArtProps) {
  return <ArtFrame title={title} className={className}>
    <Ground />
    <g transform="translate(45 77) scale(1.2 .85)"><BookStack /></g>
    <g transform="rotate(-6 120 90)" {...line}>
      <rect x="30" y="42" width="180" height="108" rx="13" fill={paint.clay} />
      <rect x="42" y="53" width="156" height="66" rx="7" fill={paint.paper} />
      <path d="M49 61h142v13H49" fill={paint.sage} stroke="none" />
      <rect x="65" y="81" width="110" height="29" rx="14" fill={paint.cream} />
      {[82,158].map(x => <g key={x} className="coado-tape-reel" style={{ transformOrigin: `${x}px 96px` }}>
        <circle cx={x} cy="96" r="10" fill={paint.paper} /><path d={`M${x} 89v14m-7-7h14`} /><circle cx={x} cy="96" r="3" fill={paint.ink} />
      </g>)}
      <path d="M80 96h68" strokeWidth="1" />
      <path d="M71 148l9-22h80l9 22" fill={paint.cream} /><circle cx="86" cy="139" r="3" fill={paint.ink} /><circle cx="154" cy="139" r="3" fill={paint.ink} />
      {[[39,51],[201,51],[39,140],[201,140]].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill={paint.ink} stroke="none" />)}
    </g>
  </ArtFrame>
}

export function HeadphonesArt({ className, title = 'Fones de ouvido e um livro para estudar com lo-fi' }: ArtProps) {
  return <ArtFrame title={title} className={className}>
    <Ground />
    <g transform="translate(45 102) scale(1.02 .6)"><OpenBook /></g>
    <path d="M57 109V77a63 63 0 0 1 126 0v32" fill="none" stroke={paint.ink} strokeWidth="19" />
    <path d="M57 109V77a63 63 0 0 1 126 0v32" fill="none" stroke={paint.sage} strokeWidth="12" />
    <path d="M64 69a56 56 0 0 1 112 0" fill="none" stroke={paint.paper} strokeWidth="5" strokeLinecap="round" />
    <rect x="41" y="87" width="31" height="53" rx="14" fill={paint.clay} {...line} />
    <rect x="168" y="87" width="31" height="53" rx="14" fill={paint.clay} {...line} />
    <rect x="62" y="91" width="14" height="45" rx="6" fill={paint.ink} /><rect x="164" y="91" width="14" height="45" rx="6" fill={paint.ink} />
    <path d="M194 137q26 21 5 27h-27" fill="none" {...line} strokeWidth="3" />
  </ArtFrame>
}

export function RainWindowArt({ className, title = 'Chuva tranquila na janela, livros e uma planta' }: ArtProps) {
  return <ArtFrame title={title} className={className}>
    <NightWindow rain />
    <g transform="translate(151 84) scale(.85)"><Plant /></g>
    <g transform="translate(18 111) scale(.65)"><BookStack /></g>
  </ArtFrame>
}

export type ArtName = 'cup' | 'cat' | 'books' | 'cassette' | 'headphones' | 'none'
export function Art({ name, className }: { name: ArtName; className?: string }) {
  if (name === 'none') return null
  const Component = { cup: CupArt, cat: CatWindowArt, books: BooksMugArt, cassette: CassetteArt, headphones: HeadphonesArt }[name]
  return <Component className={className} />
}
