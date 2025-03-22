import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { LinkedInApiService } from './linkedin-api.service';
import { CreateLinkedinApiDto } from './dto/create-linkedin-api.dto';
import { UpdateLinkedinApiDto } from './dto/update-linkedin-api.dto';
import { ApiTags } from '@nestjs/swagger';

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
}

