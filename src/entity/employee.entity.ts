import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { subject } from './subject.entity';

@Entity('employees')
export class employee {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'id' })
  id: number = 0;

  @Column('varchar', { length: 500, name: 'name' })
  name: string = '';

  @Column('varchar', { length: 500, name: 'phone_number' })
  phone_number: string = '';

  @Column('varchar', { length: 500, name: 'fb_id' })
  fb_id: string = '';

  @Column('varchar', { length: 500, name: 'tele_id' })
  tele_id: string = '';

  @Column('varchar', { length: 500, name: 'tele_user_name' })
  tele_user_name: string = '';

  @ManyToMany(() => subject, (subject) => subject.employees)
  @JoinTable({
    name: 'employee_subject',
    joinColumns: [{ name: 'employee_id', referencedColumnName: 'id' }],
    inverseJoinColumns: [{ name: 'subject_id', referencedColumnName: 'id' }],
  })
  subjects: subject[];
}
