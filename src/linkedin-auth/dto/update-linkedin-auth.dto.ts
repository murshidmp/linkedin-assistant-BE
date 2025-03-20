import { PartialType } from '@nestjs/swagger';
import { CreateLinkedinAuthDto } from './create-linkedin-auth.dto';

export class UpdateLinkedinAuthDto extends PartialType(CreateLinkedinAuthDto) {}
