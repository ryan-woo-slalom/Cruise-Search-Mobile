<script setup lang="ts">
import { ref } from 'vue'
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

const currentStep = ref(1)
const selectedCabinLocations = ref<string[]>([])
const selectedAddOns = ref<string[]>([])

const cabinLocationOptions = [
  { id: 'midship', label: 'Midship (Best for comfort)' },
  { id: 'forward', label: 'Forward (Quieter)' },
  { id: 'aft', label: 'Aft (Near nightlife)' },
]

const addOnOptions = [
  { id: 'beverage', label: 'Beverage Package', price: 200 },
  { id: 'speciality', label: 'Speciality Dining', price: 150 },
  { id: 'wifi', label: 'Internet Package', price: 100 },
  { id: 'excursions', label: 'Shore Excursions Bundle', price: 300 },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function nextStep(): void {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

function previousStep(): void {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function completeBooking(): void {
  // Booking complete - could redirect to confirmation page or back to home
  router.push('/')
}

const addOnCost = ref(0)

function updateAddOnCost(): void {
  addOnCost.value = selectedAddOns.value.reduce((sum, id) => {
    const addOn = addOnOptions.find((opt) => opt.id === id)
    return sum + (addOn?.price || 0)
  }, 0)
}
</script>

<template>
  <v-container fluid class="pa-3 pa-sm-5 pa-md-8">
    <v-card rounded="xl" elevation="2" class="surface-card">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="text-h5 font-weight-bold">Booking Flow</h1>
          <v-btn icon="mdi-close" variant="text" @click="router.push('/')" />
        </div>

        <v-stepper v-model="currentStep" class="mb-6">
          <v-stepper-header>
            <v-stepper-item :complete="currentStep > 1" :value="1" title="Cabin Location" />
            <v-divider />
            <v-stepper-item :complete="currentStep > 2" :value="2" title="Add-ons" />
            <v-divider />
            <v-stepper-item :value="3" title="Review & Confirm" />
          </v-stepper-header>

          <v-stepper-window>
            <!-- Step 1: Cabin Location -->
            <v-stepper-window-item :value="1">
              <div class="pa-4">
                <h3 class="text-subtitle-1 font-weight-bold mb-4">Select Cabin Location</h3>
                <v-radio-group v-model="selectedCabinLocations" :items="cabinLocationOptions" />
              </div>
            </v-stepper-window-item>

            <!-- Step 2: Add-ons -->
            <v-stepper-window-item :value="2">
              <div class="pa-4">
                <h3 class="text-subtitle-1 font-weight-bold mb-4">Select Add-ons</h3>
                <div class="mb-4">
                  <v-checkbox
                    v-for="addOn in addOnOptions"
                    :key="addOn.id"
                    v-model="selectedAddOns"
                    :value="addOn.id"
                    class="mb-2"
                    @update:model-value="updateAddOnCost"
                  >
                    <template #label>
                      <div class="d-flex justify-space-between w-100 ga-4">
                        <span>{{ addOn.label }}</span>
                        <span class="text-medium-emphasis">{{ formatCurrency(addOn.price) }}</span>
                      </div>
                    </template>
                  </v-checkbox>
                </div>
                <v-divider class="my-4" />
                <div class="text-body-2">
                  <span class="text-medium-emphasis">Add-ons Total: </span>
                  <span class="font-weight-bold">{{ formatCurrency(addOnCost) }}</span>
                </div>
              </div>
            </v-stepper-window-item>

            <!-- Step 3: Review & Confirm -->
            <v-stepper-window-item :value="3">
              <div class="pa-4">
                <h3 class="text-subtitle-1 font-weight-bold mb-4">Review Your Booking</h3>
                <v-row class="mb-6">
                  <v-col cols="12" md="6">
                    <div class="mb-3">
                      <div class="text-body-2 text-medium-emphasis">Cruise</div>
                      <div class="text-body-1 font-weight-medium">{{ cruise?.itineraryName }}</div>
                    </div>
                    <div class="mb-3">
                      <div class="text-body-2 text-medium-emphasis">Guests</div>
                      <div class="text-body-1 font-weight-medium">{{ adults }} Adults, {{ children }} Children</div>
                    </div>
                    <div class="mb-3">
                      <div class="text-body-2 text-medium-emphasis">Cabin Location</div>
                      <div class="text-body-1 font-weight-medium">
                        {{ cabinLocationOptions.find((o) => o.id === selectedCabinLocations[0])?.label || 'Not selected' }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card variant="outlined" class="pa-4">
                      <div class="mb-4">
                        <div class="text-body-2 text-medium-emphasis mb-1">Cruise Total</div>
                        <div class="text-h6 font-weight-bold">{{ formatCurrency(totalPrice) }}</div>
                      </div>
                      <div class="mb-4">
                        <div class="text-body-2 text-medium-emphasis mb-1">Add-ons</div>
                        <div class="text-h6 font-weight-bold">{{ formatCurrency(addOnCost) }}</div>
                      </div>
                      <v-divider class="my-3" />
                      <div>
                        <div class="text-body-2 text-medium-emphasis mb-1">Grand Total</div>
                        <div class="text-h5 font-weight-bold text-primary">{{ formatCurrency(totalPrice + addOnCost) }}</div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>

        <v-divider class="mb-6" />

        <div class="d-flex align-center justify-space-between">
          <v-btn
            :disabled="currentStep === 1"
            variant="text"
            @click="previousStep"
          >
            Back
          </v-btn>
          <div class="d-flex ga-3">
            <v-btn variant="text" @click="router.push('/')">Cancel</v-btn>
            <v-btn
              v-if="currentStep < 3"
              color="primary"
              variant="flat"
              @click="nextStep"
            >
              Next
            </v-btn>
            <v-btn
              v-else
              color="primary"
              variant="flat"
              @click="completeBooking"
            >
              Complete Booking
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
