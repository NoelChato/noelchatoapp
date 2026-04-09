import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../../src/auth/auth.service';
import { UserEntity } from '../../src/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<UserEntity>;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data without password for valid credentials', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: await bcrypt.hash('password123', 10),
        role: 'security_guard',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.validateUser('testuser', 'password123');

      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        role: 'security_guard',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.validateUser('nonexistent', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: await bcrypt.hash('correctpassword', 10),
        role: 'security_guard',
      };

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      await expect(service.validateUser('testuser', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('signup', () => {
    it('should create and save a new user with hashed password', async () => {
      const mockCreatedUser = {
        id: 1,
        username: 'newuser',
        password: 'hashedpassword',
        role: 'security_guard',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.create.mockReturnValue(mockCreatedUser);
      mockUserRepository.save.mockResolvedValue(mockCreatedUser);

      const result = await service.signup('newuser', 'password123', 'security_guard');

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        username: 'newuser',
        password: expect.any(String), // Password should be hashed
        role: 'security_guard',
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockCreatedUser);
      expect(result).toEqual(mockCreatedUser);
    });
  });
});