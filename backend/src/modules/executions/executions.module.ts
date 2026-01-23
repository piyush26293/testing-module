import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ExecutionsController } from './executions.controller';
import { ExecutionsService } from './executions.service';
import { ExecutionsProcessor } from './executions.processor';
import { TestExecution } from '../../database/entities/test-execution.entity';
import { ExecutionLog } from '../../database/entities/execution-log.entity';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestExecution, ExecutionLog]),
    BullModule.registerQueue({
      name: 'executions',
    }),
    ProjectsModule,
  ],
  controllers: [ExecutionsController],
  providers: [ExecutionsService, ExecutionsProcessor],
  exports: [ExecutionsService],
})
export class ExecutionsModule {}
