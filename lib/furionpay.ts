// FurionPay API Integration
// Documentação: https://api.furionpay.com/integration

const FURIONPAY_BASE_URL = "https://qtlhwjotfkyyqzgxlmkg.supabase.co/functions/v1"

interface FurionPayCustomer {
  name: string
  email: string
  document: string
}

interface CreatePixRequest {
  amount: number
  description?: string
  external_reference?: string
  customer: FurionPayCustomer
  metadata?: Record<string, string>
}

interface FurionPayPixResponse {
  success: boolean
  data: {
    txid: string
    pix_code: string
    qr_code_url: string
    amount: number
    external_reference?: string
    status: "pending" | "paid" | "expired" | "cancelled"
    expires_at: string
    created_at: string
  }
}

interface FurionPayStatusResponse {
  success: boolean
  data: {
    txid: string
    external_reference?: string
    amount: number
    status: "pending" | "paid" | "expired" | "cancelled"
    paid_at?: string
    expired_at?: string
    created_at: string
    metadata?: Record<string, string>
  }
}

// Criar PIX
export async function createFurionPayPix(data: CreatePixRequest): Promise<FurionPayPixResponse> {
  const apiKey = process.env.FURIONPAY_API_KEY

  if (!apiKey) {
    throw new Error("FURIONPAY_API_KEY não configurado")
  }

  console.log("[v0] FurionPay - Creating PIX with URL:", `${FURIONPAY_BASE_URL}/api-v1-pix-create`)
  console.log("[v0] FurionPay - Request data:", JSON.stringify(data, null, 2))

  const response = await fetch(`${FURIONPAY_BASE_URL}/api-v1-pix-create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(data),
  })

  const responseText = await response.text()
  console.log("[v0] FurionPay - Response status:", response.status)
  console.log("[v0] FurionPay - Response body:", responseText)

  if (!response.ok) {
    let errorMessage = `FurionPay API error: ${response.status}`
    try {
      const errorData = JSON.parse(responseText)
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {
      errorMessage = responseText || errorMessage
    }
    throw new Error(errorMessage)
  }

  try {
    return JSON.parse(responseText)
  } catch {
    throw new Error(`Resposta inválida da API: ${responseText}`)
  }
}

// Consultar status do PIX
export async function getFurionPayPixStatus(txid: string): Promise<FurionPayStatusResponse> {
  const apiKey = process.env.FURIONPAY_API_KEY

  if (!apiKey) {
    throw new Error("FURIONPAY_API_KEY não configurado")
  }

  console.log("[v0] FurionPay - Checking PIX status for txid:", txid)

  const response = await fetch(`${FURIONPAY_BASE_URL}/api-v1-pix-status?txid=${txid}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  const responseText = await response.text()
  console.log("[v0] FurionPay - Status response:", responseText)

  if (!response.ok) {
    let errorMessage = `FurionPay API error: ${response.status}`
    try {
      const errorData = JSON.parse(responseText)
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {
      errorMessage = responseText || errorMessage
    }
    throw new Error(errorMessage)
  }

  try {
    return JSON.parse(responseText)
  } catch {
    throw new Error(`Resposta inválida da API: ${responseText}`)
  }
}

// Helpers para verificar status
export function isPaymentApproved(status: string): boolean {
  return status === "paid"
}

export function isPaymentPending(status: string): boolean {
  return status === "pending"
}

export function isPaymentFailed(status: string): boolean {
  return status === "expired" || status === "cancelled"
}
