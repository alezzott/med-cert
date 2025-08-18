import {
  Controller,
  Get,
  Query,
  Inject,
  BadRequestException,
  BadGatewayException,
  LoggerService,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/infra/guards/jwt-auth.guard';
import { OmsService } from '../application/oms.service';
import { CidResponseDto } from '../dto/oms-response.dto';
import { ApiTags } from '@nestjs/swagger';
import { SearchCidSwagger } from '../docs/cid.swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerExceptionFilter } from './rate-limiting.filter';

@ApiTags('cid')
@Controller('cid')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@UseFilters(ThrottlerExceptionFilter)
export class CidController {
  constructor(
    private readonly omsService: OmsService,
    @Inject('Logger') private readonly logger: LoggerService,
  ) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Get('search')
  @SearchCidSwagger
  async searchCid(
    @Query('term') term: string,
    @Query('locale') locale?: string,
  ): Promise<CidResponseDto[]> {
    this.logger.log(`Busca CID por termo: ${term}`, 'CidController');
    if (!term || term.trim() === '') {
      this.logger.warn('Termo obrigatório não informado', 'CidController');
      throw new BadRequestException('Termo obrigatório');
    }
    try {
      return await this.omsService.searchCid(term, locale);
    } catch (error) {
      this.logger.error(
        `Erro ao buscar CID por termo: ${error}`,
        'CidController',
      );
      throw new BadGatewayException('Falha ao buscar CID na OMS');
    }
  }
}
