// src/linkedin-api/dto/update-linkedin-post.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateLinkedInPostDto } from './create-linkedin-post.dto';

export class UpdateLinkedInPostDto extends PartialType(CreateLinkedInPostDto) {}
