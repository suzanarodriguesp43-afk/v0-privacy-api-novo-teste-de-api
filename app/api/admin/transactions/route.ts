import { type NextRequest, NextResponse } from "next/server"

// A FurionPay não tem endpoint de listagem de transações na documentação pública
// Por enquanto, este endpoint retorna uma mensagem informativa
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação simples via header
    const authEmail = request.headers.get("x-admin-email")

    if (authEmail !== "suzanarodriguesp43@gmail.com") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // A API FurionPay não possui endpoint de listagem de transações
    // Para ver transações, acesse o painel em https://api.furionpay.com/admin
    return NextResponse.json({
      message: "Para visualizar transações, acesse o painel FurionPay em https://api.furionpay.com/admin",
      transactions: [],
      meta: {
        total: 0,
        page: 1,
        limit: 50,
      },
      stats: {
        totalTransactions: 0,
        totalValue: 0,
        authorizedCount: 0,
        pendingCount: 0,
        failedCount: 0,
      },
    })
  } catch (error) {
    console.error("[Admin API] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao buscar transações" },
      { status: 500 },
    )
  }
}
