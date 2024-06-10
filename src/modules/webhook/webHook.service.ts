import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WebHookService {
  constructor(private readonly httpService: HttpService) {}

  // Adds support for GET requests to our webhook
  getWebhook(req: Request, res: Response) {
    // Your verify token. Should be a random string.
    const VERIFY_TOKEN = 'bwN5JURM';

    // Parse the query params
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    // Checks if a token and mode is in the query string of the request
    console.log(mode);
    console.log(token);
    console.log(challenge);
    if (mode && token) {
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(401);
    }
  }

  // Creates the endpoint for your webhook
  postWebhook(req: Request, res: Response) {
    let body = req.body;
    console.log(req.body);
    res.status(200).send('EVENT_RECEIVED');
    // Checks if this is an event from a page subscription
    // if (body.object === 'page') {
    //   // Iterates over each entry - there may be multiple if batched
    //   body.entry.forEach(function (entry: any) {
    //     // Gets the body of the webhook event
    //     let webhookEvent = entry.messaging[0];
    //     console.log(webhookEvent);

    //     // Get the sender PSID
    //     let senderPsid = webhookEvent.sender.id;
    //     console.log('Sender PSID: ' + senderPsid);

    //     // Check if the event is a message or postback and
    //     // pass the event to the appropriate handler function
    //     if (webhookEvent.message) {
    //       this.handleMessage(senderPsid, webhookEvent.message);
    //     } else if (webhookEvent.postback) {
    //       this.handlePostback(senderPsid, webhookEvent.postback);
    //     }
    //   });

    //   // Returns a '200 OK' response to all requests
    //   res.status(200).send('EVENT_RECEIVED');
    // } else {
    //   // Returns a '404 Not Found' if event is not from a page subscription
    //   res.sendStatus(404);
    // }
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

  // Sends response messages via the Send API
  async callSendAPI(senderPsid: any, response: any) {
    // The page access token we have generated in your app settings
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

    // Construct the message body
    let requestBody = {
      recipient: {
        id: senderPsid,
      },
      message: response,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://graph.facebook.com/v2.6/me/messages',
          requestBody,
          {
            params: { access_token: PAGE_ACCESS_TOKEN },
          },
        ),
      );
      console.log('Message sent!');
    } catch (err) {
      console.error('Unable to send message:' + err);
    }
  }
}
