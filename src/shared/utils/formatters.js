export const formatDate = (iso, options = {}) => {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

export const formatTime = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })
}

export const formatDateTime = (iso) => {
  return `${formatDate(iso)} ${formatTime(iso)}`
}
