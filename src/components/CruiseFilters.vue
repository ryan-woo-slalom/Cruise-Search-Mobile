<script setup lang="ts">
defineProps<{
  monthOptions: { label: string; value: string }[]
  shipOptions: string[]
  minPrice: number
  maxPrice: number
  minNights: number
  maxNights: number
}>()

const searchQuery = defineModel<string>('searchQuery', { required: true })
const selectedMonths = defineModel<string[]>('selectedMonths', { required: true })
const selectedShips = defineModel<string[]>('selectedShips', { required: true })
const priceRange = defineModel<number[]>('priceRange', { required: true })
const nightsRange = defineModel<number[]>('nightsRange', { required: true })
</script>

<template>
  <div class="d-flex flex-column ga-4">
    <v-text-field
      v-model="searchQuery"
      label="Search itinerary or ship"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      hide-details
      density="comfortable"
    />

    <v-select
      v-model="selectedMonths"
      :items="monthOptions"
      item-title="label"
      item-value="value"
      label="Departure month"
      variant="outlined"
      multiple
      chips
      closable-chips
      hide-details
    />

    <v-select
      v-model="selectedShips"
      :items="shipOptions"
      label="Ship"
      variant="outlined"
      multiple
      chips
      closable-chips
      hide-details
    />

    <div>
      <p class="text-caption text-medium-emphasis mb-1">Price per person</p>
      <v-range-slider
        v-model="priceRange"
        :min="minPrice"
        :max="maxPrice"
        :step="10"
        color="primary"
        thumb-label="always"
        hide-details
      />
    </div>

    <div>
      <p class="text-caption text-medium-emphasis mb-1">Cruise nights</p>
      <v-range-slider
        v-model="nightsRange"
        :min="minNights"
        :max="maxNights"
        :step="1"
        color="primary"
        thumb-label="always"
        hide-details
      />
    </div>
  </div>
</template>
