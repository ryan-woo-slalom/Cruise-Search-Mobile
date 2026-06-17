<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import cruiseData from '../data/metrics.json'
import CruiseFilters from '../components/CruiseFilters.vue'
import ResultCard from '../components/ResultCard.vue'
import type { CruiseDeparture, StateroomPricing } from '../types/cruise'

type ViewMode = 'itinerary' | 'date'

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
const adultsCount = ref(2)
const childrenCount = ref(0)
const selectedMonths = ref<string[]>([])
const selectedShips = ref<string[]>([])
const priceRange = ref<number[]>([minPrice, maxPrice])
const nightsRange = ref<number[]>([minNights, maxNights])
const activeView = ref<ViewMode>('itinerary')
const mobileFiltersOpen = ref(false)

const savedIds = ref<string[]>([])
const compareIds = ref<string[]>([])

const quickViewOpen = ref(false)
const quickViewTitle = ref('')
const quickViewCruises = ref<CruiseDeparture[]>([])
const selectedQuickViewDateId = ref('')
const selectedStateroomType = ref<keyof StateroomPricing>('interior')

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

const totalGuests = computed(() => adultsCount.value + childrenCount.value)
const guestSummary = computed(() => `${adultsCount.value} Adults, ${childrenCount.value} Children`)

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
    const adjustedPrice = adjustedPricePerPerson(cruise)
    const matchesPrice = adjustedPrice >= selectedMinPrice && adjustedPrice <= selectedMaxPrice
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

  const baseStateroom = quickViewSelectedCruise.value.stateroomPricing[selectedStateroomType.value]
  const extraGuests = Math.max(totalGuests.value - 2, 0)
  const extraGuestRate = Math.round(quickViewSelectedCruise.value.pricePerPerson * 0.75)

  return baseStateroom + extraGuests * extraGuestRate
})

const guestCalculatorPerGuest = computed(() =>
  Math.round(guestCalculatorTotal.value / totalGuests.value),
)

function adjustedPricePerPerson(cruise: CruiseDeparture): number {
  const extraAdults = Math.max(adultsCount.value - 2, 0)
  const extraChildren = childrenCount.value
  const total = cruise.totalBasePrice + cruise.pricePerPerson * extraAdults * 0.85 + cruise.pricePerPerson * extraChildren * 0.6
  return Math.round(total / totalGuests.value)
}

function incrementAdults(): void {
  if (totalGuests.value < 4) {
    adultsCount.value += 1
  }
}

function decrementAdults(): void {
  const minimumAdults = childrenCount.value > 0 ? 1 : 1
  if (adultsCount.value > minimumAdults) {
    adultsCount.value -= 1
  }
}

function incrementChildren(): void {
  if (totalGuests.value < 4) {
    childrenCount.value += 1
    if (adultsCount.value === 0) {
      adultsCount.value = 1
    }
  }
}

function decrementChildren(): void {
  if (childrenCount.value > 0) {
    childrenCount.value -= 1
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

  if (compareIds.value.length >= 3) {
    compareIds.value = [...compareIds.value.slice(1), id]
    return
  }

  compareIds.value = [...compareIds.value, id]
}

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
              <div class="text-subtitle-2 mb-2">Guests</div>
              <div class="d-flex justify-space-between align-center mb-3">
                <div>
                  <div class="text-body-2 font-weight-medium">Adults</div>
                  <div class="text-caption text-medium-emphasis">Ages 18+</div>
                </div>
                <div class="d-flex align-center ga-2">
                  <v-btn icon="mdi-minus" size="x-small" variant="tonal" @click="decrementAdults" />
                  <strong>{{ adultsCount }}</strong>
                  <v-btn icon="mdi-plus" size="x-small" variant="tonal" @click="incrementAdults" />
                </div>
              </div>
              <div class="d-flex justify-space-between align-center mb-2">
                <div>
                  <div class="text-body-2 font-weight-medium">Children</div>
                  <div class="text-caption text-medium-emphasis">Under 18</div>
                </div>
                <div class="d-flex align-center ga-2">
                  <v-btn icon="mdi-minus" size="x-small" variant="tonal" @click="decrementChildren" />
                  <strong>{{ childrenCount }}</strong>
                  <v-btn icon="mdi-plus" size="x-small" variant="tonal" @click="incrementChildren" />
                </div>
              </div>
              <p class="text-caption text-medium-emphasis mb-0">{{ guestSummary }} • Max 4 guests per stateroom.</p>
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

          <v-btn-toggle v-model="activeView" mandatory color="primary" divided rounded="pill">
            <v-btn value="itinerary">View by Itinerary</v-btn>
            <v-btn value="date">View by Cruise Date</v-btn>
          </v-btn-toggle>

          <v-chip color="secondary" variant="tonal" prepend-icon="mdi-ferry">
            {{ filteredCruises.length }} cruise dates found
          </v-chip>
          </v-card-text>
        </v-card>

        <div class="results-header mb-3">
          <p class="text-overline mb-1 section-kicker">Search Results</p>
          <h2 class="text-h6 mb-0">Cruises matching your search ({{ filteredCruises.length }})</h2>
        </div>

        <v-row v-if="activeView === 'itinerary'">
          <v-col v-for="group in groupedByItinerary" :key="group.itineraryName" cols="12">
            <ResultCard
              mode="itinerary"
              :cruise="group.leadDeparture"
              :departures="group.departures"
              :image-url="destinationImage(group.leadDeparture.itineraryMap.split('->')[1]?.trim() ?? group.leadDeparture.itineraryName)"
              :is-saved="savedIds.includes(group.leadDeparture.id)"
              :is-compared="compareIds.includes(group.leadDeparture.id)"
              :adjusted-price-per-person="adjustedPricePerPerson(group.leadDeparture)"
              @save="toggleSaved"
              @compare="toggleCompare"
              @quickview="openQuickView"
            />
          </v-col>
        </v-row>

        <v-row v-else>
          <v-col v-for="cruise in filteredCruises" :key="cruise.id" cols="12" sm="6">
            <ResultCard
              mode="date"
              :cruise="cruise"
              :image-url="destinationImage(cruise.itineraryMap.split('->')[1]?.trim() ?? cruise.itineraryName)"
              :is-saved="savedIds.includes(cruise.id)"
              :is-compared="compareIds.includes(cruise.id)"
              :adjusted-price-per-person="adjustedPricePerPerson(cruise)"
              @save="toggleSaved"
              @compare="toggleCompare"
              @quickview="openQuickView"
            />
          </v-col>
        </v-row>

        <v-card v-if="compareCruises.length > 0" rounded="xl" class="mt-6 compare-shell surface-card" elevation="2">
          <v-card-title class="d-flex align-center ga-2">
            <v-icon icon="mdi-compare" color="secondary" />
            Compare cruises ({{ compareCruises.length }}/3)
          </v-card-title>
          <v-divider />
          <v-table density="comfortable">
            <thead>
              <tr>
                <th>Itinerary</th>
                <th>Ship</th>
                <th>Dates</th>
                <th>Price / person</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cruise in compareCruises" :key="cruise.id">
                <td>{{ cruise.itineraryName }}</td>
                <td>{{ cruise.shipName }}</td>
                <td>{{ formatDate(cruise.startDate) }} - {{ formatDate(cruise.endDate) }}</td>
                <td>{{ formatCurrency(adjustedPricePerPerson(cruise)) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>

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
                <p class="text-caption text-medium-emphasis mt-3 mb-0">Using global guest selection: {{ guestSummary }}</p>

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

@media (max-width: 600px) {
  .hero-title {
    font-size: 1.65rem !important;
    line-height: 1.2;
  }

  .toolbar-shell :deep(.v-btn-toggle .v-btn) {
    font-size: 0.72rem;
    padding-inline: 10px;
  }

  .results-header h2 {
    font-size: 1.1rem;
  }
}
</style>
