import {
  Controller,
  Get,
  Query,
  Res,
  Session,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { LinkedInAuthService } from './linkedin-auth.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as crypto from 'crypto';

@ApiTags('linkedin')
@Controller('auth/linkedin')
export class LinkedInAuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly linkedinAuthService: LinkedInAuthService,
  ) {}

  /**
   * Redirect user to LinkedIn OAuth screen
   */
  @Get('redirect')
  @ApiOperation({ summary: 'Redirect user to LinkedIn OAuth screen' })
  @ApiResponse({ status: 302, description: 'Redirects to LinkedIn login page' })
  redirectToLinkedIn(@Res() res: Response, @Session() session?: Record<string, any>) {
    // 1) Generate a random "state" to protect against CSRF
    const state = crypto.randomBytes(8).toString('hex');
    if (session) {
      session.linkedinState = state;
    }

    // 2) Build the LinkedIn authorization URL, using OIDC scopes
    // If you also need to post, add "w_member_social"
    const scope = 'openid profile email w_member_social';
    const authorizeUrl = this.linkedinAuthService.buildAuthorizationUrl(scope, state);

    // 3) Redirect the user to LinkedIn
    return res.redirect(authorizeUrl);
  }

  /**
   * Handle LinkedIn OAuth callback
   */
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
    @Query('state') returnedState: string,
    @Res() res: Response,
    @Session() session?: Record<string, any>,
  ) {
    // 1) Optional: verify 'state' to prevent CSRF
    if (session) {
      const storedState = session.linkedinState;
      if (!storedState || storedState !== returnedState) {
        console.error('Invalid or missing state parameter!');
        return res.redirect('/error'); // or throw an exception
      }
      session.linkedinState = null;
    }

    // 2) Exchange the code for tokens (access_token and optionally id_token)
    const tokenResponse = await this.linkedinAuthService.exchangeCodeForToken(code);

    // console.log('LinkedIn Access Token:', tokenResponse.access_token);
    // console.log('LinkedIn ID Token:', tokenResponse.id_token); // if OIDC scope was requested
    return { tokenResponse };
    // 3) (Optional) Fetch user info from /userinfo endpoint
    // or decode the ID token to get sub, name, email, etc.
    // const userInfo = await this.linkedinAuthService.getUserInfo(tokenResponse.access_token);
    // console.log('User info from LinkedIn OIDC:', userInfo);

    // 4) Redirect or respond with success
    return res.redirect('/'); // or wherever you want
  }
}