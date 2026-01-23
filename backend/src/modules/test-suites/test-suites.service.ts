import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TestSuite } from '../../database/entities/test-suite.entity';
import { Project } from '../../database/entities/project.entity';
import { User } from '../../database/entities/user.entity';
import { ProjectMember } from '../../database/entities/project-member.entity';
import { CreateTestSuiteDto } from './dto/create-test-suite.dto';
import { UpdateTestSuiteDto } from './dto/update-test-suite.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { createPaginatedResponse } from '../../common/utils/helpers';
import { ProjectsService } from '../projects/projects.service';
import { UserRole } from '../../database/entities/user.entity';

@Injectable()
export class TestSuitesService {
  constructor(
    @InjectRepository(TestSuite)
    private testSuiteRepository: Repository<TestSuite>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
    private projectsService: ProjectsService,
  ) {}

  async create(createTestSuiteDto: CreateTestSuiteDto, userId: string): Promise<TestSuite> {
    const { projectId, parentSuiteId, ...rest } = createTestSuiteDto;

    // Check if user has access to the project
    const hasAccess = await this.projectsService.hasAccess(projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    // Verify project exists
    const project = await this.projectRepository.findOne({
      where: { id: projectId, deletedAt: IsNull() },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // If parentSuiteId is provided, verify it exists and belongs to the same project
    if (parentSuiteId) {
      const parentSuite = await this.testSuiteRepository.findOne({
        where: { id: parentSuiteId, deletedAt: IsNull() },
      });
      if (!parentSuite) {
        throw new NotFoundException('Parent test suite not found');
      }
      if (parentSuite.projectId !== projectId) {
        throw new BadRequestException('Parent test suite must belong to the same project');
      }
    }

    const testSuite = this.testSuiteRepository.create({
      ...rest,
      projectId,
      parentSuiteId,
      createdBy: userId,
    });

    return this.testSuiteRepository.save(testSuite);
  }

  async findAll(projectId: string, pagination: PaginationDto, userId: string) {
    // Check if user has access to the project
    const hasAccess = await this.projectsService.hasAccess(projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.testSuiteRepository
      .createQueryBuilder('testSuite')
      .leftJoinAndSelect('testSuite.creator', 'creator')
      .leftJoinAndSelect('testSuite.parentSuite', 'parentSuite')
      .where('testSuite.projectId = :projectId', { projectId })
      .andWhere('testSuite.deletedAt IS NULL')
      .orderBy('testSuite.orderIndex', 'ASC')
      .addOrderBy('testSuite.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [testSuites, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(testSuites, total, page, limit);
  }

  async findOne(id: string, userId: string): Promise<TestSuite> {
    const testSuite = await this.testSuiteRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['creator', 'parentSuite', 'project'],
    });

    if (!testSuite) {
      throw new NotFoundException('Test suite not found');
    }

    // Check if user has access to the project
    const hasAccess = await this.projectsService.hasAccess(testSuite.projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return testSuite;
  }

  async update(
    id: string,
    updateTestSuiteDto: UpdateTestSuiteDto,
    userId: string,
  ): Promise<TestSuite> {
    const testSuite = await this.findOne(id, userId);

    // If updating parentSuiteId, verify it exists and doesn't create a cycle
    if (updateTestSuiteDto.parentSuiteId) {
      if (updateTestSuiteDto.parentSuiteId === id) {
        throw new BadRequestException('Test suite cannot be its own parent');
      }

      const parentSuite = await this.testSuiteRepository.findOne({
        where: {
          id: updateTestSuiteDto.parentSuiteId,
          deletedAt: IsNull(),
        },
      });
      if (!parentSuite) {
        throw new NotFoundException('Parent test suite not found');
      }
      if (parentSuite.projectId !== testSuite.projectId) {
        throw new BadRequestException('Parent test suite must belong to the same project');
      }

      // Check for circular reference
      const wouldCreateCycle = await this.checkCircularReference(
        id,
        updateTestSuiteDto.parentSuiteId,
      );
      if (wouldCreateCycle) {
        throw new BadRequestException('Cannot set parent: would create a circular reference');
      }
    }

    Object.assign(testSuite, updateTestSuiteDto);
    return this.testSuiteRepository.save(testSuite);
  }

  async remove(id: string, userId: string): Promise<void> {
    const testSuite = await this.findOne(id, userId);

    // Check if user is project admin
    const isAdmin = await this.isProjectAdmin(testSuite.projectId, userId);
    if (!isAdmin) {
      throw new ForbiddenException('Only project admins can delete test suites');
    }

    await this.testSuiteRepository.softDelete(id);
  }

  async getChildren(suiteId: string, userId: string): Promise<TestSuite[]> {
    const parentSuite = await this.findOne(suiteId, userId);

    return this.testSuiteRepository.find({
      where: {
        parentSuiteId: parentSuite.id,
        deletedAt: IsNull(),
      },
      relations: ['creator'],
      order: {
        orderIndex: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async getHierarchy(projectId: string, userId: string): Promise<TestSuite[]> {
    // Check if user has access to the project
    const hasAccess = await this.projectsService.hasAccess(projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    // Get all test suites for the project
    const allSuites = await this.testSuiteRepository.find({
      where: {
        projectId,
        deletedAt: IsNull(),
      },
      relations: ['creator'],
      order: {
        orderIndex: 'ASC',
        createdAt: 'DESC',
      },
    });

    // Build tree structure
    return this.buildTree(allSuites);
  }

  private buildTree(suites: TestSuite[]): TestSuite[] {
    const suiteMap = new Map<string, any>();
    const rootSuites: any[] = [];

    // Create a map of all suites with children array
    suites.forEach((suite) => {
      suiteMap.set(suite.id, { ...suite, children: [] });
    });

    // Build the tree
    suites.forEach((suite) => {
      const node = suiteMap.get(suite.id);
      if (suite.parentSuiteId) {
        const parent = suiteMap.get(suite.parentSuiteId);
        if (parent) {
          parent.children.push(node);
        } else {
          // Parent not found (might be deleted), treat as root
          rootSuites.push(node);
        }
      } else {
        rootSuites.push(node);
      }
    });

    return rootSuites;
  }

  private async checkCircularReference(
    suiteId: string,
    potentialParentId: string,
  ): Promise<boolean> {
    let currentId = potentialParentId;
    const visited = new Set<string>();

    while (currentId) {
      if (currentId === suiteId) {
        return true; // Circular reference detected
      }

      if (visited.has(currentId)) {
        // Already visited, avoid infinite loop
        break;
      }

      visited.add(currentId);

      const parent = await this.testSuiteRepository.findOne({
        where: { id: currentId, deletedAt: IsNull() },
        select: ['id', 'parentSuiteId'],
      });

      if (!parent || !parent.parentSuiteId) {
        break;
      }

      currentId = parent.parentSuiteId;
    }

    return false;
  }

  private async isProjectAdmin(projectId: string, userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const member = await this.projectMemberRepository.findOne({
      where: { projectId, userId },
    });

    return member?.role === UserRole.ADMIN || member?.role === UserRole.PROJECT_MANAGER;
  }
}
