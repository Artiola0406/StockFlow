export function formatCurrency(amount: number | string) {
  return (
    '€' +
    parseFloat(String(amount || 0)).toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('sq-AL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
