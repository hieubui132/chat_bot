import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { post_group, set_webhook } from 'src/model';
import { ConfigService } from '@nestjs/config';
import { tele_url } from 'src/api/url';
import { InjectRepository } from '@nestjs/typeorm';
import { employee, subject } from 'src/entity';
import { Repository } from 'typeorm';

@Injectable()
export class TeleService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
    @InjectRepository(employee)
    private employees: Repository<employee>,
    @InjectRepository(subject)
    private subjects: Repository<subject>,
  ) {}

  async sendMesToGroup(mes: string) {
    const token = this.configService.get<string>('tele_token');
    const group = this.configService.get<string>('tele_group_id');
    const url = `${tele_url}/bot${token}/sendMessage?chat_id=${group}&text=${mes}`;
    const res = await this.httpService.axiosRef.post(url);
    return res.status == 200;
  }

  async pushTele(mes: post_group) {
    const entity = await this.subjects.findOne({
      where: {
        id: mes.subject_id,
      },
      relations: {
        employees: true,
      },
    });

    if (entity == null) {
      return false;
    }

    const tag: string[] = [];
    for (const e of entity.employees) {
      tag.push('@' + e.tele_id);
    }
    if (tag.length > 0) {
      let mes = tag.join(' ');
      mes +=
        ' Có người cần hỗ trợ, các bạn vui lòng vào page check tin nhắn nhé!';
      const res = await this.sendMesToGroup(mes);
      return res;
    }

    return false;
  }
  async setWebhook(body: set_webhook) {
    const token = this.configService.get<string>('tele_token');
    const url = `${tele_url}/bot${token}/setWebhook?url=${body.domain}`;
    const res = await this.httpService.axiosRef.post(url, {
      allowed_updates: ['message'],
    });
    return res.status == 200;
  }

  async getWebhook() {
    const token = this.configService.get<string>('tele_token');
    const url = `${tele_url}/bot${token}/getWebhookInfo`;
    const res = await this.httpService.axiosRef.post(url);
    return res.data;
  }
}
