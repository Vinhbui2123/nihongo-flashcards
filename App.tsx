import React, { useState, useCallback, useEffect, useMemo } from "react"
import { Flashcard } from "./components/Flashcard"
import { DeckEditor } from "./components/DeckEditor"
import { Modal } from "./components/ui/Modal"
import { useDeck } from "./hooks/useDeck"
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Edit3,
  RotateCcw,
  Volume2,
} from "lucide-react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { VocabCard } from "./types"

function App() {
  const { deck, saveDeck, resetDeck } = useDeck()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [randomMode, setRandomMode] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [autoPlayAudio, setAutoPlayAudio] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Smart Shuffle State
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([])

  // Reset indices when deck changes
  useEffect(() => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setShuffledIndices([])
  }, [deck.length])

  // Smart Shuffle Logic: "Bag" shuffle
  const getNextRandomIndex = useCallback(() => {
    let newIndices = [...shuffledIndices]

    // If bag is empty, refill it
    if (newIndices.length === 0) {
      newIndices = Array.from({ length: deck.length }, (_, i) => i)
      // Shuffle the array (Fisher-Yates)
      for (let i = newIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
          ;[newIndices[i], newIndices[j]] = [newIndices[j], newIndices[i]]
      }
    }

    // Pick one and remove from bag
    const nextIndex = newIndices.pop()
    setShuffledIndices(newIndices)
    return nextIndex ?? 0 // fallback
  }, [deck.length, shuffledIndices])

  const currentCard = useMemo(() => deck[currentIndex], [deck, currentIndex])

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  const handleNext = useCallback(() => {
    setIsFlipped(false)
    if (randomMode) {
      const nextIndex = getNextRandomIndex()
      setCurrentIndex(nextIndex)
    } else {
      setCurrentIndex((prev) => (prev + 1) % deck.length)
    }
  }, [deck.length, randomMode, getNextRandomIndex])

  const handlePrev = useCallback(() => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length)
  }, [deck.length])

  // Reset shuffled bag when toggling random mode
  useEffect(() => {
    if (randomMode) {
      setShuffledIndices([])
    }
  }, [randomMode])

  const toggleRandomMode = useCallback(() => {
    setRandomMode((prev) => !prev)
  }, [])

  const toggleAutoPlayAudio = useCallback(() => {
    setAutoPlayAudio((prev) => !prev)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
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
        <div className="text-center bg-white/60 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/50">
          <div className="mb-4 text-6xl">📭</div>
          <p className="text-xl text-slate-600 mb-6 font-medium">
            Không có thẻ từ vựng nào
          </p>
          <button
            onClick={() => setShowEditor(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5"
          >
            Thêm từ vựng ngay
          </button>
        </div>
        {showEditor && (
          <DeckEditor
            currentDeck={deck}
            onSave={saveDeck}
            onClose={() => setShowEditor(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 bg-purple-100 rounded-full blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-1/2 h-1/2 bg-indigo-100 rounded-full blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-[30%] left-[30%] w-1/3 h-1/3 bg-pink-100 rounded-full blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <SpeedInsights />

      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col min-h-screen">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2 drop-shadow-sm">
            日本語 Flashcards
          </h1>
          <p className="text-slate-500 font-medium">
            Học từ vựng tiếng Nhật mỗi ngày
          </p>
        </header>

        {/* Controls Bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <ControlTooltip label={randomMode ? "Tắt ngẫu nhiên" : "Bật ngẫu nhiên"}>
            <button
              onClick={toggleRandomMode}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all shadow-sm border ${randomMode
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200"
                  : "bg-white/80 backdrop-blur-sm text-slate-600 border-white hover:bg-white hover:border-indigo-100"
                }`}
            >
              <Shuffle size={18} className={randomMode ? "" : "opacity-70"} />
              <span className="font-medium hidden sm:inline">Ngẫu nhiên</span>
            </button>
          </ControlTooltip>

          <ControlTooltip label="Tự động phát âm khi chuyển thẻ">
            <button
              onClick={toggleAutoPlayAudio}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all shadow-sm border ${autoPlayAudio
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200"
                  : "bg-white/80 backdrop-blur-sm text-slate-600 border-white hover:bg-white hover:border-indigo-100"
                }`}
            >
              <Volume2 size={18} className={autoPlayAudio ? "" : "opacity-70"} />
              <span className="font-medium hidden sm:inline">Tự động phát</span>
            </button>
          </ControlTooltip>

          <div className="w-px h-10 bg-slate-200 mx-2 hidden sm:block"></div>

          <ControlTooltip label="Chỉnh sửa danh sách từ vựng">
            <button
              onClick={() => setShowEditor(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm text-slate-600 rounded-xl hover:bg-white border border-white hover:border-indigo-100 transition-all shadow-sm hover:shadow-md"
            >
              <Edit3 size={18} className="opacity-70" />
              <span className="font-medium hidden sm:inline">Chỉnh sửa</span>
            </button>
          </ControlTooltip>

          <ControlTooltip label="Khôi phục dữ liệu gốc">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm text-slate-600 rounded-xl hover:bg-white border border-white hover:border-red-100 transition-all shadow-sm hover:shadow-md group"
            >
              <RotateCcw
                size={18}
                className="opacity-70 group-hover:text-red-500 transition-colors"
              />
              <span className="font-medium hidden sm:inline group-hover:text-red-600 transition-colors">
                Reset
              </span>
            </button>
          </ControlTooltip>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-sm font-medium text-slate-500 mb-4 px-2">
            <span>Thẻ hiện tại</span>
            <span className="bg-white/50 px-3 py-1 rounded-full border border-white shadow-sm">
              {currentIndex + 1} <span className="text-slate-300">/</span>{" "}
              {deck.length}
            </span>
          </div>

          {/* Flashcard Component */}
          <div className="mb-8">
            <Flashcard
              card={currentCard}
              isFlipped={isFlipped}
              onFlip={handleFlip}
              autoPlayAudio={autoPlayAudio}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center items-center gap-8">
            <button
              onClick={handlePrev}
              aria-label="Thẻ trước"
              className="p-5 bg-white rounded-full shadow-lg shadow-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:scale-110 active:scale-95 transition-all border border-indigo-50"
            >
              <ChevronLeft size={28} />
            </button>

            <button
              onClick={handleNext}
              aria-label="Thẻ tiếp theo"
              className="p-5 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200 text-white hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all ring-4 ring-indigo-50"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Keyboard Hint */}
          <p className="text-center text-slate-400 text-xs mt-10 font-medium">
            <span className="bg-white px-2 py-1 rounded border border-slate-100 mx-1">
              ←
            </span>
            <span className="bg-white px-2 py-1 rounded border border-slate-100 mx-1">
              →
            </span>{" "}
            chuyển thẻ
            <span className="mx-2">•</span>
            <span className="bg-white px-2 py-1 rounded border border-slate-100 mx-1">
              Space
            </span>{" "}
            lật thẻ
          </p>
        </div>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <DeckEditor
          currentDeck={deck}
          onSave={saveDeck}
          onClose={() => setShowEditor(false)}
        />
      )}

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset bộ thẻ?"
        confirmLabel="Reset ngay"
        isDestructive
        onConfirm={() => {
          resetDeck()
          setShowResetConfirm(false)
        }}
      >
        <p>
          Bạn có chắc muốn xóa toàn bộ từ vựng đã thêm và quay về bộ thẻ mặc định
          không? Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </div>
  )
}

// Helper component for tooltips (simple wrapper)
const ControlTooltip = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => {
  return (
    <div className="group relative flex flex-col items-center">
      {children}
      <div className="absolute bottom-full mb-2 hidden group-hover:block w-max px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg z-50 animate-fade-in">
        {label}
        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
      </div>
    </div>
  )
}

export default App
