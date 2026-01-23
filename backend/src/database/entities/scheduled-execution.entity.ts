import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Project } from './project.entity';
import { TestSuite } from './test-suite.entity';
import { User } from './user.entity';
import { BrowserType } from './test-execution.entity';

@Entity('scheduled_executions')
export class ScheduledExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'uuid', nullable: true })
  suiteId: string;

  @Column({ type: 'uuid', array: true, default: [] })
  testCaseIds: string[];

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  cronExpression: string;

  @Column({ type: 'varchar', length: 100, default: 'UTC' })
  timezone: string;

  @Column({ type: 'enum', enum: BrowserType, default: BrowserType.CHROMIUM })
  browser: BrowserType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  environment: string;

  @Index()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastRunAt: Date;

  @Index()
  @Column({ type: 'timestamp with time zone', nullable: true })
  nextRunAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => Project, project => project.scheduledExecutions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ManyToOne(() => TestSuite, testSuite => testSuite.scheduledExecutions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'suiteId' })
  suite: TestSuite;

  @ManyToOne(() => User, user => user.createdScheduledExecutions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  createdByUser: User;
}
