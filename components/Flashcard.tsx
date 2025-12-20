import React, { useEffect, useRef, useCallback } from "react"
import { Volume2, RotateCw } from "lucide-react"
import { VocabCard } from "../types"

interface FlashcardProps {
  card: VocabCard
  isFlipped: boolean
  onFlip: () => void
  autoPlayAudio?: boolean
}

export const Flashcard: React.FC<FlashcardProps> = ({
  card,
  isFlipped,
  onFlip,
  autoPlayAudio = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Cleanup audio on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      window.speechSynthesis.cancel()
    }
  }, [])

  const playAudio = useCallback(() => {
    if (card.audioUrl) {
      // Stop previous audio if playing
      if (audioRef.current) {
        audioRef.current.pause()
      }
      audioRef.current = new Audio(card.audioUrl)
      audioRef.current.play().catch((err) => {
        console.error("Audio play failed:", err)
      })
    } else {
      // Fallback: Web Speech API
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(card.kana || card.kanji)
      utterance.lang = "ja-JP"
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }, [card.audioUrl, card.kana, card.kanji])

  // Handle auto-play when card changes
  useEffect(() => {
    if (autoPlayAudio) {
      playAudio()
    }
  }, [card.id, autoPlayAudio, playAudio])

  const handleAudioClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation() // Prevent flipping when clicking audio
      playAudio()
    },
    [playAudio]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        onFlip()
      }
    },
    [onFlip]
  )

  return (
    <div
      className="w-full max-w-md h-[28rem] sm:h-96 cursor-pointer group perspective-1000 mx-auto"
      onClick={onFlip}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={isFlipped ? "Nhấn để xem câu hỏi" : "Nhấn để xem đáp án"}
    >
      <div
        className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? "rotate-y-180" : ""
          }`}
      >
        {/* Front Side (Question) */}
        <div className="absolute w-full h-full bg-white/70 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center justify-center backface-hidden shadow-2xl border border-white/50 ring-1 ring-white/60">
          <div className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
            Tiếng Nhật
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            {/* Kanji Display */}
            <h2 className="text-6xl md:text-7xl font-jp font-bold text-slate-800 text-center drop-shadow-sm">
              {card.kanji}
            </h2>
            {/* Kana */}
            <p className="text-2xl font-jp text-slate-600 font-medium">{card.kana}</p>
          </div>

          <div className="mt-auto flex gap-4 pt-4">
            <button
              onClick={handleAudioClick}
              className="p-3 rounded-full bg-indigo-50/80 text-indigo-600 hover:bg-indigo-100 transition-colors z-10 shadow-sm border border-indigo-100"
              title="Phát âm thanh"
              aria-label="Phát âm thanh tiếng Nhật"
            >
              <Volume2 size={24} />
            </button>
          </div>

          <div className="absolute bottom-4 right-4 text-slate-300">
            <RotateCw size={20} aria-hidden="true" />
          </div>
        </div>

        {/* Back Side (Answer) */}
        <div className="absolute w-full h-full bg-gradient-to-br from-indigo-600/90 to-purple-600/90 backdrop-blur-md text-white rounded-2xl p-6 flex flex-col items-center justify-center backface-hidden rotate-y-180 shadow-2xl border border-white/20">
          <div className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-8">
            Đáp án
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
            {/* Sino-Vietnamese */}
            {card.sinoVietnamese && (
              <div>
                <span className="text-indigo-200 text-[10px] font-bold uppercase tracking-[0.2em] block mb-1">
                  Âm Hán
                </span>
                <p className="text-2xl font-bold uppercase tracking-wide text-white drop-shadow-md">
                  {card.sinoVietnamese}
                </p>
              </div>
            )}

            <div className="w-16 h-1 bg-white/20 rounded-full backdrop-blur-sm"></div>

            {/* Meaning */}
            <div>
              <span className="text-indigo-200 text-[10px] font-bold uppercase tracking-[0.2em] block mb-1">
                Nghĩa Tiếng Việt
              </span>
              <h3 className="text-3xl font-bold leading-tight text-white drop-shadow-md">
                {card.meaning}
              </h3>
            </div>
          </div>

          <div className="mt-auto flex gap-4 pt-4">
            <button
              onClick={handleAudioClick}
              className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10 backdrop-blur-sm border border-white/30"
              title="Phát âm thanh"
              aria-label="Phát âm thanh tiếng Nhật"
            >
              <Volume2 size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
