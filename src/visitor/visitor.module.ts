import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitorService } from './visitor.service';
import { VisitorController } from './visitor.controller';
import { ReportsController } from './reports.controller';
import { VisitorEntity } from '../entities/visitor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VisitorEntity])],
  providers: [VisitorService],
  controllers: [VisitorController, ReportsController],
  exports: [VisitorService],
})
export class VisitorModule {}
