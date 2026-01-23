import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestSuitesService } from './test-suites.service';
import { TestSuitesController } from './test-suites.controller';
import { TestSuite } from '../../database/entities/test-suite.entity';
import { Project } from '../../database/entities/project.entity';
import { User } from '../../database/entities/user.entity';
import { ProjectMember } from '../../database/entities/project-member.entity';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([TestSuite, Project, User, ProjectMember]), ProjectsModule],
  controllers: [TestSuitesController],
  providers: [TestSuitesService],
  exports: [TestSuitesService],
})
export class TestSuitesModule {}
