import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @Index()
  @Column({ type: 'varchar', length: 500, unique: true })
  token: string;

  @Index()
  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  revokedAt: Date;

  @ManyToOne(() => User, user => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
