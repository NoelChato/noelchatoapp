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
}
