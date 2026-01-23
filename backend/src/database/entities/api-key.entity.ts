import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index()
  @Column({ type: 'varchar', length: 255, unique: true })
  keyHash: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastUsedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: [] })
  scopes: object;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.apiKeys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
