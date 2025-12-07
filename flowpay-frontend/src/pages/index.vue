<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <PageHeader />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <ServiceFilters
          :filters="filters"
          @next-pending="getNextPendingService"
          @refresh="loadServices"
          @update:filters="filters = $event"
        />
        <ServiceCreateForm
          :loading="creating"
          @submit="createService"
        />
      </v-col>

      <v-col cols="12" md="8">
        <ServiceList
          :error="error"
          :loading="loading"
          :services="services"
          @edit="openEditDialog"
          @resolve="updateServiceStatus($event, 'RESOLVED')"
          @start="updateServiceStatus($event, 'IN_PROGRESS')"
        />
      </v-col>
    </v-row>

    <ServiceEditDialog
      v-model="editDialog"
      :loading="updating"
      :service="editingService"
      @save="saveEdit"
    />
  </v-container>
</template>

<script setup lang="ts">
  import type { Service, ServiceStatus, ServiceType } from '@/types/service'
  import { onMounted, ref } from 'vue'
  import PageHeader from '@/components/organisms/PageHeader.vue'
  import ServiceCreateForm from '@/components/organisms/ServiceCreateForm.vue'
  import ServiceEditDialog from '@/components/organisms/ServiceEditDialog.vue'
  import ServiceFilters from '@/components/organisms/ServiceFilters.vue'
  import ServiceList from '@/components/organisms/ServiceList.vue'
  import { servicesApi } from '@/services/api'

  const services = ref<Service[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const creating = ref(false)
  const updating = ref(false)

  const filters = ref({
    status: null as ServiceStatus | null,
    type: null as ServiceType | null,
  })

  const editDialog = ref(false)
  const editingService = ref<Service | null>(null)

  async function loadServices () {
    loading.value = true
    error.value = null
    try {
      if (filters.value.status && filters.value.type) {
        services.value = await servicesApi.getServicesByStatusAndType(
          filters.value.status,
          filters.value.type,
        )
      } else if (filters.value.status) {
        services.value = await servicesApi.getServicesByStatus(filters.value.status)
      } else if (filters.value.type) {
        services.value = await servicesApi.getAllServices()
        services.value = services.value.filter(s => s.type === filters.value.type)
      } else {
        services.value = await servicesApi.getAllServices()
      }
    } catch (error_: any) {
      error.value = error_.response?.data?.message || error_.message || 'Erro ao carregar atendimentos'
      console.error(error_)
    } finally {
      loading.value = false
    }
  }

  async function createService (data: { type: ServiceType, description: string, customerId: string }) {
    creating.value = true
    error.value = null
    try {
      await servicesApi.createService(data)
      await loadServices()
    } catch (error_: any) {
      error.value = error_.response?.data?.message || error_.message || 'Erro ao criar atendimento'
      console.error(error_)
    } finally {
      creating.value = false
    }
  }

  async function updateServiceStatus (id: number, status: ServiceStatus) {
    updating.value = true
    error.value = null
    try {
      await servicesApi.updateService(id, { status })
      await loadServices()
    } catch (error_: any) {
      error.value = error_.response?.data?.message || error_.message || 'Erro ao atualizar atendimento'
      console.error(error_)
    } finally {
      updating.value = false
    }
  }

  function openEditDialog (service: Service) {
    editingService.value = service
    editDialog.value = true
  }

  async function saveEdit (service: Service) {
    updating.value = true
    error.value = null
    try {
      await servicesApi.updateService(service.id, {
        status: service.status,
        description: service.description,
      })
      editDialog.value = false
      await loadServices()
    } catch (error_: any) {
      error.value = error_.response?.data?.message || error_.message || 'Erro ao atualizar atendimento'
      console.error(error_)
    } finally {
      updating.value = false
    }
  }

  async function getNextPendingService () {
    if (!filters.value.type) {
      error.value = 'Selecione um tipo para buscar o próximo atendimento pendente'
      return
    }

    loading.value = true
    error.value = null
    try {
      const result = await servicesApi.getNextServiceByType(filters.value.type)
      if ('message' in result) {
        error.value = result.message
      } else {
        filters.value.status = 'PEDING'
        await loadServices()
      }
    } catch (error_: any) {
      error.value = error_.response?.data?.message || error_.message || 'Erro ao buscar próximo atendimento'
      console.error(error_)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadServices()
  })
</script>
