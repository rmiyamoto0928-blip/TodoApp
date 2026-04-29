'use client'

import { SortOption } from '@/lib/types'

const options: { value: SortOption; label: string }[] = [
  { value: 'rating-desc', label: '評価が高い順' },
  { value: 'rating-asc', label: '評価が低い順' },
  { value: 'date-desc', label: '新しい順' },
  { value: 'date-asc', label: '古い順' },
]

interface SortDropdownProps {
  value: SortOption
  onChange: (v: SortOption) => void
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
