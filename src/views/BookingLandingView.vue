<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import type { CruiseDeparture, StateroomPricing } from '../types/cruise'
import cruiseData from '../data/metrics.json'

const router = useRouter()
const route = useRoute()

const cruiseId = route.query.cruiseId as string
const stateroomTypes = route.query.stateroomTypes ? (JSON.parse(route.query.stateroomTypes as string) as (keyof StateroomPricing)[]) : ['interior']
const adults = parseInt(route.query.adults as string) || 0
const children = parseInt(route.query.children as string) || 0
const totalPrice = parseInt(route.query.totalPrice as string) || 0
const pricePerStateroom = parseInt(route.query.pricePerStateroom as string) || 0
const pricePerPerson = parseInt(route.query.pricePerPerson as string) || 0

const cruise = (cruiseData as CruiseDeparture[]).find((c) => c.id === cruiseId)

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(date: string): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return formatter.format(new Date(date))
}

function stateroomTypeLabel(type: keyof StateroomPricing): string {
  const labels: Record<keyof StateroomPricing, string> = {
    interior: 'Interior',
    oceanview: 'Oceanview',
    balcony: 'Balcony',
    suite: 'Suite',
  }
  return labels[type]
}

function goBack(): void {
  router.push('/')
}

function continueToBooking(): void {
  router.push({
    name: 'booking-flow',
    query: {
      cruiseId,
      stateroomTypes: JSON.stringify(stateroomTypes),
      adults,
      children,
      totalPrice,
      pricePerStateroom,
      pricePerPerson,
    },
  })
}
</script>

<template>
  <v-container fluid class="pa-3 pa-sm-5 pa-md-8">
    <v-card rounded="xl" elevation="2" class="surface-card">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="text-h5 font-weight-bold">Booking Summary</h1>
          <v-btn icon="mdi-close" variant="text" @click="goBack" />
        </div>

        <v-divider class="mb-6" />

        <div v-if="cruise" class="mb-8">
          <h2 class="text-h6 font-weight-bold mb-4">Cruise Details</h2>
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-body-2 text-medium-emphasis">Itinerary</div>
                <div class="text-body-1 font-weight-medium">{{ cruise.itineraryName }}</div>
              </div>
              <div class="mb-4">
                <div class="text-body-2 text-medium-emphasis">Ship</div>
                <div class="text-body-1 font-weight-medium">{{ cruise.shipName }}</div>
              </div>
              <div class="mb-4">
                <div class="text-body-2 text-medium-emphasis">Destinations</div>
                <div class="text-body-1 font-weight-medium">{{ cruise.itineraryMap }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-body-2 text-medium-emphasis">Dates</div>
                <div class="text-body-1 font-weight-medium">
                  {{ formatDate(cruise.startDate) }} - {{ formatDate(cruise.endDate) }}
                </div>
              </div>
              <div class="mb-4">
                <div class="text-body-2 text-medium-emphasis">Duration</div>
                <div class="text-body-1 font-weight-medium">{{ cruise.nights }} nights</div>
              </div>
            </v-col>
          </v-row>
        </div>

        <div class="mb-8">
          <h2 class="text-h6 font-weight-bold mb-4">Your Selection</h2>
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-body-2 text-medium-emphasis">Staterooms</div>
                <div class="text-body-1 font-weight-medium">{{ stateroomTypes.length }}</div>
              </div>
              <div class="mb-4">
                <div class="text-body-2 text-medium-emphasis">Stateroom Types</div>
                <div class="text-body-1 font-weight-medium">
                  {{ stateroomTypes.map((type) => stateroomTypeLabel(type as keyof StateroomPricing)).join(', ') }}
                </div>
              </div>
              <div class="mb-4">
                <div class="text-body-2 text-medium-emphasis">Guests</div>
                <div class="text-body-1 font-weight-medium">{{ adults }} Adults, {{ children }} Children</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="pa-4">
                <div class="mb-4">
                  <div class="text-body-2 text-medium-emphasis mb-1">Estimated Total</div>
                  <div class="text-h4 font-weight-bold">{{ formatCurrency(totalPrice) }}</div>
                </div>
                <div class="mb-2">
                  <div class="text-caption text-medium-emphasis">
                    Price per stateroom: {{ formatCurrency(pricePerStateroom) }}
                  </div>
                </div>
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Price per person: {{ formatCurrency(pricePerPerson) }}
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <v-divider class="mb-6" />

        <div class="d-flex align-center justify-end gap-3">
          <v-btn variant="text" @click="goBack">Back</v-btn>
          <v-btn color="primary" variant="flat" @click="continueToBooking">Continue</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
