import { Module } from '@nestjs/common';
import { WebHookController } from './webHook.controller';
import { WebHookService } from './webHook.service';

@Module({
  imports: [],
  controllers: [WebHookController],
  providers: [WebHookService],
})
export class WebHookModule {}
