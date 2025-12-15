import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function parseCSV(csvContent) {
  const lines = csvContent.split("\n").filter((line) => line.trim())
  const result = []

  // Bỏ qua dòng header và comment
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith("//")) continue

    // Parse CSV với xử lý dấu ngoặc kép
    const values = []
    let current = ""
    let inQuotes = false

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        values.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    values.push(current.trim())

    const [kana, kanji, sinoVietnamese, audioUrl, meaning] = values

    result.push({
      id: String(i),
      kanji: kanji || "",
      kana: kana || "",
      sinoVietnamese: sinoVietnamese || "",
      meaning: meaning || "",
      audioUrl: audioUrl || "",
    })
  }

  return result
}

function generateTS(data) {
  const items = data
    .map(
      (item) => `  {
    id: "${item.id}",
    kanji: "${item.kanji}",
    kana: "${item.kana}",
    sinoVietnamese: "${item.sinoVietnamese}",
    meaning: "${item.meaning}",
    audioUrl: "${item.audioUrl}",
  }`
    )
    .join(",\n")

  return `import { VocabCard } from "./types"

export const SAMPLE_DATA: VocabCard[] = [
${items},
] as const
`
}

// Chạy script
const csvFile = process.argv[2] || "crawl/vocabulary_bai14.csv"
const csvPath = path.resolve(__dirname, csvFile)
const outputPath = path.resolve(__dirname, "constants.ts")

const csvContent = fs.readFileSync(csvPath, "utf-8")
const data = parseCSV(csvContent)
const tsContent = generateTS(data)

fs.writeFileSync(outputPath, tsContent)
console.log(`✅ Đã chuyển đổi ${data.length} từ vựng sang constants.ts`)