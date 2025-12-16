import { type NextRequest, NextResponse } from "next/server"
import { listSpedPayTransactions } from "@/lib/spedpay"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Admin API - Starting request")

    // Verificar autenticação simples via header
    const authEmail = request.headers.get("x-admin-email")
    console.log("[v0] Admin API - Auth email:", authEmail)

    if (authEmail !== "suzanarodriguesp43@gmail.com") {
      console.log("[v0] Admin API - Unauthorized access attempt")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    console.log("[v0] Admin API - Fetching transactions, page:", page, "limit:", limit)

    const transactions = await listSpedPayTransactions(page, limit)
    console.log("[v0] Admin API - Transactions received:", transactions)

    // Calcular estatísticas
    const stats = {
      totalTransactions: transactions.meta.total,
      totalValue: transactions.data.reduce((sum, t) => sum + t.amount, 0),
      authorizedCount: transactions.data.filter((t) => t.status === "AUTHORIZED").length,
      pendingCount: transactions.data.filter((t) => t.status === "PENDING").length,
      failedCount: transactions.data.filter(
        (t) => t.status === "FAILED" || t.status === "CHARGEBACK" || t.status === "IN_DISPUTE",
      ).length,
    }

    console.log("[v0] Admin API - Stats calculated:", stats)

    return NextResponse.json({
      transactions: transactions.data,
      meta: transactions.meta,
      stats,
    })
  } catch (error) {
    console.error("[v0] Admin API - Error fetching transactions:", error)
    console.error("[v0] Admin API - Error details:", error instanceof Error ? error.stack : error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao buscar transações" },
      { status: 500 },
    )
  }
}
