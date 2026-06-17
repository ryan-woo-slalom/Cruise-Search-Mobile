<script setup lang="ts">
defineProps<{
  monthOptions: { label: string; value: string }[]
  shipOptions: string[]
  minPrice: number
  maxPrice: number
  minNights: number
  maxNights: number
}>()

const selectedMonths = defineModel<string[]>('selectedMonths', { required: true })
const selectedShips = defineModel<string[]>('selectedShips', { required: true })
const priceRange = defineModel<number[]>('priceRange', { required: true })
const nightsRange = defineModel<number[]>('nightsRange', { required: true })
</script>

<template>
  <v-expansion-panels variant="accordion" class="filter-accordion">
    <v-expansion-panel title="Sailing month">
      <v-expansion-panel-text>
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
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel title="Ship">
      <v-expansion-panel-text>
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
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel title="Price per person">
      <v-expansion-panel-text>
        <v-range-slider
          v-model="priceRange"
          :min="minPrice"
          :max="maxPrice"
          :step="10"
          color="primary"
          thumb-label="always"
          hide-details
        />
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel title="Cruise nights">
      <v-expansion-panel-text>
        <v-range-slider
          v-model="nightsRange"
          :min="minNights"
          :max="maxNights"
          :step="1"
          color="primary"
          thumb-label="always"
          hide-details
        />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<style scoped>
.filter-accordion {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #dbe6f2;
}
</style>
