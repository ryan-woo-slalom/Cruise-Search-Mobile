<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import cruiseData from '../data/metrics.json'
import CruiseFilters from '../components/CruiseFilters.vue'
import PriceTrendChart from '../components/PriceTrendChart.vue'
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
const selectedStateroomType = ref<keyof StateroomPricing>('interior')
const guestCount = ref(2)

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
    const matchesPrice =
      cruise.pricePerPerson >= selectedMinPrice && cruise.pricePerPerson <= selectedMaxPrice
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

const quickViewPrimary = computed(() => quickViewCruises.value[0])

const guestCalculatorTotal = computed(() => {
  if (!quickViewPrimary.value) {
    return 0
  }

  const baseStateroom = quickViewPrimary.value.stateroomPricing[selectedStateroomType.value]
  const extraGuests = Math.max(guestCount.value - 2, 0)
  const extraGuestRate = Math.round(quickViewPrimary.value.pricePerPerson * 0.75)

  return baseStateroom + extraGuests * extraGuestRate
})

const guestCalculatorPerGuest = computed(() => Math.round(guestCalculatorTotal.value / guestCount.value))

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
  selectedStateroomType.value = 'interior'
  guestCount.value = 2
  quickViewOpen.value = true
}
</script>

<template>
  <v-container fluid class="pa-4 pa-md-8 cruise-page">
    <v-card class="hero-card mb-6" rounded="xl">
      <v-card-text class="py-8 py-md-10 px-6 px-md-10">
        <p class="text-overline text-medium-emphasis">Cruise Search</p>
        <h1 class="text-h4 text-md-h3 font-weight-bold mb-2">Find your perfect Intrepid voyage</h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Mobile-first search with real-time filters, itinerary and date views, and quick booking actions.
        </p>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col cols="12" md="3">
        <v-card v-if="mdAndUp" rounded="lg" class="sticky-filters">
          <v-card-title>Filters</v-card-title>
          <v-divider />
          <v-card-text>
            <CruiseFilters
              v-model:search-query="searchQuery"
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
        <div class="d-flex flex-wrap align-center ga-3 mb-4">
          <v-btn
            v-if="!mdAndUp"
            color="primary"
            prepend-icon="mdi-filter-variant"
            @click="mobileFiltersOpen = true"
          >
            Filters
          </v-btn>

          <v-btn-toggle v-model="activeView" mandatory color="primary" divided>
            <v-btn value="itinerary">View by Itinerary</v-btn>
            <v-btn value="date">View by Cruise Date</v-btn>
          </v-btn-toggle>

          <v-chip color="secondary" variant="tonal">
            {{ filteredCruises.length }} cruise dates found
          </v-chip>
        </div>

        <v-card rounded="lg" class="mb-6">
          <v-card-title class="pb-0">Pricing trend</v-card-title>
          <v-card-text>
            <PriceTrendChart :cruises="filteredCruises" />
          </v-card-text>
        </v-card>

        <v-row v-if="activeView === 'itinerary'">
          <v-col v-for="group in groupedByItinerary" :key="group.itineraryName" cols="12">
            <v-card rounded="lg" class="mb-3">
              <v-card-text>
                <div class="d-flex justify-space-between flex-wrap ga-3">
                  <div>
                    <h2 class="text-h6 mb-1">{{ group.itineraryName }}</h2>
                    <p class="text-body-2 mb-1">{{ group.itineraryMap }}</p>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ group.shipName }} | {{ group.leadDeparture.nights }} nights | from
                      {{ formatCurrency(Math.min(...group.departures.map((item) => item.pricePerPerson))) }} / guest
                    </p>
                  </div>
                  <div class="d-flex flex-wrap ga-2 align-start justify-end">
                    <v-btn
                      size="small"
                      variant="tonal"
                      :color="savedIds.includes(group.leadDeparture.id) ? 'secondary' : undefined"
                      @click="toggleSaved(group.leadDeparture.id)"
                    >
                      {{ savedIds.includes(group.leadDeparture.id) ? 'Saved' : 'Save' }}
                    </v-btn>
                    <v-btn size="small" variant="tonal" @click="toggleCompare(group.leadDeparture.id)">
                      Compare
                    </v-btn>
                    <v-btn
                      size="small"
                      color="secondary"
                      variant="outlined"
                      @click="openQuickView(group.departures, group.itineraryName)"
                    >
                      Quick view
                    </v-btn>
                    <v-btn size="small" color="primary" href="#">Book now</v-btn>
                  </div>
                </div>

                <v-expansion-panels variant="accordion" class="mt-4">
                  <v-expansion-panel title="Show available cruise dates">
                    <v-expansion-panel-text>
                      <v-row>
                        <v-col v-for="departure in group.departures" :key="departure.id" cols="12" sm="6">
                          <v-sheet color="blue-lighten-5" rounded="lg" class="pa-3">
                            <div class="text-subtitle-2">{{ formatDate(departure.startDate) }} to {{ formatDate(departure.endDate) }}</div>
                            <div class="text-caption">Starting at {{ formatCurrency(departure.pricePerPerson) }} per person</div>
                          </v-sheet>
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-else>
          <v-col v-for="cruise in filteredCruises" :key="cruise.id" cols="12" sm="6">
            <v-card rounded="lg" class="fill-height">
              <v-card-text>
                <div class="d-flex justify-space-between ga-3">
                  <div>
                    <h2 class="text-subtitle-1 font-weight-bold mb-1">{{ cruise.itineraryName }}</h2>
                    <p class="text-body-2 mb-1">{{ cruise.shipName }}</p>
                    <p class="text-caption text-medium-emphasis mb-2">{{ cruise.itineraryMap }}</p>
                    <p class="text-body-2 mb-0">
                      {{ formatDate(cruise.startDate) }} to {{ formatDate(cruise.endDate) }}
                    </p>
                  </div>
                  <div class="text-right">
                    <div class="text-h6">{{ formatCurrency(cruise.pricePerPerson) }}</div>
                    <div class="text-caption">per person</div>
                  </div>
                </div>

                <v-divider class="my-3" />

                <v-row dense>
                  <v-col cols="6">
                    <div class="text-caption">Interior</div>
                    <div class="text-body-2">{{ formatCurrency(cruise.stateroomPricing.interior) }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption">Balcony</div>
                    <div class="text-body-2">{{ formatCurrency(cruise.stateroomPricing.balcony) }}</div>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-card-actions>
                <v-btn size="small" variant="tonal" @click="toggleSaved(cruise.id)">
                  {{ savedIds.includes(cruise.id) ? 'Saved' : 'Save' }}
                </v-btn>
                <v-btn size="small" variant="tonal" @click="toggleCompare(cruise.id)">Compare</v-btn>
                <v-spacer />
                <v-btn size="small" variant="outlined" @click="openQuickView([cruise], cruise.itineraryName)">
                  Quick view
                </v-btn>
                <v-btn size="small" color="primary" href="#">Book now</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-card v-if="compareCruises.length > 0" rounded="lg" class="mt-6">
          <v-card-title>Compare cruises ({{ compareCruises.length }}/3)</v-card-title>
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
                <td>{{ formatCurrency(cruise.pricePerPerson) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="mobileFiltersOpen" fullscreen>
      <v-card>
        <v-toolbar color="white">
          <v-toolbar-title>Filters</v-toolbar-title>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="mobileFiltersOpen = false" />
        </v-toolbar>
        <v-card-text>
          <CruiseFilters
            v-model:search-query="searchQuery"
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
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>{{ quickViewTitle }}</span>
          <v-btn icon="mdi-close" variant="text" @click="quickViewOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-row>
            <v-col cols="12" md="7">
              <h3 class="text-subtitle-1 font-weight-bold mb-2">Cruise dates</h3>
              <v-timeline density="compact" align="start" side="end">
                <v-timeline-item
                  v-for="cruise in quickViewCruises"
                  :key="cruise.id"
                  dot-color="primary"
                  fill-dot
                  size="small"
                >
                  <div class="text-body-2 font-weight-medium">{{ formatDate(cruise.startDate) }} to {{ formatDate(cruise.endDate) }}</div>
                  <div class="text-caption">{{ cruise.shipName }} | {{ cruise.nights }} nights</div>
                  <div class="text-caption">{{ formatCurrency(cruise.pricePerPerson) }} per person</div>
                </v-timeline-item>
              </v-timeline>
            </v-col>

            <v-col cols="12" md="5">
              <v-sheet color="blue-lighten-5" rounded="lg" class="pa-4">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">Guest calculator</h3>
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

                <div class="mt-4">
                  <div class="text-body-2 mb-1">Guests (max 4)</div>
                  <v-slider
                    v-model="guestCount"
                    :min="1"
                    :max="4"
                    :step="1"
                    color="primary"
                    thumb-label="always"
                    hide-details
                  />
                </div>

                <v-divider class="my-4" />

                <div class="d-flex justify-space-between text-body-2 mb-2">
                  <span>Estimated stateroom total</span>
                  <strong>{{ formatCurrency(guestCalculatorTotal) }}</strong>
                </div>
                <div class="d-flex justify-space-between text-body-2">
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
  background:
    radial-gradient(circle at top right, rgba(151, 207, 255, 0.26), transparent 34%),
    linear-gradient(180deg, #f7fbff 0%, #edf5fb 100%);
}

.hero-card {
  background: linear-gradient(130deg, #ffffff 0%, #e4f1ff 100%);
  border: 1px solid #cde2f4;
}

.sticky-filters {
  position: sticky;
  top: 88px;
}
</style>
