import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestCasesController } from './test-cases.controller';
import { TestCasesService } from './test-cases.service';
import { TestCase } from '../../database/entities/test-case.entity';
import { TestStep } from '../../database/entities/test-step.entity';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([TestCase, TestStep]), ProjectsModule],
  controllers: [TestCasesController],
  providers: [TestCasesService],
  exports: [TestCasesService],
})
export class TestCasesModule {}
