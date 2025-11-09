import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} à ${formatTime(date)}`
}

export function formatDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diff = end.getTime() - start.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}h${mins.toString().padStart(2, '0')}`
  }
  return `${mins} min`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    performance: 'bg-blue-100 text-blue-800 border-blue-200',
    behavior: 'bg-purple-100 text-purple-800 border-purple-200',
    progress: 'bg-green-100 text-green-800 border-green-200',
    difficulty: 'bg-orange-100 text-orange-800 border-orange-200',
    injury: 'bg-red-100 text-red-800 border-red-200',
    general: 'bg-gray-100 text-gray-800 border-gray-200',
  }
  return colors[category] || colors.general
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    performance: 'Performance',
    behavior: 'Comportement',
    progress: 'Progrès',
    difficulty: 'Difficulté',
    injury: 'Blessure',
    general: 'Général',
  }
  return labels[category] || category
}

export function getSentimentColor(sentiment: string): string {
  const colors: Record<string, string> = {
    positive: 'text-green-600',
    neutral: 'text-orange-600',
    negative: 'text-red-600',
  }
  return colors[sentiment] || colors.neutral
}

export function getSentimentIcon(sentiment: string): string {
  const icons: Record<string, string> = {
    positive: '😊',
    neutral: '😐',
    negative: '😟',
  }
  return icons[sentiment] || icons.neutral
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
