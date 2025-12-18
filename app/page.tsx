"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import Image from "next/image"
const PaymentModal = lazy(() => import("@/components/payment-modal").then((mod) => ({ default: mod.PaymentModal })))

// ... existing code for interfaces and plans ...

interface Plan {
  id: string
  name: string
  duration: string
  price: number
  priceDisplay: string
  discount?: string
}

const plans: Plan[] = [
  {
    id: "plan-1-mes",
    name: "1 Mês",
    duration: "1 Mês",
    price: 19.9,
    priceDisplay: "R$ 19,90",
  },
  {
    id: "plan-3-meses",
    name: "3 Meses",
    duration: "3 Meses",
    price: 27.9,
    priceDisplay: "R$ 27,90",
    discount: "25% off",
  },
  {
    id: "plan-vitalicio",
    name: "Vitalício",
    duration: "Vitalício",
    price: 47.9,
    priceDisplay: "R$ 47,90",
    discount: "50% off",
  },
]

function captureAndSaveUTMs() {
  if (typeof window === "undefined") return

  try {
    const urlParams = new URLSearchParams(window.location.search)
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

    const utmParams: Record<string, string> = {}
    let hasUtms = false

    utmKeys.forEach((key) => {
      const value = urlParams.get(key)
      if (value && value.trim() !== "") {
        // Decodifica caracteres especiais como | usados no Facebook
        utmParams[key] = decodeURIComponent(value)
        hasUtms = true
      }
    })

    if (hasUtms) {
      const utmJson = JSON.stringify(utmParams)
      // Salva em ambos os storages para redundância
      localStorage.setItem("utm_params", utmJson)
      sessionStorage.setItem("utm_params", utmJson)
      console.log("[v0] UTMs salvos na página:", utmJson)
    } else {
      console.log("[v0] Nenhum UTM encontrado na URL")
    }
  } catch (e) {
    console.log("[v0] Erro ao capturar UTMs:", e)
  }
}

export default function ProfilePage() {
  const [bioExpanded, setBioExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<"posts" | "media">("posts")
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  useEffect(() => {
    captureAndSaveUTMs()
  }, [])

  const handleSubscribe = (plan: Plan) => {
    setSelectedPlan(plan)
    setIsPaymentModalOpen(true)
  }

  // ... existing code for return JSX ...
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-[60px] z-50 bg-white border-b border-gray-100 shadow-sm flex items-center justify-center px-5">
        <Image src="/images/images-logo.webp" alt="Logo do Privacy" width={120} height={32} className="h-8 w-auto" />
      </header>

      <main className="max-w-3xl mx-auto pt-[60px]">
        {/* Profile Section */}
        <div className="relative mb-[50px]">
          {/* Banner */}
          <div className="relative w-full h-[175px] overflow-hidden">
            <Image
              src="/images/banner.png"
              alt="Foto de Capa"
              fill
              className="object-cover object-[20%_60%]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
            <div className="absolute top-4 left-6">
              <h2 className="text-2xl font-bold text-white drop-shadow-md mb-2">Mc Mirella</h2>
              <div className="flex items-center gap-4 text-sm text-white -mt-0.5">
                <div className="flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  <span>1.1k •</span>
                </div>
                <div className="flex items-center gap-1">
                  <VideoIcon className="w-4 h-4" />
                  <span>438 •</span>
                </div>
                <div className="flex items-center gap-1">
                  <HeartIcon className="w-4 h-4" />
                  <span>229K</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Image */}
          <div className="absolute -bottom-[50px] left-6 w-[130px] h-[130px] rounded-full overflow-hidden border-4 border-white shadow-md z-10">
            <Image src="/images/fotodeperfil.jpg" alt="Foto de Perfil" fill className="object-cover" />
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-gray-50 pt-2 mt-6 px-4">
          <div className="pl-[15px]">
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold text-gray-900 leading-5">Mc Mirella</span>
              <VerifiedBadge className="w-[18px] h-[18px] flex-shrink-0" />
            </div>
            <p className="text-sm text-gray-500">@mirella</p>

            <p className={`text-gray-500 mt-2 ${bioExpanded ? "" : "line-clamp-2"}`}>
              Veio conferir se é tudo rosinha né? Sim é tudo rosinha🙈! Você vai me ver toda peladinha, me masturbando
              com dedinhos e brinquedos… 💭 fazendo streaptease pra você e também vídeos de Sexo e Garganta Profunda.
              Uma tonelada de conteúdos solo e acompanhada bem quente pra você aproveitar. Aqui é onde você vai me ver o
              mais natural possível, então prepare-se para relaxar e aproveitar o show! 😜
            </p>
            <button
              onClick={() => setBioExpanded(!bioExpanded)}
              className="text-sm text-[#FD7350] font-medium cursor-pointer"
            >
              {bioExpanded ? "Ler menos" : "Ler mais"}
            </button>
          </div>

          <hr className="border-none bg-gray-200 h-1.5 mt-6" />
        </div>

        {/* Subscription Options */}
        <div className="bg-gray-50 px-4 py-4">
          <h3 className="text-base font-medium text-black pl-[15px] mb-2">Assinaturas</h3>

          <div className="space-y-3">
            {/* Plan 1 - 1 Mês */}
            <button
              onClick={() => handleSubscribe(plans[0])}
              className="w-full h-[60px] px-6 rounded-full bg-gradient-to-r from-[#F58170] to-[#F9AF77] text-white font-medium flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all animate-radar-pulse"
            >
              <span>1 Mês</span>
              <span>R$ 19,90</span>
            </button>

            {/* Promoções */}
            <div className="pt-2">
              <h3 className="text-base font-medium text-gray-900 pl-[15px] mb-2">Promoções</h3>

              {/* Plan 2 - 3 Meses */}
              <button
                onClick={() => handleSubscribe(plans[1])}
                className="w-full h-[60px] px-6 rounded-full bg-gradient-to-r from-[#F58170] to-[#F9AF77] text-white font-medium flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all mb-3"
              >
                <span>
                  3 Meses (<em>25% off</em>)
                </span>
                <span>R$ 27,90</span>
              </button>

              {/* Plan 3 - Vitalício */}
              <button
                onClick={() => handleSubscribe(plans[2])}
                className="w-full h-[60px] px-6 rounded-full bg-gradient-to-r from-[#F58170] to-[#F9AF77] text-white font-medium flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                <span>
                  Vitalício (<em>50% off</em>)
                </span>
                <span>R$ 47,90</span>
              </button>
            </div>
          </div>
        </div>

        <hr className="border-none bg-gray-200 h-1.5" />

        {/* Content Tabs */}
        <div className="px-4 pb-8">
          <div className="flex border-b-2 border-gradient">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 h-[50px] text-lg rounded-t-xl ${
                activeTab === "posts" ? "bg-[#fef3f1] text-[#f58673]" : "bg-gray-100 text-gray-500"
              }`}
            >
              644 postagens
            </button>
            <button
              onClick={() => setActiveTab("media")}
              className={`flex-1 h-[50px] text-lg rounded-t-xl ${
                activeTab === "media" ? "bg-[#fef3f1] text-[#f58673]" : "bg-gray-100 text-gray-500"
              }`}
            >
              1.359 mídias
            </button>
          </div>

          {/* Posts Content */}
          {activeTab === "posts" && (
            <div className="space-y-5 mt-4">
              <PostCard videoUrl="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Design%20sem%20nome%20%281%29-NT1p7sJFZyqqaZykxsW7oBiCYFpMH5.mp4" likes={672} comments={132} />
              <PostCard videoUrl="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Design%20sem%20nome%20%282%29-of70f947hVUY4mRPuJ5bIbkkCaAg5N.mp4" likes={872} comments={532} />
              <PostCard videoUrl="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Design%20sem%20nome%20%283%29-AABeU5XnaQHxL7Ew2PhBmKMd6Gkg8l.mp4" likes={1243} comments={289} />

              <div className="pt-4">
                <button
                  onClick={() => handleSubscribe(plans[0])}
                  className="w-full h-[60px] px-6 rounded-full bg-gradient-to-r from-[#F58170] to-[#F9AF77] text-white font-medium flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all animate-radar-pulse"
                >
                  <span>1 Mês</span>
                  <span>R$ 19,90</span>
                </button>
              </div>
            </div>
          )}

          {/* Media Content */}
          {activeTab === "media" && (
            <div className="mt-4">
              <div className="flex justify-center gap-2 mb-4 overflow-x-auto pb-2">
                <button className="px-4 py-2 text-xs bg-orange-100 text-orange-700 font-medium rounded">
                  412 todos
                </button>
                <button className="px-4 py-2 text-xs bg-gray-100 text-gray-600 rounded">258 fotos</button>
                <button className="px-4 py-2 text-xs bg-gray-100 text-gray-600 rounded">154 vídeos</button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-orange-50 rounded flex items-center justify-center relative">
                    <Image
                      src="/images/images-logo.webp"
                      alt="Logo Privacy"
                      width={80}
                      height={80}
                      className="opacity-10 absolute"
                    />
                    <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center z-10">
                      <LockIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Payment Modal */}
      <Suspense fallback={null}>
        {isPaymentModalOpen && (
          <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} plan={selectedPlan} />
        )}
      </Suspense>
    </div>
  )
}

function PostCard({
  imageUrl,
  videoUrl,
  likes,
  comments,
}: {
  imageUrl?: string
  videoUrl?: string
  likes: number
  comments: number
}) {
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVideoLoaded(true)
          }
        })
      },
      { rootMargin: "100px" },
    )

    const videoElement = document.getElementById(`video-${videoUrl}`)
    if (videoElement) {
      observer.observe(videoElement)
    }

    return () => observer.disconnect()
  }, [videoUrl])

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow mx-auto">
      <div className="flex items-center justify-between p-2 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Image
            src="/images/fotodeperfil.jpg"
            alt="Foto de Perfil"
            width={40}
            height={40}
            className="rounded-full object-cover"
            loading="lazy"
          />
          <div>
            <div className="flex items-center gap-1">
              <h4 className="text-sm font-medium">Mc Mirella</h4>
              <VerifiedBadge className="w-[14px] h-[14px] flex-shrink-0" />
            </div>
            <p className="text-xs text-gray-500">@mirella</p>
          </div>
        </div>
        <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
          <MoreVerticalIcon className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div id={`video-${videoUrl}`} className="relative h-[400px] overflow-hidden bg-gray-100">
        {videoUrl && videoLoaded ? (
          <video src={videoUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline preload="none" />
        ) : (
          <Image src={imageUrl || "/placeholder.svg"} alt="Post content" fill className="object-cover" loading="lazy" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center mb-4">
            <LockIcon className="w-8 h-8 text-gray-400" />
          </div>
          <div className="flex items-center gap-4 px-4 py-3 text-xs text-gray-600 bg-white/50 rounded-lg">
            <div className="flex items-center gap-1">
              <HeartIcon className="w-4 h-4" />
              <span>{likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageIcon className="w-4 h-4" />
              <span>{comments}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center p-3">
        <button className="flex items-center gap-1 p-2 text-gray-600 rounded hover:bg-gray-100">
          <HeartIcon className="w-5 h-5" />
        </button>
        <button className="flex items-center gap-1 p-2 text-gray-600 rounded hover:bg-gray-100">
          <MessageIcon className="w-5 h-5" />
        </button>
        <button className="flex items-center gap-1 p-2 text-gray-600 rounded hover:bg-gray-100 ml-auto">
          <BookmarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

// Icons
function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor">
      <path d="M64 64C46.3 64 32 78.3 32 96V329.4l67.7-67.7c15.6-15.6 40.9-15.6 56.6 0L224 329.4 355.7 197.7c15.6-15.6 40.9-15.6 56.6 0L480 265.4V96c0-17.7-14.3-32-32-32H64zM32 374.6V416c0 17.7 14.3 32 32 32h41.4l96-96-67.7-67.7c-3.1-3.1-8.2-3.1-11.3 0L32 374.6zM389.7 220.3c-3.1-3.1-8.2-3.1-11.3 0L150.6 448H448c17.7 0 32-14.3 32-32V310.6l-90.3-90.3zM0 96C0 60.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zm160 48a16 16 0 1 0 -32 0 16 16 0 1 0 32 0zm-64 0a48 48 0 1 1 96 0 48 48 0 1 1 -96 0z" />
    </svg>
  )
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 576 512" fill="currentColor">
      <path d="M64 96c-17.7 0-32 14.3-32 32V384c0 17.7 14.3 32 32 32H320c17.7 0 32-14.3 32-32V128c0-17.7-14.3-32-32-32H64zM0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64v47.2V336.8 384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM519.4 411.3L416 354.4V317.9l118.8 65.4c.9 .5 1.9 .8 3 .8c3.4 0 6.2-2.8 6.2-6.2V134.2c0-3.4-2.8-6.2-6.2-6.2c-6.4 0-12.8-1.6-18.4-4.7z" />
    </svg>
  )
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function MoreVerticalIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  )
}

function VerifiedBadge({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#FD7350" />
      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
