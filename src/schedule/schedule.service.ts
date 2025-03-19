import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduledPost } from './entities/schedule.entity';
import { Post } from 'src/post/entities/post.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    @InjectRepository(ScheduledPost)
    private readonly scheduleRepo: Repository<ScheduledPost>,

    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  // CREATE
  async schedulePost(createDto: CreateScheduleDto): Promise<ScheduledPost> {
    // 1. find the post in DB
    const post = await this.postRepo.findOne({ where: { id: createDto.postId } });
    if (!post) {
      throw new Error(`Post with ID ${createDto.postId} not found`);
    }

    // 2. create the scheduled entry
    const scheduled = this.scheduleRepo.create({
      post,
      scheduledAt: new Date(createDto.scheduledAt),
      status: 'pending',
    });
    return this.scheduleRepo.save(scheduled);
  }

  // READ (all)
  async findAll(): Promise<ScheduledPost[]> {
    return this.scheduleRepo.find({
      order: { scheduledAt: 'ASC' },
    });
  }

  // READ (one)
  async findOne(id: number): Promise<ScheduledPost> {
    const scheduledPost = await this.scheduleRepo.findOne({ where: { id } });
    if (!scheduledPost) {
      throw new Error(`Scheduled post with ID ${id} not found`);
    }
    return scheduledPost;
  }

  // UPDATE (for changing scheduled time or status)
  async update(
    id: number,
    partial: Partial<ScheduledPost>,
  ): Promise<ScheduledPost> {
    const sched = await this.findOne(id);
    if (!sched) {
      throw new Error(`Scheduled post with ID ${id} not found`);
    }
    Object.assign(sched, partial);
    return this.scheduleRepo.save(sched);
  }

  // DELETE
  async remove(id: number): Promise<void> {
    await this.scheduleRepo.delete(id);
  }

  // CRON: check every minute whether a post is due to be published
  @Cron(CronExpression.EVERY_MINUTE)
  async publishDuePosts() {
    const now = new Date();
    const due = await this.scheduleRepo.find({
      where: {
        status: 'pending',
        // scheduledAt <= now (TypeORM can do raw query or you can filter in code)
      },
    });

    // Filter in code to be safe
    const readyToPublish = due.filter(item => item.scheduledAt <= now);

    if (readyToPublish.length) {
      this.logger.log(`Found ${readyToPublish.length} posts to publish...`);
    }

    for (const item of readyToPublish) {
      // Here, do whatever "publish" means in your app. For an MVP,
      // we might just set status to "published" or log a message.
      item.status = 'published';
      await this.scheduleRepo.save(item);

      this.logger.log(`Post ID ${item.post.id} published!`);
    }
  }
}
