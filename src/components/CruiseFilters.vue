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
  <v-expansion-panels
    variant="accordion"
    class="filter-accordion"
    multiple
    :model-value="[0, 1, 2, 3]"
  >
    <v-expansion-panel class="filter-section" title="Sailing month">
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

    <v-expansion-panel class="filter-section" title="Ship">
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

    <v-expansion-panel class="filter-section" title="Price per person">
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

    <v-expansion-panel class="filter-section" title="Cruise nights">
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
  border: 0;
  border-radius: 0;
  overflow: visible;
}

.filter-accordion :deep(.filter-section) {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0;
  border: 0;
  margin: 0;
}

.filter-accordion :deep(.filter-section .v-expansion-panel__shadow),
.filter-accordion :deep(.filter-section::before),
.filter-accordion :deep(.filter-section::after) {
  display: none;
}

.filter-accordion :deep(.filter-section + .filter-section) {
  border-top: 1px solid #dbe6f2;
}

.filter-accordion :deep(.filter-section .v-expansion-panel-title),
.filter-accordion :deep(.filter-section .v-expansion-panel-text) {
  background: transparent !important;
}
</style>
