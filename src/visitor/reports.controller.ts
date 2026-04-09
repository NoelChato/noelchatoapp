import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { VisitorService } from './visitor.service';
import { ReportsQueryDto } from './dto/reports-query.dto';
import { ReportResponseDto } from './dto/report-response.dto';

@Controller('api/reports')
export class ReportsController {
  constructor(private readonly visitorService: VisitorService) {}

  @Get()
  async getReports(
    @Query() query: ReportsQueryDto,
  ): Promise<ReportResponseDto[]> {
    const status = query.status || 'all';
    const allowed = ['all', 'inside', 'out'];

    if (!allowed.includes(status)) {
      throw new BadRequestException('status must be all, inside or out');
    }

    if (query.from && Number.isNaN(Date.parse(query.from))) {
      throw new BadRequestException('Invalid from date');
    }

    if (query.to && Number.isNaN(Date.parse(query.to))) {
      throw new BadRequestException('Invalid to date');
    }

    return this.visitorService.getReports({
      from: query.from,
      to: query.to,
      status: status as 'all' | 'inside' | 'out',
    });
  }
}
