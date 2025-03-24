import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/linkedin-auth.entity'; // Adjust path as needed

@Injectable()
export class LinkedInAuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Build the LinkedIn OIDC authorization URL.
   */
  buildAuthorizationUrl(scope: string, state: string): string {
    const clientId = this.configService.get<string>('LINKEDIN_CLIENT_ID');
    const redirectUri = this.configService.get<string>('LINKEDIN_REDIRECT_URI');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId || '',
      redirect_uri: redirectUri || '',
      scope,
      state,
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  /**
   * Exchange the authorization code for tokens, retrieve the user profile from LinkedIn (/v2/userinfo),
   * and then save/update the user record in our database.
   * Returns our internal user ID along with token data.
   */
  async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    expires_in?: number;
    id_token?: string;
    userId: string;
  }> {
    const clientId = this.configService.get<string>('LINKEDIN_CLIENT_ID');
    const clientSecret = this.configService.get<string>('LINKEDIN_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('LINKEDIN_REDIRECT_URI');

    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri || '',
      client_id: clientId || '',
      client_secret: clientSecret || '',
    });

    // Exchange the code for tokens
    const { data } = await axios.post(tokenUrl, body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = data.access_token;
    const expiresIn = data.expires_in;
    const idToken = data.id_token;

    // Retrieve user profile from LinkedIn using the /v2/userinfo endpoint
    let profileData;
    try {
      const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'LinkedIn-Version': '202503', // Ensure this version is active per your app's settings
          'X-RestLi-Protocol-Version': '2.0.0',
        },
      });
      profileData = profileResponse.data;
    } catch (error) {
      console.error(
        'Error fetching LinkedIn profile:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        error.response?.data || 'Error fetching LinkedIn profile',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Extract fields from the /v2/userinfo response
    // OIDC standard returns the unique member identifier in the "sub" field.
    const linkedinId = profileData.sub; // For example: "782bbtaQ"
    const firstName = profileData.given_name;
    const lastName = profileData.family_name;
    // Optionally use "name" if full name is needed
    const profilePicture = profileData.picture; // may be undefined if not provided
    // Optionally, email and email_verified fields can also be extracted if available:
    // const email = profileData.email;
    // const emailVerified = profileData.email_verified;

    // Look up the user in our local database using their LinkedIn ID
    let user = await this.userRepository.findOne({ where: { linkedinId } });
    if (!user) {
      // Create a new user record
      user = this.userRepository.create({
        linkedinId,
        firstName,
        lastName,
        profilePicture,
        accessToken,
        expiresIn,
        idToken,
      });
    } else {
      // Update existing user record
      user.firstName = firstName;
      user.lastName = lastName;
      user.profilePicture = profilePicture;
      user.accessToken = accessToken;
      user.expiresIn = expiresIn;
      user.idToken = idToken;
    }
    const savedUser = await this.userRepository.save(user);

    return {
      access_token: accessToken,
      expires_in: expiresIn,
      id_token: idToken,
      userId: savedUser.id, // Return our internal user id
    };
  }

}
