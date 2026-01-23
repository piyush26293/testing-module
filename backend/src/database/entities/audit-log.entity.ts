import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Index()
  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 255 })
  action: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  resourceType: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  resourceId: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: object;

  @Column({ type: 'jsonb', nullable: true })
  newValues: object;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Index()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.auditLogs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Organization, organization => organization.auditLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
}
