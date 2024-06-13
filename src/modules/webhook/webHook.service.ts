import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class WebHookService {
  constructor(private readonly httpService: HttpService) {}

  // Handles messages events
  handleMessage(senderPsid: any, receivedMessage: any) {
    let response: any;
    // Checks if the message contains text

    if (receivedMessage.text) {
      // Create the payload for a basic text message, which
      // will be added to the body of your request to the Send API
      response = {
        text: `You sent the message: '${receivedMessage.text}'. Now send me an attachment!`,
      };
    } else if (receivedMessage.attachments) {
      // Get the URL of the message attachment
      let attachmentUrl = receivedMessage.attachments[0].payload.url;
      response = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
              {
                title: 'Is this the right picture?',
                subtitle: 'Tap a button to answer.',
                image_url: attachmentUrl,
                buttons: [
                  {
                    type: 'postback',
                    title: 'Yes!',
                    payload: 'yes',
                  },
                  {
                    type: 'postback',
                    title: 'No!',
                    payload: 'no',
                  },
                ],
              },
            ],
          },
        },
      };
    }

    // Send the response message
    // this.callSendAPI(senderPsid, response);
  }

  // Handles messaging_postbacks events
  async handlePostback(senderPsid: any, receivedPostback: any) {
    let response: any;

    // Get the payload for the postback
    let payload = receivedPostback.payload;

    // Set the response based on the postback payload
    if (payload === 'STARTED') {
      let username = await this.getNameUser(senderPsid);
      response = {
        text: `Chào ${username.name}. Bạn cần sử dụng dịch vụ nào của chúng tôi?`,
      };

      // Send the message to acknowledge the postback
      await this.callSendAPI(senderPsid, response);
      await this.sendMenuService(senderPsid);
    } else if (payload === '1') {
      await this.sendSubjectList(senderPsid);
    }
  }

  // Sends response messages via the Send API
  async callSendAPI(senderPsid: any, response: any) {
    // The page access token we have generated in your app settings
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
    const url = 'https://graph.facebook.com/v20.0/me/messages';

    // Construct the message body
    let requestBody = {
      recipient: {
        id: senderPsid,
      },
      message: response,
    };

    // Send the HTTP request to the Messenger Platform
    try {
      const response = await firstValueFrom(
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
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
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
                  payload: '1',
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
                  payload: '2',
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
                  payload: '3',
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
                  payload: '4',
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
                  payload: '5',
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
    const subjects = [
      { id: 1, ten: 'Toán học' },
      { id: 2, ten: 'Vật lý' },
      { id: 3, ten: 'Hóa học' },
      { id: 4, ten: 'Sinh học' },
      { id: 5, ten: 'Ngữ văn' },
      { id: 6, ten: 'Lịch sử' },
      { id: 7, ten: 'Địa lý' },
      { id: 8, ten: 'Tiếng Anh' },
      { id: 9, ten: 'Giáo dục công dân' },
      { id: 10, ten: 'Công nghệ' },
      { id: 11, ten: 'Tin học' },
      { id: 12, ten: 'Giáo dục thể chất' },
      { id: 13, ten: 'Nghệ thuật' },
      { id: 14, ten: 'Âm nhạc' },
      { id: 15, ten: 'Kỹ năng sống' },
      { id: 16, ten: 'Tiếng Pháp' },
      { id: 17, ten: 'Tiếng Đức' },
      { id: 18, ten: 'Tiếng Nhật' },
      { id: 19, ten: 'Tiếng Hàn' },
      { id: 20, ten: 'Tiếng Trung' },
    ];

    let elements = [];

    for (let i = 0; i < subjects.length; i += 3) {
      let item = {
        title: 'Chọn môn học',
        subtitle: '',
        image_url: '',
        buttons: [],
      };

      for (let j = i; j < i + 3 && j < subjects.length; j++) {
        item.buttons.push({
          type: 'postback',
          title: subjects[j].ten,
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
