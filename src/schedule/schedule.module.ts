import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { ScheduledPost } from './entities/schedule.entity';
import { Post } from 'src/post/entities/post.entity';
import { TasksModule } from 'src/task/task.module';

@Module({
  imports: [
    // For cron jobs
    NestScheduleModule.forRoot(),
    // For DB access
    TypeOrmModule.forFeature([ScheduledPost, Post]),
    TasksModule,
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
