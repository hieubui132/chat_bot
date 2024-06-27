import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WebHookModule } from './modules/webhook/webHook.module';
import { TeleModule } from './modules/tele/tele.module';
import configuration from './config/configuration';
import { ScheduleModule } from '@nestjs/schedule';
import { JobModule } from './modules/job/job.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { conversation, employee, subject } from './entity';
import { SubjectModule } from './modules/subject/subject.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Tùy chọn này sẽ làm cho ConfigModule có sẵn ở mọi nơi trong ứng dụng
      envFilePath: '.env',
      load: [configuration],
    }),
    WebHookModule,
    TeleModule,
    SubjectModule,
    ScheduleModule.forRoot(),
    JobModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '117.103.224.26',
      port: 5432,
      username: 'postgres',
      password: 'Khongbiet098',
      database: 'messenger',
      entities: [conversation, employee, subject],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
