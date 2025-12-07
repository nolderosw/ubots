<template>
  <v-avatar :color="statusColor" size="40">
    <TypeIcon :type="type" />
  </v-avatar>
</template>

<script setup lang="ts">
  import type { ServiceStatus, ServiceType } from '@/types/service'
  import { computed } from 'vue'
  import TypeIcon from './TypeIcon.vue'

  const props = defineProps<{
    status: ServiceStatus
    type: ServiceType
  }>()

  const statusColor = computed(() => {
    switch (props.status) {
      case 'PEDING': {
        return 'warning'
      }
      case 'IN_PROGRESS': {
        return 'info'
      }
      case 'RESOLVED': {
        return 'success'
      }
      default: {
        return 'grey'
      }
    }
  })
</script>
