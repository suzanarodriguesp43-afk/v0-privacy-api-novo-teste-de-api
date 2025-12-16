import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json()
    const signature = request.headers.get("x-furionpay-signature")

    console.log("[FurionPay Webhook] Received:", {
      body: webhookData,
      signature,
      timestamp: new Date().toISOString(),
    })

    // Validar assinatura do webhook (se configurado)
    const webhookSecret = process.env.FURIONPAY_WEBHOOK_SECRET
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(webhookData))
        .digest("hex")

      if (signature !== expectedSignature) {
        console.error("[FurionPay Webhook] Invalid signature")
        return NextResponse.json({ received: false, error: "Invalid signature" }, { status: 401 })
      }
    }

    // Estrutura do webhook da FurionPay
    const event = webhookData.event
    const data = webhookData.data

    console.log("[FurionPay Webhook] Processing event:", {
      event,
      txid: data?.txid,
      status: data?.status,
      amount: data?.amount,
    })

    switch (event) {
      case "payment.created":
        console.log("[FurionPay Webhook] Payment CREATED:", data.txid)
        // PIX foi criado e está aguardando pagamento
        break

      case "payment.paid":
        console.log("[FurionPay Webhook] Payment PAID:", data.txid)
        // PIX foi pago com sucesso
        // Aqui você pode:
        // - Atualizar banco de dados
        // - Enviar email de confirmação
        // - Liberar acesso ao conteúdo
        // - Registrar conversão em ferramentas de analytics
        break

      case "payment.expired":
        console.log("[FurionPay Webhook] Payment EXPIRED:", data.txid)
        // PIX expirou sem pagamento
        break

      case "payment.cancelled":
        console.log("[FurionPay Webhook] Payment CANCELLED:", data.txid)
        // PIX foi cancelado
        break

      default:
        console.log("[FurionPay Webhook] Unknown event:", event)
    }

    return NextResponse.json({
      received: true,
      event,
      txid: data?.txid,
    })
  } catch (error) {
    console.error("[FurionPay Webhook] Error:", error)
    // Retornar 200 mesmo em caso de erro para evitar retentativas desnecessárias
    return NextResponse.json({ received: true, error: "Processing error" })
  }
}
