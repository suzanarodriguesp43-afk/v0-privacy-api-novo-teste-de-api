// FurionPay API Integration
// Documentação: https://api.furionpay.com/integration

const FURIONPAY_BASE_URL = "https://qtlhwjotfkyyqzgxlmkg.supabase.co/functions/v1"

const FURIONPAY_API_KEY = "fp_live_uZwOFRm43UjaUg6ZJsmZyzQajCvONeI"

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
  error?: {
    code: string
    message: string
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
  error?: {
    code: string
    message: string
  }
}

export async function createFurionPayPix(data: CreatePixRequest): Promise<FurionPayPixResponse> {
  const apiKey = FURIONPAY_API_KEY

  console.log("[v0] FurionPay usando chave:", apiKey.substring(0, 20) + "...")

  const requestBody = {
    amount: data.amount,
    description: data.description,
    external_reference: data.external_reference,
    customer: {
      name: data.customer.name,
      email: data.customer.email,
      document: data.customer.document,
    },
    metadata: data.metadata,
  }

  console.log("[v0] FurionPay Request Body:", JSON.stringify(requestBody, null, 2))

  const response = await fetch(`${FURIONPAY_BASE_URL}/api-v1-pix-create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  })

  const responseText = await response.text()
  console.log("[v0] FurionPay Response:", responseText)

  let responseData: FurionPayPixResponse
  try {
    responseData = JSON.parse(responseText)
  } catch {
    throw new Error(`Resposta inválida da API: ${responseText}`)
  }

  if (!response.ok || !responseData.success) {
    const errorMessage = responseData.error?.message || `FurionPay API error: ${response.status}`
    throw new Error(errorMessage)
  }

  return responseData
}

export async function getFurionPayPixStatus(txid: string): Promise<FurionPayStatusResponse> {
  const apiKey = FURIONPAY_API_KEY

  if (!apiKey) {
    throw new Error("FURIONPAY_API_KEY não configurado")
  }

  const response = await fetch(`${FURIONPAY_BASE_URL}/api-v1-pix-status?txid=${txid}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  const responseText = await response.text()

  let responseData: FurionPayStatusResponse
  try {
    responseData = JSON.parse(responseText)
  } catch {
    throw new Error(`Resposta inválida da API: ${responseText}`)
  }

  if (!response.ok || !responseData.success) {
    const errorMessage = responseData.error?.message || `FurionPay API error: ${response.status}`
    throw new Error(errorMessage)
  }

  return responseData
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
