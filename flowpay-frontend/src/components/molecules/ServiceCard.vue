<template>
  <v-list-item class="mb-2">
    <template #prepend>
      <ServiceAvatar :status="service.status" :type="service.type" />
    </template>
    <v-list-item-title>
      <strong>#{{ service.id }}</strong> - {{ service.description }}
    </v-list-item-title>
    <v-list-item-subtitle>
      Cliente: {{ service.customerId }} |
      Tipo: {{ typeLabel }} |
      Status: {{ statusLabel }}
      <span v-if="service.attendantId">
        | Atendente: {{ service.attendantId }}
      </span>
    </v-list-item-subtitle>
    <template #append>
      <ServiceActionsMenu
        :service="service"
        @start="emit('start', service.id)"
        @resolve="emit('resolve', service.id)"
        @edit="emit('edit', service)"
      />
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Service } from '@/types/service'
import ServiceAvatar from '@/components/atoms/ServiceAvatar.vue'
import ServiceActionsMenu from './ServiceActionsMenu.vue'

const props = defineProps<{
  service: Service
}>()

const emit = defineEmits<{
  start: [id: number]
  resolve: [id: number]
  edit: [service: Service]
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

const statusLabel = computed(() => {
  const option = statusOptions.find(opt => opt.value === props.service.status)
  return option?.title || props.service.status
})

const typeLabel = computed(() => {
  const option = typeOptions.find(opt => opt.value === props.service.type)
  return option?.title || props.service.type
})
</script>

