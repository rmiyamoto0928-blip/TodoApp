'use client'

interface MiyaRatingProps {
  rating: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (value: number) => void
}

const sizeMap = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' }

export default function MiyaRating({
  rating,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
}: MiyaRatingProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < rating
        return (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
            className={[
              sizeMap[size],
              'font-bold leading-none select-none transition-all duration-150',
              filled ? 'text-sky-400' : 'text-gray-200',
              interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default',
            ].join(' ')}
            aria-label={interactive ? `${i + 1}宮` : undefined}
          >
            宮
          </button>
        )
      })}
    </div>
  )
}
