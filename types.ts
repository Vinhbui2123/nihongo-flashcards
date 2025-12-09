export interface VocabCard {
  id: string;
  kanji: string;
  kana: string;
  sinoVietnamese: string; // Âm Hán
  meaning: string;
  audioUrl?: string;
}

export interface DeckStats {
  total: number;
  currentIndex: number;
}
