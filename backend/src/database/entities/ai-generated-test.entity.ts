import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Project } from './project.entity';
import { TestCase } from './test-case.entity';
import { User } from './user.entity';

@Entity('ai_generated_tests')
export class AiGeneratedTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  projectId: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  testCaseId: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'text', nullable: true })
  userFlowDescription: string;

  @Column({ type: 'jsonb' })
  generatedSteps: object;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidenceScore: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  modelUsed: string;

  @Column({ type: 'integer', nullable: true })
  tokensUsed: number;

  @Index()
  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  approvedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => Project, (project) => project.aiGeneratedTests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ManyToOne(() => TestCase, (testCase) => testCase.aiGeneratedTests, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'testCaseId' })
  testCase: TestCase;

  @ManyToOne(() => User, (user) => user.approvedAiTests, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approvedBy' })
  approvedByUser: User;

  @ManyToOne(() => User, (user) => user.createdAiTests, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  createdByUser: User;
}
