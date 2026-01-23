import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn, Index, Unique } from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { ProjectMember } from './project-member.entity';
import { TestSuite } from './test-suite.entity';
import { TestCase } from './test-case.entity';
import { TestExecution } from './test-execution.entity';
import { AiGeneratedTest } from './ai-generated-test.entity';
import { ScheduledExecution } from './scheduled-execution.entity';
import { Report } from './report.entity';

export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

@Entity('projects')
@Unique(['organizationId', 'slug'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  baseUrl: string;

  @Index()
  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.ACTIVE })
  status: ProjectStatus;

  @Column({ type: 'jsonb', default: {} })
  settings: object;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Organization, organization => organization.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => User, user => user.createdProjects, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  createdByUser: User;

  @OneToMany(() => ProjectMember, projectMember => projectMember.project)
  members: ProjectMember[];

  @OneToMany(() => TestSuite, testSuite => testSuite.project)
  testSuites: TestSuite[];

  @OneToMany(() => TestCase, testCase => testCase.project)
  testCases: TestCase[];

  @OneToMany(() => TestExecution, testExecution => testExecution.project)
  testExecutions: TestExecution[];

  @OneToMany(() => AiGeneratedTest, aiGeneratedTest => aiGeneratedTest.project)
  aiGeneratedTests: AiGeneratedTest[];

  @OneToMany(() => ScheduledExecution, scheduledExecution => scheduledExecution.project)
  scheduledExecutions: ScheduledExecution[];

  @OneToMany(() => Report, report => report.project)
  reports: Report[];
}
