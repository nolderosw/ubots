<template>
  <v-card>
    <v-card-title>
      Atendimentos
      <v-spacer />
      <v-chip class="ml-2" color="info">
        Total: {{ services.length }}
      </v-chip>
    </v-card-title>
    <v-card-text>
      <v-progress-linear
        v-if="loading"
        color="primary"
        indeterminate
      />
      <v-alert
        v-else-if="error"
        class="mb-4"
        type="error"
      >
        {{ error }}
      </v-alert>
      <v-alert
        v-else-if="services.length === 0"
        class="mb-4"
        type="info"
      >
        Nenhum Atendimento encontrado
      </v-alert>
      <template v-else>
        <v-list>
          <ServiceCard
            v-for="service in paginatedServices"
            :key="service.id"
            :service="service"
            @edit="emit('edit', $event)"
            @resolve="emit('resolve', $event)"
            @start="emit('start', $event)"
          />
        </v-list>
        <div v-if="totalPages > 1" class="mt-4 d-flex align-center justify-space-between flex-wrap">
          <div class="text-caption text-medium-emphasis">
            Mostrando {{ startItem }}-{{ endItem }} de {{ services.length }}
          </div>
          <v-pagination
            v-model="currentPage"
            density="comfortable"
            :length="totalPages"
            :total-visible="7"
          />
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import type { Service } from '@/types/service'
  import { computed, ref, watch } from 'vue'
  import ServiceCard from '@/components/molecules/ServiceCard.vue'

  const props = defineProps<{
    services: Service[]
    loading: boolean
    error: string | null
  }>()

  const emit = defineEmits<{
    start: [id: number]
    resolve: [id: number]
    edit: [service: Service]
  }>()

  const itemsPerPage = 10
  const currentPage = ref(1)

  watch(() => props.services, () => {
    currentPage.value = 1
  })

  const totalPages = computed(() => {
    return Math.ceil(props.services.length / itemsPerPage)
  })

  const paginatedServices = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return props.services.slice(start, end)
  })

  const startItem = computed(() => {
    return props.services.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1
  })

  const endItem = computed(() => {
    const end = currentPage.value * itemsPerPage
    return Math.min(end, props.services.length)
  })
</script>
