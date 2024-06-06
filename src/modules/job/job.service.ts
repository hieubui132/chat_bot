import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { conversation } from 'src/entity';
import { Repository } from 'typeorm';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(conversation)
    private conversation: Repository<conversation>,
  ) {}

  public async saveConversation(entities: conversation[]) {
    console.log(entities);
    for (const item of entities) {
      const find = await this.conversation.findOneBy({
        conversation_id: item.conversation_id,
      });
      if (find == null) {
        return this.conversation.save(item);
      } else {
        find.updated_time = item.updated_time;
        this.conversation.save(find);
      }
    }
  }
}
