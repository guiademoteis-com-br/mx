export async function loadMotelData() {
  const response = await fetch('dados/motel.json', { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Não foi possível carregar os dados do motel.')
  }

  const data = await response.json()
  return data || {}
}

export function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function resolveSuiteBySlug(motel, slug) {
  if (!motel || !Array.isArray(motel.suites) || !motel.suites.length) return null
  const normalized = slugify(slug)
  return motel.suites.find(suite => slugify((suite && (suite.slug || suite.name)) || '') === normalized) || null
}

export function placeholderImage(width, height, label) {
  const text = encodeURIComponent(label || `${width}x${height}`)
  return `https://placehold.co/${width}x${height}/e9dfd7/8c4f38?text=${text}`
}

export function hexToHsl(hex) {
  const value = String(hex || '').trim().replace(/^#/, '')
  if (![3, 6].includes(value.length)) return null

  const normalized = value.length === 3
    ? value.split('').map(ch => ch + ch).join('')
    : value

  const r = parseInt(normalized.slice(0, 2), 16) / 255
  const g = parseInt(normalized.slice(2, 4), 16) / 255
  const b = parseInt(normalized.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }

  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

  return {
    h: `${Math.round(h)}deg`,
    s: `${Math.round(s * 100)}%`,
    l: `${Math.round(l * 100)}%`,
  }
}
