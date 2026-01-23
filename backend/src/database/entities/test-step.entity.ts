import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { TestCase } from './test-case.entity';
import { ExecutionLog } from './execution-log.entity';
import { SelfHealingRecord } from './self-healing-record.entity';

export enum StepType {
  NAVIGATE = 'navigate',
  CLICK = 'click',
  TYPE = 'type',
  SELECT = 'select',
  WAIT = 'wait',
  ASSERT = 'assert',
  CUSTOM = 'custom'
}

export enum LocatorStrategy {
  CSS = 'css',
  XPATH = 'xpath',
  TEXT = 'text',
  ROLE = 'role',
  TESTID = 'testid',
  AI_GENERATED = 'ai_generated'
}

@Entity('test_steps')
export class TestStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  testCaseId: string;

  @Index()
  @Column({ type: 'integer' })
  orderIndex: number;

  @Column({ type: 'enum', enum: StepType })
  stepType: StepType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  action: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  targetElement: string;

  @Column({ type: 'enum', enum: LocatorStrategy, nullable: true })
  targetLocator: LocatorStrategy;

  @Column({ type: 'text', nullable: true })
  inputData: string;

  @Column({ type: 'text', nullable: true })
  expectedResult: string;

  @Column({ type: 'integer', default: 5000 })
  timeout: number;

  @Column({ type: 'boolean', default: true })
  screenshotEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  aiGeneratedLocator: boolean;

  @Column({ type: 'jsonb', default: {} })
  locatorMetadata: object;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => TestCase, testCase => testCase.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'testCaseId' })
  testCase: TestCase;

  @OneToMany(() => ExecutionLog, executionLog => executionLog.step)
  executionLogs: ExecutionLog[];

  @OneToMany(() => SelfHealingRecord, selfHealingRecord => selfHealingRecord.step)
  selfHealingRecords: SelfHealingRecord[];
}
