import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../linkedin-auth/entities/linkedin-auth.entity';
import { CreateLinkedInPostDto } from './dto/create-linkedin-post.dto';
import { UpdateLinkedInPostDto } from './dto/update-linkedin-post.dto';
import { Post } from 'src/post/entities/post.entity';

@Injectable()
export class LinkedInApiService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) { }

  /**
   * Create a LinkedIn post using the local user's stored credentials.
   * The client sends a CreateLinkedInPostDto containing:
   *  - userId: local user ID
   *  - commentary: text content of the post
   */
  async createPostUsingUser(createDto: CreateLinkedInPostDto): Promise<any> {
    // Lookup user by local userId
    const user = await this.userRepository.findOne({ where: { id: createDto.userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Build the payload using the DTO values.
    // If user.linkedinId is stored as just the ID (e.g., "hzPck-LUgV"), prefix with "urn:li:person:".
    // Otherwise, if stored as full URN, simply use user.linkedinId.
    const authorUrn = `urn:li:person:${user.linkedinId}`;

    const payload: any = {
      author: authorUrn,
      commentary: createDto.commentary,
      distribution: createDto.distribution,
      lifecycleState: createDto.lifecycleState,
      visibility: createDto.visibility,
      isReshareDisabledByAuthor: createDto.isReshareDisabledByAuthor,
    };

    // Optionally include content if provided
    if (createDto.content) {
      payload.content = createDto.content;
    }
    if (createDto.container) {
      payload.container = createDto.container;
    }
    if (createDto.contentLandingPage) {
      payload.contentLandingPage = createDto.contentLandingPage;
    }
    if (createDto.contentCallToActionLabel) {
      payload.contentCallToActionLabel = createDto.contentCallToActionLabel;
    }

    const url = 'https://api.linkedin.com/rest/posts';
    const headers = {
      Authorization: `Bearer ${user.accessToken}`,
      'X-RestLi-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202503', // Use active version in YYYYMM format
      'Content-Type': 'application/json',
    };

    try {
      // Call LinkedIn API to create the post
      const response = await axios.post(url, payload, { headers });
      const linkedInPostId = response.headers['x-restli-id'];

      // Save a local post record associated with the user.
      const postRecord = this.postRepository.create({
        content: payload, // Storing the full payload as JSON (or you may store selected fields)
        linkedInPostId: linkedInPostId,
        user: user,
      });
      const savedPost = await this.postRepository.save(postRecord);

      return {
        data: response.data,
        linkedInPostId,
        localPostId: savedPost.id,
      };
    } catch (error) {
      console.error('Error creating LinkedIn post:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data || 'Error creating LinkedIn post',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPostByUrn(
    userId: string,
    postUrn: string,
  ): Promise<any> {

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const authorUrn = `urn:li:person:${user.linkedinId}`;
    console.log(user);
    const encodedUrn = encodeURIComponent(authorUrn);
    // Build the URL with the viewContext parameter set to AUTHOR
    const url = `https://api.linkedin.com/rest/posts?author=${encodedUrn}&q=author&viewContext=AUTHOR&count=10&sortBy=LAST_MODIFIED`;

    const headers = {
      Authorization: `Bearer ${user.accessToken}`,
      'X-RestLi-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202503'
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error(
        'Error fetching post by URN:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        error.response?.data || 'Error fetching post by URN',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPostFromDb(userId: string, postUrn: string): Promise<any> {
    // Lookup user by local userId
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Find the post that belongs to this user and has the given LinkedIn post URN
    const post = await this.postRepository.findOne({
      where: { linkedInPostId: postUrn, user: { id: user.id } },
    });

    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    return post;
  }
  /**
   * Update a LinkedIn post using its LinkedIn post ID.
   * The update is performed via a partial update call.
   * @param userId Local user ID.
   * @param linkedinPostId The LinkedIn post's URN (e.g., "urn:li:ugcPost:68447855235931240").
   * @param updateDto Contains fields to update (e.g., commentary).
   * @param version LinkedIn API version (YYYYMM format).
   */
  async updatePostByUser(
    userId: string,
    linkedinPostId: string,
    updateDto: UpdateLinkedInPostDto,
    version: string,
  ): Promise<any> {
    // Look up the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Build partial update payload
    // Only set fields that the user is actually changing
    const setObject: any = {};

    if (updateDto.commentary !== undefined) {
      setObject.commentary = updateDto.commentary;
    }
    if (updateDto.contentCallToActionLabel !== undefined) {
      setObject.contentCallToActionLabel = updateDto.contentCallToActionLabel;
    }
    if (updateDto.contentLandingPage !== undefined) {
      setObject.contentLandingPage = updateDto.contentLandingPage;
    }
    // Additional fields as needed...

    const payload = {
      patch: {
        $set: setObject,
      },
    };

    const url = `https://api.linkedin.com/rest/posts/${encodeURIComponent(linkedinPostId)}`;
    const headers = {
      Authorization: `Bearer ${user.accessToken}`,
      'X-RestLi-Protocol-Version': '2.0.0',
      'LinkedIn-Version': version,
      'Content-Type': 'application/json',
      'X-RestLi-Method': 'PARTIAL_UPDATE',
    };

    try {
      // 1) Partial update on LinkedIn
      await axios.post(url, payload, { headers });

      // 2) Update local DB if we store the post
      const localPost = await this.postRepository.findOne({
        where: { user: { id: userId }, linkedInPostId: linkedinPostId },
      });

      if (localPost) {
        // If the user changed commentary, update in local DB
        if (updateDto.commentary !== undefined) {
          // If you previously stored commentary inside 'content', you can update it:
          const contentObj = typeof localPost.content === 'object'
            ? localPost.content
            : {};

          contentObj.commentary = updateDto.commentary;
          localPost.content = contentObj;
          // or directly store commentary in a dedicated column, up to your DB design
        }

        await this.postRepository.save(localPost);
      }

      return { message: 'Post updated successfully' };
    } catch (error) {
      console.error('Error updating post:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data || 'Error updating post',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a LinkedIn post, plus remove from local DB if present.
   */
  async deletePostByUser(
    userId: string,
    linkedinPostId: string,
    version: string,
  ): Promise<any> {
    // Look up the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const url = `https://api.linkedin.com/rest/posts/${encodeURIComponent(linkedinPostId)}`;
    const headers = {
      Authorization: `Bearer ${user.accessToken}`,
      'X-RestLi-Protocol-Version': '2.0.0',
      'LinkedIn-Version': version,
      'Content-Type': 'application/json',
      'X-RestLi-Method': 'DELETE', // Not always required, but clarifies the method
    };

    try {
      // 1) Delete on LinkedIn
      await axios.delete(url, { headers });

      // 2) Also remove from local DB
      const localPost = await this.postRepository.findOne({
        where: { user: { id: userId }, linkedInPostId: linkedinPostId },
      });

      if (localPost) {
        await this.postRepository.remove(localPost);
      }

      return { message: 'Post deleted successfully' };
    } catch (error) {
      console.error('Error deleting post:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data || 'Error deleting post',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
