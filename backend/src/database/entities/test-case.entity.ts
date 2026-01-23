import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Project } from './project.entity';
import { TestSuite } from './test-suite.entity';
import { User } from './user.entity';
import { TestStep } from './test-step.entity';
import { TestExecution } from './test-execution.entity';
import { AiGeneratedTest } from './ai-generated-test.entity';

export enum TestCaseStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived'
}

export enum TestCasePriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

@Entity('test_cases')
export class TestCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  projectId: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  suiteId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Index()
  @Column({ type: 'enum', enum: TestCaseStatus, default: TestCaseStatus.DRAFT })
  status: TestCaseStatus;

  @Index()
  @Column({ type: 'enum', enum: TestCasePriority, default: TestCasePriority.MEDIUM })
  priority: TestCasePriority;

  @Index('idx_test_cases_tags', { synchronize: false })
  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'integer', default: 1 })
  version: number;

  @Index()
  @Column({ type: 'boolean', default: false })
  isAiGenerated: boolean;

  @Column({ type: 'jsonb', default: {} })
  aiMetadata: object;

  @Column({ type: 'text', nullable: true })
  preconditions: string;

  @Column({ type: 'text', nullable: true })
  postconditions: string;

  @Column({ type: 'integer', default: 30000 })
  timeout: number;

  @Column({ type: 'integer', default: 0 })
  retryCount: number;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Project, project => project.testCases, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ManyToOne(() => TestSuite, testSuite => testSuite.testCases, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'suiteId' })
  suite: TestSuite;

  @ManyToOne(() => User, user => user.createdTestCases, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  createdByUser: User;

  @OneToMany(() => TestStep, testStep => testStep.testCase)
  steps: TestStep[];

  @OneToMany(() => TestExecution, testExecution => testExecution.testCase)
  executions: TestExecution[];

  @OneToMany(() => AiGeneratedTest, aiGeneratedTest => aiGeneratedTest.testCase)
  aiGeneratedTests: AiGeneratedTest[];
}
