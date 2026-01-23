import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../../database/entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { slugify } from '../../common/utils/helpers';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const slug = slugify(createOrganizationDto.name);

    await this.ensureSlugUniqueness(slug);

    const organization = this.organizationRepository.create({
      ...createOrganizationDto,
      slug,
      settings: createOrganizationDto.settings || {},
    });

    return this.organizationRepository.save(organization);
  }

  private async ensureSlugUniqueness(slug: string, excludeId?: string): Promise<void> {
    const queryBuilder = this.organizationRepository
      .createQueryBuilder('organization')
      .where('organization.slug = :slug', { slug })
      .andWhere('organization.deletedAt IS NULL');

    if (excludeId) {
      queryBuilder.andWhere('organization.id != :excludeId', { excludeId });
    }

    const existingOrg = await queryBuilder.getOne();

    if (existingOrg) {
      throw new ConflictException('Organization with this name already exists');
    }
  }

  async findAll(
    pagination: PaginationDto,
    organizationId?: string,
  ): Promise<PaginatedResult<Organization>> {
    const { page = 1, limit = 10 } = pagination;

    const queryBuilder = this.organizationRepository
      .createQueryBuilder('organization')
      .where('organization.deletedAt IS NULL');

    if (organizationId) {
      queryBuilder.andWhere('organization.id = :organizationId', { organizationId });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('organization.createdAt', 'DESC')
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['users', 'projects'],
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async findBySlug(slug: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { slug },
      relations: ['users', 'projects'],
    });

    if (!organization) {
      throw new NotFoundException(`Organization with slug ${slug} not found`);
    }

    return organization;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    const organization = await this.findOne(id);

    if (updateOrganizationDto.name && updateOrganizationDto.name !== organization.name) {
      const newSlug = slugify(updateOrganizationDto.name);
      await this.ensureSlugUniqueness(newSlug, id);
      organization.slug = newSlug;
    }

    Object.assign(organization, updateOrganizationDto);

    return this.organizationRepository.save(organization);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.organizationRepository.softDelete(id);
  }
}
