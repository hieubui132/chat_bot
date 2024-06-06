import { Module } from '@nestjs/common';
import { TasksService } from './autocall';
import { JobService } from './job.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { conversation } from 'src/entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // ...Object.values(tables)
      conversation,
    ]),
    HttpModule,
  ],
  providers: [JobService, TasksService],
})
export class JobModule {}
