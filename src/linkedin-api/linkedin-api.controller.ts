import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { LinkedInApiService } from './linkedin-api.service';
import { CreateLinkedinApiDto } from './dto/create-linkedin-api.dto';
import { UpdateLinkedinApiDto } from './dto/update-linkedin-api.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('linkedin')
@Controller('linkedin')
export class LinkedInApiController {
  constructor(private readonly linkedinApiService: LinkedInApiService) {}

  @Get('posts')
  async fetchPosts(@Req() req) {
    // get user token from DB or session
    // const token = req.user.linkedinToken;
    const token = 'AQVH79BTCyy3Q-UbfxmsmKQ_yLn0Lq8v_pj7-pip6MF1UP2-KkZP66_tg12rPk3-YoWBOkn8F12CDLwWynNFYCMAsU26kzqbG7BluBdvwQvtwgxsgIGtNg1S4HNsRgkqy_uIB9tGfgcDZU4fRJ7hqzDciYBuqXF077KZUN6LeJYlnu43cNM-Q863FfU9a1gHldwtrhbanbWf_1lKe4iWZOdKEEYjSssjVGKjylrWUjG8YWnKJ3iACMNZpTY9QaRYQvsaeEZFgt7K8unM43k3JBQbmmhLCnuFtiDU6nUumI8KiTbYbNsblkLfMQ_ShiBmlOOqfo4LKGlm5lBXmQpENi5RwiR14A'
    return this.linkedinApiService.getPosts(token);
  }

  @Post('publish')
  async publish(@Req() req, @Body() body: { text: string }) {
    const token = req.user.linkedinToken;
    return this.linkedinApiService.publishPost(token, body.text);
  }
}

