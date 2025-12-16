import { type NextRequest, NextResponse } from "next/server"
import { getFurionPayPixStatus } from "@/lib/furionpay"

export async function POST(request: NextRequest) {
  const apiKey = process.env.FURIONPAY_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "API FurionPay não configurada" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { transactionId } = body

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID é obrigatório" }, { status: 400 })
    }

    // Consulta o status do PIX na FurionPay
    const statusResponse = await getFurionPayPixStatus(transactionId)

    if (!statusResponse.success) {
      throw new Error("Erro ao consultar status do pagamento")
    }

    const pixData = statusResponse.data

    // Mapeia o status para o formato esperado pelo frontend
    let mappedStatus = "PENDING"
    if (pixData.status === "paid") {
      mappedStatus = "AUTHORIZED"
    } else if (pixData.status === "pending") {
      mappedStatus = "PENDING"
    } else if (pixData.status === "expired" || pixData.status === "cancelled") {
      mappedStatus = "FAILED"
    }

    return NextResponse.json({
      status: mappedStatus,
      transactionId: pixData.txid,
      externalId: pixData.external_reference,
      amount: pixData.amount,
      paidAt: pixData.paid_at,
    })
  } catch (error) {
    console.error("[Check Payment] Error:", error)
    return NextResponse.json({ error: "Erro ao verificar pagamento" }, { status: 500 })
  }
}
