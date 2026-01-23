import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestCase } from '../../database/entities/test-case.entity';
import { TestStep } from '../../database/entities/test-step.entity';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto } from './dto/update-test-case.dto';
import { TestStepDto } from './dto/test-step.dto';
import { TestCaseFiltersDto } from './dto/test-case-filters.dto';
import { PaginatedResult, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class TestCasesService {
  constructor(
    @InjectRepository(TestCase)
    private readonly testCaseRepository: Repository<TestCase>,
    @InjectRepository(TestStep)
    private readonly testStepRepository: Repository<TestStep>,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(createTestCaseDto: CreateTestCaseDto, userId: string): Promise<TestCase> {
    const hasAccess = await this.projectsService.hasAccess(createTestCaseDto.projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const { steps, ...testCaseData } = createTestCaseDto;

    const testCase = this.testCaseRepository.create({
      ...testCaseData,
      createdBy: userId,
    });

    const savedTestCase = await this.testCaseRepository.save(testCase);

    if (steps && steps.length > 0) {
      const testSteps = steps.map((step) =>
        this.testStepRepository.create({
          ...step,
          testCaseId: savedTestCase.id,
        }),
      );
      await this.testStepRepository.save(testSteps);
    }

    return this.findOne(savedTestCase.id, userId);
  }

  async findAll(filters: TestCaseFiltersDto, userId: string): Promise<PaginatedResult<TestCase>> {
    const {
      page = 1,
      limit = 10,
      projectId,
      suiteId,
      status,
      priority,
      tags,
      search,
      isAiGenerated,
    } = filters;
    const skip = (page - 1) * limit;

    if (projectId) {
      const hasAccess = await this.projectsService.hasAccess(projectId, userId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this project');
      }
    }

    const queryBuilder = this.testCaseRepository
      .createQueryBuilder('testCase')
      .leftJoinAndSelect('testCase.project', 'project')
      .leftJoinAndSelect('testCase.suite', 'suite')
      .leftJoinAndSelect('testCase.createdByUser', 'createdByUser')
      .loadRelationCountAndMap('testCase.stepsCount', 'testCase.steps')
      .where('testCase.deletedAt IS NULL');

    if (projectId) {
      queryBuilder.andWhere('testCase.projectId = :projectId', { projectId });
    }

    if (suiteId) {
      queryBuilder.andWhere('testCase.suiteId = :suiteId', { suiteId });
    }

    if (status) {
      queryBuilder.andWhere('testCase.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('testCase.priority = :priority', { priority });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('testCase.tags && :tags', { tags });
    }

    if (search) {
      queryBuilder.andWhere('(testCase.name ILIKE :search OR testCase.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (isAiGenerated !== undefined) {
      queryBuilder.andWhere('testCase.isAiGenerated = :isAiGenerated', { isAiGenerated });
    }

    queryBuilder.orderBy('testCase.createdAt', 'DESC').skip(skip).take(limit);

    const [testCases, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(testCases, total, page, limit);
  }

  async findOne(id: string, userId: string): Promise<TestCase> {
    const testCase = await this.testCaseRepository.findOne({
      where: { id },
      relations: ['project', 'suite', 'createdByUser', 'steps'],
      order: {
        steps: {
          orderIndex: 'ASC',
        },
      },
    });

    if (!testCase) {
      throw new NotFoundException('Test case not found');
    }

    const hasAccess = await this.projectsService.hasAccess(testCase.projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this test case');
    }

    return testCase;
  }

  async update(
    id: string,
    updateTestCaseDto: UpdateTestCaseDto,
    userId: string,
  ): Promise<TestCase> {
    const testCase = await this.testCaseRepository.findOne({ where: { id } });

    if (!testCase) {
      throw new NotFoundException('Test case not found');
    }

    const hasAccess = await this.projectsService.hasAccess(testCase.projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this test case');
    }

    Object.assign(testCase, updateTestCaseDto);

    return this.testCaseRepository.save(testCase);
  }

  async remove(id: string, userId: string): Promise<void> {
    const testCase = await this.testCaseRepository.findOne({ where: { id } });

    if (!testCase) {
      throw new NotFoundException('Test case not found');
    }

    const hasAccess = await this.projectsService.hasAccess(testCase.projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this test case');
    }

    await this.testCaseRepository.softDelete(id);
  }

  async updateSteps(testCaseId: string, steps: TestStepDto[], userId: string): Promise<TestStep[]> {
    const testCase = await this.testCaseRepository.findOne({ where: { id: testCaseId } });

    if (!testCase) {
      throw new NotFoundException('Test case not found');
    }

    const hasAccess = await this.projectsService.hasAccess(testCase.projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this test case');
    }

    await this.testStepRepository.delete({ testCaseId });

    if (steps && steps.length > 0) {
      const testSteps = steps.map((step) =>
        this.testStepRepository.create({
          ...step,
          testCaseId,
        }),
      );
      return this.testStepRepository.save(testSteps);
    }

    return [];
  }

  async duplicate(id: string, userId: string): Promise<TestCase> {
    const originalTestCase = await this.findOne(id, userId);

    if (!originalTestCase) {
      throw new NotFoundException('Test case not found');
    }

    const hasAccess = await this.projectsService.hasAccess(originalTestCase.projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this test case');
    }

    const {
      id: _originalId,
      steps,
      createdByUser: _createdByUser,
      project: _project,
      suite: _suite,
      executions: _executions,
      aiGeneratedTests: _aiGeneratedTests,
      ...testCaseData
    } = originalTestCase;

    const duplicatedTestCase = this.testCaseRepository.create({
      ...testCaseData,
      name: `${originalTestCase.name} (Copy)`,
      createdBy: userId,
      version: 1,
    });

    const savedTestCase = await this.testCaseRepository.save(duplicatedTestCase);

    if (steps && steps.length > 0) {
      const duplicatedSteps = steps.map(
        ({
          id: _stepId,
          testCase: _stepTestCase,
          executionLogs: _executionLogs,
          selfHealingRecords: _selfHealingRecords,
          ...stepData
        }) =>
          this.testStepRepository.create({
            ...stepData,
            testCaseId: savedTestCase.id,
          }),
      );
      await this.testStepRepository.save(duplicatedSteps);
    }

    return this.findOne(savedTestCase.id, userId);
  }
}
