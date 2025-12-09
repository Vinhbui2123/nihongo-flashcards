import React, { useState, useEffect, useCallback } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  PlusCircle,
  RefreshCcw,
  BookOpen,
  Trash2,
} from "lucide-react"
import { Flashcard } from "./components/Flashcard"
import { DeckEditor } from "./components/DeckEditor"
import { VocabCard } from "./types"
import { SAMPLE_DATA } from "./constants"
import { SpeedInsights } from "@vercel/speed-insights/react"

const App: React.FC = () => {
  const [deck, setDeck] = useState<VocabCard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [randomMode, setRandomMode] = useState(false)

  // Load from LocalStorage or Init
  useEffect(() => {
    const saved = localStorage.getItem("nihongo-deck")
    if (saved) {
      try {
        setDeck(JSON.parse(saved))
      } catch (e) {
        setDeck(SAMPLE_DATA)
      }
    } else {
      setDeck(SAMPLE_DATA)
    }
  }, [])

  // Save to LocalStorage whenever deck changes
  useEffect(() => {
    if (deck.length > 0) {
      localStorage.setItem("nihongo-deck", JSON.stringify(deck))
    }
  }, [deck])

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  const handleNext = useCallback(() => {
    setIsFlipped(false)
    setTimeout(() => {
      if (randomMode) {
        const next = Math.floor(Math.random() * deck.length)
        setCurrentIndex(next)
      } else {
        setCurrentIndex((prev) => (prev + 1) % deck.length)
      }
    }, 150) // Small delay for smooth transition feel if needed, primarily handles state reset
  }, [deck.length, randomMode])

  const handlePrev = useCallback(() => {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length)
    }, 150)
  }, [deck.length])

  const handleShuffleToggle = () => {
    setRandomMode(!randomMode)
  }

  const handleSaveDeck = (newDeck: VocabCard[]) => {
    setDeck(newDeck)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const handleResetDeck = () => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục dữ liệu mẫu không?")) {
      setDeck(SAMPLE_DATA)
      setCurrentIndex(0)
      setIsFlipped(false)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showEditor) return
      if (e.key === "ArrowRight") handleNext()
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === " " || e.key === "Enter") handleFlip()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleNext, handlePrev, handleFlip, showEditor])

  if (deck.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Chưa có từ vựng nào</h1>
          <button
            onClick={() => setShowEditor(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Thêm từ vựng ngay
          </button>
        </div>
        {showEditor && (
          <DeckEditor
            currentDeck={deck}
            onSave={handleSaveDeck}
            onClose={() => setShowEditor(false)}
          />
        )}
      </div>
    )
  }

  const currentCard = deck[currentIndex]
  const progress = Math.round(((currentIndex + 1) / deck.length) * 100)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              日
            </div>
            <h1 className="text-lg font-bold tracking-tight hidden sm:block">
              Nihongo Flashcards
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDeck}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Khôi phục dữ liệu mẫu"
            >
              <RefreshCcw size={20} />
            </button>
            <button
              onClick={() => setShowEditor(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-medium transition-colors"
            >
              <PlusCircle size={16} />
              <span className="hidden sm:inline">Thêm từ</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-4xl mx-auto">
        {/* Progress Info */}
        <div className="w-full max-w-md mb-6 flex justify-between items-end px-2">
          <div>
            <span className="text-3xl font-bold text-indigo-600">
              {currentIndex + 1}
            </span>
            <span className="text-slate-400 text-sm font-medium">
              {" "}
              / {deck.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffleToggle}
              className={`p-2 rounded-full transition-colors ${
                randomMode
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-slate-400 hover:bg-slate-100"
              }`}
              title="Xáo trộn"
            >
              <Shuffle size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md h-1.5 bg-slate-200 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* The Card */}
        <div className="w-full mb-8">
          <Flashcard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 w-full max-w-md">
          <button
            onClick={handlePrev}
            className="p-4 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95 disabled:opacity-50"
            disabled={deck.length <= 1}
          >
            <ChevronLeft size={28} />
          </button>

          <button
            onClick={handleFlip}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <BookOpen size={20} />
            {isFlipped ? "Xem từ vựng" : "Xem đáp án"}
          </button>

          <button
            onClick={handleNext}
            className="p-4 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95 disabled:opacity-50"
            disabled={deck.length <= 1}
          >
            <ChevronRight size={28} />
          </button>
        </div>

        <div className="mt-8 text-slate-400 text-xs text-center">
          Mẹo: Sử dụng phím mũi tên và Space/Enter để điều hướng
        </div>
      </main>

      {/* Editor Modal */}
      {showEditor && (
        <DeckEditor
          currentDeck={deck}
          onSave={handleSaveDeck}
          onClose={() => setShowEditor(false)}
        />
      )}

      <SpeedInsights />
    </div>
  )
}

export default App
