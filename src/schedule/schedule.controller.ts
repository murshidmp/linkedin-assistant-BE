import {
  Controller,
  Get,
  Post as PostMethod,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { ScheduledPost } from './entities/schedule.entity';
import { TasksService } from 'src/task/tasks.service';


@ApiTags('schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly tasksService: TasksService,  
  ) {}


  @Post()
  async schedule(@Body() body: any) {
    const { taskName, scheduledAt, data } = body;
    // Convert scheduledAt to ms from now
    const futureTime = new Date(scheduledAt).getTime();
    const now = Date.now();
    const delayMs = futureTime - now;

    if (delayMs <= 0) {
      throw new Error('scheduledAt must be in the future');
    }

    await this.tasksService.scheduleTask(taskName, data, delayMs);

    return { success: true, scheduledAt };
  }

  @Get()
  @ApiOperation({ summary: 'Get all scheduled posts' })
  @ApiResponse({ status: 200, type: [ScheduledPost] })
  async findAll() {
    return this.scheduleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a scheduled post by ID' })
  @ApiResponse({ status: 200, type: ScheduledPost })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.findOne(id);
  }

  @PostMethod()
  @ApiOperation({ summary: 'Schedule a post at a future date/time' })
  @ApiResponse({ status: 201, type: ScheduledPost })
  async schedulePost(@Body() dto: CreateScheduleDto): Promise<ScheduledPost> {
    return this.scheduleService.schedulePost(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a scheduled post' })
  @ApiResponse({ status: 200, type: ScheduledPost })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() partial: Partial<ScheduledPost>,
  ): Promise<ScheduledPost> {
    return this.scheduleService.update(id, partial);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel or remove a scheduled post' })
  @ApiResponse({ status: 200, description: 'Deleted successfully' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.remove(id);
  }
}
