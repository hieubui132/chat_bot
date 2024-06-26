import { Controller, Get } from '@nestjs/common';

@Controller('subject')
export class SubjectController {
  @Get('list')
  public async setWebHook() {
    const res = await this.service.setWebhook(body);
    return res;
  }
}
