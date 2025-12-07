<template>
  <v-dialog max-width="500" :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>Editar Atendimento #{{ service?.id }}</v-card-title>
      <v-card-text>
        <v-form v-if="editingService" ref="formRef" @submit.prevent="handleSave">
          <v-select
            v-model="editingService.status"
            :items="statusOptions"
            label="Status"
            prepend-inner-icon="mdi-filter"
          />
          <v-textarea
            v-model="editingService.description"
            class="mt-2"
            label="Descrição"
            prepend-inner-icon="mdi-text"
            rows="3"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="emit('update:modelValue', false)">Cancelar</v-btn>
        <v-btn color="primary" :loading="loading" @click="handleSave">
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { Service } from '@/types/service'
  import { ref, watch } from 'vue'

  const props = defineProps<{
    modelValue: boolean
    service: Service | null
    loading: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'save': [service: Service]
  }>()

  const formRef = ref()
  const editingService = ref<Service | null>(null)

  const statusOptions = [
    { title: 'Pendente', value: 'PEDING' },
    { title: 'Em Progresso', value: 'IN_PROGRESS' },
    { title: 'Resolvido', value: 'RESOLVED' },
  ]

  watch(() => props.service, newService => {
    if (newService) {
      editingService.value = { ...newService }
    }
  }, { immediate: true })

  function handleSave () {
    if (!editingService.value) return
    emit('save', editingService.value)
  }
</script>
