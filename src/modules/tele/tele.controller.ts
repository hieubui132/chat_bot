import { Body, Controller, Post } from '@nestjs/common';
import { post_group } from 'src/model';
import { TeleService } from './tele.service';

@Controller('tele')
export class TeleController {
  constructor(private readonly service: TeleService) {}
  @Post('send_group')
  sendMesToGroup(@Body() body: post_group) {
    const res = this.service.sendMesToGroup(body);
    return res;
  }
}
