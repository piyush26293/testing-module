import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Report } from '../../database/entities/report.entity';
import { TestExecution } from '../../database/entities/test-execution.entity';
import { ProjectsModule } from '../projects/projects.module';
import { ExecutionsModule } from '../executions/executions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, TestExecution]),
    ProjectsModule,
    ExecutionsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
