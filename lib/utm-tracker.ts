// lib/utm-tracker.ts

export interface UTMParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_adset?: string
  utm_ad?: string
  utm_id?: string
  utm_term?: string
  utm_content?: string
  src?: string
  sck?: string
}

const UTM_KEYS: (keyof UTMParams)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_adset",
  "utm_ad",
  "utm_id",
  "utm_term",
  "utm_content",
  "src",
  "sck",
]

const STORAGE_KEY = "utm_params"

// Captura UTMs da URL atual
export function captureUTMsFromURL(): UTMParams {
  if (typeof window === "undefined") return {}

  const params = new URLSearchParams(window.location.search)
  const utms: UTMParams = {}

  UTM_KEYS.forEach((key) => {
    const value = params.get(key)
    if (value) {
      utms[key] = value
    }
  })

  return utms
}

// Salva UTMs no localStorage (mais persistente)
export function saveUTMs(utms: UTMParams): void {
  if (typeof window === "undefined") return

  const existing = getStoredUTMs()
  const merged = { ...existing, ...utms }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
}

// Recupera UTMs do localStorage
export function getStoredUTMs(): UTMParams {
  if (typeof window === "undefined") return {}

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// Captura e salva UTMs automaticamente
export function initUTMTracking(): UTMParams {
  const utms = captureUTMsFromURL()

  if (Object.keys(utms).length > 0) {
    saveUTMs(utms)
  }

  return getStoredUTMs()
}

export function getUTMsForAPI(): UTMParams {
  if (typeof window === "undefined") return {}

  // Primeiro tenta pegar da URL atual (caso ainda esteja na mesma sessão)
  const urlUtms = captureUTMsFromURL()

  // Depois pega do storage
  const storedUtms = getStoredUTMs()

  // Mescla dando prioridade para URL atual, depois storage
  const merged = { ...storedUtms, ...urlUtms }

  // Log para debug
  console.log("[v0] getUTMsForAPI - URL:", JSON.stringify(urlUtms))
  console.log("[v0] getUTMsForAPI - Storage:", JSON.stringify(storedUtms))
  console.log("[v0] getUTMsForAPI - Merged:", JSON.stringify(merged))

  return merged
}

// Formata UTMs para exibição
export function formatUTMsForDisplay(utms: UTMParams): string {
  const parts: string[] = []

  if (utms.utm_source) parts.push(`Fonte: ${utms.utm_source}`)
  if (utms.utm_medium) parts.push(`Mídia: ${utms.utm_medium}`)
  if (utms.utm_campaign) parts.push(`Campanha: ${utms.utm_campaign}`)
  if (utms.utm_adset) parts.push(`Conjunto: ${utms.utm_adset}`)
  if (utms.utm_ad) parts.push(`Anúncio: ${utms.utm_ad}`)
  if (utms.src) parts.push(`src: ${utms.src}`)
  if (utms.sck) parts.push(`sck: ${utms.sck}`)

  return parts.join(" | ")
}
