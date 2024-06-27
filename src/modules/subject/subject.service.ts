import { InjectRepository } from '@nestjs/typeorm';
import { subject } from 'src/entity';
import { Repository } from 'typeorm';

export class SubjectService {
  constructor(
    @InjectRepository(subject)
    private subjects: Repository<subject>,
  ) {}

  async list() {
    try {
      return await this.subjects.find();
    } catch (ex) {
      console.log(ex);
      return [];
    }
  }
}
