import { Controller, Get } from '@nestjs/common';
import { SubjectService } from './subject.service';

@Controller('subject')
export class SubjectController {
  constructor(private readonly service: SubjectService) {}
  @Get('list')
  public async list() {
    const res = await this.service.list();
    return res;
  }
}
