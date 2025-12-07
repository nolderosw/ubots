<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <v-btn
        icon
        variant="text"
        v-bind="menuProps"
      >
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-if="service.status !== 'IN_PROGRESS'"
        @click="emit('start')"
      >
        <v-list-item-title>
          <v-icon start>mdi-play</v-icon>
          Iniciar Atendimento
        </v-list-item-title>
      </v-list-item>
      <v-list-item
        v-if="service.status !== 'RESOLVED'"
        @click="emit('resolve')"
      >
        <v-list-item-title>
          <v-icon start>mdi-check</v-icon>
          Resolver
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="emit('edit')">
        <v-list-item-title>
          <v-icon start>mdi-pencil</v-icon>
          Editar
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import type { Service } from '@/types/service'

defineProps<{
  service: Service
}>()

const emit = defineEmits<{
  start: []
  resolve: []
  edit: []
}>()
</script>

