'use client'

interface CarRatingProps {
  rating: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (value: number) => void
}

const sizeMap = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' }

export default function CarRating({
  rating,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
}: CarRatingProps) {
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
              'leading-none select-none transition-all duration-150',
              filled ? 'opacity-100' : 'opacity-20 grayscale',
              interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default',
            ].join(' ')}
            aria-label={interactive ? `${i + 1}点` : undefined}
          >
            🚗
          </button>
        )
      })}
    </div>
  )
}
