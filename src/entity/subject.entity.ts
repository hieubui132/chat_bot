import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { employee } from './employee.entity';

@Entity('subjects')
export class subject {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'id' })
  id: number = 0;

  @Column('varchar', { length: 500, name: 'name' })
  name: string = '';

  @Column('varchar', { length: 500, name: 'metadata_id', nullable: true })
  metadata_id: string | null = '';

  @ManyToMany(() => employee, (employee) => employee.subjects)
  @JoinTable({
    name: 'employee_subject',
    joinColumns: [{ name: 'subject_id', referencedColumnName: 'id' }],
    inverseJoinColumns: [{ name: 'employee_id', referencedColumnName: 'id' }],
  })
  employees: employee[];
}
