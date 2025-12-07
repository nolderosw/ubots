import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import {
  ServicesService,
  Service,
  VALID_TYPES,
  VALID_STATUSES,
} from './services.service';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos os serviços',
    description: 'Retorna uma lista de todos os serviços cadastrados',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de serviços retornada com sucesso',
    isArray: true,
  })
  getServices(): Service[] {
    return this.servicesService.getServices();
  }

  @Get(':status')
  @ApiOperation({
    summary: 'Filtrar serviços por status',
    description:
      'Retorna serviços filtrados por um status específico: PEDING, IN_PROGRESS ou RESOLVED',
  })
  @ApiParam({
    name: 'status',
    description: 'Status do serviço',
    enum: ['PEDING', 'IN_PROGRESS', 'RESOLVED'],
    example: 'IN_PROGRESS',
  })
  @ApiResponse({
    status: 200,
    description: 'Serviços encontrados',
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: 'Status inválido',
  })
  getServicesByStatus(
    @Param('status') status: 'PEDING' | 'IN_PROGRESS' | 'RESOLVED',
  ): Service[] {
    if (!VALID_STATUSES.includes(status as any)) {
      throw new HttpException('Status inválido', HttpStatus.BAD_REQUEST);
    }
    return this.servicesService.getServicesByStatus(status);
  }

  @Get(':status/:type')
  @ApiOperation({
    summary: 'Filtrar serviços por status e tipo',
    description: 'Retorna serviços filtrados por status e tipo simultaneamente',
  })
  @ApiParam({
    name: 'status',
    description: 'Status do serviço',
    enum: ['PEDING', 'IN_PROGRESS', 'RESOLVED'],
    example: 'IN_PROGRESS',
  })
  @ApiParam({
    name: 'type',
    description: 'Tipo de serviço',
    enum: ['CARD', 'LOAN', 'OTHER'],
    example: 'CARD',
  })
  @ApiResponse({
    status: 200,
    description: 'Serviços encontrados',
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: 'Status ou tipo inválido',
  })
  getServicesByStatusAndType(
    @Param('status') status: 'PEDING' | 'IN_PROGRESS' | 'RESOLVED',
    @Param('type') type: 'CARD' | 'LOAN' | 'OTHER',
  ): Service[] {
    if (!VALID_STATUSES.includes(status as any)) {
      throw new HttpException('Status inválido', HttpStatus.BAD_REQUEST);
    }
    if (!VALID_TYPES.includes(type as any)) {
      throw new HttpException('Tipo inválido', HttpStatus.BAD_REQUEST);
    }
    return this.servicesService.getServicesByStatusAndType(status, type);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar novo serviço',
    description:
      'Cria um novo serviço. Se o atendente tiver menos de 3 atendimentos, o serviço entra em IN_PROGRESS. Caso contrário, entra em PEDING (fila)',
  })
  @ApiBody({
    description: 'Dados necessários para criar um serviço',
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['CARD', 'LOAN', 'OTHER'],
          description: 'Tipo de serviço',
          example: 'CARD',
        },
        description: {
          type: 'string',
          description: 'Descrição do problema/solicitação',
          example: 'Cartão bloqueado',
        },
        customerId: {
          type: 'string',
          description: 'ID único do cliente',
          example: '1',
        },
      },
      required: ['type', 'description', 'customerId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Serviço criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou incompletos',
  })
  createService(
    @Body()
    createServiceDto: {
      type: 'CARD' | 'LOAN' | 'OTHER';
      description: string;
      customerId: string;
      startDate?: Date;
    },
  ): Service {
    const { type, description, customerId } = createServiceDto;

    if (!type || !VALID_TYPES.includes(type as any)) {
      throw new HttpException('Tipo inválido', HttpStatus.BAD_REQUEST);
    }
    if (!description || description.trim() === '') {
      throw new HttpException(
        'Descrição é obrigatória',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!customerId || customerId.trim() === '') {
      throw new HttpException(
        'ID do cliente é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.servicesService.createService(type, description, customerId);
  }

  @Patch('next/:type')
  @ApiOperation({
    summary: 'Obter próximo serviço pendente',
    description:
      'Retorna o próximo serviço pendente (em fila) de um tipo específico',
  })
  @ApiParam({
    name: 'type',
    description: 'Tipo de serviço',
    enum: ['CARD', 'LOAN', 'OTHER'],
    example: 'CARD',
  })
  @ApiResponse({
    status: 200,
    description: 'Serviço pendente encontrado',
  })
  @ApiResponse({
    status: 200,
    description: 'Nenhum serviço pendente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Nenhum serviço pendente para este tipo',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Tipo inválido',
  })
  getNextServiceByType(
    @Param('type') type: 'CARD' | 'LOAN' | 'OTHER',
  ): Service | { message: string } {
    if (!VALID_TYPES.includes(type as any)) {
      throw new HttpException('Tipo inválido', HttpStatus.BAD_REQUEST);
    }

    const nextService = this.servicesService.getNextServiceByType(type);

    if (!nextService) {
      return { message: 'Nenhum serviço pendente para este tipo' };
    }

    return nextService;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar serviço',
    description:
      'Atualiza dados de um serviço. Quando status muda para RESOLVED, o atendente fica disponível e o próximo da fila é atribuído automaticamente. IMPORTANTE: Não é possível atribuir ou transferir um serviço para um atendente que já possui 3 serviços em andamento (IN_PROGRESS).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do serviço',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    description: 'Campos a serem atualizados',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PEDING', 'IN_PROGRESS', 'RESOLVED'],
          example: 'RESOLVED',
        },
        description: {
          type: 'string',
          example: 'Cartão desbloqueado com sucesso',
        },
        attendantId: {
          type: 'number',
          description: 'ID do atendente (1=CARD, 2=LOAN, 3=OTHER)',
          example: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Serviço atualizado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido ou atendente já possui 3 serviços em andamento',
  })
  @ApiResponse({
    status: 404,
    description: 'Serviço não encontrado',
  })
  updateService(
    @Param('id') id: string,
    @Body() updateServiceDto: Partial<Service>,
  ): Service {
    const serviceId = parseInt(id, 10);
    if (isNaN(serviceId)) {
      throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
    }

    try {
      const updatedService = this.servicesService.updateService(
        serviceId,
        updateServiceDto,
      );

      if (!updatedService) {
        throw new HttpException('Serviço não encontrado', HttpStatus.NOT_FOUND);
      }

      return updatedService;
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }
}
