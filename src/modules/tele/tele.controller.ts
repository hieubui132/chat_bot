import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { post_group, set_webhook } from 'src/model';
import { TeleService } from './tele.service';
import { Request, Response } from 'express';

@Controller('tele')
export class TeleController {
  constructor(private readonly service: TeleService) {}

  // APi này để gửi tin nhắn đến group tele
  @Post('send_group')
  public async sendMesToGroup(@Body() body: post_group) {
    const res = await this.service.pushTele(body);
    return res;
  }

  // APi này để cài đặt webhook cho chatbot
  @Post('set_webhook')
  public async setWebHook(@Body() body: set_webhook) {
    const res = await this.service.setWebhook(body);
    return res;
  }

  // APi này để cài đặt webhook cho chatbot
  @Get('get_webhook')
  public async getWebHook() {
    const res = await this.service.getWebhook();
    return res;
  }

  @Post()
  public async postWebhook(@Req() req: Request, @Res() res: Response) {
    console.log(req.body);
    const result = await this.service.callBackMsg(req.body);
    res.status(200).send(result);
  }
}
