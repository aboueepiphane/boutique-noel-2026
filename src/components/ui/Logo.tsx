/** Logo typographique NOËL & MERVEILLES avec boule de Noël stylisée. */
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <radialGradient id="lm-b" cx="38%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#d9434b" />
          <stop offset="60%" stopColor="#9b1c23" />
          <stop offset="100%" stopColor="#5e0f15" />
        </radialGradient>
        <linearGradient id="lm-g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ecd8a4" />
          <stop offset="100%" stopColor="#b8914a" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="38" r="20" fill="url(#lm-b)" />
      <path d="M14 36c6 4 30 4 36 0" stroke="url(#lm-g)" strokeWidth="1.6" fill="none" />
      <path d="M13.5 41c7 4 30 4 37 0" stroke="url(#lm-g)" strokeWidth="1" fill="none" opacity=".7" />
      <rect x="26" y="13" width="12" height="7" rx="1.5" fill="url(#lm-g)" />
      <circle cx="32" cy="10" r="3.2" fill="none" stroke="url(#lm-g)" strokeWidth="1.6" />
      <path d="M32 27l1.6 3.4 3.7.5-2.7 2.6.7 3.7-3.3-1.8-3.3 1.8.7-3.7-2.7-2.6 3.7-.5z" fill="url(#lm-g)" />
      <ellipse cx="25" cy="31" rx="4" ry="2.4" fill="#fff" opacity=".28" transform="rotate(-30 25 31)" />
    </svg>
  )
}

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none whitespace-nowrap">
      <LogoMark size={compact ? 28 : 34} />
      <span className="flex flex-col leading-none">
        <span className={`font-display font-semibold tracking-[0.08em] ${compact ? 'text-lg' : 'text-xl'} ${light ? 'text-[#f6ecd6]' : 'text-encre'}`}>
          NOËL <span className="text-or">&amp;</span> MERVEILLES
        </span>
        {!compact && <span className={`eyebrow !text-[0.55rem] !tracking-[0.42em] mt-1 ${light ? 'text-or-light/80' : 'text-bois'}`}>Maison de Noël</span>}
      </span>
    </span>
  )
}
