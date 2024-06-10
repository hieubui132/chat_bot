import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { post_group } from 'src/model';
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

  async sendMesToGroup(mes: post_group) {
    const token = this.configService.get<string>('tele_token');
    const group = this.configService.get<string>('tele_group_id');
    const url = `${tele_url}/bot${token}/sendMessage?chat_id=${group}&text=${mes.mess}`;
    console.log(url);
    const res = await this.httpService.axiosRef.post(url);
    return res.status == 200;
  }

  async sendMesToGroup1(mes: post_group) {
    // const token = this.configService.get<string>('tele_token');
    // const group = this.configService.get<string>('tele_group_id');
    // const url = `${tele_url}/bot${token}/sendMessage?chat_id=${group}&text=${mes.mess}`;
    // const res = await this.httpService.axiosRef.post(url);
    // return res.status == 200;
    console.log(mes);
    const entity = this.subjects.findOne({
      where: {
        id: mes.subject_id,
      },
      relations: {
        employees: true,
      },
    });
    return entity;
  }
}
