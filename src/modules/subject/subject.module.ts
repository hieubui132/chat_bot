import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { subject } from 'src/entity';
import { ConfigModule } from '@nestjs/config';
import { TeleModule } from '../tele/tele.module';
import { SubjectController } from './subject.controller';
import { SubjectService } from './subject.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([subject]),
    ConfigModule,
    TeleModule,
  ],
  controllers: [SubjectController],
  providers: [SubjectService],
})
export class SubjectModule {}
