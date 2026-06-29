<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { CruiseDeparture, StateroomPricing } from '../types/cruise'
import cruiseData from '../data/metrics.json'

const router = useRouter()
const route = useRoute()

const cruiseId = route.query.cruiseId as string
const cruise = (cruiseData as CruiseDeparture[]).find((c) => c.id === cruiseId)

// Editable state for staterooms
interface EditableStateroom {
  type: keyof StateroomPricing
  adults: number
  children: number
}

const editableStaterooms = ref<EditableStateroom[]>([
  { type: 'interior', adults: 2, children: 0 },
])

function addStateroom(): void {
  if (editableStaterooms.value.length < 4) {
    editableStaterooms.value.push({ type: 'interior', adults: 2, children: 0 })
  }
}

function removeStateroom(index: number): void {
  if (editableStaterooms.value.length > 1) {
    editableStaterooms.value.splice(index, 1)
  }
}

function incrementAdults(index: number): void {
  const stateroom = editableStaterooms.value[index]
  if (stateroom) {
    const guests = stateroom.adults + stateroom.children
    if (guests < 4) {
      stateroom.adults++
    }
  }
}

function decrementAdults(index: number): void {
  const stateroom = editableStaterooms.value[index]
  if (stateroom && stateroom.adults > 1) {
    stateroom.adults--
  }
}

function incrementChildren(index: number): void {
  const stateroom = editableStaterooms.value[index]
  if (stateroom) {
    const guests = stateroom.adults + stateroom.children
    if (guests < 4) {
      stateroom.children++
    }
  }
}

function decrementChildren(index: number): void {
  const stateroom = editableStaterooms.value[index]
  if (stateroom && stateroom.children > 0) {
    stateroom.children--
  }
}

// Computed pricing
const calculatedPricing = computed(() => {
  let totalPrice = 0
  if (cruise && cruise.stateroomPricing) {
    editableStaterooms.value.forEach((stateroom) => {
      const price = cruise.stateroomPricing[stateroom.type] ?? 0
      totalPrice += price
    })
  }

  const totalGuests = editableStaterooms.value.reduce((sum, sr) => sum + sr.adults + sr.children, 0)
  const pricePerStateroom = editableStaterooms.value.length > 0 ? totalPrice / editableStaterooms.value.length : 0
  const pricePerPerson = totalGuests > 0 ? totalPrice / totalGuests : 0

  return {
    totalPrice,
    pricePerStateroom,
    pricePerPerson,
    totalGuests,
  }
})

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
      stateroomTypes: JSON.stringify(editableStaterooms.value.map((sr) => sr.type)),
      adults: editableStaterooms.value.reduce((sum, sr) => sum + sr.adults, 0),
      children: editableStaterooms.value.reduce((sum, sr) => sum + sr.children, 0),
      totalPrice: calculatedPricing.value.totalPrice,
      pricePerStateroom: calculatedPricing.value.pricePerStateroom,
      pricePerPerson: calculatedPricing.value.pricePerPerson,
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
            <!-- Staterooms Accordion -->
            <v-col cols="12" md="7">
              <v-expansion-panels variant="accordion">
                <v-expansion-panel
                  v-for="(stateroom, index) in editableStaterooms"
                  :key="index"
                >
                  <template #title>
                    <div class="d-flex justify-space-between w-100 align-center pr-2">
                      <span>Stateroom {{ index + 1 }}: {{ stateroomTypeLabel(stateroom.type) }}</span>
                      <span class="text-caption text-medium-emphasis">
                        {{ stateroom.adults }} Adults, {{ stateroom.children }} Children
                      </span>
                    </div>
                  </template>

                  <v-card-text>
                    <div class="mb-4">
                      <div class="text-body-2 text-medium-emphasis mb-2">Stateroom Type</div>
                      <v-select
                        v-model="stateroom.type"
                        :items="['interior', 'oceanview', 'balcony', 'suite']"
                        :item-props="(item: any) => ({ title: stateroomTypeLabel(item as keyof StateroomPricing) })"
                        density="compact"
                        variant="outlined"
                      />
                    </div>

                    <div class="mb-4">
                      <div class="text-body-2 text-medium-emphasis mb-2">Adults</div>
                      <div class="d-flex align-center gap-2">
                        <v-btn
                          icon="mdi-minus"
                          size="small"
                          variant="outlined"
                          :disabled="stateroom.adults <= 1"
                          @click="decrementAdults(index)"
                        />
                        <span class="text-body-1">{{ stateroom.adults }}</span>
                        <v-btn
                          icon="mdi-plus"
                          size="small"
                          variant="outlined"
                          :disabled="stateroom.adults + stateroom.children >= 4"
                          @click="incrementAdults(index)"
                        />
                      </div>
                    </div>

                    <div class="mb-4">
                      <div class="text-body-2 text-medium-emphasis mb-2">Children</div>
                      <div class="d-flex align-center gap-2">
                        <v-btn
                          icon="mdi-minus"
                          size="small"
                          variant="outlined"
                          :disabled="stateroom.children <= 0"
                          @click="decrementChildren(index)"
                        />
                        <span class="text-body-1">{{ stateroom.children }}</span>
                        <v-btn
                          icon="mdi-plus"
                          size="small"
                          variant="outlined"
                          :disabled="stateroom.adults + stateroom.children >= 4"
                          @click="incrementChildren(index)"
                        />
                      </div>
                    </div>

                    <div class="text-body-2 mb-4">
                      <span class="text-medium-emphasis">Price: </span>
                      <span class="font-weight-bold">{{ formatCurrency(cruise && cruise.stateroomPricing ? cruise.stateroomPricing[stateroom.type] : 0) }}</span>
                    </div>

                    <v-btn
                      v-if="editableStaterooms.length > 1"
                      size="small"
                      color="error"
                      variant="text"
                      @click="removeStateroom(index)"
                    >
                      Remove Stateroom
                    </v-btn>
                  </v-card-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <v-btn
                v-if="editableStaterooms.length < 4"
                class="mt-4"
                color="primary"
                variant="text"
                prepend-icon="mdi-plus"
                @click="addStateroom"
              >
                Add Stateroom
              </v-btn>
            </v-col>

            <!-- Pricing Card -->
            <v-col cols="12" md="5">
              <v-card variant="outlined" class="pa-4 sticky" style="top: 20px">
                <div class="mb-4">
                  <div class="text-body-2 text-medium-emphasis mb-1">Estimated Total</div>
                  <div class="text-h4 font-weight-bold">{{ formatCurrency(calculatedPricing.totalPrice) }}</div>
                </div>
                <div class="mb-2">
                  <div class="text-caption text-medium-emphasis">
                    Staterooms: {{ editableStaterooms.length }}
                  </div>
                </div>
                <div class="mb-2">
                  <div class="text-caption text-medium-emphasis">
                    Total Guests: {{ calculatedPricing.totalGuests }}
                  </div>
                </div>
                <div class="mb-2">
                  <div class="text-caption text-medium-emphasis">
                    Price per stateroom: {{ formatCurrency(calculatedPricing.pricePerStateroom) }}
                  </div>
                </div>
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Price per person: {{ formatCurrency(calculatedPricing.pricePerPerson) }}
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
