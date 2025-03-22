import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LinkedInApiService {
  // You might store user tokens in DB, or inject a UserService 
  // to retrieve them as needed.

  async getPosts(accessToken: string): Promise<any> {
    // example using the "shares" or "ugcPosts" endpoint
    // 1) find the URN for the user e.g. "urn:li:person:XXXXX"
    //    or store it when you first fetch user profile info

    const userUrn = 'urn:li:person:XYZ';
    const url = `https://api.linkedin.com/v2/shares?q=owners&owners=${encodeURIComponent(
      userUrn
    )}`;

    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return data;
  }

  async publishPost(accessToken: string, text: string): Promise<any> {
    // Example using the UGC Post endpoint
    // Need the user's URN as "author"
    const userUrn = 'urn:li:person:XYZ';
    const url = 'https://api.linkedin.com/v2/ugcPosts';

    const body = {
      author: userUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'CONNECTIONS',
      },
    };

    const { data } = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
    });
    return data;
  }

  // more methods as needed (get user profile, analytics, etc.)
}
