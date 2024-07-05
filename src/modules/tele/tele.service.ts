import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { post_group, response, set_webhook } from 'src/model';
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
    this.bot.on(message('text'), async (ctx: any) => {
      try {
        console.log(ctx.update.message.chat.id, ctx.update.message.from.id);
        let isAdmin = false;
        const user = await this.bot.telegram.getChatMember(
          ctx.update.message.chat.id,
          ctx.update.message.from.id,
        );
        if (user.status == 'administrator' || user.status == 'creator') {
          isAdmin = true;
        }
        await this.command(ctx.update.message.text, isAdmin);
      } catch (ex) {
        console.log(ex);
      }
    });
    // this.bot.telegram.sendMessage('-4249901175', 'xvvv');
    // this.bot.on();
    this.bot.on('chat_member', async (ctx: any) => {
      try {
        await this.addOrRemoveMember({
          id: ctx.update.chat_member.new_chat_member.user.id,
          status: ctx.update.chat_member.new_chat_member.status,
          username: 'xx',
        });
      } catch (ex) {
        console.log(ex);
      }
    });

    this.bot.launch({
      // webhook: {
      //   // Public domain for webhook; e.g.: example.com
      //   domain: this.configService.get<string>('tele_webhook_domain'),
      //   // Port to listen on; e.g.: 8080
      //   // port: port,
      //   // Optional path to listen for.
      //   // `bot.secretPathComponent()` will be used by default
      //   path: this.configService.get<string>('tele_webhook_path'),
      //   // Optional secret to be sent back in a header for security.
      //   // e.g.: `crypto.randomBytes(64).toString("hex")`
      //   // secretToken: randomAlphaNumericString,
      // },
      allowedUpdates: ['chat_member', 'message'],
    });
  }

  async sendMesToGroup(mes: string) {
    const token = this.configService.get<string>('tele_token');
    const group = this.configService.get<string>('tele_group_id');
    const url = `${tele_url}/bot${token}/sendMessage?chat_id=${group}&text=${mes}`;
    const res = await this.httpService.axiosRef.post(url);
    return res.status == 200;
  }

  makeString(text: string) {
    const dot = text.indexOf('.');

    // Nếu không tìm thấy dấu chấm, trả về chuỗi ban đầu
    if (dot === -1) {
      return text;
    }

    let phanSau = text.substring(dot + 1);

    // Xóa các khoảng trắng ở đầu và cuối chuỗi
    phanSau = phanSau.trim();

    return phanSau;
  }

  async pushTele(body: post_group) {
    // const subject_name = this.makeString(body.subject_name);
    let response: response = {
      status: false,
      message: '',
    };
    if (body.key != this.configService.get<string>('private_key')) {
      response = {
        status: false,
        message: 'Sai key',
      };
      return response;
    }

    // const entity = await this.subjects
    //   .createQueryBuilder('subjects')
    //   .leftJoinAndSelect('subjects.employees', 'employees')
    //   .where('UPPER(subjects.name) = UPPER(:subjectName)', {
    //     subjectName: subject_name,
    //   })
    //   .getOne();

    const entity = await this.subjects.findOne({
      where: {
        metadata_id: body.subject_id,
      },
      relations: {
        employees: true,
      },
    });

    if (entity == null) {
      response = {
        status: false,
        message: 'Không tồn tại môn này',
      };
      return response;
    }

    console.log(entity);
    const tag: string[] = [];
    for (const e of entity.employees) {
      tag.push(`<a href='tg://user?id=${e.tele_id}'>${e.tele_user_name}</a>`);
    }
    let mesString = '';
    const group = this.configService.get<string>('tele_group_id');
    if (tag.length > 0) {
      mesString = tag.join(' ');
      mesString += ` ${body.fb_name} cần hỗ trợ môn ${entity.name}, các bạn vui lòng vào page check tin nhắn nhé!`;
      await this.bot.telegram.sendMessage(group, mesString, {
        parse_mode: 'HTML',
      });
    } else {
      mesString = `${body.fb_name} cần hỗ trợ môn ${entity.name}, ai làm được thì triển nhé!`;
      await this.bot.telegram.sendMessage(group, mesString, {
        parse_mode: 'HTML',
      });
    }
    response = {
      status: true,
      message: 'Thành công',
    };
    return response;
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
    try {
      if (body.message.text) {
        // return await this.command(body);
      } else if (
        body.message.left_chat_member ||
        body.message.new_chat_member
      ) {
        return await this.addOrRemoveMember(body);
      }
    } catch (ex) {
      console.log(ex);
    }
  }
  async command(mes: string, isAdmin: boolean) {
    const group_id = this.configService.get<string>('tele_group_id');
    const stringArr = mes.split(' ');
    const command = stringArr[0];
    let user_name = stringArr[1];
    if (user_name) user_name = user_name.replace('@', '');
    const employee = await this.employees.findOne({
      where: {
        tele_user_name: user_name,
      },
      relations: {
        subjects: true,
      },
    });
    switch (command) {
      case '/set_role':
        if (!isAdmin) return;
        if (employee == null) {
          this.bot.telegram.sendMessage(
            group_id,
            'Người dùng không tồn tại trong group',
          );
          return true;
        }
        let list_id = [];
        stringArr.map((x, index) => {
          if (index > 1) {
            list_id.push(x);
          }
        });
        let str_id = list_id.join('');
        let subject = str_id.split(',');
        subject = subject.map((x) => {
          return x.trim();
        });
        const subjectList = await this.subjects.find({
          where: {
            metadata_id: In(subject),
          },
        });
        employee.subjects = subjectList;
        const result = await this.employees.save(employee);
        this.bot.telegram.sendMessage(
          group_id,
          `Đã gán quyền cho ${user_name}`,
        );
        return result;
      case '/delete_role':
        if (!isAdmin) return;
        if (employee == null) {
          this.bot.telegram.sendMessage(
            group_id,
            'Người dùng không tồn tại trong group',
          );
          return true;
        }
        employee.subjects = [];
        const result1 = await this.employees.save(employee);
        this.bot.telegram.sendMessage(
          group_id,
          `Đã xóa quyền của ${user_name}`,
        );
        return result1;
      case '/show_user':
        const list = await this.employees.find({
          where: {
            tele_user_name: user_name,
          },
          relations: {
            subjects: true,
          },
        });
        if (list.length == 0) {
          this.bot.telegram.sendMessage(group_id, `Chưa có dữ liệu`);
          return;
        }
        const users: string[] = [];
        for (const item of list) {
          const subjectStr: string[] = [];
          for (const s of item.subjects) {
            subjectStr.push(s.name);
          }
          users.push('- ' + item.name + ': ' + subjectStr.join(', '));
        }

        this.bot.telegram.sendMessage(
          group_id,
          'Danh sách người dùng: \n' + users.join('\n'),
        );
        return;
      case '/help':
        if (isAdmin) {
          this.bot.telegram.sendMessage(
            group_id,
            `Các lệnh hỗ trợ dành cho bạn:\n
            - Gán môn phụ trách cho người dùng: /set_role <Tag người dùng> <ID môn phụ trách>\n 
            - Xóa môn phụ trách của người dùng: /delete_role <Tag người dùng>\n
            - Xem Danh sách các môn: /subject\n
            - Xem Danh sách user: /show_user
            `,
          );
        } else {
          this.bot.telegram.sendMessage(
            group_id,
            `Các lệnh hỗ trợ:\n
            - Xem Danh sách các môn: /subject\n
            - Xem Danh sách user: /show_user
            `,
          );
        }

        return true;
      case '/subject':
        const monhocs = await this.subjects.find({
          order: { metadata_id: 'ASC' },
        });
        const array: string[] = [`Mã      Tên môn học`];
        monhocs.map((x) => {
          array.push(`${x.metadata_id}      ${x.name}`);
        });
        this.bot.telegram.sendMessage(group_id, array.join('\n'));
        return true;
      // return result1;
      default:
        if (command.startsWith('/')) {
          this.bot.telegram.sendMessage(
            group_id,
            `Lệnh không tồn tại! Bạn vui lòng kiểm tra đúng cú pháp. Chat /help để nhận được hỗ trợ`,
          );
        }
        return false;
    }
  }

  async addOrRemoveMember(body: any) {
    let employee = null;
    if (body.status == 'member') {
      employee = await this.employees.findOne({
        where: {
          tele_id: body.id,
        },
      });
      if (employee == null) {
        const teleUser = await this.bot.telegram.getChat(body.id);
        employee = {
          id: 0,
          fb_id: '',
          name: teleUser['first_name'] + ' ' + teleUser['last_name'],
          phone_number: '',
          subjects: [],
          tele_id: teleUser.id,
          tele_user_name: teleUser['username'] ?? teleUser['first_name'],
        };
        return await this.employees.save(employee);
      }
    } else if (body.status == 'left') {
      employee = await this.employees.findOne({
        where: {
          tele_id: body.id,
        },
      });
      if (employee) {
        return await this.employees.remove(employee);
      }
    }
    return false;
  }
}
