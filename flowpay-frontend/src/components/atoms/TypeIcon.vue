<template>
  <v-icon color="white" :icon="icon" />
</template>

<script setup lang="ts">
  import type { ServiceType } from '@/types/service'
  import { computed } from 'vue'

  const props = defineProps<{
    type: ServiceType
  }>()

  const icon = computed(() => {
    switch (props.type) {
      case 'CARD': {
        return 'mdi-credit-card'
      }
      case 'LOAN': {
        return 'mdi-cash'
      }
      case 'OTHER': {
        return 'mdi-help-circle'
      }
      default: {
        return 'mdi-help'
      }
    }
  })
</script>
