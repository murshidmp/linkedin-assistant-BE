// src/linkedin-api/dto/initialize-image-upload.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitializeImageUploadDto {
  @ApiProperty({
    description: 'The URN of the entity that owns the asset (e.g., person or organization)',
    example: 'urn:li:organization:5583111',
  })
  owner: string;

  @ApiPropertyOptional({
    description: 'Optional metadata to register the asset in the media library',
    example: {
      associatedAccount: 'urn:li:sponsoredAccount:123456789',
      assetName: 'My media library asset',
    },
  })
  mediaLibraryMetadata?: {
    associatedAccount: string;
    assetName: string;
  };
}
