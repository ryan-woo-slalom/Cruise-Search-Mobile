import { ref } from 'vue'
import type { SavedCruiseConfig } from '../types/savedCruise'

const STORAGE_KEY = 'intrepid.savedCruises'
const savedCruises = ref<SavedCruiseConfig[]>([])
let initialized = false

function loadSavedCruises(): SavedCruiseConfig[] {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as SavedCruiseConfig[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistSavedCruises(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCruises.value))
}

function ensureInitialized(): void {
  if (!initialized) {
    savedCruises.value = loadSavedCruises()
    initialized = true
  }
}

export function useSavedCruises() {
  ensureInitialized()

  function addSavedCruise(entry: SavedCruiseConfig): void {
    const existingIndex = savedCruises.value.findIndex((item) => item.cruiseId === entry.cruiseId)

    if (existingIndex >= 0) {
      const existing = savedCruises.value[existingIndex]
      const updatedEntry: SavedCruiseConfig = {
        ...entry,
        id: existing?.id ?? entry.id,
      }

      savedCruises.value = [
        updatedEntry,
        ...savedCruises.value.filter((item) => item.cruiseId !== entry.cruiseId),
      ]
    } else {
      savedCruises.value = [entry, ...savedCruises.value]
    }

    persistSavedCruises()
  }

  function removeSavedCruise(id: string): void {
    savedCruises.value = savedCruises.value.filter((item) => item.id !== id)
    persistSavedCruises()
  }

  function clearSavedCruises(): void {
    savedCruises.value = []
    persistSavedCruises()
  }

  return {
    savedCruises,
    addSavedCruise,
    removeSavedCruise,
    clearSavedCruises,
  }
}
