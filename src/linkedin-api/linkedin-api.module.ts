import { Module } from '@nestjs/common';
import { LinkedInApiService } from './linkedin-api.service';
import { HttpModule } from '@nestjs/axios'; // optional, if you want to use HttpService
import { LinkedInApiController } from './linkedin-api.controller';

@Module({
  imports: [
    HttpModule, // or you can keep using axios directly
  ],
  controllers: [LinkedInApiController],
  providers: [LinkedInApiService],
  exports: [LinkedInApiService],
})
export class LinkedInApiModule {}
