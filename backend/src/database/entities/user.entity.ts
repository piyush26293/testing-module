import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Organization } from './organization.entity';
import { RefreshToken } from './refresh-token.entity';
import { ApiKey } from './api-key.entity';
import { Project } from './project.entity';
import { ProjectMember } from './project-member.entity';
import { TestSuite } from './test-suite.entity';
import { TestCase } from './test-case.entity';
import { TestExecution } from './test-execution.entity';
import { AiGeneratedTest } from './ai-generated-test.entity';
import { ScheduledExecution } from './scheduled-execution.entity';
import { Report } from './report.entity';
import { AuditLog } from './audit-log.entity';

export enum UserRole {
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
  QA_LEAD = 'qa_lead',
  QA_ENGINEER = 'qa_engineer',
  DEVELOPER = 'developer',
  VIEWER = 'viewer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string;

  @Index()
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Index()
  @Column({ type: 'enum', enum: UserRole, default: UserRole.VIEWER })
  role: UserRole;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string;

  @Index()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'jsonb', default: {} })
  settings: object;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Organization, (organization) => organization.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => ApiKey, (apiKey) => apiKey.user)
  apiKeys: ApiKey[];

  @OneToMany(() => Project, (project) => project.createdByUser)
  createdProjects: Project[];

  @OneToMany(() => ProjectMember, (projectMember) => projectMember.user)
  projectMemberships: ProjectMember[];

  @OneToMany(() => TestSuite, (testSuite) => testSuite.createdByUser)
  createdTestSuites: TestSuite[];

  @OneToMany(() => TestCase, (testCase) => testCase.createdByUser)
  createdTestCases: TestCase[];

  @OneToMany(() => TestExecution, (testExecution) => testExecution.triggeredByUser)
  triggeredExecutions: TestExecution[];

  @OneToMany(() => AiGeneratedTest, (aiGeneratedTest) => aiGeneratedTest.createdByUser)
  createdAiTests: AiGeneratedTest[];

  @OneToMany(() => AiGeneratedTest, (aiGeneratedTest) => aiGeneratedTest.approvedByUser)
  approvedAiTests: AiGeneratedTest[];

  @OneToMany(() => ScheduledExecution, (scheduledExecution) => scheduledExecution.createdByUser)
  createdScheduledExecutions: ScheduledExecution[];

  @OneToMany(() => Report, (report) => report.generatedByUser)
  generatedReports: Report[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs: AuditLog[];
}
