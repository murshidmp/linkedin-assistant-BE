import {
  Controller,
  Get,
  Query,
  Res,
  Session,
  HttpException,
  HttpStatus,
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

  @Get('redirect')
  @ApiOperation({ summary: 'Redirect user to LinkedIn OAuth screen' })
  @ApiResponse({ status: 302, description: 'Redirects to LinkedIn login page' })
  redirectToLinkedIn(
    @Res() res: Response,
    @Session() session?: Record<string, any>,
  ) {
    // Generate a random state string for CSRF protection
    const state = crypto.randomBytes(8).toString('hex');
    if (session) {
      session.linkedinState = state;
    }

    // Use OIDC scopes (openid profile email) plus w_member_social if posting is needed
    const scope = 'openid profile email w_member_social';
    const authorizeUrl = this.linkedinAuthService.buildAuthorizationUrl(scope, state);
    return res.redirect(authorizeUrl);
  }

  @Get('callback')
  @ApiOperation({ summary: 'Handle LinkedIn OAuth callback and return local user details' })
  @ApiQuery({
    name: 'code',
    type: String,
    description: 'The authorization code returned by LinkedIn',
  })
  @ApiQuery({
    name: 'state',
    type: String,
    description: 'The state parameter for CSRF protection',
  })
  @ApiResponse({ status: 200, description: 'Returns local user id and tokens' })
  async handleCallback(
    @Query('code') code: string,
    @Query('state') returnedState: string,
    @Res() res: Response,
    @Session() session?: Record<string, any>,
  ) {
    // Validate state parameter to protect against CSRF
    if (session) {
      const storedState = session.linkedinState;
      if (!storedState || storedState !== returnedState) {
        throw new HttpException('Invalid or missing state parameter', HttpStatus.FORBIDDEN);
      }
      session.linkedinState = null;
    }

    // Exchange the code for tokens and save/update the user profile in our DB.
    const tokenResponse = await this.linkedinAuthService.exchangeCodeForToken(code);
    // Return a JSON response with our internal user ID and token details.
    return res.json({
      userId: tokenResponse.userId, // internal (local DB) user id
      access_token: tokenResponse.access_token,
      expires_in: tokenResponse.expires_in,
      id_token: tokenResponse.id_token,
    });
  }
}
