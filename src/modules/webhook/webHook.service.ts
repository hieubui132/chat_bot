import { Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebHookService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}
  // private readonly logger = new Logger(WebHookService.name);
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
    this.callSendAPI(senderPsid, response);
  }

  // Handles messaging_postbacks events
  handlePostback(senderPsid: any, receivedPostback: any) {
    let response: any;

    // Get the payload for the postback
    let payload = receivedPostback.payload;

    // Set the response based on the postback payload
    if (payload === 'yes') {
      response = { text: 'Thanks!' };
    } else if (payload === 'no') {
      response = { text: 'Oops, try sending another image.' };
    }
    // Send the message to acknowledge the postback
    this.callSendAPI(senderPsid, response);
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
    const { data } = await firstValueFrom(
      this.httpService
        .post(url, requestBody, {
          params: { access_token: PAGE_ACCESS_TOKEN },
        })
        .pipe(
          catchError((error: AxiosError) => {
            // this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );
    return data;
  }
}
