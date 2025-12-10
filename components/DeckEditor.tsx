import React, { useState, useCallback, useMemo } from "react"
import { Upload, Save, X, Info } from "lucide-react"
import { VocabCard } from "../types"

interface DeckEditorProps {
  currentDeck: VocabCard[]
  onSave: (newDeck: VocabCard[]) => void
  onClose: () => void
}

const generateId = () => Math.random().toString(36).substring(2, 9)

export const DeckEditor: React.FC<DeckEditorProps> = ({
  currentDeck,
  onSave,
  onClose,
}) => {
  const [inputText, setInputText] = useState("")
  const [preview, setPreview] = useState<VocabCard[]>([])
  const [error, setError] = useState<string | null>(null)

  const parseInput = useCallback((text: string) => {
    const lines = text.trim().split("\n")
    const newCards: VocabCard[] = []

    try {
      lines.forEach((line, index) => {
        if (!line.trim()) return
        // Split by tab or comma (naive CSV)
        // Order: Word(Kanji) | Kana | SinoViet | Meaning | AudioLink
        const parts = line.split(/\t|,/)

        if (parts.length < 2) {
          console.warn(`Line ${index + 1} ignored: not enough data`)
          return
        }

        const kanji = parts[0]?.trim() || ""
        const kana = parts[1]?.trim() || ""
        const sinoVietnamese = parts[2]?.trim() || ""
        const meaning = parts[3]?.trim() || ""
        const audioUrl = parts[4]?.trim() || ""

        newCards.push({
          id: generateId(),
          kanji,
          kana,
          sinoVietnamese,
          meaning,
          audioUrl,
        })
      })
      setPreview(newCards)
      setError(null)
    } catch (err) {
      setError("Lỗi định dạng dữ liệu. Vui lòng kiểm tra lại.")
      setPreview([])
    }
  }, [])

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      setInputText(value)
      parseInput(value)
    },
    [parseInput]
  )

  const handleSaveAppend = useCallback(() => {
    if (preview.length === 0) return
    onSave([...currentDeck, ...preview])
    onClose()
  }, [preview, currentDeck, onSave, onClose])

  const handleSaveReplace = useCallback(() => {
    if (preview.length === 0) return
    onSave(preview)
    onClose()
  }, [preview, onSave, onClose])

  const isPreviewEmpty = useMemo(() => preview.length === 0, [preview.length])

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deck-editor-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h2
            id="deck-editor-title"
            className="text-xl font-bold text-slate-800 flex items-center gap-2"
          >
            <Upload size={20} className="text-indigo-600" aria-hidden="true" />
            Nhập danh sách từ vựng
          </h2>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Area */}
          <div className="flex flex-col h-full">
            <label
              htmlFor="vocab-input"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Dán dữ liệu từ Excel/Google Sheets (Tab-separated)
            </label>
            <div className="text-xs text-slate-500 mb-2 flex items-start gap-1 p-2 bg-blue-50 rounded border border-blue-100">
              <Info
                size={14}
                className="mt-0.5 flex-shrink-0 text-blue-500"
                aria-hidden="true"
              />
              <span>
                Thứ tự cột: <strong>Hán Tự</strong> [TAB] <strong>Kana</strong>{" "}
                [TAB] <strong>Âm Hán</strong> [TAB] <strong>Nghĩa</strong> [TAB]{" "}
                <strong>Link Audio</strong>
              </span>
            </div>
            <textarea
              id="vocab-input"
              className="flex-1 w-full border border-slate-300 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder={`学生\tがくせい\tHỌC SINH\tHọc sinh\t\n先生\tせんせい\tTIÊN SINH\tGiáo viên\t`}
              value={inputText}
              onChange={handleTextChange}
              aria-describedby="input-error"
            />
            {error && (
              <p
                id="input-error"
                className="mt-2 text-sm text-red-600"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>

          {/* Preview Area */}
          <div className="flex flex-col h-full bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-3 bg-slate-100 border-b border-slate-200 font-semibold text-slate-700 text-sm">
              Xem trước ({preview.length} từ)
            </div>
            <div className="flex-1 overflow-y-auto p-0">
              {isPreviewEmpty ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm italic p-4 text-center">
                  Dữ liệu xem trước sẽ hiện ở đây...
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="p-2 font-medium text-slate-500 border-b">
                        Kanji
                      </th>
                      <th className="p-2 font-medium text-slate-500 border-b">
                        Kana
                      </th>
                      <th className="p-2 font-medium text-slate-500 border-b">
                        Nghĩa
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.map((card) => (
                      <tr
                        key={card.id}
                        className="hover:bg-white transition-colors"
                      >
                        <td className="p-2 font-jp">{card.kanji}</td>
                        <td className="p-2 font-jp text-slate-600">
                          {card.kana}
                        </td>
                        <td className="p-2 text-slate-600 truncate max-w-[100px]">
                          {card.meaning}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSaveReplace}
            disabled={isPreviewEmpty}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Thay thế toàn bộ
          </button>
          <button
            onClick={handleSaveAppend}
            disabled={isPreviewEmpty}
            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} aria-hidden="true" />
            Thêm vào danh sách
          </button>
        </div>
      </div>
    </div>
  )
}
