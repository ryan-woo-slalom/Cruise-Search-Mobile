<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import cruiseData from '../data/metrics.json'
import CruiseFilters from '../components/CruiseFilters.vue'
import ResultCard from '../components/ResultCard.vue'
import type { CruiseDeparture, StateroomPricing } from '../types/cruise'

type ViewMode = 'itinerary' | 'date'
type PricingMode = 'person' | 'stateroom'
type SortMode = 'recommended' | 'highestRated' | 'priceLowHigh' | 'priceHighLow'

type RoomConfig = {
  adults: number
  children: number
}

type ItineraryGroup = {
  itineraryName: string
  itineraryMap: string
  shipName: string
  leadDeparture: CruiseDeparture
  departures: CruiseDeparture[]
}

const cruises = cruiseData as CruiseDeparture[]
const { mdAndUp } = useDisplay()

const minPrice = Math.min(...cruises.map((cruise) => cruise.pricePerPerson))
const maxPrice = Math.max(...cruises.map((cruise) => cruise.pricePerPerson))
const minNights = Math.min(...cruises.map((cruise) => cruise.nights))
const maxNights = Math.max(...cruises.map((cruise) => cruise.nights))

const searchQuery = ref('')
const pricingMode = ref<PricingMode>('person')
const staterooms = ref<RoomConfig[]>([{ adults: 2, children: 0 }])
const selectedMonths = ref<string[]>([])
const selectedShips = ref<string[]>([])
const priceRange = ref<number[]>([minPrice, maxPrice])
const nightsRange = ref<number[]>([minNights, maxNights])
const activeView = ref<ViewMode>('itinerary')
const mobileFiltersOpen = ref(false)
const sortMode = ref<SortMode>('recommended')

const savedIds = ref<string[]>([])
const compareIds = ref<string[]>([])

const quickViewOpen = ref(false)
const quickViewTitle = ref('')
const quickViewCruises = ref<CruiseDeparture[]>([])
const selectedQuickViewDateId = ref('')
const selectedStateroomType = ref<keyof StateroomPricing>('interior')
const comparePanelCollapsed = ref(false)
const compareModuleOpen = ref(false)

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const monthOptions = computed(() => {
  const monthSet = new Set(cruises.map((cruise) => cruise.startDate.slice(0, 7)))
  return [...monthSet].sort().map((value) => ({
    value,
    label: monthFormatter.format(new Date(`${value}-01`)),
  }))
})

const shipOptions = computed(() => [...new Set(cruises.map((cruise) => cruise.shipName))].sort())
const stateroomCount = computed(() => staterooms.value.length)
const totalAdults = computed(() => staterooms.value.reduce((sum, room) => sum + room.adults, 0))
const totalChildren = computed(() => staterooms.value.reduce((sum, room) => sum + room.children, 0))
const totalGuests = computed(() => totalAdults.value + totalChildren.value)
const guestSummary = computed(
  () => `${stateroomCount.value} staterooms • ${totalAdults.value} Adults, ${totalChildren.value} Children`,
)
const pricingLabel = computed(() => (pricingMode.value === 'person' ? 'person' : 'stateroom'))
const resultsCount = computed(() =>
  activeView.value === 'itinerary' ? sortedGroupedByItinerary.value.length : sortedFilteredCruises.value.length,
)

const sortOptions: { title: string; value: SortMode }[] = [
  { title: 'Recommended', value: 'recommended' },
  { title: 'Highest Rated', value: 'highestRated' },
  { title: 'Price: Low to High', value: 'priceLowHigh' },
  { title: 'Price: High to Low', value: 'priceHighLow' },
]

const filteredCruises = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const [selectedMinPrice = minPrice, selectedMaxPrice = maxPrice] = priceRange.value
  const [selectedMinNights = minNights, selectedMaxNights = maxNights] = nightsRange.value

  return cruises.filter((cruise) => {
    const cruiseMonth = cruise.startDate.slice(0, 7)
    const matchesQuery =
      query.length === 0 ||
      cruise.itineraryName.toLowerCase().includes(query) ||
      cruise.shipName.toLowerCase().includes(query)

    const matchesMonth =
      selectedMonths.value.length === 0 || selectedMonths.value.includes(cruiseMonth)
    const matchesShip =
      selectedShips.value.length === 0 || selectedShips.value.includes(cruise.shipName)
    // Keep filtering on a fixed per-person basis so pricing view mode does not change results.
    const filterPrice = cruise.pricePerPerson
    const matchesPrice = filterPrice >= selectedMinPrice && filterPrice <= selectedMaxPrice
    const matchesNights =
      cruise.nights >= selectedMinNights && cruise.nights <= selectedMaxNights

    return matchesQuery && matchesMonth && matchesShip && matchesPrice && matchesNights
  })
})

const groupedByItinerary = computed<ItineraryGroup[]>(() => {
  const groups = new Map<string, ItineraryGroup>()

  filteredCruises.value.forEach((cruise) => {
    const current = groups.get(cruise.itineraryName)
    if (current) {
      current.departures.push(cruise)
      return
    }

    groups.set(cruise.itineraryName, {
      itineraryName: cruise.itineraryName,
      itineraryMap: cruise.itineraryMap,
      shipName: cruise.shipName,
      leadDeparture: cruise,
      departures: [cruise],
    })
  })

  return [...groups.values()].sort((a, b) => {
    const aDate = a.departures[0]?.startDate ?? ''
    const bDate = b.departures[0]?.startDate ?? ''
    return aDate.localeCompare(bDate)
  })
})

function cruiseRatingValue(id: string): number {
  const hash = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return Number((3.8 + (hash % 12) * 0.1).toFixed(1))
}

function cruiseRating(cruise: CruiseDeparture): number {
  return cruiseRatingValue(cruise.id)
}

function itineraryRating(group: ItineraryGroup): number {
  const total = group.departures.reduce((sum, departure) => sum + cruiseRating(departure), 0)
  return Number((total / group.departures.length).toFixed(1))
}

function compareBySortMode(a: CruiseDeparture, b: CruiseDeparture): number {
  if (sortMode.value === 'highestRated') {
    return cruiseRating(b) - cruiseRating(a)
  }

  if (sortMode.value === 'priceLowHigh') {
    return pricingValue(a) - pricingValue(b)
  }

  if (sortMode.value === 'priceHighLow') {
    return pricingValue(b) - pricingValue(a)
  }

  const aSaved = savedIds.value.includes(a.id)
  const bSaved = savedIds.value.includes(b.id)
  if (aSaved !== bSaved) {
    return aSaved ? -1 : 1
  }

  const ratingDiff = cruiseRating(b) - cruiseRating(a)
  if (ratingDiff !== 0) {
    return ratingDiff
  }

  return pricingValue(a) - pricingValue(b)
}

const sortedFilteredCruises = computed(() => [...filteredCruises.value].sort(compareBySortMode))

const sortedGroupedByItinerary = computed(() => {
  const groups = [...groupedByItinerary.value]

  return groups.sort((a, b) => {
    if (sortMode.value === 'highestRated') {
      return itineraryRating(b) - itineraryRating(a)
    }

    if (sortMode.value === 'priceLowHigh') {
      return pricingValue(a.leadDeparture) - pricingValue(b.leadDeparture)
    }

    if (sortMode.value === 'priceHighLow') {
      return pricingValue(b.leadDeparture) - pricingValue(a.leadDeparture)
    }

    const aSaved = a.departures.some((departure) => savedIds.value.includes(departure.id))
    const bSaved = b.departures.some((departure) => savedIds.value.includes(departure.id))
    if (aSaved !== bSaved) {
      return aSaved ? -1 : 1
    }

    const ratingDiff = itineraryRating(b) - itineraryRating(a)
    if (ratingDiff !== 0) {
      return ratingDiff
    }

    return pricingValue(a.leadDeparture) - pricingValue(b.leadDeparture)
  })
})

const compareCruises = computed(() =>
  cruises.filter((cruise) => compareIds.value.includes(cruise.id)).sort((a, b) => a.startDate.localeCompare(b.startDate)),
)

const shipHighlights: Record<string, string[]> = {
  'Intrepid Aurora': ['Skyline pool deck', 'Mediterranean chef table', 'Open-air cinema'],
  'Intrepid Solstice': ['Family splash zone', 'Tropical juice bar', 'Sunset terrace lounges'],
  'Intrepid Northwind': ['Panorama observation lounge', 'Glacier-view spa', 'Naturalist talks'],
  'Intrepid Meridian': ['Nordic thermal suite', 'Fjord-view dining room', 'Live acoustic nights'],
  'Intrepid Horizon': ['Rooftop pickleball', 'Coastal tasting kitchen', 'Ocean promenade track'],
  'Intrepid Atlas': ['Transatlantic library', 'Grand ballroom', 'Planetarium dome shows'],
}

const quickViewSelectedCruise = computed(() => {
  if (selectedQuickViewDateId.value.length > 0) {
    const selected = quickViewCruises.value.find((item) => item.id === selectedQuickViewDateId.value)
    if (selected) {
      return selected
    }
  }

  return quickViewCruises.value[0]
})

const quickViewDestinations = computed(() => {
  if (!quickViewSelectedCruise.value) {
    return []
  }

  return quickViewSelectedCruise.value.itineraryMap.split('->').map((item) => item.trim())
})

const quickViewShipHighlights = computed(() => {
  if (!quickViewSelectedCruise.value) {
    return []
  }

  return shipHighlights[quickViewSelectedCruise.value.shipName] ?? ['Signature dining', 'Live entertainment', 'Wellness centre']
})

const guestCalculatorTotal = computed(() => {
  if (!quickViewSelectedCruise.value) {
    return 0
  }

  const baseStateroom = quickViewSelectedCruise.value.stateroomPricing[selectedStateroomType.value] * stateroomCount.value
  const extraGuests = staterooms.value.reduce((sum, room) => sum + Math.max(room.adults + room.children - 2, 0), 0)
  const extraGuestRate = Math.round(quickViewSelectedCruise.value.pricePerPerson * 0.75)

  return baseStateroom + extraGuests * extraGuestRate
})

const guestCalculatorPerGuest = computed(() =>
  Math.round(guestCalculatorTotal.value / totalGuests.value),
)

function totalCruisePrice(cruise: CruiseDeparture): number {
  return staterooms.value.reduce((sum, room) => {
    const roomGuests = room.adults + room.children
    const extraAdults = Math.max(room.adults - 2, 0)
    const extraChildren = room.children
    const roomTotal =
      cruise.totalBasePrice +
      cruise.pricePerPerson * extraAdults * 0.85 +
      cruise.pricePerPerson * extraChildren * 0.6 +
      (roomGuests < 2 ? cruise.pricePerPerson * 0.5 : 0)

    return sum + roomTotal
  }, 0)
}

function pricingValue(cruise: CruiseDeparture): number {
  const total = totalCruisePrice(cruise)
  if (pricingMode.value === 'stateroom') {
    return Math.round(total / stateroomCount.value)
  }

  return Math.round(total / totalGuests.value)
}

function addStateroom(): void {
  staterooms.value.push({ adults: 2, children: 0 })
}

function removeStateroom(index: number): void {
  if (staterooms.value.length > 1) {
    staterooms.value.splice(index, 1)
  }
}

function incrementAdults(index: number): void {
  const room = staterooms.value[index]
  if (!room) {
    return
  }

  if (room.adults + room.children < 4) {
    room.adults += 1
  }
}

function decrementAdults(index: number): void {
  const room = staterooms.value[index]
  if (!room) {
    return
  }

  if (room.adults > 1) {
    room.adults -= 1
  }
}

function incrementChildren(index: number): void {
  const room = staterooms.value[index]
  if (!room) {
    return
  }

  if (room.adults + room.children < 4) {
    room.children += 1
  }
}

function decrementChildren(index: number): void {
  const room = staterooms.value[index]
  if (!room) {
    return
  }

  if (room.children > 0) {
    room.children -= 1
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(date: string): string {
  return dateFormatter.format(new Date(date))
}

function toggleSaved(id: string): void {
  savedIds.value = savedIds.value.includes(id)
    ? savedIds.value.filter((item) => item !== id)
    : [...savedIds.value, id]
}

function toggleCompare(id: string): void {
  if (compareIds.value.includes(id)) {
    compareIds.value = compareIds.value.filter((item) => item !== id)
    return
  }

  if (compareIds.value.length >= 4) {
    compareIds.value = [...compareIds.value.slice(1), id]
    return
  }

  compareIds.value = [...compareIds.value, id]
}

watch(compareIds, (nextIds) => {
  if (nextIds.length > 0) {
    comparePanelCollapsed.value = false
  }
})

function openQuickView(cruiseSet: CruiseDeparture[], title: string): void {
  quickViewCruises.value = cruiseSet
  quickViewTitle.value = title
  selectedQuickViewDateId.value = cruiseSet[0]?.id ?? ''
  selectedStateroomType.value = 'interior'
  quickViewOpen.value = true
}

function destinationImage(destination: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(destination)}/800/420`
}

function openCompareModule(): void {
  compareModuleOpen.value = true
}

function closeComparePanel(): void {
  comparePanelCollapsed.value = true
}

function expandComparePanel(): void {
  comparePanelCollapsed.value = false
}

function clearCompareSelections(): void {
  compareIds.value = []
  comparePanelCollapsed.value = true
}

const compareRows = computed(() => [
  {
    label: 'Itinerary',
    values: compareCruises.value.map((cruise) => cruise.itineraryName),
  },
  {
    label: 'Ship',
    values: compareCruises.value.map((cruise) => cruise.shipName),
  },
  {
    label: 'Dates',
    values: compareCruises.value.map((cruise) => `${formatDate(cruise.startDate)} - ${formatDate(cruise.endDate)}`),
  },
  {
    label: 'Nights',
    values: compareCruises.value.map((cruise) => `${cruise.nights}`),
  },
  {
    label: `Price per ${pricingLabel.value}`,
    values: compareCruises.value.map((cruise) => formatCurrency(pricingValue(cruise))),
  },
  {
    label: 'Map',
    values: compareCruises.value.map((cruise) => cruise.itineraryMap),
  },
])
</script>

<template>
  <v-container fluid class="pa-3 pa-sm-5 pa-md-8 cruise-page">
    <v-card class="hero-card mb-5 mb-md-6" rounded="xl" elevation="0">
      <v-card-text class="py-7 py-md-9 px-4 px-sm-5 px-md-9">
        <h1 class="text-h4 text-md-h3 font-weight-black mb-2 hero-title">Find your perfect Intrepid voyage</h1>
        <p class="text-body-2 text-md-body-1 text-medium-emphasis mb-4 hero-copy">
          Search itineraries, compare sail dates, and estimate room pricing in seconds.
        </p>
        <v-row class="align-center mt-1" dense>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="searchQuery"
              label="Search itineraries, ships, destinations"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              density="comfortable"
              bg-color="white"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-card variant="outlined" class="pa-3 pa-md-4 guest-panel h-100">
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="text-subtitle-2">Staterooms</div>
                <div class="d-flex ga-1">
                  <v-btn icon="mdi-minus" size="x-small" variant="tonal" :disabled="stateroomCount <= 1" @click="removeStateroom(staterooms.length - 1)" />
                  <v-btn icon="mdi-plus" size="x-small" variant="tonal" @click="addStateroom" />
                </div>
              </div>

              <v-expansion-panels variant="accordion">
                <v-expansion-panel v-for="(room, index) in staterooms" :key="index" :title="`Stateroom ${index + 1}`" rounded="lg">
                  <v-expansion-panel-text>
                    <div class="d-flex justify-space-between align-center mb-3">
                      <div>
                        <div class="text-body-2 font-weight-medium">Adults</div>
                        <div class="text-caption text-medium-emphasis">Ages 18+</div>
                      </div>
                      <div class="d-flex align-center ga-2">
                        <v-btn icon="mdi-minus" size="x-small" variant="tonal" @click="decrementAdults(index)" />
                        <strong>{{ room.adults }}</strong>
                        <v-btn icon="mdi-plus" size="x-small" variant="tonal" @click="incrementAdults(index)" />
                      </div>
                    </div>

                    <div class="d-flex justify-space-between align-center">
                      <div>
                        <div class="text-body-2 font-weight-medium">Children</div>
                        <div class="text-caption text-medium-emphasis">Under 18</div>
                      </div>
                      <div class="d-flex align-center ga-2">
                        <v-btn icon="mdi-minus" size="x-small" variant="tonal" @click="decrementChildren(index)" />
                        <strong>{{ room.children }}</strong>
                        <v-btn icon="mdi-plus" size="x-small" variant="tonal" @click="incrementChildren(index)" />
                      </div>
                    </div>
                    <p class="text-caption text-medium-emphasis mt-2 mb-0">Max 4 guests per stateroom and at least 1 adult.</p>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <p class="text-caption text-medium-emphasis mt-2 mb-0">{{ guestSummary }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row class="align-start">
      <v-col cols="12" md="3">
        <v-card v-if="mdAndUp" rounded="xl" class="sticky-filters filters-shell surface-card" elevation="2">
          <v-card-title class="d-flex align-center ga-2 py-4">
            <v-icon icon="mdi-tune-variant" color="primary" />
            Filters
          </v-card-title>
          <v-divider />
          <v-card-text>
            <CruiseFilters
              v-model:selected-months="selectedMonths"
              v-model:selected-ships="selectedShips"
              v-model:price-range="priceRange"
              v-model:nights-range="nightsRange"
              :month-options="monthOptions"
              :ship-options="shipOptions"
              :min-price="minPrice"
              :max-price="maxPrice"
              :min-nights="minNights"
              :max-nights="maxNights"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <v-card rounded="xl" elevation="2" class="toolbar-shell mb-4 surface-card">
          <v-card-text class="py-3 px-3 px-sm-4 px-md-5 d-flex flex-wrap align-center ga-2 ga-sm-3">
          <v-btn
            v-if="!mdAndUp"
            color="primary"
            prepend-icon="mdi-filter-variant"
            rounded="pill"
            @click="mobileFiltersOpen = true"
          >
            Filters
          </v-btn>

          <div class="control-group">
            <span class="control-label">View by</span>
            <v-btn-toggle v-model="activeView" mandatory divided rounded="pill" density="comfortable">
              <v-btn value="itinerary" size="small">Itinerary</v-btn>
              <v-btn value="date" size="small">Cruise Date</v-btn>
            </v-btn-toggle>
          </div>

          <div class="control-group">
            <span class="control-label">Pricing by</span>
            <v-btn-toggle v-model="pricingMode" mandatory divided rounded="pill" density="comfortable">
              <v-btn value="stateroom" size="small">Per Stateroom</v-btn>
              <v-btn value="person" size="small">Per Person</v-btn>
            </v-btn-toggle>
          </div>

          <div class="control-group sort-control">
            <span class="control-label">Sort by</span>
            <v-select
              v-model="sortMode"
              :items="sortOptions"
              variant="outlined"
              density="compact"
              hide-details
              class="sort-select"
            />
          </div>
          </v-card-text>
        </v-card>

        <div class="results-header mb-3">
          <p class="text-overline mb-1 section-kicker">Search Results</p>
          <h2 class="text-h6 mb-0">Cruises matching your search ({{ resultsCount }})</h2>
        </div>

        <v-row v-if="activeView === 'itinerary'">
          <v-col v-for="group in sortedGroupedByItinerary" :key="group.itineraryName" cols="12">
            <ResultCard
              mode="itinerary"
              :cruise="group.leadDeparture"
              :departures="group.departures"
              :image-url="destinationImage(group.leadDeparture.itineraryMap.split('->')[1]?.trim() ?? group.leadDeparture.itineraryName)"
              :is-saved="savedIds.includes(group.leadDeparture.id)"
              :is-compared="compareIds.includes(group.leadDeparture.id)"
              :display-price="pricingValue(group.leadDeparture)"
              :price-label="pricingLabel"
              :review-rating="itineraryRating(group)"
              :departure-prices="Object.fromEntries(group.departures.map((item) => [item.id, pricingValue(item)]))"
              @save="toggleSaved"
              @compare="toggleCompare"
              @quickview="openQuickView"
            />
          </v-col>
        </v-row>

        <v-row v-else>
          <v-col v-for="cruise in sortedFilteredCruises" :key="cruise.id" cols="12" sm="6">
            <ResultCard
              mode="date"
              :cruise="cruise"
              :image-url="destinationImage(cruise.itineraryMap.split('->')[1]?.trim() ?? cruise.itineraryName)"
              :is-saved="savedIds.includes(cruise.id)"
              :is-compared="compareIds.includes(cruise.id)"
              :display-price="pricingValue(cruise)"
              :price-label="pricingLabel"
              :review-rating="cruiseRating(cruise)"
              @save="toggleSaved"
              @compare="toggleCompare"
              @quickview="openQuickView"
            />
          </v-col>
        </v-row>

      </v-col>
    </v-row>

    <div v-if="compareIds.length > 0" class="compare-dock" :class="{ collapsed: comparePanelCollapsed }">
      <v-card class="compare-panel surface-card" rounded="xl" elevation="6">
        <v-card-title class="d-flex align-center justify-space-between py-3">
          <div class="d-flex align-center ga-2">
            <v-icon icon="mdi-compare" color="secondary" />
            <span>Compare panel ({{ compareCruises.length }}/4)</span>
          </div>
          <div class="d-flex align-center ga-2">
            <v-btn
              size="small"
              variant="text"
              @click="comparePanelCollapsed ? expandComparePanel() : closeComparePanel()"
            >
              {{ comparePanelCollapsed ? 'Expand' : 'Collapse' }}
            </v-btn>
            <v-btn size="small" color="primary" :disabled="compareCruises.length < 2" @click="openCompareModule">
              Compare
            </v-btn>
          </div>
        </v-card-title>

        <div v-show="!comparePanelCollapsed">
          <v-divider />
          <v-card-text class="py-3">
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="cruise in compareCruises"
                :key="cruise.id"
                color="secondary"
                variant="tonal"
                closable
                @click:close="toggleCompare(cruise.id)"
              >
                {{ cruise.itineraryName }}
              </v-chip>
            </div>
            <div class="mt-3">
              <v-btn size="small" variant="text" color="secondary" @click="clearCompareSelections">
                Clear all
              </v-btn>
            </div>
          </v-card-text>
        </div>
      </v-card>
    </div>

    <v-dialog v-model="mobileFiltersOpen" fullscreen>
      <v-card class="mobile-filter-shell">
        <v-toolbar color="white" elevation="0">
          <v-toolbar-title>Filters</v-toolbar-title>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="mobileFiltersOpen = false" />
        </v-toolbar>
        <v-card-text>
          <CruiseFilters
            v-model:selected-months="selectedMonths"
            v-model:selected-ships="selectedShips"
            v-model:price-range="priceRange"
            v-model:nights-range="nightsRange"
            :month-options="monthOptions"
            :ship-options="shipOptions"
            :min-price="minPrice"
            :max-price="maxPrice"
            :min-nights="minNights"
            :max-nights="maxNights"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="quickViewOpen" max-width="900">
      <v-card rounded="xl" class="quick-view-shell surface-card">
        <v-card-title class="d-flex align-center justify-space-between quickview-titlebar">
          <div>
            <p class="text-overline mb-0 text-medium-emphasis">Quick View</p>
            <span>{{ quickViewTitle }}</span>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="quickViewOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4 pa-sm-5">
          <v-row class="quickview-grid">
            <v-col cols="12" md="7">
              <h3 class="text-subtitle-1 font-weight-bold mb-3">Cruise itinerary</h3>
              <v-select
                v-model="selectedQuickViewDateId"
                label="Cruise date"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                :items="quickViewCruises.map((item) => ({ title: `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`, value: item.id }))"
              />

              <v-sheet rounded="lg" class="pa-4 mb-4 itinerary-summary section-surface">
                <p class="text-body-2 mb-2"><strong>Route:</strong> {{ quickViewSelectedCruise?.itineraryMap }}</p>
                <p class="text-body-2 mb-0">
                  <strong>Ship:</strong> {{ quickViewSelectedCruise?.shipName }}
                  <span class="mx-1">•</span>
                  <strong>Nights:</strong> {{ quickViewSelectedCruise?.nights }}
                </p>
              </v-sheet>

              <h4 class="text-subtitle-2 font-weight-bold mb-2">Highlighted destinations</h4>
              <v-row>
                <v-col v-for="destination in quickViewDestinations" :key="destination" cols="12" sm="6">
                  <v-card rounded="lg" elevation="1" class="destination-card section-surface">
                    <v-img :src="destinationImage(destination)" height="120" cover />
                    <v-card-text class="py-2 px-3 text-body-2 font-weight-medium">{{ destination }}</v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="12" md="5">
              <v-sheet rounded="lg" class="pa-4 calculator-shell section-surface">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">Ship highlights</h3>
                <v-list density="compact" class="mb-4 bg-transparent">
                  <v-list-item v-for="highlight in quickViewShipHighlights" :key="highlight" :title="highlight" prepend-icon="mdi-star-four-points" />
                </v-list>

                <h3 class="text-subtitle-1 font-weight-bold mb-3">Pricing calculator</h3>
                <v-select
                  v-model="selectedStateroomType"
                  label="Stateroom"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  :items="[
                    { title: 'Interior', value: 'interior' },
                    { title: 'Oceanview', value: 'oceanview' },
                    { title: 'Balcony', value: 'balcony' },
                    { title: 'Suite', value: 'suite' },
                  ]"
                />
                <p class="text-caption text-medium-emphasis mt-3 mb-0">Using global stateroom and guest selection: {{ guestSummary }}</p>

                <v-divider class="my-4" />

                <div class="d-flex justify-space-between text-body-2 mb-2 price-row">
                  <span>Estimated stateroom total</span>
                  <strong>{{ formatCurrency(guestCalculatorTotal) }}</strong>
                </div>
                <div class="d-flex justify-space-between text-body-2 price-row">
                  <span>Average per guest</span>
                  <strong>{{ formatCurrency(guestCalculatorPerGuest) }}</strong>
                </div>
              </v-sheet>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="justify-end px-4 pb-4 px-sm-5 pb-sm-5">
          <v-btn variant="text" @click="quickViewOpen = false">Close</v-btn>
          <v-btn color="primary" href="#" rounded="pill">Book now</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="compareModuleOpen" max-width="1100">
      <v-card rounded="xl" class="surface-card">
        <v-card-title class="d-flex align-center justify-space-between quickview-titlebar">
          <div>
            <p class="text-overline mb-0 text-medium-emphasis">Compare</p>
            <span>Side-by-side cruise comparison</span>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="compareModuleOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-table density="comfortable">
            <thead>
              <tr>
                <th>Aspect</th>
                <th v-for="cruise in compareCruises" :key="cruise.id">{{ cruise.itineraryName }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in compareRows" :key="row.label">
                <td class="font-weight-medium">{{ row.label }}</td>
                <td v-for="(value, index) in row.values" :key="`${row.label}-${index}`">{{ value }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.cruise-page {
  background: linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
}

.hero-card {
  background: linear-gradient(145deg, #ffffff 0%, #eef6ff 100%);
  border: 1px solid #d3e3f3;
  box-shadow: 0 10px 28px rgba(22, 67, 110, 0.1);
  color: #13395f;
}

.hero-copy {
  max-width: 58ch;
  color: #3e6287 !important;
  line-height: 1.5;
}

.hero-title {
  letter-spacing: 0.01em;
  color: #123c66;
}

.sticky-filters {
  position: sticky;
  top: 88px;
}

.filters-shell,
.toolbar-shell,
.pricing-shell,
.compare-shell,
.itinerary-card,
.cruise-date-card,
.quick-view-shell {
  border: 1px solid #d8e5f1;
  background: #ffffff;
  box-shadow: 0 6px 16px rgba(19, 67, 108, 0.05);
}

.surface-card {
  border: 1px solid #cfdfee;
  box-shadow: 0 10px 22px rgba(24, 79, 126, 0.08);
}

.guest-panel {
  border-color: #cfdfee !important;
  background: #f9fcff;
}

.section-kicker {
  letter-spacing: 0.08em;
}

.toolbar-shell {
  background: #ffffff;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-control {
  margin-left: auto;
}

.sort-select {
  min-width: 210px;
}

.control-label {
  font-size: 0.8rem;
  color: #2b557f;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.results-header {
  border-top: 1px solid #d6e3f0;
  padding-top: 14px;
}

.quickview-titlebar {
  background: linear-gradient(180deg, #f8fbff 0%, #f2f7fd 100%);
}

.quickview-grid {
  align-items: start;
}

.section-surface {
  border: 1px solid #dce8f4;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
}

.itinerary-summary {
  background: linear-gradient(180deg, #fbfdff 0%, #f2f7fd 100%);
}

.destination-card {
  overflow: hidden;
}

.price-row {
  background: #f7fbff;
  border: 1px solid #dde8f3;
  border-radius: 10px;
  padding: 10px 12px;
}

.route-copy {
  color: #28557f;
}

.compact-meta {
  line-height: 1.45;
}

.card-actions {
  min-width: 315px;
}

.itinerary-expansion {
  border: 1px solid #dee8f3;
  border-radius: 12px;
  overflow: hidden;
}

.departure-chip {
  background: #f6faff;
  border: 1px solid #dce8f4;
}

.card-title {
  color: #103a61;
}

.mobile-filter-shell {
  background: linear-gradient(180deg, #f9fcff 0%, #f1f6fc 100%);
}

.calculator-shell {
  background: #f5f9ff;
  border: 1px solid #d5e4f3;
}

.compare-panel {
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
}

.compare-dock {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: 12px;
  z-index: 30;
}

.compare-dock.collapsed {
  max-height: 78px;
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 1.65rem !important;
    line-height: 1.2;
  }

  .control-group {
    width: 100%;
  }

  .sort-control {
    margin-left: 0;
  }

  .control-group :deep(.v-btn-toggle) {
    margin-left: auto;
  }

  .sort-control :deep(.v-field) {
    width: 100%;
  }

  .results-header h2 {
    font-size: 1.1rem;
  }
}
</style>
