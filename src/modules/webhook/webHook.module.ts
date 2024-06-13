import { Module } from '@nestjs/common';
import { WebHookController } from './webHook.controller';
import { WebHookService } from './webHook.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { employee, subject } from 'src/entity';
import { ConfigModule } from '@nestjs/config';
import { TeleModule } from '../tele/tele.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([employee, subject]),
    ConfigModule,
    TeleModule,
  ],
  controllers: [WebHookController],
  providers: [WebHookService],
})
export class WebHookModule {}
