<script setup lang="ts">
const props = defineProps<{
  monthOptions: { label: string; value: string }[]
  shipOptions: string[]
  minPrice: number
  maxPrice: number
  minNights: number
  maxNights: number
  pricingMode?: 'stateroom' | 'person'
}>()

const selectedMonths = defineModel<string[]>('selectedMonths', { required: true })
const selectedShips = defineModel<string[]>('selectedShips', { required: true })
const priceRange = defineModel<number[]>('priceRange', { required: true })
const nightsRange = defineModel<number[]>('nightsRange', { required: true })

function removeMonth(value: string): void {
  selectedMonths.value = selectedMonths.value.filter((m) => m !== value)
}

function removeShip(ship: string): void {
  selectedShips.value = selectedShips.value.filter((s) => s !== ship)
}

function resetPriceRange(): void {
  priceRange.value = [props.minPrice, props.maxPrice]
}

function resetNightsRange(): void {
  nightsRange.value = [props.minNights, props.maxNights]
}
</script>

<template>
  <div class="filter-container">
    <div class="filter-section">
      <div class="section-title">Sailing month</div>
      <div class="mb-3">
        <v-select
          v-model="selectedMonths"
          :items="monthOptions"
          item-title="label"
          item-value="value"
          label="Select months"
          variant="outlined"
          multiple
          hide-details
          density="compact"
          class="mb-3"
        />
      </div>
      <div v-if="selectedMonths.length > 0" class="d-flex flex-wrap ga-2 mb-3">
        <v-chip
          v-for="month in selectedMonths"
          :key="month"
          closable
          color="secondary"
          variant="flat"
          size="small"
          @click:close="removeMonth(month)"
        >
          {{ monthOptions.find((m) => m.value === month)?.label }}
        </v-chip>
      </div>
    </div>

    <div class="filter-section">
      <div class="section-title">Ship</div>
      <div class="mb-3">
        <v-select
          v-model="selectedShips"
          :items="shipOptions"
          label="Select ships"
          variant="outlined"
          multiple
          hide-details
          density="compact"
          class="mb-3"
        />
      </div>
      <div v-if="selectedShips.length > 0" class="d-flex flex-wrap ga-2 mb-3">
        <v-chip
          v-for="ship in selectedShips"
          :key="ship"
          closable
          color="secondary"
          variant="flat"
          size="small"
          @click:close="removeShip(ship)"
        >
          {{ ship }}
        </v-chip>
      </div>
    </div>

    <div class="filter-section">
      <div class="section-title">{{ pricingMode === 'stateroom' ? 'Price per stateroom' : 'Price per person' }}</div>
      <v-range-slider
        v-model="priceRange"
        :min="minPrice"
        :max="maxPrice"
        :step="10"
        color="primary"
        thumb-label="always"
        hide-details
        class="mb-3"
      />
      <div v-if="priceRange[0] !== minPrice || priceRange[1] !== maxPrice" class="d-flex flex-wrap ga-2 mb-2">
        <v-chip
          closable
          color="secondary"
          variant="flat"
          size="small"
          @click:close="resetPriceRange"
        >
          Price: ${{ priceRange[0] }}-${{ priceRange[1] }}
        </v-chip>
      </div>
    </div>

    <div class="filter-section">
      <div class="section-title">Cruise nights</div>
      <v-range-slider
        v-model="nightsRange"
        :min="minNights"
        :max="maxNights"
        :step="1"
        color="primary"
        thumb-label="always"
        hide-details
        class="mb-3"
      />
      <div v-if="nightsRange[0] !== minNights || nightsRange[1] !== maxNights" class="d-flex flex-wrap ga-2">
        <v-chip
          closable
          color="secondary"
          variant="flat"
          size="small"
          @click:close="resetNightsRange"
        >
          Nights: {{ nightsRange[0] }}-{{ nightsRange[1] }}
        </v-chip>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: #164675;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

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
