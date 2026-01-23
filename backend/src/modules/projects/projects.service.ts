import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../../database/entities/project.entity';
import { ProjectMember } from '../../database/entities/project-member.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { slugify, createPaginatedResponse } from '../../common/utils/helpers';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    const slug = slugify(createProjectDto.name);

    await this.ensureSlugUniqueness(slug, createProjectDto.organizationId);

    const project = this.projectRepository.create({
      ...createProjectDto,
      slug,
      createdBy: userId,
      settings: createProjectDto.settings || {},
    });

    const savedProject = await this.projectRepository.save(project);

    await this.projectMemberRepository.save({
      projectId: savedProject.id,
      userId: userId,
      role: UserRole.ADMIN,
    });

    return this.projectRepository.findOne({
      where: { id: savedProject.id },
      relations: ['organization', 'createdByUser', 'members'],
    });
  }

  private async ensureSlugUniqueness(slug: string, organizationId: string, excludeId?: string): Promise<void> {
    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .where('project.slug = :slug', { slug })
      .andWhere('project.organizationId = :organizationId', { organizationId })
      .andWhere('project.deletedAt IS NULL');

    if (excludeId) {
      queryBuilder.andWhere('project.id != :excludeId', { excludeId });
    }

    const existingProject = await queryBuilder.getOne();

    if (existingProject) {
      throw new ConflictException('Project with this name already exists in the organization');
    }
  }

  async findAll(
    userId: string,
    userRole: UserRole,
    organizationId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Project>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.organization', 'organization')
      .leftJoinAndSelect('project.createdByUser', 'createdByUser')
      .leftJoin('project.members', 'member')
      .where('project.deletedAt IS NULL');

    if (userRole !== UserRole.ADMIN) {
      queryBuilder
        .andWhere('project.organizationId = :organizationId', { organizationId })
        .andWhere('member.userId = :userId', { userId });
    }

    queryBuilder
      .orderBy('project.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [projects, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(projects, total, page, limit);
  }

  async findOne(id: string, userId: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['organization', 'createdByUser', 'members', 'members.user'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const hasAccess = await this.hasAccess(id, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isAdmin = await this.isProjectAdmin(id, userId);
    if (!isAdmin) {
      throw new ForbiddenException('Only project admins can update the project');
    }

    if (updateProjectDto.name && updateProjectDto.name !== project.name) {
      const slug = slugify(updateProjectDto.name);
      await this.ensureSlugUniqueness(slug, project.organizationId, id);
      project.slug = slug;
    }

    Object.assign(project, updateProjectDto);

    return this.projectRepository.save(project);
  }

  async remove(id: string, userId: string): Promise<void> {
    const project = await this.projectRepository.findOne({ where: { id } });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isAdmin = await this.isProjectAdmin(id, userId);
    if (!isAdmin) {
      throw new ForbiddenException('Only project admins can delete the project');
    }

    await this.projectRepository.softDelete(id);
  }

  async addMember(projectId: string, addMemberDto: AddMemberDto, currentUserId: string): Promise<ProjectMember> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isAdmin = await this.isProjectAdmin(projectId, currentUserId);
    if (!isAdmin) {
      throw new ForbiddenException('Only project admins can add members');
    }

    const user = await this.userRepository.findOne({ where: { id: addMemberDto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.organizationId !== project.organizationId) {
      throw new BadRequestException('User must belong to the same organization as the project');
    }

    const existingMember = await this.projectMemberRepository.findOne({
      where: { projectId, userId: addMemberDto.userId },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this project');
    }

    const member = this.projectMemberRepository.create({
      projectId,
      userId: addMemberDto.userId,
      role: addMemberDto.role,
    });

    const savedMember = await this.projectMemberRepository.save(member);

    return this.projectMemberRepository.findOne({
      where: { id: savedMember.id },
      relations: ['user', 'project'],
    });
  }

  async removeMember(projectId: string, userId: string, currentUserId: string): Promise<void> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isAdmin = await this.isProjectAdmin(projectId, currentUserId);
    if (!isAdmin) {
      throw new ForbiddenException('Only project admins can remove members');
    }

    if (userId === currentUserId) {
      throw new BadRequestException('You cannot remove yourself from the project');
    }

    const member = await this.projectMemberRepository.findOne({
      where: { projectId, userId },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this project');
    }

    await this.projectMemberRepository.remove(member);
  }

  async getMembers(projectId: string, currentUserId: string): Promise<ProjectMember[]> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const hasAccess = await this.hasAccess(projectId, currentUserId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.projectMemberRepository.find({
      where: { projectId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });
  }

  async hasAccess(projectId: string, userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const member = await this.projectMemberRepository.findOne({
      where: { projectId, userId },
    });

    return !!member;
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
