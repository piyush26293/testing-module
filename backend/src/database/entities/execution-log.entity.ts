import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TestExecution, ExecutionStatus } from './test-execution.entity';
import { TestStep } from './test-step.entity';
import { Screenshot } from './screenshot.entity';

@Entity('execution_logs')
export class ExecutionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  executionId: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  stepId: string;

  @Column({ type: 'integer' })
  orderIndex: number;

  @Index()
  @Column({ type: 'enum', enum: ExecutionStatus })
  status: ExecutionStatus;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  screenshotUrl: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  startedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt: Date;

  @Column({ type: 'integer', nullable: true })
  durationMs: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: object;

  @ManyToOne(() => TestExecution, (testExecution) => testExecution.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'executionId' })
  execution: TestExecution;

  @ManyToOne(() => TestStep, (testStep) => testStep.executionLogs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'stepId' })
  step: TestStep;

  @OneToMany(() => Screenshot, (screenshot) => screenshot.log)
  screenshots: Screenshot[];
}
