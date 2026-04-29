'use client'

interface FilterTagsProps {
  genres: readonly string[]
  selected: string[]
  onChange: (genres: string[]) => void
}

export default function FilterTags({ genres, selected, onChange }: FilterTagsProps) {
  const toggle = (g: string) => {
    if (selected.includes(g)) {
      onChange(selected.filter((s) => s !== g))
    } else {
      onChange([...selected, g])
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {genres.map((g) => {
        const active = selected.includes(g)
        return (
          <button
            key={g}
            type="button"
            onClick={() => toggle(g)}
            className={[
              'text-xs px-3 py-1 rounded-full font-medium transition-all duration-150 active:scale-95',
              active
                ? 'bg-sky-400 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200',
            ].join(' ')}
          >
            {g}
          </button>
        )
      })}
    </div>
  )
}
