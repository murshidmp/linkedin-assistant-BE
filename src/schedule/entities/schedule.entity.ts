export class Schedule {}
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Post } from 'src/post/entities/post.entity';
  import { ApiProperty } from '@nestjs/swagger';
  
  @Entity()
  export class ScheduledPost {
    @ApiProperty({ example: 1, description: 'Unique ID of the scheduled post' })
    @PrimaryGeneratedColumn()
    id: number;
  
    @ApiProperty({ description: 'Reference to the post being scheduled' })
    @ManyToOne(() => Post, { eager: true })  // 'eager' loads the post automatically
    post: Post;
  
    @ApiProperty({
      example: '2025-03-25T08:00:00.000Z',
      description: 'UTC datetime when the post should be published',
    })
    @Column()
    scheduledAt: Date;
  
    @ApiProperty({
      example: 'pending',
      description: 'Status of the scheduled post: pending, published, cancelled, etc.',
    })
    @Column({ default: 'pending' })
    status: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  