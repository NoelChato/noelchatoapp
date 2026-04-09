import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VisitorEntity } from '../entities/visitor.entity';

@Injectable()
export class VisitorService {
  constructor(
    @InjectRepository(VisitorEntity)
    private repo: Repository<VisitorEntity>,
  ) {}

  async create(visitor: Partial<VisitorEntity>): Promise<VisitorEntity> {
    const v = this.repo.create(visitor);
    return this.repo.save(v);
  }

  findAll(): Promise<VisitorEntity[]> {
    return this.repo.find();
  }

  async findById(id: number): Promise<VisitorEntity> {
    const v = await this.repo.findOneBy({ id });
    if (!v) throw new NotFoundException('Visitor not found');
    return v;
  }

  async updateTimeout(id: number, timeOut: string): Promise<VisitorEntity> {
    const v = await this.findById(id);
    v.timeOut = timeOut;
    return this.repo.save(v);
  }

  async search(name?: string, date?: string): Promise<VisitorEntity[]> {
    const qb = this.repo.createQueryBuilder('v');
    if (name) {
      qb.andWhere('LOWER(v.name) LIKE :name', { name: `%${name.toLowerCase()}%` });
    }
    if (date) {
      qb.andWhere('v.date = :date', { date });
    }
    return qb.getMany();
  }

  reportByDate(date: string): Promise<VisitorEntity[]> {
    return this.repo.findBy({ date });
  }

  async getReports(filter: {
    from?: string;
    to?: string;
    status?: 'all' | 'inside' | 'out';
  }): Promise<{
    id: number;
    name: string;
    purpose: string;
    timeIn: string;
    timeOut: string;
    duration: string;
    status: string;
    date: string;
  }[]> {
    const qb = this.repo.createQueryBuilder('v');

    if (filter.from) {
      qb.andWhere('v.date >= :from', { from: filter.from });
    }
    if (filter.to) {
      qb.andWhere('v.date <= :to', { to: filter.to });
    }
    if (filter.status === 'inside') {
      qb.andWhere('v.timeOut IS NULL');
    }
    if (filter.status === 'out') {
      qb.andWhere('v.timeOut IS NOT NULL');
    }

    const visitors = await qb
      .orderBy('v.date', 'DESC')
      .addOrderBy('v.timeIn', 'DESC')
      .getMany();

    return visitors.map((v) => ({
      id: v.id,
      name: v.name,
      purpose: v.purpose,
      timeIn: v.timeIn,
      timeOut: v.timeOut || '—',
      duration: this.formatDuration(v.timeIn, v.timeOut),
      status: v.timeOut ? 'Checked Out' : 'Inside',
      date: v.date,
    }));
  }

  private formatDuration(timeIn: string, timeOut?: string): string {
    if (!timeOut) {
      return 'Inside';
    }

    const [hoursIn, minutesIn] = timeIn.split(':').map(Number);
    const [hoursOut, minutesOut] = timeOut.split(':').map(Number);

    let totalMinutes = hoursOut * 60 + minutesOut - (hoursIn * 60 + minutesIn);
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours && minutes) {
      return `${hours}h ${minutes}m`;
    }
    if (hours) {
      return `${hours}h`;
    }
    if (minutes) {
      return `${minutes}m`;
    }
    return '0m';
  }
}
