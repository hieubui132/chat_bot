import { Module } from '@nestjs/common';
import { WebHookController } from './webHook.controller';
import { WebHookService } from './webHook.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [WebHookController],
  providers: [WebHookService],
})
export class WebHookModule {}
