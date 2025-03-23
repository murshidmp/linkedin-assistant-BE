import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { CreateLinkedInPostDto } from './entities/linkedin-api.entity';
import { InitializeImageUploadDto } from './entities/image-upload.entity';

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
  async getImages(accessToken: string, version: string): Promise<any> {
    const url = 'https://api.linkedin.com/rest/images';
    const params = {
      // The query param should be exactly as required:
      // "List(urn:li:image:C4E10AQFn10iWtKexVA,urn:li:image:C4E10AQFgOYeVoHFeBw)"
      ids: 'List(urn:li:image:C4E10AQFn10iWtKexVA,urn:li:image:C4E10AQFgOYeVoHFeBw)',
    };
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'LinkedIn-Version': version, // e.g., "202305"
      'X-RestLi-Protocol-Version': '2.0.0',
    };

    try {
      const response = await axios.get(url, { params, headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching images:', error.response?.data || error.message);
      throw error;
    }
  }

  async createPost(createPostDto: CreateLinkedInPostDto): Promise<any> {
    const { accessToken, version, media, ...postData } = createPostDto;

    // Build payload without the media field if it's not provided.
    const payload = { ...postData };
    if (media) {
      // If media is provided, include it. Otherwise, do not.
      payload['media'] = media;
    }

    const url = 'https://api.linkedin.com/rest/posts';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'X-RestLi-Protocol-Version': '2.0.0',
      'LinkedIn-Version': 202503, // e.g., "202503"
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(url, payload, { headers });
      // LinkedIn returns a header 'x-restli-id' containing the post ID.
      const postId = response.headers['x-restli-id'];
      return { data: response.data, postId };
    } catch (error) {
      console.error(
        'Error creating LinkedIn post:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        error.response?.data || 'Error creating post',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async initializeUpload(
    body: InitializeImageUploadDto,
    accessToken: string,
    version: string,
  ): Promise<any> {
    const url = 'https://api.linkedin.com/rest/images?action=initializeUpload';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'X-RestLi-Protocol-Version': '2.0.0',
      'LinkedIn-Version': version,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(url, { initializeUploadRequest: body }, { headers });
      return response.data;
    } catch (error) {
      console.error(
        'Error initializing image upload:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        error.response?.data || 'Error initializing image upload',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Batch get images by their URNs.
   * Expects an array of URNs, for example:
   * ["urn:li:image:C4E10AQFn10iWtKexVA", "urn:li:image:C4E10AQFgOYeVoHFeBw"]
   */
  async batchGetImages(
    accessToken: string,
    version: string,
    ids: string[],
  ): Promise<any> {
    // Construct the ids parameter: List(urn%3Ali%3Aimage%3A...,urn%3Ali%3Aimage%3A...)
    const encodedIds = ids.map(id => encodeURIComponent(id)).join(',');
    const idsParam = `List(${encodedIds})`;

    const url = `https://api.linkedin.com/rest/images?ids=${idsParam}`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'X-RestLi-Protocol-Version': '2.0.0',
      'LinkedIn-Version': version,
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error(
        'Error fetching images:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        error.response?.data || 'Error fetching images',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // more methods as needed (get user profile, analytics, etc.)
}
