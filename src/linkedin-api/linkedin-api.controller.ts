import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { LinkedInApiService } from './linkedin-api.service';
import { CreateLinkedinApiDto } from './dto/create-linkedin-api.dto';
import { UpdateLinkedinApiDto } from './dto/update-linkedin-api.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateLinkedInPostDto } from './entities/linkedin-api.entity';
import { InitializeImageUploadDto } from './entities/image-upload.entity';

@ApiTags('linkedin')
@Controller('linkedin')
export class LinkedInApiController {
  constructor(private readonly linkedinApiService: LinkedInApiService) {}

  @Get('posts')
  async fetchPosts(@Req() req,@Query('token') token: string,) {
    // get user token from DB or session
    // const token = req.user.linkedinToken;
    // const token = 'eyJ6aXAiOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImQ5Mjk2NjhhLWJhYjEtNGM2OS05NTk4LTQzNzMxNDk3MjNmZiIsImFsZyI6IlJTMjU2In0.eyJpc3MiOiJodHRwczovL3d3dy5saW5rZWRpbi5jb20vb2F1dGgiLCJhdWQiOiI4NnFwb2Y4MTVnZjRqayIsImlhdCI6MTc0MjY0MDE0MiwiZXhwIjoxNzQyNjQzNzQyLCJzdWIiOiJ3Um5PUFhneUN2IiwibmFtZSI6IkFtZWVyYSBiYW51IiwiZ2l2ZW5fbmFtZSI6IkFtZWVyYSIsImZhbWlseV9uYW1lIjoiYmFudSIsImVtYWlsIjoiYmFudWFtZWVyYTc3NUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6InRydWUiLCJsb2NhbGUiOiJlbl9VUyJ9.hye15mqr5vqhwVXOt0j1XgxzFtjznMWzYoOcMy569coIF7pFlSXurvDuYILj57vh_QgLiCb515OwcTFKQ5ncSVarEDBSGobIwchOGnwjBaO1xcvovlORHZJwrGCU41cBvgnAg5jHLbHYTGeAe1Ul_m-aDtcO1bqZNkPT1QwaydZmRMCIPZHzBmhC4Na5YZdtfTFcuZMqNQoYIU2MCxK_1n4tHMsUawqNLYaBkEWz9BskAfGxmRCo89O267ip-iLVXEpvipYv9S2H45ln3adcYeu5y3PVsK_OdLi3NXu99u2lu3mewCpvp-D3MwU1HwiIvIy19kxiLTZcinRPnAohXx8KPyAI2K7G60Ky_paaUhtl4LCBe1MCUH7gWSeihwKC2TFXbm080CpzCtUNnbzIgZgp-VIk-_FF7sQdZbMPiSm2nk3RRCmONRcaLiLRCwHQrM8e3Lnf6-CUH_zkT14w91mivuja8PR2JQ0WVU55k1ULXvV_h9od0ORz2VutHY3UdomNsGxGtGZa5jzcJwmgR7H6xJw0Qo8marIWJhSZko-CX_EfHuEXrgQ2dY2-WrE6MGuu9rhXgV7Rx5hfz-RpeHW9Os_QHB4a44iRYf2QKuovyN2sf--ydOFgRs1esuwQvjeNjgmokD1acpIAAhfUC9z0aOBdHXlKETJ561Q3dPM'
    return this.linkedinApiService.getPosts(token);
  }

  @Post('publish')
  async publish(@Req() req, @Body() body: { text: string }) {
    const token = req.user.linkedinToken;
    return this.linkedinApiService.publishPost(token, body.text);
  }

  @Get('images')
  @ApiOperation({ summary: 'Fetch LinkedIn images using provided URNs' })
  @ApiQuery({
    name: 'accessToken',
    type: String,
    description: 'Valid LinkedIn access token',
  })
  @ApiQuery({
    name: 'version',
    type: String,
    description: 'LinkedIn API version in the format YYYYMM (e.g., 202305)',
  })
  @ApiResponse({ status: 200, description: 'Images fetched successfully' })
  async fetchImages(
    @Query('accessToken') accessToken: string,
    @Query('version') version: string,
  ) {
    return this.linkedinApiService.getImages(accessToken, version);
  }

  @Post('create-post')
  @ApiOperation({ summary: 'Create an organic LinkedIn post' })
  @ApiResponse({
    status: 201,
    description:
      'Post created successfully. The response header x-restli-id contains the Post ID.',
  })
  async createPost(@Body() createPostDto: CreateLinkedInPostDto) {
    return this.linkedinApiService.createPost(createPostDto);
  }


  @Post('upload-init')
  @ApiOperation({ summary: 'Initialize image upload' })
  @ApiResponse({
    status: 200,
    description:
      'Successfully initialized image upload. Returns an upload URL, expiration, and image URN.',
  })
  async initializeUpload(
    @Body() body: InitializeImageUploadDto,
    @Query('accessToken') accessToken: string,
    @Query('version') version: string,
  ) {
    return this.linkedinApiService.initializeUpload(body, accessToken, version);
  }

  @Get('batch')
  @ApiOperation({ summary: 'Batch get images by URNs' })
  @ApiQuery({
    name: 'accessToken',
    type: String,
    description: 'Valid LinkedIn access token',
  })
  @ApiQuery({
    name: 'version',
    type: String,
    description: 'LinkedIn API version (YYYYMM format)',
  })
  @ApiQuery({
    name: 'ids',
    type: String,
    description:
      'Comma-separated list of image URNs, e.g., urn:li:image:C4E10AQFn10iWtKexVA,urn:li:image:C4E10AQFgOYeVoHFeBw',
  })
  @ApiResponse({ status: 200, description: 'Batch images fetched successfully' })
  async batchGetImages(
    @Query('accessToken') accessToken: string,
    @Query('version') version: string,
    @Query('ids') ids: string,
  ) {
    const idArray = ids.split(',').map(id => id.trim());
    return this.linkedinApiService.batchGetImages(accessToken, version, idArray);
  }
  @Get('my-posts')
  @ApiOperation({ summary: 'Get posts from the authenticated account' })
  @ApiResponse({ status: 200, description: 'Posts retrieved successfully' })
  @ApiQuery({
    name: 'accessToken',
    type: String,
    description: 'Valid LinkedIn access token',
  })
  @ApiQuery({
    name: 'memberUrn',
    type: String,
    description: 'Authenticated member URN (e.g., urn:li:person:ABC123)',
  })
  @ApiQuery({
    name: 'version',
    type: String,
    description: 'LinkedIn API version in the format YYYYMM (e.g., 202503)',
  })
  async getMyPosts(
    @Query('accessToken') accessToken: string,
    @Query('memberUrn') memberUrn: string,
    @Query('version') version: string,
  ) {
    return this.linkedinApiService.getPostsForUser(accessToken, memberUrn, version);
  }
}

