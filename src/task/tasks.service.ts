import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class TasksService {
  constructor(
    @InjectQueue('scheduledTasksQueue')
    private readonly scheduledTasksQueue: Queue,
  ) {}

  async scheduleTask(taskName: string, data: any, delayMs: number) {
    // Add a job to be processed after delayMs
    await this.scheduledTasksQueue.add(
      'myTask',  // Job name, optional
      { taskName, data },
      { delay: delayMs },
    );
  }
}
