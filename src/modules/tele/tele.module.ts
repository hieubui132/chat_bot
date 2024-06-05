import { HttpModule } from '@nestjs/axios/dist/http.module';
import { Module } from '@nestjs/common';
import { TeleController } from './tele.controller';
import { TeleService } from './tele.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [TeleController],
  providers: [TeleService],
})
export class TeleModule {}
