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
]

const STORAGE_KEY = "donation_utm_params"

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

// Salva UTMs no sessionStorage
export function saveUTMs(utms: UTMParams): void {
  if (typeof window === "undefined") return

  const existing = getStoredUTMs()
  const merged = { ...existing, ...utms }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
}

// Recupera UTMs do sessionStorage
export function getStoredUTMs(): UTMParams {
  if (typeof window === "undefined") return {}

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
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

// Retorna UTMs para enviar na API
export function getUTMsForAPI(): UTMParams {
  // Primeiro tenta pegar da URL atual
  const urlUtms = captureUTMsFromURL()

  // Se não tiver na URL, pega do storage
  const storedUtms = getStoredUTMs()

  // Mescla dando prioridade para URL atual
  return { ...storedUtms, ...urlUtms }
}
