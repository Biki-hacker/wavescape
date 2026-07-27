import { Radio, Tv } from 'lucide-react'

export type ServiceTab = 'radio' | 'tv'

interface ServiceTabsProps {
  activeTab: ServiceTab
  onTabChange: (tab: ServiceTab) => void
}

export function ServiceTabs({ activeTab, onTabChange }: ServiceTabsProps) {
  return (
    <div className="flex w-full max-w-xl mx-auto mt-4">
      <button
        onClick={() => onTabChange('radio')}
        className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 font-space font-bold text-sm uppercase tracking-wide border-3 border-black rounded-l-lg transition-all duration-150 ${
          activeTab === 'radio'
            ? 'bg-[var(--accent)] text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] -translate-y-0.5 z-10'
            : 'bg-[var(--surface)] text-[var(--muted-text)] hover:bg-[var(--accent)]/20 hover:text-[var(--text)]'
        }`}
        aria-pressed={activeTab === 'radio'}
      >
        <Radio className="w-5 h-5" />
        <span>Live Radio</span>
      </button>
      <button
        onClick={() => onTabChange('tv')}
        className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 font-space font-bold text-sm uppercase tracking-wide border-3 border-black border-l-0 rounded-r-lg transition-all duration-150 ${
          activeTab === 'tv'
            ? 'bg-[var(--accent)] text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] -translate-y-0.5 z-10'
            : 'bg-[var(--surface)] text-[var(--muted-text)] hover:bg-[var(--accent)]/20 hover:text-[var(--text)]'
        }`}
        aria-pressed={activeTab === 'tv'}
      >
        <Tv className="w-5 h-5" />
        <span>Live TV</span>
      </button>
    </div>
  )
}
