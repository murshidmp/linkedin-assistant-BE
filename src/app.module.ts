import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './post/post.module';
import { ScheduleModule } from './schedule/schedule.module';
import { TasksModule } from './task/task.module';
import { BullModule } from '@nestjs/bullmq';
import { LinkedInAuthModule } from './linkedin-auth/linkedin-auth.module';
import { LinkedInApiModule } from './linkedin-api/linkedin-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'linkedin_assistant',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
    }),
    PostModule,
    ScheduleModule,
    TasksModule,
    LinkedInAuthModule,
    LinkedInApiModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
