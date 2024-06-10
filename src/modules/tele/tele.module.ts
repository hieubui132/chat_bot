import { HttpModule } from '@nestjs/axios/dist/http.module';
import { Module } from '@nestjs/common';
import { TeleController } from './tele.controller';
import { TeleService } from './tele.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { employee, subject } from 'src/entity';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([employee, subject]),
  ],
  controllers: [TeleController],
  providers: [TeleService],
})
export class TeleModule {}
