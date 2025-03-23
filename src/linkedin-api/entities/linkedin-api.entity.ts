// src/linkedin-api/dto/create-linkedin-post.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLinkedInPostDto {
  @ApiProperty({
    description: 'The LinkedIn access token',
    example: 'AQX...your_access_token...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'LinkedIn API version in the format YYYYMM',
    example: '202503',
  })
  version: string;

  @ApiProperty({
    description: 'The author URN (e.g., organization or member)',
    example: 'urn:li:organization:5515715',
  })
  author: string;

  @ApiProperty({
    description: 'The commentary text of the post',
    example: 'Sample text Post',
  })
  commentary: string;

  @ApiProperty({
    description: 'Visibility of the post',
    example: 'PUBLIC',
  })
  visibility: string;

  @ApiProperty({
    description: 'Distribution settings for the post',
    example: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
  })
  distribution: {
    feedDistribution: string;
    targetEntities: any[];
    thirdPartyDistributionChannels: any[];
  };

  @ApiProperty({
    description: 'The lifecycle state of the post',
    example: 'PUBLISHED',
  })
  lifecycleState: string;

  @ApiProperty({
    description: 'Indicates if resharing is disabled by the author',
    example: false,
  })
  isReshareDisabledByAuthor: boolean;

  @ApiPropertyOptional({
    description:
      'Optional media object. Include this only when creating a post with media. For text-only posts, leave it undefined.',
    example: {
      title: 'Title of the video',
      id: 'urn:li:video:C5F10AQGKQg_6y2a4sQ',
    },
  })
  media?: {
    title: string;
    id: string;
  };
}
