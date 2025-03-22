import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class LinkedInAuthService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Build the LinkedIn OIDC authorization URL
   */
  buildAuthorizationUrl(scope: string, state: string): string {
    const clientId = this.configService.get('LINKEDIN_CLIENT_ID');
    const redirectUri = this.configService.get('LINKEDIN_REDIRECT_URI');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state,
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  /**
   * Exchange the authorization code for an access token and (if using openid scope) an ID token
   */
  async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    expires_in?: number;
    id_token?: string;
  }> {
    const clientId = this.configService.get('LINKEDIN_CLIENT_ID');
    const clientSecret = this.configService.get('LINKEDIN_CLIENT_SECRET');
    const redirectUri = this.configService.get('LINKEDIN_REDIRECT_URI');

    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const { data } = await axios.post(tokenUrl, body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // data typically has: access_token, expires_in, id_token (if OIDC)
    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
      id_token: data.id_token, // included if "openid" scope was used
    };
  }

  /**
   * Optional: fetch user info from the /userinfo endpoint
   * to get sub, name, picture, email, etc.
   */
  async getUserInfo(accessToken: string) {
    const url = 'https://api.linkedin.com/v2/userinfo';
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return data;
  }
}
