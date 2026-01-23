import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Project } from './project.entity';
import { TestCase } from './test-case.entity';
import { TestSuite } from './test-suite.entity';
import { User } from './user.entity';
import { ExecutionLog } from './execution-log.entity';
import { Screenshot } from './screenshot.entity';
import { SelfHealingRecord } from './self-healing-record.entity';

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  ERROR = 'error',
}

export enum ExecutionTrigger {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  CI_CD = 'ci_cd',
  API = 'api',
}

export enum BrowserType {
  CHROMIUM = 'chromium',
  FIREFOX = 'firefox',
  WEBKIT = 'webkit',
  CHROME = 'chrome',
  EDGE = 'edge',
}

@Entity('test_executions')
export class TestExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  projectId: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  testCaseId: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  suiteId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  executionName: string;

  @Index()
  @Column({ type: 'enum', enum: ExecutionStatus, default: ExecutionStatus.PENDING })
  status: ExecutionStatus;

  @Index()
  @Column({ type: 'enum', enum: ExecutionTrigger, default: ExecutionTrigger.MANUAL })
  trigger: ExecutionTrigger;

  @Column({ type: 'enum', enum: BrowserType, default: BrowserType.CHROMIUM })
  browser: BrowserType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  environment: string;

  @Index()
  @Column({ type: 'timestamp with time zone', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt: Date;

  @Column({ type: 'integer', nullable: true })
  durationMs: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'text', nullable: true })
  stackTrace: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  videoUrl: string;

  @Column({ type: 'jsonb', default: {} })
  summary: object;

  @Column({ type: 'uuid', nullable: true })
  triggeredBy: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => Project, (project) => project.testExecutions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ManyToOne(() => TestCase, (testCase) => testCase.executions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'testCaseId' })
  testCase: TestCase;

  @ManyToOne(() => TestSuite, (testSuite) => testSuite.testExecutions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'suiteId' })
  suite: TestSuite;

  @ManyToOne(() => User, (user) => user.triggeredExecutions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'triggeredBy' })
  triggeredByUser: User;

  @OneToMany(() => ExecutionLog, (executionLog) => executionLog.execution)
  logs: ExecutionLog[];

  @OneToMany(() => Screenshot, (screenshot) => screenshot.execution)
  screenshots: Screenshot[];

  @OneToMany(() => SelfHealingRecord, (selfHealingRecord) => selfHealingRecord.execution)
  selfHealingRecords: SelfHealingRecord[];
}
