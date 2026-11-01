export function localISODate(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return localISODate(date)
}

export function formatPracticeDate(iso: string, today: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  const label = new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  if (iso === today) {
    return `Today · ${label}`
  }

  if (iso === addDays(today, 1)) {
    return `Tomorrow · ${label}`
  }

  if (iso === addDays(today, -1)) {
    return `Yesterday · ${label}`
  }

  return label
}

export function formatWhen(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return iso
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
