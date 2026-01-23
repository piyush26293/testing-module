import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TestExecution } from './test-execution.entity';
import { TestStep, LocatorStrategy } from './test-step.entity';

@Entity('self_healing_records')
export class SelfHealingRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  executionId: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  stepId: string;

  @Column({ type: 'varchar', length: 500 })
  originalLocator: string;

  @Column({ type: 'varchar', length: 500 })
  healedLocator: string;

  @Column({ type: 'enum', enum: LocatorStrategy })
  locatorStrategy: LocatorStrategy;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidenceScore: number;

  @Column({ type: 'boolean', nullable: true })
  success: boolean;

  @Column({ type: 'jsonb', default: {} })
  metadata: object;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => TestExecution, testExecution => testExecution.selfHealingRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'executionId' })
  execution: TestExecution;

  @ManyToOne(() => TestStep, testStep => testStep.selfHealingRecords, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'stepId' })
  step: TestStep;
}
