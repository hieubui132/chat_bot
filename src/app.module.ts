import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WebHookModule } from './modules/webhook/webHook.module';

@Module({
  imports: [ConfigModule.forRoot(), WebHookModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
