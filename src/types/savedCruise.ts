import type { StateroomPricing } from './cruise'

export interface SavedStateroomConfig {
  adults: number
  children: number
  stateroomType: keyof StateroomPricing
}

export interface SavedCruiseConfig {
  id: string
  cruiseId: string
  itineraryName: string
  itineraryMap: string
  shipName: string
  startDate: string
  endDate: string
  nights: number
  imageUrl: string
  staterooms: SavedStateroomConfig[]
  totalPrice: number
  pricePerStateroom: number
  pricePerPerson: number
  savedAt: string
}
