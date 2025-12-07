<template>
  <v-card class="mt-4">
    <v-card-title>Novo Atendimento</v-card-title>
    <v-card-text>
      <v-form ref="formRef" @submit.prevent="handleSubmit">
        <v-select
          v-model="formData.type"
          :items="typeOptions"
          label="Tipo *"
          prepend-inner-icon="mdi-tag"
          :rules="[rules.required]"
        />
        <v-textarea
          v-model="formData.description"
          class="mt-2"
          label="Descrição *"
          prepend-inner-icon="mdi-text"
          rows="3"
          :rules="[rules.required]"
        />
        <v-text-field
          v-model="formData.customerId"
          class="mt-2"
          label="ID do Cliente *"
          prepend-inner-icon="mdi-account"
          :rules="[rules.required]"
        />
        <v-btn
          block
          class="mt-4"
          color="primary"
          :loading="loading"
          type="submit"
        >
          <v-icon start>mdi-plus</v-icon>
          Criar Atendimento
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import type { ServiceType } from '@/types/service'
  import { ref } from 'vue'

  const props = defineProps<{
    loading: boolean
  }>()

  const emit = defineEmits<{
    submit: [data: { type: ServiceType, description: string, customerId: string }]
  }>()

  const formRef = ref()
  const formData = ref({
    type: '' as ServiceType | '',
    description: '',
    customerId: '',
  })

  const typeOptions = [
    { title: 'Cartão', value: 'CARD' },
    { title: 'Empréstimo', value: 'LOAN' },
    { title: 'Outros', value: 'OTHER' },
  ]

  const rules = {
    required: (value: any) => !!value || 'Campo obrigatório',
  }

  async function handleSubmit () {
    const { valid } = await formRef.value.validate()
    if (!valid) return

    emit('submit', {
      type: formData.value.type as ServiceType,
      description: formData.value.description,
      customerId: formData.value.customerId,
    })

    formData.value = {
      type: '' as ServiceType | '',
      description: '',
      customerId: '',
    }
    formRef.value.reset()
  }
</script>
