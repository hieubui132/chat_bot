import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { subject } from 'src/entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TeleService } from '../tele/tele.service';

@Injectable()
export class WebHookService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(subject)
    private subjects: Repository<subject>,
    private configService: ConfigService,
    private teleService: TeleService,
  ) {}

  // Handles messaging_postbacks events
  async handlePostback(senderPsid: any, receivedPostback: any) {
    let response: any;

    // Get the payload for the postback
    const payload = receivedPostback.payload;

    // Set the response based on the postback payload
    if (payload === 'STARTED') {
      const username = await this.getNameUser(senderPsid);
      response = {
        text: `Chào ${username.name}. Bạn cần sử dụng dịch vụ nào của chúng tôi?`,
      };

      // Send the message to acknowledge the postback
      await this.callSendAPI(senderPsid, response);
      await this.sendMenuService(senderPsid);
    } else if (payload === '-1') {
      await this.sendSubjectList(senderPsid);
    } else if (!isNaN(payload) && payload > 0) {
      this.teleService.pushTele({
        subject_id: payload,
      });
      this.callSendAPI(senderPsid, {
        text: `Chúng tôi đã ghi nhận yêu cầu của bạn. Vui lòng chờ 1 chút để chúng tôi yêu cầu nhân viên tư vấn cho bạn nhé?`,
      });
    }
  }

  // Sends response messages via the Send API
  async callSendAPI(senderPsid: any, response: any) {
    // The page access token we have generated in your app settings
    // const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
    const PAGE_ACCESS_TOKEN =
      this.configService.get<string>('page_access_token');
    const url = 'https://graph.facebook.com/v20.0/me/messages';

    // Construct the message body
    const requestBody = {
      recipient: {
        id: senderPsid,
      },
      message: response,
    };

    // Send the HTTP request to the Messenger Platform
    try {
      await firstValueFrom(
        this.httpService.post(url, requestBody, {
          params: { access_token: PAGE_ACCESS_TOKEN },
        }),
      );
      console.log('Message sent!');
    } catch (error) {
      console.error('Unable to send message');
    }
  }

  async getNameUser(senderPsid: any) {
    const PAGE_ACCESS_TOKEN =
      this.configService.get<string>('page_access_token');
    const url = `https://graph.facebook.com/${senderPsid}?fields=name&access_token=${PAGE_ACCESS_TOKEN}`;
    // Send the HTTP request to the Messenger Platform
    const { data } = await firstValueFrom(
      this.httpService.get(url).pipe(
        catchError((error: AxiosError) => {
          console.error(error);
          throw 'An error happened!';
        }),
      ),
    );
    return data;
  }

  async sendMenuService(senderPsid: any) {
    const response = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: 'Hỗ trợ học tập',
              subtitle: '',
              image_url:
                'https://cantho-school.fpt.edu.vn/wp-content/uploads/hoc-tap-hieu-qua-la-gi.jpg',
              buttons: [
                {
                  type: 'postback',
                  title: 'Hỗ trợ học tập',
                  payload: '-1',
                },
              ],
            },
            {
              title: 'Chat với admin',
              subtitle: '',
              image_url:
                'https://png.pngtree.com/png-clipart/20230409/original/pngtree-admin-and-customer-service-job-vacancies-png-image_9041264.png',
              buttons: [
                {
                  type: 'postback',
                  title: 'Chat với admin',
                  payload: '-2',
                },
              ],
            },
            {
              title: 'Hỗ trợ pass tiếng Anh + đầu ra',
              subtitle: '',
              image_url:
                'https://ngoaingucongnghe.edu.vn/upload/images/khoa-ngon-ngu-anh/english-british-england-language-education-concept-min-scaled.jpg',
              buttons: [
                {
                  type: 'postback',
                  title: 'Tiếng Anh',
                  payload: '-3',
                },
              ],
            },
            {
              title: 'Thực tập',
              subtitle: '',
              image_url:
                'https://talentbold.com/uptalent/attachments/images/20220620/104614386_thuc-tap-sinh-la-gi-1.jpg',
              buttons: [
                {
                  type: 'postback',
                  title: 'Thực tập',
                  payload: '-4',
                },
              ],
            },
            {
              title: 'Vay tiền nhanh',
              subtitle: '',
              image_url:
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW9TRQ-c25e3-apdtVWAzoQ-HMkT5iiy3bKw&s',
              buttons: [
                {
                  type: 'postback',
                  title: 'Vay tiền nhanh',
                  payload: '-5',
                },
              ],
            },
          ],
        },
      },
    };
    this.callSendAPI(senderPsid, response);
  }

  async sendSubjectList(senderPsid: any) {
    const subjects = await this.subjects.find();
    const elements = [];
    for (let i = 0; i < subjects.length; i += 3) {
      const item = {
        title: 'Chọn môn học',
        subtitle: '',
        image_url: '',
        buttons: [],
      };

      for (let j = i; j < i + 3 && j < subjects.length; j++) {
        item.buttons.push({
          type: 'postback',
          title: subjects[j].name,
          payload: subjects[j].id,
        });
      }

      elements.push(item);
    }

    const response = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: elements,
        },
      },
    };
    this.callSendAPI(senderPsid, response);
  }
}
