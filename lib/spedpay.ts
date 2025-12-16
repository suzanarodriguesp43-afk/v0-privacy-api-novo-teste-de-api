// SpedPay API Integration
// Documentação: https://api.spedpay.space/integration/docs/api

const SPEDPAY_BASE_URL = "https://api.spedpay.space"

interface SpedPayCustomer {
  name: string
  email: string
  phone: string
  document_type: "CPF" | "CNPJ"
  document: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

interface SpedPayItem {
  id: string
  title: string
  description: string
  price: number
  quantity: number
  is_physical: boolean
}

interface CreateTransactionRequest {
  external_id: string
  total_amount: number
  payment_method: "PIX"
  webhook_url: string
  items: SpedPayItem[]
  ip: string
  customer: SpedPayCustomer
  // splits removido - não é necessário quando você é o único recebedor
}

interface SpedPayTransactionResponse {
  id: string
  external_id: string
  status: "AUTHORIZED" | "PENDING" | "CHARGEBACK" | "FAILED" | "IN_DISPUTE"
  total_value: number
  customer: {
    email: string
    name: string
  }
  payment_method: string
  pix: {
    payload: string
  }
  hasError: boolean
}

interface SpedPayTransactionDetails {
  id: string
  external_id: string | null
  status: "AUTHORIZED" | "PENDING" | "CHARGEBACK" | "FAILED" | "IN_DISPUTE"
  amount: number
  payment_method: string
  customer: {
    name: string
    email: string
    phone: string
    document: string
    address?: {
      cep: string
      city: string
      state: string
      number: string
      street: string
      complement: string
      neighborhood: string
    }
  }
  created_at: string
}

interface SpedPayAccountInfo {
  email: string
  name: string
  document: string
}

interface SpedPayTransactionListItem {
  id: string
  external_id: string | null
  status: "AUTHORIZED" | "PENDING" | "CHARGEBACK" | "FAILED" | "IN_DISPUTE"
  amount: number
  payment_method: string
  customer: {
    name: string
    email: string
  }
  created_at: string
}

interface SpedPayTransactionsListResponse {
  data: SpedPayTransactionListItem[]
  meta: {
    total: number
    page: number
    limit: number
  }
}

// Criar transação PIX
export async function createSpedPayTransaction(data: CreateTransactionRequest): Promise<SpedPayTransactionResponse> {
  const apiSecret = process.env.SPEDPAY_API_SECRET

  if (!apiSecret) {
    throw new Error("SPEDPAY_API_SECRET não configurado")
  }

  console.log("[v0] SpedPay - Creating transaction with URL:", `${SPEDPAY_BASE_URL}/v1/transactions`)
  console.log("[v0] SpedPay - Request data:", JSON.stringify(data, null, 2))

  const response = await fetch(`${SPEDPAY_BASE_URL}/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-secret": apiSecret,
    },
    body: JSON.stringify(data),
  })

  const responseText = await response.text()
  console.log("[v0] SpedPay - Response status:", response.status)
  console.log("[v0] SpedPay - Response body:", responseText)

  if (!response.ok) {
    let errorMessage = `SpedPay API error: ${response.status}`
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

// Consultar transação por ID
export async function getSpedPayTransaction(transactionId: string): Promise<SpedPayTransactionDetails> {
  const apiSecret = process.env.SPEDPAY_API_SECRET

  if (!apiSecret) {
    throw new Error("SPEDPAY_API_SECRET não configurado")
  }

  const response = await fetch(`${SPEDPAY_BASE_URL}/v1/transactions/${transactionId}`, {
    method: "GET",
    headers: {
      "api-secret": apiSecret,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error("[SpedPay] Get transaction error:", errorData)
    throw new Error(errorData.message || `SpedPay API error: ${response.status}`)
  }

  return response.json()
}

// Consultar informações da conta
export async function getSpedPayAccountInfo(): Promise<SpedPayAccountInfo> {
  const apiSecret = process.env.SPEDPAY_API_SECRET

  if (!apiSecret) {
    throw new Error("SPEDPAY_API_SECRET não configurado")
  }

  const response = await fetch(`${SPEDPAY_BASE_URL}/v1/account-info`, {
    method: "GET",
    headers: {
      "api-secret": apiSecret,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error("[SpedPay] Get account info error:", errorData)
    throw new Error(errorData.message || `SpedPay API error: ${response.status}`)
  }

  return response.json()
}

// Gerar QR Code a partir do payload PIX
export function generatePixQRCodeUrl(pixPayload: string): string {
  // Usa a API do QR Server para gerar o QR Code
  const encodedPayload = encodeURIComponent(pixPayload)
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedPayload}`
}

export async function listSpedPayTransactions(page = 1, limit = 50): Promise<SpedPayTransactionsListResponse> {
  const apiSecret = process.env.SPEDPAY_API_SECRET

  if (!apiSecret) {
    throw new Error("SPEDPAY_API_SECRET não configurado")
  }

  console.log("[v0] SpedPay - Listing transactions, page:", page, "limit:", limit)
  console.log("[v0] SpedPay - API URL:", `${SPEDPAY_BASE_URL}/v1/transactions?page=${page}&limit=${limit}`)

  const response = await fetch(`${SPEDPAY_BASE_URL}/v1/transactions?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: {
      "api-secret": apiSecret,
    },
  })

  console.log("[v0] SpedPay - List response status:", response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[v0] SpedPay - List transactions error response:", errorText)

    let errorData
    try {
      errorData = JSON.parse(errorText)
    } catch {
      throw new Error(`SpedPay API error: ${response.status} - ${errorText}`)
    }

    throw new Error(errorData.message || `SpedPay API error: ${response.status}`)
  }

  const data = await response.json()
  console.log("[v0] SpedPay - List transactions response:", data)

  return data
}

// Helpers para verificar status
export function isPaymentApproved(status: string): boolean {
  return status === "AUTHORIZED"
}

export function isPaymentPending(status: string): boolean {
  return status === "PENDING"
}

export function isPaymentFailed(status: string): boolean {
  return status === "FAILED" || status === "CHARGEBACK" || status === "IN_DISPUTE"
}
