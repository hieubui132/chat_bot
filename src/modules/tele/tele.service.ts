import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { post_group } from 'src/model';
import { ConfigService } from '@nestjs/config';
import { tele_url } from 'src/api/url';

@Injectable()
export class TeleService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async sendMesToGroup(mes: post_group) {
    const token = this.configService.get<string>('tele_token');
    const group = this.configService.get<string>('tele_group_id');
    const url = `${tele_url}/bot${token}/sendMessage?chat_id=${group}&text=${mes.mess}`;
    console.log(url);
    const res = await this.httpService.axiosRef.post(url);
    return res.status == 200;
  }
}
