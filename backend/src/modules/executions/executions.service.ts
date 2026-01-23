import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { TestExecution, ExecutionStatus } from '../../database/entities/test-execution.entity';
import { ExecutionLog } from '../../database/entities/execution-log.entity';
import { ProjectsService } from '../projects/projects.service';
import { CreateExecutionDto } from './dto/create-execution.dto';
import { UpdateExecutionStatusDto } from './dto/update-execution-status.dto';
import { ExecutionFiltersDto } from './dto/execution-filters.dto';
import { ExecutionLogDto } from './dto/execution-log.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { createPaginatedResponse } from '../../common/utils/helpers';

@Injectable()
export class ExecutionsService {
  constructor(
    @InjectRepository(TestExecution)
    private readonly executionRepository: Repository<TestExecution>,
    @InjectRepository(ExecutionLog)
    private readonly executionLogRepository: Repository<ExecutionLog>,
    private readonly projectsService: ProjectsService,
    @InjectQueue('executions')
    private readonly executionQueue: Queue,
  ) {}

  async create(createDto: CreateExecutionDto, userId: string): Promise<TestExecution> {
    const hasAccess = await this.projectsService.hasAccess(createDto.projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    if (!createDto.testCaseId && !createDto.suiteId) {
      throw new BadRequestException('Either testCaseId or suiteId must be provided');
    }

    const execution = this.executionRepository.create({
      ...createDto,
      status: ExecutionStatus.PENDING,
      triggeredBy: userId,
    });

    const savedExecution = await this.executionRepository.save(execution);

    await this.executionQueue.add('execute-test', {
      executionId: savedExecution.id,
    });

    return this.executionRepository.findOne({
      where: { id: savedExecution.id },
      relations: ['project', 'testCase', 'suite', 'triggeredByUser'],
    });
  }

  async findAll(
    filters: ExecutionFiltersDto,
    userId: string,
  ): Promise<PaginatedResult<TestExecution>> {
    const { page = 1, limit = 10, projectId, testCaseId, suiteId, status, trigger, browser, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    if (projectId) {
      const hasAccess = await this.projectsService.hasAccess(projectId, userId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this project');
      }
    }

    const queryBuilder = this.executionRepository
      .createQueryBuilder('execution')
      .leftJoinAndSelect('execution.project', 'project')
      .leftJoinAndSelect('execution.testCase', 'testCase')
      .leftJoinAndSelect('execution.suite', 'suite')
      .leftJoinAndSelect('execution.triggeredByUser', 'triggeredByUser')
      .leftJoin('project.members', 'member')
      .where('member.userId = :userId', { userId });

    if (projectId) {
      queryBuilder.andWhere('execution.projectId = :projectId', { projectId });
    }

    if (testCaseId) {
      queryBuilder.andWhere('execution.testCaseId = :testCaseId', { testCaseId });
    }

    if (suiteId) {
      queryBuilder.andWhere('execution.suiteId = :suiteId', { suiteId });
    }

    if (status) {
      queryBuilder.andWhere('execution.status = :status', { status });
    }

    if (trigger) {
      queryBuilder.andWhere('execution.trigger = :trigger', { trigger });
    }

    if (browser) {
      queryBuilder.andWhere('execution.browser = :browser', { browser });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('execution.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('execution.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('execution.createdAt <= :endDate', { endDate });
    }

    queryBuilder
      .orderBy('execution.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [executions, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(executions, total, page, limit);
  }

  async findOne(id: string, userId: string): Promise<TestExecution> {
    const execution = await this.executionRepository.findOne({
      where: { id },
      relations: ['project', 'testCase', 'suite', 'triggeredByUser', 'logs'],
    });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    const hasAccess = await this.projectsService.hasAccess(execution.projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this execution');
    }

    return execution;
  }

  async updateStatus(
    id: string,
    updateDto: UpdateExecutionStatusDto,
  ): Promise<TestExecution> {
    const execution = await this.executionRepository.findOne({ where: { id } });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    execution.status = updateDto.status;

    if (updateDto.status === ExecutionStatus.RUNNING && !execution.startedAt) {
      execution.startedAt = new Date();
    }

    if (
      [ExecutionStatus.PASSED, ExecutionStatus.FAILED, ExecutionStatus.ERROR, ExecutionStatus.SKIPPED].includes(
        updateDto.status,
      )
    ) {
      execution.completedAt = new Date();
      if (execution.startedAt) {
        execution.durationMs = updateDto.durationMs || 
          new Date().getTime() - execution.startedAt.getTime();
      }
    }

    if (updateDto.errorMessage) {
      execution.errorMessage = updateDto.errorMessage;
    }

    if (updateDto.stackTrace) {
      execution.stackTrace = updateDto.stackTrace;
    }

    return this.executionRepository.save(execution);
  }

  async remove(id: string, userId: string): Promise<void> {
    const execution = await this.executionRepository.findOne({ where: { id } });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    const hasAccess = await this.projectsService.hasAccess(execution.projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this execution');
    }

    if (execution.status === ExecutionStatus.RUNNING) {
      throw new BadRequestException('Cannot delete a running execution. Stop it first.');
    }

    await this.executionRepository.remove(execution);
  }

  async stopExecution(id: string, userId: string): Promise<TestExecution> {
    const execution = await this.executionRepository.findOne({ where: { id } });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    const hasAccess = await this.projectsService.hasAccess(execution.projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this execution');
    }

    if (execution.status !== ExecutionStatus.RUNNING && execution.status !== ExecutionStatus.PENDING) {
      throw new BadRequestException('Only running or pending executions can be stopped');
    }

    execution.status = ExecutionStatus.ERROR;
    execution.errorMessage = 'Execution stopped by user';
    execution.completedAt = new Date();
    
    if (execution.startedAt) {
      execution.durationMs = new Date().getTime() - execution.startedAt.getTime();
    }

    return this.executionRepository.save(execution);
  }

  async getLogs(executionId: string, userId: string): Promise<ExecutionLog[]> {
    const execution = await this.executionRepository.findOne({
      where: { id: executionId },
    });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    const hasAccess = await this.projectsService.hasAccess(execution.projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this execution');
    }

    return this.executionLogRepository.find({
      where: { executionId },
      relations: ['step'],
      order: { orderIndex: 'ASC' },
    });
  }

  async addLog(executionId: string, logDto: ExecutionLogDto): Promise<ExecutionLog> {
    const execution = await this.executionRepository.findOne({
      where: { id: executionId },
    });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    const log = this.executionLogRepository.create({
      executionId,
      ...logDto,
    });

    return this.executionLogRepository.save(log);
  }
}
