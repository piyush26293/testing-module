import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Project } from './project.entity';
import { User } from './user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  reportType: string;

  @Index()
  @Column({ type: 'timestamp with time zone', nullable: true })
  timePeriodStart: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  timePeriodEnd: Date;

  @Column({ type: 'jsonb', default: {} })
  summary: object;

  @Column({ type: 'jsonb', default: {} })
  metrics: object;

  @Column({ type: 'text', nullable: true })
  aiInsights: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath: string;

  @Column({ type: 'uuid', nullable: true })
  generatedBy: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => Project, project => project.reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ManyToOne(() => User, user => user.generatedReports, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'generatedBy' })
  generatedByUser: User;
}
