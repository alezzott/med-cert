import {
  Controller,
  Get,
  Query,
  Inject,
  BadRequestException,
  BadGatewayException,
  LoggerService,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/infra/guards/jwt-auth.guard';
import { OmsService } from '../application/oms.service';
import { CidResponseDto } from '../dto/oms-response.dto';

@Controller('cid')
@UseGuards(JwtAuthGuard)
export class CidController {
  constructor(
    private readonly omsService: OmsService,
    @Inject('Logger') private readonly logger: LoggerService,
  ) {}

  @Get('search')
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
