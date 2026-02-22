import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Report } from '../../database/entities/report.entity';
import { TestExecution, ExecutionStatus } from '../../database/entities/test-execution.entity';
import { ProjectsService } from '../projects/projects.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { createPaginatedResponse } from '../../common/utils/helpers';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(TestExecution)
    private readonly executionRepository: Repository<TestExecution>,
    private readonly projectsService: ProjectsService,
  ) {}

  async generate(generateDto: GenerateReportDto, userId: string): Promise<Report> {
    const hasAccess = await this.projectsService.hasAccess(generateDto.projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const startDate = new Date(generateDto.timePeriodStart);
    const endDate = new Date(generateDto.timePeriodEnd);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const executions = await this.executionRepository.find({
      where: {
        projectId: generateDto.projectId,
        createdAt: Between(startDate, endDate),
      },
      relations: ['testCase', 'suite'],
    });

    const metrics = this.calculateMetrics(executions);
    const summary = this.generateSummary(executions);

    const reportName =
      generateDto.name ||
      `${generateDto.reportType} Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;

    const report = this.reportRepository.create({
      projectId: generateDto.projectId,
      name: reportName,
      reportType: generateDto.reportType,
      timePeriodStart: startDate,
      timePeriodEnd: endDate,
      summary,
      metrics,
      generatedBy: userId,
    });

    return this.reportRepository.save(report);
  }

  async findAll(
    projectId: string,
    pagination: PaginationDto,
    userId: string,
  ): Promise<PaginatedResult<Report>> {
    const hasAccess = await this.projectsService.hasAccess(projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [reports, total] = await this.reportRepository.findAndCount({
      where: { projectId },
      relations: ['generatedByUser'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return createPaginatedResponse(reports, total, page, limit);
  }

  async findOne(id: string, userId: string): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['project', 'generatedByUser'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const hasAccess = await this.projectsService.hasAccess(report.projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this report');
    }

    return report;
  }

  async remove(id: string, userId: string): Promise<void> {
    const report = await this.findOne(id, userId);
    await this.reportRepository.remove(report);
  }

  calculateMetrics(executions: TestExecution[]): object {
    const totalTests = executions.length;
    const passedTests = executions.filter((e) => e.status === ExecutionStatus.PASSED).length;
    const failedTests = executions.filter((e) => e.status === ExecutionStatus.FAILED).length;
    const skippedTests = executions.filter((e) => e.status === ExecutionStatus.SKIPPED).length;
    const errorTests = executions.filter((e) => e.status === ExecutionStatus.ERROR).length;

    const completedExecutions = executions.filter((e) => e.durationMs !== null);
    const totalDuration = completedExecutions.reduce((sum, e) => sum + (e.durationMs || 0), 0);
    const avgDuration =
      completedExecutions.length > 0 ? Math.round(totalDuration / completedExecutions.length) : 0;

    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : '0.00';
    const failRate = totalTests > 0 ? ((failedTests / totalTests) * 100).toFixed(2) : '0.00';

    const executionsByStatus = {
      [ExecutionStatus.PASSED]: passedTests,
      [ExecutionStatus.FAILED]: failedTests,
      [ExecutionStatus.SKIPPED]: skippedTests,
      [ExecutionStatus.ERROR]: errorTests,
      [ExecutionStatus.PENDING]: executions.filter((e) => e.status === ExecutionStatus.PENDING)
        .length,
      [ExecutionStatus.RUNNING]: executions.filter((e) => e.status === ExecutionStatus.RUNNING)
        .length,
    };

    const executionsByTrigger = executions.reduce(
      (acc, exec) => {
        acc[exec.trigger] = (acc[exec.trigger] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const executionsByBrowser = executions.reduce(
      (acc, exec) => {
        acc[exec.browser] = (acc[exec.browser] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      errorTests,
      passRate: parseFloat(passRate),
      failRate: parseFloat(failRate),
      avgDurationMs: avgDuration,
      totalDurationMs: totalDuration,
      executionsByStatus,
      executionsByTrigger,
      executionsByBrowser,
    };
  }

  generateSummary(executions: TestExecution[]): object {
    const uniqueTestCases = new Set(
      executions.filter((e) => e.testCaseId).map((e) => e.testCaseId),
    );
    const uniqueSuites = new Set(executions.filter((e) => e.suiteId).map((e) => e.suiteId));

    const executionsWithErrors = executions.filter(
      (e) => e.status === ExecutionStatus.FAILED || e.status === ExecutionStatus.ERROR,
    );

    const topFailures = executionsWithErrors.slice(0, 10).map((e) => ({
      executionId: e.id,
      testCaseId: e.testCaseId,
      testCaseName: e.testCase?.name || 'Unknown',
      errorMessage: e.errorMessage,
      executedAt: e.createdAt,
    }));

    const fastestExecution = executions
      .filter((e) => e.durationMs !== null)
      .sort((a, b) => (a.durationMs || 0) - (b.durationMs || 0))[0];

    const slowestExecution = executions
      .filter((e) => e.durationMs !== null)
      .sort((a, b) => (b.durationMs || 0) - (a.durationMs || 0))[0];

    return {
      totalExecutions: executions.length,
      uniqueTestCases: uniqueTestCases.size,
      uniqueSuites: uniqueSuites.size,
      topFailures,
      fastestExecution: fastestExecution
        ? {
            executionId: fastestExecution.id,
            testCaseName: fastestExecution.testCase?.name || 'Unknown',
            durationMs: fastestExecution.durationMs,
          }
        : null,
      slowestExecution: slowestExecution
        ? {
            executionId: slowestExecution.id,
            testCaseName: slowestExecution.testCase?.name || 'Unknown',
            durationMs: slowestExecution.durationMs,
          }
        : null,
    };
  }
}
