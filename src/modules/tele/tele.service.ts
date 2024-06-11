import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { post_group, set_webhook } from 'src/model';
import { ConfigService } from '@nestjs/config';
import { tele_url } from 'src/api/url';
import { InjectRepository } from '@nestjs/typeorm';
import { employee, subject } from 'src/entity';
import { In, Repository } from 'typeorm';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

@Injectable()
export class TeleService {
  private readonly bot: Telegraf;
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
    @InjectRepository(employee)
    private employees: Repository<employee>,
    @InjectRepository(subject)
    private subjects: Repository<subject>,
  ) {
    const token = this.configService.get<string>('tele_token');
    this.bot = new Telegraf(token);
    this.bot.on(message('text'), (ctx) => ctx.reply('Hello'));
    // this.bot.telegram.sendMessage('-4249901175', 'xvvv');
    // this.bot.on();
    this.bot.launch({
      webhook: {
        // Public domain for webhook; e.g.: example.com
        domain: this.configService.get<string>('tele_webhook_domain'),
        // Port to listen on; e.g.: 8080
        // port: port,
        // Optional path to listen for.
        // `bot.secretPathComponent()` will be used by default
        path: this.configService.get<string>('tele_webhook_path'),
        // Optional secret to be sent back in a header for security.
        // e.g.: `crypto.randomBytes(64).toString("hex")`
        // secretToken: randomAlphaNumericString,
      },
    });
  }

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
    let mesString = '';
    if (tag.length > 0) {
      mesString = tag.join(' ');
      mesString += ` Có người cần hỗ trợ môn ${entity.name}, các bạn vui lòng vào page check tin nhắn nhé!`;
      const res = await this.sendMesToGroup(mesString);
      return res;
    } else {
      mesString = `Có người cần hỗ trợ môn ${entity.name}, ai làm được thì triển nhé!`;
      const res = await this.sendMesToGroup(mesString);
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

  async callBackMsg(body: any) {
    if (body.message.text) {
      return await this.command(body);
    } else if (body.message.left_chat_member || body.message.new_chat_member) {
      return await this.addOrRemoveMember(body);
    }
  }
  async command(body: any) {
    const group_id = this.configService.get<string>('tele_group_id');
    const mes = body.message.text;
    const stringArr = mes.split(' ');
    // if (stringArr[1] == undefined || stringArr[2] == undefined) {
    //   this.bot.telegram.sendMessage(
    //     group_id,
    //     'Lệnh sai! vui lòng nhập lại lệnh',
    //   );
    //   return false;
    // }
    const command = stringArr[0];
    let userId = stringArr[1];
    if (userId) userId = userId.replace('@', '');
    const employee = await this.employees.findOne({
      where: {
        tele_id: userId,
      },
      relations: {
        subjects: true,
      },
    });

    switch (command) {
      case '/set_role':
        if (employee == null) {
          this.bot.telegram.sendMessage(
            group_id,
            'Người dùng không tồn tại trong group',
          );
          return true;
        }
        const subject = stringArr[2].split(',');
        const subjectList = await this.subjects.find({
          where: {
            id: In(subject),
          },
        });
        employee.subjects = subjectList;
        const result = await this.employees.save(employee);
        this.bot.telegram.sendMessage(group_id, `Đã gán quyền cho ${userId}`);
        return result;
      case '/delete_role':
        if (employee == null) {
          this.bot.telegram.sendMessage(
            group_id,
            'Người dùng không tồn tại trong group',
          );
          return true;
        }
        employee.subjects = [];
        const result1 = await this.employees.save(employee);
        this.bot.telegram.sendMessage(group_id, `Đã xóa quyền của ${userId}`);
        return result1;
      case '/help':
        // employee.subjects = [];
        // const result1 = await this.employees.save(employee);
        this.bot.telegram.sendMessage(
          group_id,
          `Các lệnh hỗ trợ:\n
          Gán môn phụ trách cho người dùng: set_role <Tag người dùng> <ID môn phụ trách>\n 
          Xóa môn phụ trách của người dùng: delete_role <Tag người dùng>\n
          Xem Danh sách các môn: subject
          `,
        );
        return true;
      case '/subject':
        const monhocs = await this.subjects.find();
        const array: string[] = [`ID      Tên môn học`];
        monhocs.map((x) => {
          array.push(`${x.id}      ${x.name}`);
        });
        this.bot.telegram.sendMessage(group_id, array.join('\n'));
        return true;
      // return result1;
      default:
        this.bot.telegram.sendMessage(group_id, `Lệnh không tồn tại!`);
    }
  }

  async addOrRemoveMember(body: any) {
    let employee = null;
    if (body.message.new_chat_member) {
      employee = await this.employees.findOne({
        where: {
          tele_id: body.message.new_chat_member.username,
        },
      });
      if (employee == null) {
        employee = {
          id: 0,
          fb_id: '',
          name:
            body.message.new_chat_member.first_name +
            ' ' +
            body.message.new_chat_member.last_name,
          phone_number: '',
          subjects: [],
          tele_id: body.message.new_chat_member.username,
        };
        return await this.employees.save(employee);
      }
    } else if (body.message.left_chat_member) {
      employee = await this.employees.findOne({
        where: {
          tele_id: body.message.left_chat_member.username,
        },
      });
      if (employee) {
        return await this.employees.remove(employee);
      }
    }
    return false;
  }
}
