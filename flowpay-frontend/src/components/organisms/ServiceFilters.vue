<!-- eslint-disable vue/custom-event-name-casing -->
<template>
  <v-card>
    <v-card-title>Filtros</v-card-title>
    <v-card-text>
      <FilterSelect
        icon="mdi-filter"
        :items="statusOptions"
        label="Status"
        :model-value="filters.status"
        @update:model-value="updateStatus"
      />
      <FilterSelect
        icon="mdi-tag"
        :items="typeOptions"
        label="Tipo"
        :model-value="filters.type"
        @update:model-value="updateType"
      />
      <v-btn
        block
        class="mt-4"
        color="primary"
        @click="emit('refresh')"
      >
        <v-icon start>mdi-refresh</v-icon>
        Atualizar Lista
      </v-btn>
      <v-btn
        block
        class="mt-2"
        color="success"
        :disabled="!filters.type"
        @click="emit('nextPending')"
      >
        <v-icon start>mdi-arrow-down-circle</v-icon>
        Próximo Pendente
      </v-btn>
      <v-alert
        v-if="!filters.type"
        class="mt-2"
        density="compact"
        type="info"
      >
        Selecione um tipo para buscar o próximo pendente
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import type { ServiceStatus, ServiceType } from '@/types/service'
  import { computed } from 'vue'
  import FilterSelect from '@/components/molecules/FilterSelect.vue'

  const props = defineProps<{
    filters: {
      status: ServiceStatus | null
      type: ServiceType | null
    }
  }>()

  const emit = defineEmits<{
    'update:filters': [filters: { status: ServiceStatus | null, type: ServiceType | null }]
    'refresh': []
    'nextPending': []
  }>()

  const statusOptions = [
    { title: 'Pendente', value: 'PEDING' },
    { title: 'Em Progresso', value: 'IN_PROGRESS' },
    { title: 'Resolvido', value: 'RESOLVED' },
  ]

  const typeOptions = [
    { title: 'Cartão', value: 'CARD' },
    { title: 'Empréstimo', value: 'LOAN' },
    { title: 'Outros', value: 'OTHER' },
  ]

  function updateStatus (value: string | null) {
    emit('update:filters', {
      ...props.filters,
      status: value as ServiceStatus | null,
    })
  }

  function updateType (value: string | null) {
    emit('update:filters', {
      ...props.filters,
      type: value as ServiceType | null,
    })
  }
</script>
