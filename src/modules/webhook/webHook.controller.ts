import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { WebHookService } from './webHook.service';
import { Request, Response } from 'express';

@Controller('webhook')
export class WebHookController {
  constructor(private readonly webHookService: WebHookService) {}

  // Adds support for GET requests to our webhook
  @Get()
  getWebhook(@Req() req: Request, @Res() res: Response) {
    // Your verify token. Should be a random string.
    const VERIFY_TOKEN = 'KMOBwGPzSM';

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        // Responds with the challenge token from the request
        // console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  }

  // Creates the endpoint for your webhook
  @Post()
  postWebhook(@Req() req: Request, @Res() res: Response) {
    // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {
      // Iterate over each entry - there may be multiple if batched
      body.entry.forEach((entry: any) => {
        // Get the webhook event. entry.messaging is an array, but
        // will only ever contain one event, so we get index 0
        let webhook_event = entry.messaging[0];
        // console.log(webhook_event);

        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        // console.log('Sender PSID: ' + sender_psid);

        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (webhook_event.message) {
          this.webHookService.handleMessage(sender_psid, webhook_event.message);
        } else if (webhook_event.postback) {
          this.webHookService.handlePostback(
            sender_psid,
            webhook_event.postback,
          );
        }
      });

      // Return a '200 OK' response to all events
      res.status(200).send('EVENT_RECEIVED');
    } else {
      // Return a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  }
}
