// src/linkedin-api/linkedin-api.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { LinkedInApiService } from './linkedin-api.service';
import { CreateLinkedInPostDto } from '../linkedin-api/dto/create-linkedin-post.dto';
import { UpdateLinkedInPostDto } from './dto/update-linkedin-post.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('linkedin-posts')
@Controller('linkedin/posts')
export class LinkedInApiController {
  constructor(private readonly linkedInApiService: LinkedInApiService) { }

  @Post()
  @ApiOperation({ summary: 'Create a LinkedIn post for the authenticated user' })
  @ApiResponse({ status: 201, description: 'LinkedIn post created successfully' })
  async createPost(@Body() createDto: CreateLinkedInPostDto) {
    // The service will look up the user using createDto.userId,
    // then call LinkedIn API using the stored credentials.
    return this.linkedInApiService.createPostUsingUser(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get posts for the authenticated user' })
  @ApiQuery({ name: 'userId', description: 'Local user ID', type: String })
  async getPosts(
    @Query('userId') userId: string,
    @Query('postUrn') postUrn: string,
  ) {
    return this.linkedInApiService.getPostByUrn(userId, postUrn);
  }

  @Patch(':linkedinPostId')
  @ApiOperation({ summary: 'Update a LinkedIn post' })
  @ApiResponse({ status: 200, description: 'LinkedIn post updated successfully' })
  @ApiQuery({ name: 'userId', description: 'Local user ID', type: String })
  async updatePost(
    @Param('linkedinPostId') linkedinPostId: string,
    @Query('userId') userId: string,
    @Body() updateDto: UpdateLinkedInPostDto,
  ) {
    // Calls the service to partial update on LinkedIn
    return this.linkedInApiService.updatePostByUser(userId, linkedinPostId, updateDto, '202503');
  }

  @Delete(':linkedinPostId')
  @ApiOperation({ summary: 'Delete a LinkedIn post' })
  @ApiResponse({ status: 200, description: 'LinkedIn post deleted successfully' })
  @ApiQuery({ name: 'userId', description: 'Local user ID', type: String })
  async deletePost(
    @Param('linkedinPostId') linkedinPostId: string,
    @Query('userId') userId: string,
  ) {
    return this.linkedInApiService.deletePostByUser(userId, linkedinPostId, '202503');
  }
}
