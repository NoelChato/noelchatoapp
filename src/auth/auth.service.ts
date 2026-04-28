import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userRepo.findOneBy({ username });
    if (!user) throw new UnauthorizedException();
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException();
    const { password: _, ...rest } = user;
    return rest;
  }

  async signup(username: string, password: string, role: string) {
    const hash = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ username, password: hash, role });
    return this.userRepo.save(user);
  }

  async updateProfile(
    userId: number,
    email?: string,
    phone?: string,
    bio?: string,
    profilePicture?: string,
  ) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException('User not found');

    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (bio) user.bio = bio;
    if (profilePicture) user.profilePicture = profilePicture;

    await this.userRepo.save(user);
    const { password: _, ...rest } = user;
    return rest;
  }
}