import { useState, useEffect, useCallback } from "react"
import { VocabCard } from "../types"
import { SAMPLE_DATA } from "../constants"

const STORAGE_KEY = "nihongo-deck"

export function useDeck() {
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

    const saveDeck = useCallback((newDeck: VocabCard[]) => {
        setDeck(newDeck)
    }, [])

    const resetDeck = useCallback(() => {
        setDeck(SAMPLE_DATA)
        try {
            localStorage.removeItem(STORAGE_KEY)
        } catch (e) {
            console.error("Failed to remove deck from localStorage:", e)
        }
    }, [])

    return {
        deck,
        saveDeck,
        resetDeck,
    }
}
