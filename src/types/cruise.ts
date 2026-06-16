export interface StateroomPricing {
  interior: number
  oceanview: number
  balcony: number
  suite: number
}

export interface CruiseDeparture {
  id: string
  itineraryName: string
  itineraryMap: string
  shipName: string
  startDate: string
  endDate: string
  nights: number
  pricePerPerson: number
  totalBasePrice: number
  stateroomPricing: StateroomPricing
}
