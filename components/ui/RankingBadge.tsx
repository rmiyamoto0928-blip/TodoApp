interface RankingBadgeProps {
  rank: number
}

const badges: Record<number, { label: string; className: string }> = {
  1: { label: '🥇 1位', className: 'bg-yellow-400 text-yellow-900' },
  2: { label: '🥈 2位', className: 'bg-gray-300 text-gray-800' },
  3: { label: '🥉 3位', className: 'bg-orange-300 text-orange-900' },
}

export default function RankingBadge({ rank }: RankingBadgeProps) {
  const badge = badges[rank]
  if (!badge) return null
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.className}`}>
      {badge.label}
    </span>
  )
}
