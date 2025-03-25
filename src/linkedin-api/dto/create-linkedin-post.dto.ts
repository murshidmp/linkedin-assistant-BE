// src/linkedin-api/dto/create-linkedin-post.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLinkedInPostDto {
  @ApiProperty({ description: 'Local user ID', example: '123' })
  userId: string;

  @ApiProperty({ description: 'Post commentary text', example: 'Hello, LinkedIn!' })
  commentary: string;

  @ApiProperty({ description: 'Post visibility', example: 'PUBLIC' })
  visibility: string;

  @ApiProperty({
    description: 'Distribution settings for the post',
    example: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: []
    },
  })
  distribution: {
    feedDistribution: string;
    targetEntities: any[];
    thirdPartyDistributionChannels: any[];
  };

  @ApiProperty({ description: 'Lifecycle state of the post', example: 'PUBLISHED' })
  lifecycleState: string;

  @ApiProperty({ description: 'Indicates whether resharing is disabled by the author', example: false })
  isReshareDisabledByAuthor: boolean;

  @ApiPropertyOptional({
    description: 'Optional content object. Supply one of the supported content types. For example, for an article post:',
    example: {
      article: {
        source: 'https://example.com/latest-article',
        thumbnail: 'urn:li:image:C49klciosC89',
        title: 'Latest Article Title',
        description: 'A brief description of our latest article.'
      }
    },
  })
  content?: {
    article?: {
      source: string;
      thumbnail?: string;
      title: string;
      description: string;
    };
    media?: {
      title: string;
      id: string;
    };
    // You can later add more types (e.g., poll, multiImage) if needed.
  };

  // Optionally add container, contentLandingPage, contentCallToActionLabel if your use-case requires
  @ApiPropertyOptional({ description: 'Container URN (if the post belongs to a container)', example: 'urn:li:container:12345' })
  container?: string;

  @ApiPropertyOptional({ description: 'URL that opens when the post content is clicked', example: 'https://example.com/destination' })
  contentLandingPage?: string;

  @ApiPropertyOptional({ description: 'Call-to-action label associated with the post', example: 'LEARN_MORE' })
  contentCallToActionLabel?: string;
}
