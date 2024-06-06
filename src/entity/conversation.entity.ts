import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('conversations')
export class conversation {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'id' })
  id: number = 0;

  @Column('varchar', { length: 500, name: 'conversation_id' })
  conversation_id: string = '';

  @Column('varchar', { length: 500, name: 'link' })
  link: string = '';

  @Column('varchar', { length: 500, name: 'updated_time' })
  updated_time: string = '';
}
