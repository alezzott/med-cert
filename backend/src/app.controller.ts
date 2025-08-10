import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './auth/infra/guards/jwt-auth.guard';
import { AppService } from './app.service';
import { Request as ExpressRequest } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtected(@Request() req: ExpressRequest): any {
    return { message: 'Rota protegida acessada!', user: req.user };
  }
}
