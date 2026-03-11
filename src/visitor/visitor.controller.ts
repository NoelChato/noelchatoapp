import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { VisitorService } from './visitor.service';
import type { Visitor } from './visitor.interface';
import { VisitorEntity } from '../entities/visitor.entity';

@Controller('api/visitors')
export class VisitorController {
  constructor(private readonly service: VisitorService) {}

  @Post()
  async create(
    @Body() body: Omit<Visitor, 'id' | 'timeOut'>,
  ): Promise<VisitorEntity> {
    return this.service.create(body);
  }

  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('date') date?: string,
  ): Promise<VisitorEntity[]> {
    if (name || date) {
      return this.service.search(name, date);
    }
    return this.service.findAll();
  }

  @Put(':id/timeout')
  async setTimeout(
    @Param('id') id: string,
    @Body('timeOut') timeOut: string,
  ): Promise<VisitorEntity> {
    return this.service.updateTimeout(Number(id), timeOut);
  }

  @Get('reports/daily')
  async dailyReport(@Query('date') date: string): Promise<VisitorEntity[]> {
    return this.service.reportByDate(date);
  }
}
