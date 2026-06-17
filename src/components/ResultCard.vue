<script setup lang="ts">
import { computed } from 'vue'
import type { CruiseDeparture } from '../types/cruise'

const props = withDefaults(
  defineProps<{
    mode: 'itinerary' | 'date'
    cruise: CruiseDeparture
    departures?: CruiseDeparture[]
    imageUrl: string
    isSaved: boolean
    isCompared: boolean
    displayPrice: number
    priceLabel: string
    departurePrices?: Record<string, number>
  }>(),
  {
    departures: () => [],
    departurePrices: () => ({}),
  },
)

const emit = defineEmits<{
  save: [id: string]
  compare: [id: string]
  quickview: [cruiseSet: CruiseDeparture[], title: string]
}>()

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const itineraryCruises = computed(() => {
  if (props.mode === 'itinerary') {
    return props.departures
  }

  return [props.cruise]
})

const earliestDate = computed(() => {
  const dates = itineraryCruises.value.map((item) => item.startDate).sort()
  return dates[0] ?? props.cruise.startDate
})

const latestDate = computed(() => {
  const dates = itineraryCruises.value.map((item) => item.endDate).sort()
  return dates[dates.length - 1] ?? props.cruise.endDate
})

const cardLabel = computed(() => {
  if (props.mode === 'itinerary') {
    return `${itineraryCruises.value.length} sailings`
  }

  return `${props.cruise.nights} nights`
})

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

function openQuickView(): void {
  emit('quickview', itineraryCruises.value, props.cruise.itineraryName)
}
</script>

<template>
  <v-card rounded="xl" class="result-card surface-card fill-height" elevation="2">
    <v-img :src="imageUrl" height="190" cover class="card-image">
      <div class="image-overlay" />
      <div class="image-chip-wrap">
        <v-chip color="white" size="small" variant="flat">{{ cruise.shipName }}</v-chip>
        <v-chip color="primary" size="small" variant="flat" class="ml-2">{{ cardLabel }}</v-chip>
      </div>
    </v-img>

    <v-card-text class="pa-4 pa-sm-5 pa-md-6 card-content">
      <div class="d-flex justify-space-between ga-3 align-start mb-3">
        <div>
          <h2 class="text-subtitle-1 text-md-h6 font-weight-bold mb-1 card-title">{{ cruise.itineraryName }}</h2>
          <p class="text-caption route-copy mb-2">{{ cruise.itineraryMap }}</p>
          <p class="text-caption text-medium-emphasis mb-0 d-flex align-center ga-1">
            <v-icon size="14" icon="mdi-calendar-range" />
            {{ formatDate(earliestDate) }} to {{ formatDate(latestDate) }}
          </p>
        </div>
        <div class="text-right price-wrap">
          <v-chip color="primary" variant="flat" size="small">{{ formatCurrency(displayPrice) }}</v-chip>
          <div class="text-caption mt-1">{{ priceLabel }}</div>
        </div>
      </div>

      <template v-if="mode === 'itinerary'">
        <v-expansion-panels variant="accordion" class="mt-3 itinerary-expansion" flat>
          <v-expansion-panel :title="`Show ${itineraryCruises.length} cruise dates`" rounded="lg">
            <v-expansion-panel-text>
              <v-row>
                <v-col v-for="departure in itineraryCruises" :key="departure.id" cols="12" sm="6">
                  <v-sheet rounded="lg" class="pa-3 departure-chip">
                    <div class="text-subtitle-2 mb-1">
                      {{ formatDate(departure.startDate) }} to {{ formatDate(departure.endDate) }}
                    </div>
                    <div class="text-caption">
                      Starting at {{ formatCurrency(departurePrices[departure.id] ?? departure.pricePerPerson) }} / {{ priceLabel }}
                    </div>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>

      <template v-else>
        <v-divider class="my-3" />
        <v-row dense class="price-grid">
          <v-col cols="6">
            <div class="text-caption">Interior</div>
            <div class="text-body-2 font-weight-medium">{{ formatCurrency(cruise.stateroomPricing.interior) }}</div>
          </v-col>
          <v-col cols="6">
            <div class="text-caption">Balcony</div>
            <div class="text-body-2 font-weight-medium">{{ formatCurrency(cruise.stateroomPricing.balcony) }}</div>
          </v-col>
        </v-row>
      </template>
    </v-card-text>

    <v-card-actions class="px-4 pb-5 pt-3 px-sm-5 pb-sm-5 px-md-6 pb-md-6 card-actions">
      <v-btn size="small" variant="outlined" :color="isSaved ? 'secondary' : undefined" @click="emit('save', cruise.id)">
        {{ isSaved ? 'Saved' : 'Save' }}
      </v-btn>
      <v-btn size="small" variant="tonal" :color="isCompared ? 'secondary' : undefined" @click="emit('compare', cruise.id)">
        Compare
      </v-btn>
      <v-spacer />
      <v-btn size="small" variant="outlined" @click="openQuickView">Quick view</v-btn>
      <v-btn size="small" color="primary" href="#" rounded="pill">Book now</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.result-card {
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 26px rgba(16, 67, 109, 0.12);
}

.card-image {
  position: relative;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(11, 54, 89, 0.05) 24%, rgba(11, 54, 89, 0.58) 100%);
}

.image-chip-wrap {
  position: absolute;
  left: 12px;
  bottom: 12px;
}

.card-content {
  border-top: 1px solid #e4edf6;
}

.card-title {
  color: #103a61;
  letter-spacing: 0.01em;
}

.route-copy {
  color: #28557f;
}

.price-wrap {
  min-width: 98px;
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

.price-grid {
  background: #f9fcff;
  border: 1px solid #dce8f4;
  border-radius: 10px;
  padding: 6px;
}

.card-actions {
  border-top: 1px solid #edf2f8;
  row-gap: 8px;
  margin-top: 6px;
}

@media (max-width: 640px) {
  .card-title {
    line-height: 1.25;
  }

  .route-copy {
    line-height: 1.35;
  }

  .price-wrap {
    min-width: 88px;
  }
}
</style>
