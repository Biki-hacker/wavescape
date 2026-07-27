import type { TVCategory } from '../types'

interface TVCategoryFilterProps {
  categories: TVCategory[]
  selectedCategory: string | null
  onSelect: (categoryId: string | null) => void
}

export function TVCategoryFilter({ categories, selectedCategory, onSelect }: TVCategoryFilterProps) {
  if (categories.length === 0) return null

  return (
    <div className="w-full">
      <p className="font-mono text-xs font-bold uppercase text-[var(--muted-text)] mb-2.5 tracking-wider">
        Filter by Category
      </p>
      <div className="flex flex-wrap gap-2">
        {/* All button */}
        <button
          onClick={() => onSelect(null)}
          className={`px-3.5 py-1.5 font-mono font-bold text-xs border-2 border-black rounded-lg transition-all duration-150 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none ${
            selectedCategory === null
              ? 'bg-[var(--accent)] text-black'
              : 'bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--accent)]/30'
          }`}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id === selectedCategory ? null : cat.id)}
            title={cat.description}
            className={`px-3.5 py-1.5 font-mono font-bold text-xs border-2 border-black rounded-lg transition-all duration-150 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none capitalize ${
              selectedCategory === cat.id
                ? 'bg-[var(--accent)] text-black'
                : 'bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--accent)]/30'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}
