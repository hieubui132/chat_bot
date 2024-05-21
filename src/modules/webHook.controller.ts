import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { WebHookService } from './webHook.service';
import { Request, Response } from 'express';

@Controller('webhook')
export class WebHookController {
  constructor(private readonly webHookService: WebHookService) {}

  @Get()
  getWebhook(@Req() req: Request, @Res() res: Response): any {
    return this.webHookService.getWebhook(req, res);
  }

  @Post()
  postWebhook(@Req() req: Request, @Res() res: Response): any {
    return this.webHookService.postWebhook(req, res);
  }
}
