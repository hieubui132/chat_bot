import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobService } from './job.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { fb_url } from 'src/api/url';

@Injectable()
export class TasksService {
  constructor(
    private jobService: JobService,
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async handleCron() {
    const page_id = this.configService.get<string>('page_id');
    const page_access_token =
      this.configService.get<string>('page_access_token');
    const url = `${fb_url}/${page_id}/conversations?platform=messenger&access_token=${page_access_token}`;
    const res = await this.httpService.axiosRef.get(url);
    if (res.status == 200) {
      this.jobService.saveConversation(res.data.data);
    }
  }
}
