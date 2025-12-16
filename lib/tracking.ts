// Funções de rastreamento para Utmify e outros pixels
import type { UTMParams } from "./utm-params"

declare global {
  interface Window {
    pixelId?: string
    utmifyPixel?: {
      track: (eventName: string, data?: Record<string, unknown>) => void
    }
  }
}

export const trackInitiateCheckout = (amount: number, utmParams?: UTMParams, currency = "BRL") => {
  try {
    if (typeof window !== "undefined" && window.utmifyPixel) {
      const trackData: Record<string, unknown> = {
        value: amount / 100,
        currency: currency,
        content_type: "subscription",
      }

      // Adiciona UTMs ao tracking se existirem
      if (utmParams && Object.keys(utmParams).length > 0) {
        trackData.utm_source = utmParams.utm_source
        trackData.utm_medium = utmParams.utm_medium
        trackData.utm_campaign = utmParams.utm_campaign
        trackData.utm_adset = utmParams.utm_adset
        trackData.utm_ad = utmParams.utm_ad
        trackData.utm_id = utmParams.utm_id
        trackData.src = utmParams.src
        trackData.sck = utmParams.sck
      }

      window.utmifyPixel.track("InitiateCheckout", trackData)
      console.log("[Tracking] InitiateCheckout enviado:", trackData)
    }
  } catch (error) {
    console.error("[Tracking] Erro ao disparar InitiateCheckout:", error)
  }
}

export const trackPurchase = (amount: number, transactionId: string, utmParams?: UTMParams, currency = "BRL") => {
  try {
    if (typeof window !== "undefined" && window.utmifyPixel) {
      const trackData: Record<string, unknown> = {
        value: amount / 100,
        currency: currency,
        transaction_id: transactionId,
        content_type: "subscription",
      }

      // Adiciona UTMs ao tracking se existirem
      if (utmParams && Object.keys(utmParams).length > 0) {
        trackData.utm_source = utmParams.utm_source
        trackData.utm_medium = utmParams.utm_medium
        trackData.utm_campaign = utmParams.utm_campaign
        trackData.utm_adset = utmParams.utm_adset
        trackData.utm_ad = utmParams.utm_ad
        trackData.utm_id = utmParams.utm_id
        trackData.src = utmParams.src
        trackData.sck = utmParams.sck
      }

      window.utmifyPixel.track("Purchase", trackData)
      console.log("[Tracking] Purchase enviado:", trackData)
    }
  } catch (error) {
    console.error("[Tracking] Erro ao disparar Purchase:", error)
  }
}
