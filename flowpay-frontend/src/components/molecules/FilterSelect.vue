<template>
  <v-select
    clearable
    :items="items"
    :label="label"
    :model-value="modelValue"
    :prepend-inner-icon="icon"
    @update:model-value="updateValue"
  />
</template>

<script setup lang="ts">
  defineProps<{
    modelValue: string | null
    items: Array<{ title: string, value: string }>
    label: string
    icon: string
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: string | null]
  }>()

  function updateValue (value: string | null) {
    emit('update:modelValue', value)
  }
</script>
