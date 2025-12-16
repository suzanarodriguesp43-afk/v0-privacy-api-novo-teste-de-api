import { NextResponse } from "next/server"

// Generate valid CPF with correct check digits
function generateValidCPF() {
  function calculateDigit(cpf: string, factor: number) {
    let sum = 0
    for (let i = 0; i < factor - 1; i++) {
      sum += Number.parseInt(cpf[i]) * (factor - i)
    }
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  let cpf = ""
  for (let i = 0; i < 9; i++) {
    cpf += Math.floor(Math.random() * 10)
  }

  const digit1 = calculateDigit(cpf, 10)
  cpf += digit1

  const digit2 = calculateDigit(cpf, 11)
  cpf += digit2

  return cpf
}

// Generate valid Brazilian phone
function generateValidPhone() {
  const ddd = ["11", "21", "31", "41", "51", "61", "71", "81", "85", "91"]
  const randomDDD = ddd[Math.floor(Math.random() * ddd.length)]
  const remainingDigits = Math.floor(10000000 + Math.random() * 90000000)
  return `${randomDDD}9${remainingDigits}`
}

// Generate valid email
function generateValidEmail(name: string) {
  const domains = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com"]
  const randomDomain = domains[Math.floor(Math.random() * domains.length)]
  const sanitizedName = name
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z.]/g, "")
  const randomNumber = Math.floor(Math.random() * 999)
  return `${sanitizedName}${randomNumber}@${randomDomain}`
}

// Brazilian names
const firstNames = [
  "João",
  "Maria",
  "José",
  "Ana",
  "Pedro",
  "Mariana",
  "Lucas",
  "Juliana",
  "Gabriel",
  "Fernanda",
  "Rafael",
  "Camila",
  "Bruno",
  "Larissa",
  "Felipe",
  "Amanda",
  "Thiago",
  "Beatriz",
  "Gustavo",
  "Carolina",
]

const lastNames = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Costa",
  "Ferreira",
  "Rodrigues",
  "Almeida",
  "Nascimento",
  "Lima",
  "Araújo",
  "Fernandes",
  "Carvalho",
  "Gomes",
]

function generateValidName() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const middleName = lastNames[Math.floor(Math.random() * lastNames.length)]
  return `${firstName} ${middleName} ${lastName}`
}

export async function GET() {
  try {
    const name = generateValidName()
    const cpf = generateValidCPF()
    const phone = generateValidPhone()
    const email = generateValidEmail(name)

    const customer = {
      name,
      email,
      phone,
      document: cpf,
      documentType: "CPF",
    }

    return NextResponse.json({
      success: true,
      customer,
    })
  } catch (error) {
    console.error("Error generating customer data:", error)
    return NextResponse.json({ success: false, error: "Erro ao gerar dados do cliente" }, { status: 500 })
  }
}
