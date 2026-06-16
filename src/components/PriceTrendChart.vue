<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import type { CruiseDeparture } from '../types/cruise'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const props = defineProps<{
  cruises: CruiseDeparture[]
}>()

const monthLabels = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const chartData = computed(() => {
  const monthAverages = monthLabels.map((_, index) => {
    const month = index + 7
    const monthlyCruises = props.cruises.filter((cruise) => {
      const cruiseMonth = new Date(cruise.startDate).getMonth() + 1
      return cruiseMonth === month
    })

    if (monthlyCruises.length === 0) {
      return null
    }

    const sum = monthlyCruises.reduce((total, cruise) => total + cruise.pricePerPerson, 0)
    return Math.round(sum / monthlyCruises.length)
  })

  return {
    labels: monthLabels,
    datasets: [
      {
        label: 'Average Price Per Person',
        data: monthAverages,
        borderColor: '#135f9c',
        backgroundColor: 'rgba(68, 153, 225, 0.22)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#135f9c',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      labels: {
        color: '#1e4568',
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        color: 'rgba(19, 95, 156, 0.12)',
      },
      ticks: {
        callback(value: string | number) {
          return `$${value}`
        },
      },
    },
  },
}
</script>

<template>
  <div class="chart-wrap">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-wrap {
  min-height: 240px;
  border: 1px solid #d7e7f5;
  border-radius: 14px;
  padding: 12px;
  background: #ffffff;
}
</style>
