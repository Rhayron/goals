import { useId, type ReactNode } from 'react'
import { clsx } from '../lib/utils'

/** Shared palette and shapes keep the small illustrations in the same world as the study room. */
export const paint = {
  ink: '#65483c', paper: '#fff2d9', cream: '#e9d7b8', clay: '#bc7053',
  sage: '#8daba0', sageDark: '#52786f', blue: '#8299ae', night: '#303e56',
  lilac: '#a69ab8', gold: '#e9bb71', fur: '#dda16b', stripe: '#b86f4d',
}
export const line = { stroke: paint.ink, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
export type ArtProps = { className?: string; title?: string }
export const useArtId = (prefix: string) => `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

export function ArtFrame({ title, className, children, viewBox = '0 0 240 180' }: ArtProps & { title: string; children: ReactNode; viewBox?: string }) {
  return <svg viewBox={viewBox} className={clsx('coado-art block', className)} role="img" aria-label={title}>{children}</svg>
}

export function Ground({ y = 158 }: { y?: number }) {
  return <ellipse cx="120" cy={y} rx="90" ry="9" fill={paint.ink} opacity="0.09" />
}

export function Steam({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return <g transform={`translate(${x} ${y})`} fill="none" stroke={paint.cream} strokeWidth="3" strokeLinecap="round">
    {[0, 1, 2].map((i) => <path key={i} d={`M${i * 11} 0c-8-10 7-15 1-25`} className="coado-steam" style={{ animationDelay: `${i * -1.4}s` }} />)}
  </g>
}

/** Rounded ceramic, elliptical rim and a real handle; origin (0,0), size 80x80. */
export function Mug({ color = paint.paper, steam = true }: { color?: string; steam?: boolean }) {
  return <>
    {steam && <Steam x={20} y={5} />}
    <ellipse cx="37" cy="76" rx="39" ry="6" fill={paint.cream} {...line} />
    <path d="M63 26h5c22 0 20 31 0 32h-5" fill="none" stroke={paint.ink} strokeWidth="7" />
    <path d="M63 26h5c22 0 20 31 0 32h-5" fill="none" stroke={color} strokeWidth="4" />
    <path d="M6 20h58v34c0 17-13 21-29 21S6 71 6 54z" fill={color} {...line} />
    <path d="M13 29v23c0 8 3 12 8 14" fill="none" stroke="#fff9ec" strokeWidth="5" opacity="0.65" strokeLinecap="round" />
    <ellipse cx="35" cy="20" rx="29" ry="8" fill={paint.cream} {...line} />
    <ellipse cx="35" cy="21" rx="24" ry="4.5" fill="#76503c" />
    <path d="M28 48q7-8 14 0q-3 8-7 10q-5-4-7-10" fill={paint.clay} opacity="0.75" />
  </>
}

/** A recognisable tabby: broad face, triangular ears, tucked paws and thick curled tail. */
export function CozyCat() {
  return <g>
    <path className="coado-tail" d="M112 104c39 8 44-30 24-43c-11-7-20 1-14 10c10-6 15 13 2 17" fill={paint.fur} {...line} />
    <g className="coado-cat-breathe">
      <ellipse cx="85" cy="86" rx="49" ry="33" fill={paint.fur} {...line} />
      <path d="M95 57l-2 15m13-11l-3 15m14-8l-5 13" stroke={paint.stripe} strokeWidth="5" strokeLinecap="round" fill="none" />
      <ellipse cx="77" cy="99" rx="28" ry="18" fill={paint.paper} opacity="0.82" />
    </g>
    <path d="M32 52Q26 35 31 12Q44 13 54 28Q65 25 77 29Q88 15 100 16Q106 35 99 52Q102 78 68 83Q32 81 32 52Z" fill={paint.fur} {...line} />
    <path d="M35 21l4 22l12-10zM94 25L82 36l15 7z" fill="#e6ac9b" />
    <path d="M37 59q11-8 28 1q17-8 30 1q-4 20-30 20q-23-1-28-22" fill={paint.paper} />
    <path d="M58 29l3 12m9-13l-1 12m11-9l-6 11" stroke={paint.stripe} strokeWidth="4" strokeLinecap="round" fill="none" />
    <g className="coado-cat-eyes">
      <ellipse cx="49" cy="54" rx="3.5" ry="5" fill={paint.ink} />
      <ellipse cx="82" cy="54" rx="3.5" ry="5" fill={paint.ink} />
      <circle cx="50" cy="52" r="1" fill={paint.paper} /><circle cx="83" cy="52" r="1" fill={paint.paper} />
    </g>
    <path d="M61 62q5-3 10 0l-5 5z" fill="#b77b70" />
    <path d="M66 67v3q-5 6-10 0m10 0q5 6 10 0" fill="none" {...line} strokeWidth="1.4" />
    <path d="M41 64l-17-4m18 10l-17 1m65-7l18-4m-19 10l18 1" fill="none" {...line} strokeWidth="1.4" opacity="0.65" />
    <ellipse cx="49" cy="114" rx="15" ry="8" fill={paint.paper} {...line} />
    <ellipse cx="80" cy="115" rx="15" ry="8" fill={paint.paper} {...line} />
    <path d="M46 115v4m6-4v4m25-3v3m6-3v3" {...line} strokeWidth="1" />
  </g>
}

export function BookStack() {
  return <g {...line}>
    <path d="M9 67h107v21H9q-11-10 0-21" fill={paint.clay} />
    <path d="M15 72h95v11H15" fill={paint.paper} strokeWidth="1" />
    <path d="M5 43h99v24H5q-10-12 0-24" fill={paint.sageDark} />
    <path d="M12 49h87v12H12" fill={paint.paper} strokeWidth="1" />
    <path d="M19 22h103v21H19q-10-10 0-21" fill={paint.blue} />
    <path d="M26 27h90v11H26" fill={paint.paper} strokeWidth="1" />
    <path d="M27 32h80M17 55h73M20 77h80" fill="none" strokeWidth="0.8" opacity="0.35" />
    <path d="M88 22v24l7-4l6 4V22" fill={paint.gold} strokeWidth="1" />
  </g>
}

export function OpenBook() {
  return <g {...line}>
    <path d="M5 21q36-14 67 0q33-14 68 0l7 65q-37-11-75 2q-34-13-73-2z" fill={paint.sageDark} />
    <path d="M10 15q32-12 62 4q31-16 62-4l7 63q-34-9-69 5q-32-14-69-5z" fill={paint.paper} />
    <path d="M72 19v64" fill="none" strokeWidth="1.5" />
    {[32, 42, 52, 62].map(y => <path key={y} d={`M20 ${y}q20-4 40 3m24 0q20-7 40-3`} fill="none" strokeWidth="1.2" opacity="0.3" />)}
    <path d="M112 12v27l5-4l6 3l-2-26" fill={paint.clay} strokeWidth="1" />
  </g>
}

export function Plant() {
  return <g>
    <path d="M26 61Q13 18 41 5M28 60Q47 30 58 25M27 60Q9 33 3 31" fill="none" stroke={paint.sageDark} strokeWidth="3" />
    <path d="M30 32Q16 9 41 5Q47 23 30 32M40 45Q42 23 63 24Q64 43 40 45M20 48Q-2 49 1 28Q18 27 20 48" fill={paint.sage} stroke={paint.sageDark} strokeWidth="1.5" />
    <path d="M10 61h36l-5 27H16z" fill={paint.clay} {...line} /><rect x="8" y="58" width="40" height="8" rx="3" fill="#d59675" {...line} />
  </g>
}

export function NightWindow({ rain = false }: { rain?: boolean }) {
  const id = useArtId('night-window')
  return <>
    <defs><clipPath id={id}><path d="M30 138V58a77 48 0 0 1 154 0v80z" /></clipPath></defs>
    <path d="M30 138V58a77 48 0 0 1 154 0v80z" fill={paint.night} />
    <g clipPath={`url(#${id})`}>
      <circle cx="143" cy="43" r="17" fill={paint.paper} /><circle cx="150" cy="37" r="16" fill={paint.night} />
      <path d="M22 138v-36h26V78h23v42h18V97h32V82h24v26h25V92h30v46" fill="#46566e" />
      <path d="M22 138v-14h22v-21h23v35h16v-18h29v-16h25v34h22v-20h40v20" fill="#25344a" />
      {[[51,90],[60,109],[97,108],[131,94],[176,105]].map(([x,y]) => <rect key={x} x={x} y={y} width="4" height="6" rx="1" fill={paint.gold} opacity="0.8" />)}
      {rain && Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${35 + (i * 29) % 146} ${-70 + (i * 19) % 130}l-5 22`} stroke="#b7d5df" opacity="0.3" strokeWidth="1.5" className="coado-rain" style={{ animationDelay: `${i * -0.37}s` }} />)}
    </g>
    <path d="M30 138V58a77 48 0 0 1 154 0v80zM107 10v128M30 79h154" fill="none" stroke={paint.ink} strokeWidth="7" />
    <path d="M22 140h170" stroke="#ad8060" strokeWidth="9" strokeLinecap="round" />
  </>
}
