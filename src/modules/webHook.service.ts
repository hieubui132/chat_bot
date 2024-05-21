import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class WebHookService {
  // Adds support for GET requests to our webhook
  getWebhook(req: Request, res: Response): any {
    res.status(200).send('GET');
  }

  // Creates the endpoint for your webhook
  postWebhook(req: Request, res: Response): any {
    res.status(200).send('POST');
  }
}
