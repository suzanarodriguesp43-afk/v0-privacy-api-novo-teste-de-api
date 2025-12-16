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

    // Verifica se a API está configurada
    const apiKey = process.env.FURIONPAY_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "API não configurada. Configure FURIONPAY_API_KEY nas variáveis de ambiente.",
        },
        { status: 500 },
      )
    }

    // Gera ID externo único
    const externalId = `privacy-${planId}-${Date.now()}-${Math.random().toString(36).substring(7)}`

    console.log("[v0] UTM params recebidos na API:", JSON.stringify(utmParams))

    // Prepara metadata com UTMs e informações adicionais
    const metadata: Record<string, string> = {
      plan_id: planId,
      plan_name: planName,
    }

    if (utmParams && typeof utmParams === "object") {
      console.log("[v0] Processando UTMs:", Object.keys(utmParams))
      if (utmParams.utm_source) metadata.utm_source = utmParams.utm_source
      if (utmParams.utm_medium) metadata.utm_medium = utmParams.utm_medium
      if (utmParams.utm_campaign) metadata.utm_campaign = utmParams.utm_campaign
      if (utmParams.utm_adset) metadata.utm_adset = utmParams.utm_adset
      if (utmParams.utm_ad) metadata.utm_ad = utmParams.utm_ad
      if (utmParams.utm_id) metadata.utm_id = utmParams.utm_id
      if (utmParams.utm_term) metadata.utm_term = utmParams.utm_term
      if (utmParams.utm_content) metadata.utm_content = utmParams.utm_content
      if (utmParams.src) metadata.src = utmParams.src
      if (utmParams.sck) metadata.sck = utmParams.sck
    } else {
      console.log("[v0] UTM params não encontrados ou inválidos")
    }

    console.log("[v0] Metadata final para FurionPay:", JSON.stringify(metadata))

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
    console.error("[Create Payment] Error:", errorMessage)
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
