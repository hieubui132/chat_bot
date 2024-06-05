import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WebHookModule } from './modules/webhook/webHook.module';
import { TeleModule } from './modules/tele/tele.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Tùy chọn này sẽ làm cho ConfigModule có sẵn ở mọi nơi trong ứng dụng
      envFilePath: '.env',
      load: [configuration],
    }),
    WebHookModule,
    TeleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
