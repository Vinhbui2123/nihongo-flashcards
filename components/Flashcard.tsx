import React, { useEffect, useRef } from 'react';
import { Volume2, RotateCw } from 'lucide-react';
import { VocabCard } from '../types';

interface FlashcardProps {
  card: VocabCard;
  isFlipped: boolean;
  onFlip: () => void;
  autoPlayAudio?: boolean;
}

export const Flashcard: React.FC<FlashcardProps> = ({ 
  card, 
  isFlipped, 
  onFlip,
  autoPlayAudio = false 
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle auto-play when card changes or when flipped (optional logic)
  useEffect(() => {
    if (autoPlayAudio && card.audioUrl) {
      playAudio();
    }
  }, [card, autoPlayAudio]);

  const playAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Prevent flipping when clicking audio
    
    if (card.audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(card.audioUrl);
      } else {
        audioRef.current.src = card.audioUrl;
      }
      audioRef.current.play().catch(err => console.error("Audio play failed", err));
    } else {
        // Fallback: Web Speech API (Basic TTS if no file provided)
        const utterance = new SpeechSynthesisUtterance(card.kana || card.kanji);
        utterance.lang = 'ja-JP';
        window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div 
      className="w-full max-w-md h-96 cursor-pointer group perspective-1000 mx-auto"
      onClick={onFlip}
    >
      <div 
        className={`relative w-full h-full duration-500 transform-style-3d shadow-xl rounded-2xl transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front Side (Question) */}
        <div className="absolute w-full h-full bg-white rounded-2xl p-6 flex flex-col items-center justify-center backface-hidden border border-slate-200">
          <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-8">
            Tiếng Nhật
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
             {/* Kanji Display */}
            <h2 className="text-6xl md:text-7xl font-jp font-bold text-slate-800 text-center">
              {card.kanji}
            </h2>
            {/* Kana (Hint - optional, usually hidden on front for hard mode, but requested to show vocab) */}
            <p className="text-2xl font-jp text-slate-600">
              {card.kana}
            </p>
          </div>

          <div className="mt-auto flex gap-4 pt-4">
            <button 
              onClick={playAudio}
              className="p-3 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors z-10"
              title="Phát âm thanh"
            >
              <Volume2 size={24} />
            </button>
          </div>
          
          <div className="absolute bottom-4 right-4 text-slate-300">
             <RotateCw size={20} />
          </div>
        </div>

        {/* Back Side (Answer) */}
        <div className="absolute w-full h-full bg-indigo-600 text-white rounded-2xl p-6 flex flex-col items-center justify-center backface-hidden rotate-y-180 border border-indigo-500">
           <div className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-8">
            Đáp án
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
             {/* Sino-Vietnamese */}
            <div>
                <span className="text-indigo-300 text-xs font-bold uppercase tracking-widest block mb-1">Âm Hán</span>
                <p className="text-2xl font-bold uppercase tracking-wide text-indigo-100">
                {card.sinoVietnamese}
                </p>
            </div>
            
            <div className="w-16 h-1 bg-indigo-400/50 rounded-full"></div>

            {/* Meaning */}
            <div>
                 <span className="text-indigo-300 text-xs font-bold uppercase tracking-widest block mb-1">Nghĩa Tiếng Việt</span>
                <h3 className="text-3xl font-bold leading-tight">
                {card.meaning}
                </h3>
            </div>
          </div>

          <div className="mt-auto flex gap-4 pt-4">
            <button 
              onClick={playAudio}
              className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
              title="Phát âm thanh"
            >
              <Volume2 size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
