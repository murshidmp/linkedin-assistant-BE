import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber } from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({ example: 1, description: 'ID of the post to schedule' })
  @IsNumber()
  postId: number;

  @ApiProperty({
    example: '2025-03-25T08:00:00.000Z',
    description: 'ISO 8601 datetime string in UTC',
  })
  @IsDateString()
  scheduledAt: string;
}
