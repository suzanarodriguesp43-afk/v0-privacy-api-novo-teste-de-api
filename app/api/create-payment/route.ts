import { type NextRequest, NextResponse } from "next/server"
import { createFurionPayPix } from "@/lib/furionpay"

interface UTMParams {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, planName, planPrice, customerData, utmParams } = body

    // Validação
    if (!customerData || !customerData.email) {
      return NextResponse.json({ success: false, error: "Email é obrigatório" }, { status: 400 })
    }

    if (!customerData.name || customerData.name.trim().length < 2) {
      return NextResponse.json({ success: false, error: "Nome é obrigatório" }, { status: 400 })
    }

    if (!customerData.document || customerData.document.length !== 11) {
      return NextResponse.json({ success: false, error: "CPF é obrigatório" }, { status: 400 })
    }

    // Gera ID externo único
    const externalId = `privacy-${planId}-${Date.now()}-${Math.random().toString(36).substring(7)}`

    const metadata: Record<string, string> = {
      plan_id: planId,
      plan_name: planName,
    }

    // Adiciona todos os UTMs ao metadata
    if (utmParams && typeof utmParams === "object") {
      const utmKeys = [
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

      utmKeys.forEach((key) => {
        const value = utmParams[key]
        if (value && typeof value === "string" && value.trim() !== "") {
          metadata[key] = value.trim()
        }
      })
    }

    // Cria a transação PIX na FurionPay
    const pixResponse = await createFurionPayPix({
      amount: planPrice,
      description: `Assinatura ${planName} - Privacy`,
      external_reference: externalId,
      customer: {
        name: customerData.name,
        email: customerData.email,
        document: customerData.document,
      },
      metadata,
    })

    if (!pixResponse.success) {
      throw new Error("Erro ao criar PIX")
    }

    return NextResponse.json({
      success: true,
      transactionId: pixResponse.data.txid,
      externalId: pixResponse.data.external_reference,
      pixCode: pixResponse.data.pix_code,
      qrCodeUrl: pixResponse.data.qr_code_url,
      status: pixResponse.data.status.toUpperCase(),
      amount: planPrice,
      planId,
      planName,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro interno ao processar pagamento"
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
