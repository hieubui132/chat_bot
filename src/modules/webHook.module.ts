import { Module } from '@nestjs/common';
import { WebHookController } from './WebHook.controller';
import { WebHookService } from './webHook.service';

@Module({
  imports: [],
  controllers: [WebHookController],
  providers: [WebHookService],
})
export class WebHookModule {}
