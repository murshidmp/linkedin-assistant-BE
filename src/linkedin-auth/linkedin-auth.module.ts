import { Module } from '@nestjs/common';
import { LinkedInAuthService } from './linkedin-auth.service';
import { LinkedInAuthController } from './linkedin-auth.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // ensure we have env variables
  controllers: [LinkedInAuthController],
  providers: [LinkedInAuthService],
})
export class LinkedInAuthModule {}
