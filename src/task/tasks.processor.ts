import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('scheduledTasksQueue')
export class TasksProcessor extends WorkerHost {
  // Called automatically when a job moves from 'delayed' to 'waiting' -> 'active'
  async process(job: Job): Promise<any> {
    // Do the work you want when the job is executed
    const { taskName, data } = job.data;
    console.log(`Running scheduled task: ${taskName}`);
    // e.g., publish a post, send an email, etc.
    
    // Return result stored in job.returnvalue
    return { status: 'completed' };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job, result: any) {
    console.log(`Job ${job.id} completed! Result: ${JSON.stringify(result)}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
  }
}
