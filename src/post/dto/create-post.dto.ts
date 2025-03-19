import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'My new post content', description: 'Content of the post' })
  @IsString()
  content: string;

  @ApiProperty({ example: 10, description: 'Number of likes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  likes?: number;

  @ApiProperty({ example: 2, description: 'Number of comments', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  comments?: number;

  @ApiProperty({ example: 50, description: 'Number of impressions', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  impressions?: number;
}
