import { useUI } from '../../state/ui'
import { IconCheck } from './Icons'

export function Toast() {
  const toast = useUI((s) => s.toast)
  if (!toast) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4" role="status" aria-live="polite">
      <div key={toast} className="slide-up flex items-center gap-2.5 rounded-full bg-encre text-neige px-5 py-3 text-sm shadow-xl ring-1 ring-or/30">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-or text-encre"><IconCheck width={13} height={13} strokeWidth={2.5} /></span>
        {toast}
      </div>
    </div>
  )
}
