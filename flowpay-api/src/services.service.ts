import { Injectable } from '@nestjs/common';

export type Service = {
  id: number;
  status: 'PEDING' | 'IN_PROGRESS' | 'RESOLVED';
  type: 'CARD' | 'LOAN' | 'OTHER';
  description: string;
  customerId: string;
  attendantId: number;
  createdAt: Date;
  startDate: Date | null;
  endDate: Date | null;
};

export const VALID_TYPES = ['CARD', 'LOAN', 'OTHER'] as const;
export const VALID_STATUSES = ['PEDING', 'IN_PROGRESS', 'RESOLVED'] as const;
export const ATTENDANT_IDS = {
  CARD: 1,
  LOAN: 2,
  OTHER: 3,
} as const;

@Injectable()
export class ServicesService {
  private services: Service[] = [];
  private nextId: number = 1;
  private attendantWorkload: { [attendantId: number]: number } = {};
  private readonly MAX_CONCURRENT_SERVICES = 3;

  getServices(): Service[] {
    return [...this.services].sort((a, b) => b.id - a.id);
  }

  getServicesByStatus(
    status: 'PEDING' | 'IN_PROGRESS' | 'RESOLVED',
  ): Service[] {
    return this.services
      .filter((service) => service.status === status)
      .sort((a, b) => b.id - a.id);
  }

  getServicesByType(type: 'CARD' | 'LOAN' | 'OTHER'): Service[] {
    return this.services
      .filter((service) => service.type === type)
      .sort((a, b) => b.id - a.id);
  }

  getServicesByStatusAndType(
    status: 'PEDING' | 'IN_PROGRESS' | 'RESOLVED',
    type: 'CARD' | 'LOAN' | 'OTHER',
  ): Service[] {
    return this.services
      .filter((service) => service.status === status && service.type === type)
      .sort((a, b) => b.id - a.id);
  }

  getServiceById(id: number): Service | undefined {
    return this.services.find((service) => service.id === id);
  }

  createService(
    type: 'CARD' | 'LOAN' | 'OTHER',
    description: string,
    customerId: string,
  ): Service {
    const attendantId = ATTENDANT_IDS[type];
    const currentWorkload = this.getAttendantCurrentWorkload(attendantId);

    const newService: Service = {
      id: this.nextId++,
      status:
        currentWorkload < this.MAX_CONCURRENT_SERVICES
          ? 'IN_PROGRESS'
          : 'PEDING',
      type,
      description,
      customerId,
      attendantId,
      createdAt: new Date(),
      startDate:
        currentWorkload < this.MAX_CONCURRENT_SERVICES ? new Date() : null,
      endDate: null,
    };
    this.services.push(newService);

    if (currentWorkload < this.MAX_CONCURRENT_SERVICES) {
      this.updateAttendantWorkload(attendantId);
    }

    return newService;
  }

  updateService(id: number, updateData: Partial<Service>): Service | undefined {
    const service = this.getServiceById(id);
    if (!service) return undefined;

    const currentStatus = service.status;
    const currentAttendantId = service.attendantId;
    const newStatus = updateData.status ?? currentStatus;
    const newAttendantId = updateData.attendantId ?? currentAttendantId;

    if (newStatus === 'IN_PROGRESS') {
      let currentWorkload = this.getAttendantCurrentWorkload(newAttendantId);
      
      const isServiceAlreadyCounted = 
        currentStatus === 'IN_PROGRESS' && 
        currentAttendantId === newAttendantId;
      
      if (!isServiceAlreadyCounted) {
        if (currentWorkload >= this.MAX_CONCURRENT_SERVICES) {
          throw new Error(
            `Não é possível atribuir este serviço ao atendente ${newAttendantId}. O atendente já possui ${currentWorkload} serviços em andamento (máximo: ${this.MAX_CONCURRENT_SERVICES}).`
          );
        }
      }
      
      if (newAttendantId !== currentAttendantId && currentStatus === 'IN_PROGRESS') {
        if (currentWorkload >= this.MAX_CONCURRENT_SERVICES) {
          throw new Error(
            `Não é possível transferir este serviço para o atendente ${newAttendantId}. O atendente já possui ${currentWorkload} serviços em andamento (máximo: ${this.MAX_CONCURRENT_SERVICES}).`
          );
        }
      }
    }

    if (newStatus === 'IN_PROGRESS' && currentStatus === 'PEDING') {
      updateData.startDate = new Date();
      this.updateAttendantWorkload(newAttendantId);
    }

    if (newStatus === 'RESOLVED' && currentStatus !== 'RESOLVED') {
      updateData.endDate = new Date();
      this.releaseAttendantWorkload(currentAttendantId);
      this.assignQueuedService(service.type);
    }

    if (newAttendantId !== currentAttendantId && currentStatus === 'IN_PROGRESS') {
      this.releaseAttendantWorkload(currentAttendantId);
      if (newStatus === 'IN_PROGRESS') {
        this.updateAttendantWorkload(newAttendantId);
      }
    }

    if (currentStatus === 'IN_PROGRESS' && newStatus !== 'IN_PROGRESS' && newStatus !== 'RESOLVED') {
      this.releaseAttendantWorkload(currentAttendantId);
      this.assignQueuedService(service.type);
    }

    Object.assign(service, updateData, {
      id: service.id,
      createdAt: service.createdAt,
    });
    return service;
  }

  getNextServiceByType(type: 'CARD' | 'LOAN' | 'OTHER'): Service | undefined {
    const pendingServices = this.services.filter(
      (service) => service.status === 'PEDING' && service.type === type,
    );

    if (pendingServices.length === 0) return undefined;

    return pendingServices[0];
  }

  private updateAttendantWorkload(attendantId: number): void {
    const id = Number(attendantId);
    this.attendantWorkload[id] = (this.attendantWorkload[id] || 0) + 1;
  }

  private releaseAttendantWorkload(attendantId: number): void {
    const id = Number(attendantId);
    if (this.attendantWorkload[id]) {
      this.attendantWorkload[id]--;
    }
  }

  private assignQueuedService(type: 'CARD' | 'LOAN' | 'OTHER'): void {
    const attendantId = ATTENDANT_IDS[type];
    const currentWorkload = this.getAttendantCurrentWorkload(attendantId);

    if (currentWorkload < this.MAX_CONCURRENT_SERVICES) {
      const queuedService = this.getNextServiceByType(type);
      if (queuedService) {
        queuedService.status = 'IN_PROGRESS';
        queuedService.startDate = new Date();
        this.updateAttendantWorkload(attendantId);
      }
    }
  }

  private getAttendantCurrentWorkload(attendantId: number): number {
    return this.services.filter(
      (service) =>
        service.attendantId === attendantId &&
        service.status === 'IN_PROGRESS',
    ).length;
  }
}
