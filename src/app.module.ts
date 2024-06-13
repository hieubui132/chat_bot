import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WebHookModule } from './modules/webhook/webHook.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Tùy chọn này sẽ làm cho ConfigModule có sẵn ở mọi nơi trong ứng dụng
      envFilePath: '.env',
    }),
    WebHookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
