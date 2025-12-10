import { useState, useCallback, useEffect, useMemo } from "react"
import { Flashcard } from "./components/Flashcard"
import { DeckEditor } from "./components/DeckEditor"
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Edit3,
  RotateCcw,
  Volume2,
} from "lucide-react"
import { VocabCard } from "./types"
import { SAMPLE_DATA } from "./constants"
import { SpeedInsights } from "@vercel/speed-insights/react"

const STORAGE_KEY = "nihongo-deck"

function App() {
  const [deck, setDeck] = useState<VocabCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (e) {
      console.error("Failed to load deck from localStorage:", e)
    }
    return SAMPLE_DATA
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [randomMode, setRandomMode] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [autoPlayAudio, setAutoPlayAudio] = useState(false)

  // Save to LocalStorage whenever deck changes
  useEffect(() => {
    if (deck.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(deck))
      } catch (e) {
        console.error("Failed to save deck to localStorage:", e)
      }
    }
  }, [deck])

  // Reset index when deck changes
  useEffect(() => {
    setCurrentIndex(0)
    setIsFlipped(false)
  }, [deck.length])

  const currentCard = useMemo(() => deck[currentIndex], [deck, currentIndex])

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  const handleNext = useCallback(() => {
    setIsFlipped(false)
    if (randomMode) {
      setCurrentIndex(Math.floor(Math.random() * deck.length))
    } else {
      setCurrentIndex((prev) => (prev + 1) % deck.length)
    }
  }, [deck.length, randomMode])

  const handlePrev = useCallback(() => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length)
  }, [deck.length])

  const handleSaveDeck = useCallback((newDeck: VocabCard[]) => {
    setDeck(newDeck)
  }, [])

  const handleResetDeck = useCallback(() => {
    if (window.confirm("Bạn có chắc muốn reset về bộ thẻ mặc định?")) {
      setDeck(SAMPLE_DATA)
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (e) {
        console.error("Failed to remove deck from localStorage:", e)
      }
    }
  }, [])

  const toggleRandomMode = useCallback(() => {
    setRandomMode((prev) => !prev)
  }, [])

  const toggleAutoPlayAudio = useCallback(() => {
    setAutoPlayAudio((prev) => !prev)
  }, [])

  const openEditor = useCallback(() => {
    setShowEditor(true)
  }, [])

  const closeEditor = useCallback(() => {
    setShowEditor(false)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.key) {
        case "ArrowLeft":
          handlePrev()
          break
        case "ArrowRight":
          handleNext()
          break
        case " ":
        case "Enter":
          e.preventDefault()
          handleFlip()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleNext, handlePrev, handleFlip])

  if (deck.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Không có thẻ từ vựng nào</p>
          <button
            onClick={openEditor}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Thêm từ vựng
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <SpeedInsights />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            日本語 Flashcards
          </h1>
          <p className="text-gray-600">Học từ vựng tiếng Nhật mỗi ngày</p>
        </header>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={toggleRandomMode}
            aria-label={
              randomMode ? "Tắt chế độ ngẫu nhiên" : "Bật chế độ ngẫu nhiên"
            }
            aria-pressed={randomMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              randomMode
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Shuffle size={18} />
            <span className="hidden sm:inline">Ngẫu nhiên</span>
          </button>

          <button
            onClick={toggleAutoPlayAudio}
            aria-label={
              autoPlayAudio ? "Tắt tự động phát âm" : "Bật tự động phát âm"
            }
            aria-pressed={autoPlayAudio}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              autoPlayAudio
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Volume2 size={18} />
            <span className="hidden sm:inline">Tự động phát âm</span>
          </button>

          <button
            onClick={openEditor}
            aria-label="Chỉnh sửa bộ thẻ"
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Edit3 size={18} />
            <span className="hidden sm:inline">Chỉnh sửa</span>
          </button>

          <button
            onClick={handleResetDeck}
            aria-label="Reset bộ thẻ về mặc định"
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RotateCcw size={18} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Progress */}
        <div className="text-center mb-6">
          <span className="text-gray-600">
            Thẻ {currentIndex + 1} / {deck.length}
          </span>
        </div>

        {/* Flashcard */}
        <div className="mb-8">
          <Flashcard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            autoPlayAudio={autoPlayAudio}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center gap-6">
          <button
            onClick={handlePrev}
            aria-label="Thẻ trước"
            className="p-4 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={handleNext}
            aria-label="Thẻ tiếp theo"
            className="p-4 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Sử dụng phím ← → để chuyển thẻ, Space/Enter để lật thẻ
        </p>
      </div>

      {/* Editor Modal - FIX: đổi initialDeck thành currentDeck */}
      {showEditor && (
        <DeckEditor
          currentDeck={deck}
          onSave={handleSaveDeck}
          onClose={closeEditor}
        />
      )}
    </div>
  )
}

export default App
