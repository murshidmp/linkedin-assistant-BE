import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkedInAuthService } from './linkedin-auth.service';
import { LinkedInAuthController } from './linkedin-auth.controller';
import { User } from './entities/linkedin-auth.entity';

@Module({
  imports: [
    ConfigModule, 
    TypeOrmModule.forFeature([User]),  // Include the User entity for repository injection
  ],
  controllers: [LinkedInAuthController],
  providers: [LinkedInAuthService],
  exports: [LinkedInAuthService],
})
export class LinkedInAuthModule {}
