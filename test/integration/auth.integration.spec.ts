import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthModule } from '../../src/auth/auth.module';
import { UserEntity } from '../../src/entities/user.entity';

describe('AuthModule (Integration)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear users before each test
    await userRepository.clear();
  });

  describe('POST /auth/signup', () => {
    it('should create a new user account', async () => {
      const signupData = {
        username: 'testuser',
        password: 'password123',
        role: 'security_guard',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(signupData.username);
      expect(response.body.role).toBe(signupData.role);
      expect(response.body).not.toHaveProperty('password');

      // Verify user was created in database
      const user = await userRepository.findOneBy({ username: 'testuser' });
      expect(user).toBeDefined();
      expect(user.username).toBe(signupData.username);
      expect(user.role).toBe(signupData.role);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ username: 'testuser' }) // Missing password and role
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const signupData = {
        username: 'testuser',
        password: 'password123',
        role: 'security_guard',
      };

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupData);
    });

    it('should authenticate valid user credentials', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.username).toBe(loginData.username);
      expect(response.body.user.role).toBe('security_guard');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject invalid credentials', async () => {
      const loginData = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);
    });
  });
});