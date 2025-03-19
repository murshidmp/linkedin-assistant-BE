import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TasksProcessor } from './tasks.processor';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    // Register a queue named 'scheduledTasksQueue'
    BullModule.registerQueue({
      name: 'scheduledTasksQueue',
      // If needed, pass custom Redis connection info here
      // connection: { host: 'localhost', port: 6379 },
    }),
  ],
  providers: [TasksProcessor, TasksService],
  exports: [TasksService],
})
export class TasksModule {}
