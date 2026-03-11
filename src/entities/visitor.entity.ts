import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class VisitorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  contact: string;

  @Column()
  purpose: string;

  @Column()
  personToVisit: string;

  @Column()
  date: string;

  @Column()
  timeIn: string;

  @Column({ nullable: true })
  timeOut?: string;
}