"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Loader2, Copy, Check, RefreshCw, QrCode, Mail, User } from "lucide-react"
import { trackInitiateCheckout } from "@/lib/tracking"
import { QRCodeSVG } from "qrcode.react"

interface Plan {
  id: string
  name: string
  duration: string
  price: number
  priceDisplay: string
  discount?: string
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  plan: Plan | null
}

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

type PaymentStatus = "idle" | "form" | "loading" | "pix" | "checking" | "success" | "error"

function getAllUTMs(): UTMParams {
  const utmParams: UTMParams = {}
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

  try {
    // 1. Tenta da URL atual
    const urlParams = new URLSearchParams(window.location.search)
    utmKeys.forEach((key) => {
      const value = urlParams.get(key)
      if (value && value.trim() !== "") {
        utmParams[key as keyof UTMParams] = decodeURIComponent(value)
      }
    })

    // 2. Se não encontrou na URL, tenta do localStorage
    if (Object.keys(utmParams).length === 0) {
      const storedLocal = localStorage.getItem("utm_params")
      if (storedLocal) {
        const parsed = JSON.parse(storedLocal)
        Object.assign(utmParams, parsed)
      }
    }

    // 3. Se ainda não encontrou, tenta do sessionStorage
    if (Object.keys(utmParams).length === 0) {
      const storedSession = sessionStorage.getItem("utm_params")
      if (storedSession) {
        const parsed = JSON.parse(storedSession)
        Object.assign(utmParams, parsed)
      }
    }
  } catch (e) {
    // Silently fail
  }

  return utmParams
}

export function PaymentModal({ isOpen, onClose, plan }: PaymentModalProps) {
  const [status, setStatus] = useState<PaymentStatus>("form")
  const [email, setEmail] = useState<string>("")
  const [emailError, setEmailError] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [nameError, setNameError] = useState<string>("")
  const [pixCode, setPixCode] = useState<string>("")
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [transactionId, setTransactionId] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [capturedUtms, setCapturedUtms] = useState<UTMParams>({})

  useEffect(() => {
    if (isOpen) {
      const utms = getAllUTMs()
      setCapturedUtms(utms)
      console.log("[v0] UTMs armazenados no estado do modal:", JSON.stringify(utms))
    }
  }, [isOpen])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleFormSubmit = () => {
    let hasError = false

    if (!name.trim()) {
      setNameError("Por favor, insira seu nome ou apelido")
      hasError = true
    } else if (name.trim().length < 2) {
      setNameError("Nome deve ter pelo menos 2 caracteres")
      hasError = true
    } else {
      setNameError("")
    }

    if (!email.trim()) {
      setEmailError("Por favor, insira seu email")
      hasError = true
    } else if (!validateEmail(email)) {
      setEmailError("Por favor, insira um email válido")
      hasError = true
    } else {
      setEmailError("")
    }

    if (hasError) return

    generatePayment()
  }

  const generatePayment = useCallback(async () => {
    if (!plan || !email || !name) return

    setStatus("loading")
    setError("")

    try {
      const utmParams = Object.keys(capturedUtms).length > 0 ? capturedUtms : getAllUTMs()

      const generatedCPF = generateValidCPF()
      const customerName = name.trim()

      const requestBody = {
        planId: plan.id,
        planName: plan.name,
        planPrice: plan.price,
        customerData: {
          email,
          name: customerName,
          document: generatedCPF,
        },
        utmParams: utmParams,
      }

      const paymentResponse = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const paymentResult = await paymentResponse.json()

      if (!paymentResult.success) {
        throw new Error(typeof paymentResult.error === "string" ? paymentResult.error : "Erro ao criar pagamento")
      }

      if (!paymentResult.pixCode) {
        throw new Error("Código PIX não foi gerado")
      }

      setPixCode(paymentResult.pixCode)
      setQrCodeUrl(paymentResult.qrCodeUrl)
      setTransactionId(paymentResult.transactionId)
      setStatus("pix")

      trackInitiateCheckout(plan.price * 100, utmParams)
    } catch (err) {
      let errorMessage = "Erro ao processar pagamento"
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === "string") {
        errorMessage = err
      }
      setError(errorMessage)
      setStatus("error")
    }
  }, [plan, email, name, capturedUtms])

  useEffect(() => {
    if (status !== "pix" || !transactionId) return

    const checkPayment = async () => {
      try {
        const response = await fetch("/api/check-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId }),
        })

        const result = await response.json()

        if (result.status === "AUTHORIZED") {
          setStatus("success")
          setTimeout(() => {
            window.location.href = "https://t.me/mirellaexclusivo"
          }, 2000)
        }
      } catch (err) {
        // Silent fail
      }
    }

    const interval = setInterval(checkPayment, 5000)
    return () => clearInterval(interval)
  }, [status, transactionId])

  useEffect(() => {
    if (!isOpen) {
      setStatus("form")
      setEmail("")
      setEmailError("")
      setName("")
      setNameError("")
      setPixCode("")
      setQrCodeUrl("")
      setTransactionId("")
      setError("")
      setCopied(false)
    }
  }, [isOpen])

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Silent fail
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-2 bg-gradient-to-r from-[#F58170] to-[#F9AF77]">
          <div className="flex items-center gap-2">
            {status === "form" ? <Mail className="w-5 h-5 text-white" /> : <QrCode className="w-5 h-5 text-white" />}
            <h2 className="text-base font-semibold text-white">{status === "form" ? "Seus Dados" : "Pagamento PIX"}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-3 overflow-y-auto">
          {status === "form" && (
            <div className="flex flex-col items-center py-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#F58170] to-[#F9AF77] flex items-center justify-center mb-2">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-0.5 text-center">Quase lá!</h3>
              <p className="text-sm text-gray-600 text-center mb-3 px-4">
                Preencha seus dados para gerar o QR Code de pagamento.
              </p>

              <div className="w-full p-2.5 bg-gray-50 rounded-xl mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Plano</span>
                  <span className="font-semibold text-gray-900 text-sm">{plan?.name}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-gray-600 text-sm">Valor</span>
                  <span className="font-bold text-lg text-[#F58170]">{plan?.priceDisplay}</span>
                </div>
              </div>

              <div className="w-full mb-3">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nome ou Apelido</label>
                <input
                  type="text"
                  placeholder="Como posso te chamar bb?"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setNameError("")
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleFormSubmit()
                    }
                  }}
                  className={`w-full px-4 py-2.5 border-2 ${
                    nameError ? "border-red-500" : "border-gray-200"
                  } rounded-xl text-sm focus:outline-none focus:border-[#F58170] transition-colors`}
                />
                {nameError && <p className="text-red-500 text-xs mt-1 ml-1">{nameError}</p>}
              </div>

              <div className="w-full mb-3">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailError("")
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleFormSubmit()
                    }
                  }}
                  className={`w-full px-4 py-2.5 border-2 ${
                    emailError ? "border-red-500" : "border-gray-200"
                  } rounded-xl text-sm focus:outline-none focus:border-[#F58170] transition-colors`}
                />
                {emailError && <p className="text-red-500 text-xs mt-1 ml-1">{emailError}</p>}
              </div>

              <button
                onClick={handleFormSubmit}
                className="w-full py-2.5 bg-gradient-to-r from-[#F58170] to-[#F9AF77] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Finalizar assinatura
              </button>
            </div>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-6">
              <h3 className="text-base font-bold text-gray-900 mb-3">Gerando QR Code PIX...</h3>
              <Loader2 className="w-10 h-10 text-[#F58170] animate-spin mb-3" />
              <p className="text-sm text-gray-600">Aguarde um momento...</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-4">
              <h3 className="text-base font-bold text-gray-900 mb-2">Erro ao processar</h3>
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <X className="w-7 h-7 text-red-500" />
              </div>
              <p className="text-red-600 text-center mb-3 text-sm">{error}</p>
              <button
                onClick={() => setStatus("form")}
                className="px-6 py-2 bg-gradient-to-r from-[#F58170] to-[#F9AF77] text-white rounded-full font-medium hover:opacity-90 transition-opacity text-sm"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {status === "pix" && (
            <div className="flex flex-col items-center py-2">
              <h3 className="text-base font-bold text-gray-900 mb-1 text-center">Pague com PIX</h3>
              <p className="text-sm text-gray-600 text-center mb-3">
                Finalize o pagamento e acesse conteúdos exclusivos.
              </p>

              <div className="w-full p-2.5 bg-gray-50 rounded-xl mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Plano</span>
                  <span className="font-semibold text-gray-900 text-sm">{plan?.name}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-gray-600 text-sm">Valor</span>
                  <span className="font-bold text-lg text-[#F58170]">{plan?.priceDisplay}</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border-2 border-gray-100 mb-3">
                {pixCode ? (
                  <QRCodeSVG value={pixCode} size={160} level="M" className="mx-auto" />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>

              <div className="w-full mb-3">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Código PIX (Copia e Cola)</label>
                <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 font-mono truncate">
                  {pixCode}
                </div>
              </div>

              <button
                onClick={copyPixCode}
                className="w-full py-2.5 bg-gradient-to-r from-[#F58170] to-[#F9AF77] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Código Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Código PIX
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Aguardando confirmação do pagamento...</span>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <Check className="w-7 h-7 text-green-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2 text-center">Pagamento Confirmado!</h3>
              <p className="text-sm text-gray-600 text-center mb-4 px-4">
                Seu acesso foi liberado. Verifique seu email para mais instruções.
              </p>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-gradient-to-r from-[#F58170] to-[#F9AF77] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function generateValidCPF(): string {
  const randomDigit = () => Math.floor(Math.random() * 10)

  const digits: number[] = []
  for (let i = 0; i < 9; i++) {
    digits.push(randomDigit())
  }

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  digits.push(remainder)

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  digits.push(remainder)

  return digits.join("")
}
