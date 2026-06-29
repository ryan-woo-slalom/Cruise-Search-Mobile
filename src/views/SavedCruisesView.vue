<script setup lang="ts">
import { computed } from 'vue'
import { useSavedCruises } from '../composables/useSavedCruises'

const { savedCruises, removeSavedCruise, clearSavedCruises } = useSavedCruises()

const hasSavedCruises = computed(() => savedCruises.value.length > 0)

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function formatDate(date: string): string {
  return dateFormatter.format(new Date(date))
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function resolvedSavedImage(imageUrl: string): string {
  if (imageUrl?.includes('source.unsplash.com')) {
    return '/images/default.svg'
  }

  if (imageUrl?.startsWith('/images/') || imageUrl?.startsWith('http://') || imageUrl?.startsWith('https://')) {
    return imageUrl
  }

  return '/images/default.svg'
}
</script>

<template>
  <v-container fluid class="pa-3 pa-sm-5 pa-md-8 saved-page">
    <v-card rounded="xl" class="saved-header mb-5" elevation="0">
      <v-card-text class="py-6 py-md-7 px-4 px-sm-5 px-md-7 d-flex flex-wrap align-center ga-3">
        <div>
          <p class="text-overline mb-1">Saved Cruises</p>
          <h1 class="text-h5 text-md-h4 mb-0">Your saved cruise configurations</h1>
          <p class="text-body-2 text-medium-emphasis mb-0 mt-1">
            {{ savedCruises.length }} saved {{ savedCruises.length === 1 ? 'cruise' : 'cruises' }}
          </p>
        </div>
        <v-spacer />
        <v-btn
          v-if="hasSavedCruises"
          variant="outlined"
          color="secondary"
          prepend-icon="mdi-delete-outline"
          @click="clearSavedCruises"
        >
          Clear all
        </v-btn>
      </v-card-text>
    </v-card>

    <v-alert v-if="!hasSavedCruises" type="info" variant="tonal" border="start" class="rounded-xl">
      No saved cruises yet. Use Quick View and click Save cruise to add one.
    </v-alert>

    <v-row v-else>
      <v-col v-for="item in savedCruises" :key="item.id" cols="12" md="6">
        <v-card rounded="xl" class="saved-card" elevation="2">
          <v-img :src="resolvedSavedImage(item.imageUrl)" height="180" cover />
          <v-card-text class="pa-4 pa-sm-5">
            <div class="d-flex justify-space-between ga-3 align-start mb-2">
              <div>
                <h2 class="text-h6 mb-1">{{ item.itineraryName }}</h2>
                <p class="text-caption text-medium-emphasis mb-0">{{ item.shipName }}</p>
              </div>
              <v-chip size="small" color="primary" variant="flat">{{ item.nights }} nights</v-chip>
            </div>

            <p class="text-caption mb-2">{{ item.itineraryMap }}</p>
            <p class="text-caption text-medium-emphasis mb-3">
              {{ formatDate(item.startDate) }} to {{ formatDate(item.endDate) }}
            </p>

            <v-sheet rounded="lg" class="pa-3 summary-shell mb-3">
              <div class="text-caption font-weight-medium mb-2">Saved configuration</div>
              <div v-for="(room, index) in item.staterooms" :key="`${item.id}-${index}`" class="text-caption mb-1">
                Stateroom {{ index + 1 }}: {{ room.adults }} Adults, {{ room.children }} Children • {{ room.stateroomType }}
              </div>
            </v-sheet>

            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>Total</span>
              <strong>{{ formatCurrency(item.totalPrice) }}</strong>
            </div>
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>Per stateroom</span>
              <strong>{{ formatCurrency(item.pricePerStateroom) }}</strong>
            </div>
            <div class="d-flex justify-space-between text-body-2">
              <span>Per person</span>
              <strong>{{ formatCurrency(item.pricePerPerson) }}</strong>
            </div>
          </v-card-text>
          <v-card-actions class="px-4 pb-4 px-sm-5 pb-sm-5">
            <v-spacer />
            <v-btn variant="text" color="secondary" prepend-icon="mdi-delete-outline" @click="removeSavedCruise(item.id)">
              Remove
            </v-btn>
            <v-btn color="primary" variant="flat">Book now</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.saved-page {
  background: linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
}

.saved-header {
  background: linear-gradient(145deg, #ffffff 0%, #eef6ff 100%);
  border: 1px solid #d3e3f3;
}

.saved-card {
  border: 1px solid #d8e5f1;
}

.summary-shell {
  background: #f7fbff;
  border: 1px solid #dce8f4;
}
</style>
