import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { Project } from './project.entity';
import { User } from './user.entity';
import { UserRole } from './user.entity';

@Entity('project_members')
@Unique(['projectId', 'userId'])
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  projectId: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.VIEWER })
  role: UserRole;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  joinedAt: Date;

  @ManyToOne(() => Project, project => project.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ManyToOne(() => User, user => user.projectMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
