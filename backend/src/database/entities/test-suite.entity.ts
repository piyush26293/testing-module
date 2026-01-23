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
import { Project } from './project.entity';
import { User } from './user.entity';
import { TestCase } from './test-case.entity';
import { TestExecution } from './test-execution.entity';
import { ScheduledExecution } from './scheduled-execution.entity';

@Entity('test_suites')
export class TestSuite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  parentSuiteId: string;

  @Column({ type: 'integer', default: 0 })
  orderIndex: number;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Project, (project) => project.testSuites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ManyToOne(() => TestSuite, (testSuite) => testSuite.childSuites, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentSuiteId' })
  parentSuite: TestSuite;

  @OneToMany(() => TestSuite, (testSuite) => testSuite.parentSuite)
  childSuites: TestSuite[];

  @ManyToOne(() => User, (user) => user.createdTestSuites, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  createdByUser: User;

  @OneToMany(() => TestCase, (testCase) => testCase.suite)
  testCases: TestCase[];

  @OneToMany(() => TestExecution, (testExecution) => testExecution.suite)
  testExecutions: TestExecution[];

  @OneToMany(() => ScheduledExecution, (scheduledExecution) => scheduledExecution.suite)
  scheduledExecutions: ScheduledExecution[];
}
