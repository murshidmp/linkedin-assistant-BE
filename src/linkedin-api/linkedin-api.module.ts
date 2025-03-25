import { Module } from '@nestjs/common';
import { LinkedInApiService } from './linkedin-api.service';
import { HttpModule } from '@nestjs/axios'; // optional, if you want to use HttpService
import { LinkedInApiController } from './linkedin-api.controller';
import { User } from 'src/linkedin-auth/entities/linkedin-auth.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/entities/post.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([User,Post]) // or you can keep using axios directly
  ],
  controllers: [LinkedInApiController],
  providers: [LinkedInApiService],
  exports: [LinkedInApiService],
})
export class LinkedInApiModule {}
