import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class LinkedInAuthService {
  constructor(private readonly configService: ConfigService) {}

  async exchangeCodeForToken(code: string): Promise<void> {
    const clientId = this.configService.get('LINKEDIN_CLIENT_ID');
    const clientSecret = this.configService.get('LINKEDIN_CLIENT_SECRET');
    const redirectUri = this.configService.get('LINKEDIN_REDIRECT_URI');

    const url = 'https://www.linkedin.com/oauth/v2/accessToken';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    } as any);

    const { data } = await axios.post(url, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = data.access_token;
    const expiresIn = data.expires_in;
    // Possibly a refresh token if LinkedIn provides it

    // store in DB (pseudo-code)
    // e.g. userRepository.save({ linkedinAccessToken: accessToken, ... });

    console.log('LinkedIn Access Token:', accessToken);
  }
}