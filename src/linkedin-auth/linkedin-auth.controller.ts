import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { LinkedInAuthService } from './linkedin-auth.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('linkedin')
@Controller('auth/linkedin')
export class LinkedInAuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly linkedinAuthService: LinkedInAuthService,
  ) {}

  @Get('redirect')
  @ApiOperation({ summary: 'Redirect user to LinkedIn OAuth screen' })
  @ApiResponse({ status: 302, description: 'Redirects to LinkedIn login page' })
  redirectToLinkedIn(@Res() res: Response) {
  const clientId = this.configService.get('LINKEDIN_CLIENT_ID');
  const redirectUri = this.configService.get('LINKEDIN_REDIRECT_URI');
  const scope = 'r_liteprofile r_emailaddress w_member_social';
  const authorizeUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&scope=${encodeURIComponent(scope)}`;


  return res.redirect(authorizeUrl);
}

  @Get('callback')
  @ApiOperation({ summary: 'Handle LinkedIn OAuth callback' })
  @ApiQuery({
    name: 'code',
    type: String,
    description: 'The authorization code returned by LinkedIn',
  })
  @ApiResponse({ status: 302, description: 'Redirects after exchanging code' })
  async handleLinkedInCallback(
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    console.log('CODE from LinkedIn is:', code);
    // Exchange code for token
    await this.linkedinAuthService.exchangeCodeForToken(code);

    // Redirect or respond with success
    return res.redirect('/dashboard'); // or wherever
  }
}