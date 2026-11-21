import type { SVGProps } from 'react'

const base = (p: SVGProps<SVGSVGElement>) => ({
  width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...p,
})

export const IconBag = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>)
export const IconHeart = ({ filled, ...p }: SVGProps<SVGSVGElement> & { filled?: boolean }) => (<svg {...base(p)} fill={filled ? 'currentColor' : 'none'}><path d="M12 20s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.1a4.4 4.4 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z" /></svg>)
export const IconSearch = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>)
export const IconClose = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>)
export const IconMusic = ({ off, ...p }: SVGProps<SVGSVGElement> & { off?: boolean }) => (<svg {...base(p)}><path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" />{off && <path d="M3 3l18 18" />}</svg>)
export const IconHome = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M4 11 12 4l8 7" /><path d="M6 10v10h12V10" /><path d="M10 20v-5h4v5" /></svg>)
export const IconDoor = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M5 21V5a2 2 0 0 1 2-2h7l5 2v16" /><path d="M3 21h18" /><circle cx="13" cy="12.5" r=".8" fill="currentColor" /></svg>)
export const IconMap = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></svg>)
export const IconHelp = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8" /><circle cx="12" cy="17" r=".6" fill="currentColor" /></svg>)
export const IconSparkle = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></svg>)
export const IconMinus = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M5 12h14" /></svg>)
export const IconPlus = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>)
export const IconTrash = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>)
export const IconArrowRight = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>)
export const IconArrowLeft = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>)
export const IconCube = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></svg>)
export const IconGauge = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M4 16a8 8 0 1 1 16 0" /><path d="m12 16 4-5" /></svg>)
export const IconStar = ({ filled = true, ...p }: SVGProps<SVGSVGElement> & { filled?: boolean }) => (<svg {...base(p)} fill={filled ? 'currentColor' : 'none'} strokeWidth={1.2}><path d="m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" /></svg>)
export const IconCheck = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="m5 12.5 4.2 4.2L19 7" /></svg>)
export const IconTruck = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>)
export const IconGift = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13" /><path d="M12 7S10.5 3 8 4s1 3 4 3zm0 0s1.5-4 4-3-1 3-4 3z" /></svg>)
export const IconShield = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 3 5 6v6c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6z" /><path d="m9 12 2 2 4-4" /></svg>)
export const IconCopy = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></svg>)
export const IconMenu = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>)
