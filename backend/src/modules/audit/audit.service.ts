import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/audit-log.dto';

export interface AuditQueryOptions {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(dto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      ...dto,
      timestamp: new Date(),
    });

    return this.auditLogRepository.save(auditLog);
  }

  async findAll(options: AuditQueryOptions = {}): Promise<AuditLog[]> {
    const query = this.auditLogRepository.createQueryBuilder('audit');

    if (options.userId) {
      query.andWhere('audit.userId = :userId', { userId: options.userId });
    }

    if (options.action) {
      query.andWhere('audit.action = :action', { action: options.action });
    }

    if (options.resource) {
      query.andWhere('audit.resource = :resource', { resource: options.resource });
    }

    if (options.startDate) {
      query.andWhere('audit.timestamp >= :startDate', {
        startDate: options.startDate,
      });
    }

    if (options.endDate) {
      query.andWhere('audit.timestamp <= :endDate', {
        endDate: options.endDate,
      });
    }

    query.orderBy('audit.timestamp', 'DESC');

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.offset) {
      query.offset(options.offset);
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<AuditLog> {
    return this.auditLogRepository.findOne({ where: { id } });
  }

  async count(options: AuditQueryOptions = {}): Promise<number> {
    const query = this.auditLogRepository.createQueryBuilder('audit');

    if (options.userId) {
      query.andWhere('audit.userId = :userId', { userId: options.userId });
    }

    if (options.action) {
      query.andWhere('audit.action = :action', { action: options.action });
    }

    if (options.resource) {
      query.andWhere('audit.resource = :resource', { resource: options.resource });
    }

    if (options.startDate) {
      query.andWhere('audit.timestamp >= :startDate', {
        startDate: options.startDate,
      });
    }

    if (options.endDate) {
      query.andWhere('audit.timestamp <= :endDate', {
        endDate: options.endDate,
      });
    }

    return query.getCount();
  }

  async logUserAction(
    userId: string,
    action: string,
    resource: string,
    metadata?: any,
  ): Promise<AuditLog> {
    return this.log({
      userId,
      action,
      resource,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    });
  }
}
