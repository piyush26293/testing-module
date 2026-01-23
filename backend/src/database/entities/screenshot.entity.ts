import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TestExecution } from './test-execution.entity';
import { ExecutionLog } from './execution-log.entity';

@Entity('screenshots')
export class Screenshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  executionId: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  logId: string;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 500 })
  filePath: string;

  @Column({ type: 'integer', nullable: true })
  fileSize: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mimeType: string;

  @Column({ type: 'integer', nullable: true })
  width: number;

  @Column({ type: 'integer', nullable: true })
  height: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  capturedAt: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: object;

  @ManyToOne(() => TestExecution, testExecution => testExecution.screenshots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'executionId' })
  execution: TestExecution;

  @ManyToOne(() => ExecutionLog, executionLog => executionLog.screenshots, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'logId' })
  log: ExecutionLog;
}
