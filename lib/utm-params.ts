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

const UTM_KEYS = [
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
] as const

export function captureUTMParams(): UTMParams {
  if (typeof window === "undefined") return {}

  const urlParams = new URLSearchParams(window.location.search)
  const newUtmParams: UTMParams = {}

  UTM_KEYS.forEach((key) => {
    const value = urlParams.get(key)
    if (value) {
      newUtmParams[key as keyof UTMParams] = value
    }
  })

  // Se há novos UTMs, salva no localStorage
  if (Object.keys(newUtmParams).length > 0) {
    localStorage.setItem("utm_params", JSON.stringify(newUtmParams))
    return newUtmParams
  }

  return getStoredUTMParams()
}

export function getStoredUTMParams(): UTMParams {
  if (typeof window === "undefined") return {}

  try {
    const stored = localStorage.getItem("utm_params")
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export function getAllUTMParams(): UTMParams {
  if (typeof window === "undefined") return {}

  // Primeiro tenta da URL atual
  const urlParams = new URLSearchParams(window.location.search)
  const utmParams: UTMParams = {}

  UTM_KEYS.forEach((key) => {
    const value = urlParams.get(key)
    if (value) {
      utmParams[key as keyof UTMParams] = value
    }
  })

  // Se tem na URL, atualiza storage e retorna
  if (Object.keys(utmParams).length > 0) {
    localStorage.setItem("utm_params", JSON.stringify(utmParams))
    return utmParams
  }

  // Tenta do localStorage
  const storedParams = getStoredUTMParams()
  if (Object.keys(storedParams).length > 0) {
    return storedParams
  }

  // Tenta do document.referrer se veio de uma campanha
  const referrer = document.referrer
  if (referrer) {
    try {
      const referrerUrl = new URL(referrer)
      const referrerParams = new URLSearchParams(referrerUrl.search)
      const refUtmParams: UTMParams = {}

      UTM_KEYS.forEach((key) => {
        const value = referrerParams.get(key)
        if (value) {
          refUtmParams[key as keyof UTMParams] = value
        }
      })

      if (Object.keys(refUtmParams).length > 0) {
        localStorage.setItem("utm_params", JSON.stringify(refUtmParams))
        return refUtmParams
      }
    } catch {
      // Referrer inválido, ignora
    }
  }

  return {}
}

export function buildUTMString(utmParams: UTMParams): string {
  const parts: string[] = []

  if (utmParams.utm_source) parts.push(`utm_source=${utmParams.utm_source}`)
  if (utmParams.utm_medium) parts.push(`utm_medium=${utmParams.utm_medium}`)
  if (utmParams.utm_campaign) parts.push(`utm_campaign=${utmParams.utm_campaign}`)
  if (utmParams.utm_adset) parts.push(`utm_adset=${utmParams.utm_adset}`)
  if (utmParams.utm_ad) parts.push(`utm_ad=${utmParams.utm_ad}`)
  if (utmParams.utm_id) parts.push(`utm_id=${utmParams.utm_id}`)
  if (utmParams.utm_term) parts.push(`utm_term=${utmParams.utm_term}`)
  if (utmParams.utm_content) parts.push(`utm_content=${utmParams.utm_content}`)
  if (utmParams.src) parts.push(`src=${utmParams.src}`)
  if (utmParams.sck) parts.push(`sck=${utmParams.sck}`)

  return parts.join("&")
}

export function formatUTMForDisplay(utmParams: UTMParams): string {
  const parts = []

  if (utmParams.utm_source) parts.push(`Fonte: ${utmParams.utm_source}`)
  if (utmParams.utm_medium) parts.push(`Mídia: ${utmParams.utm_medium}`)
  if (utmParams.utm_campaign) parts.push(`Campanha: ${utmParams.utm_campaign}`)
  if (utmParams.utm_adset) parts.push(`Conjunto: ${utmParams.utm_adset}`)
  if (utmParams.utm_ad) parts.push(`Anúncio: ${utmParams.utm_ad}`)
  if (utmParams.src) parts.push(`src: ${utmParams.src}`)
  if (utmParams.sck) parts.push(`sck: ${utmParams.sck}`)

  return parts.join(" | ")
}

export function formatUTMForAPI(utmParams: UTMParams): Record<string, string> {
  const result: Record<string, string> = {}

  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      result[key] = value
    }
  })

  return result
}
