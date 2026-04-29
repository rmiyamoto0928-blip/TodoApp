'use client'

interface FavoriteButtonProps {
  isFavorite: boolean
  onToggle: () => void
  size?: 'sm' | 'md'
}

export default function FavoriteButton({ isFavorite, onToggle, size = 'md' }: FavoriteButtonProps) {
  const iconSize = size === 'sm' ? 'text-lg' : 'text-2xl'
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={[
        iconSize,
        'transition-all duration-200 active:scale-75',
        isFavorite ? 'text-red-400' : 'text-gray-300',
      ].join(' ')}
      aria-label={isFavorite ? 'お気に入り解除' : 'お気に入り追加'}
    >
      {isFavorite ? '♥' : '♡'}
    </button>
  )
}
