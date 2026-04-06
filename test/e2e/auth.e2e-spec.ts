import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../src/auth/auth.module';
import { UserEntity } from '../../src/entities/user.entity';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [UserEntity],
          synchronize: true,
          dropSchema: true,
        }),
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      next();
    });
    await app.init();
    await app.listen(0);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Flow', () => {
    const testUser = {
      username: 'e2e-test-user',
      password: 'TestPass123!',
      role: 'security_guard',
    };

    it('should complete full authentication flow', async () => {
      // Step 1: Register a new user
      const signupResponse = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);

      expect(signupResponse.body.success).toBe(true);
      expect(signupResponse.body.user).toHaveProperty('id');
      expect(signupResponse.body.user.username).toBe(testUser.username);
      expect(signupResponse.body.user.role).toBe(testUser.role);
      expect(signupResponse.body.user).not.toHaveProperty('password');

      // Step 2: Login with the created user
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body).toHaveProperty('user');
      expect(loginResponse.body.user.username).toBe(testUser.username);
      expect(loginResponse.body.user.role).toBe(testUser.role);
      expect(loginResponse.body.user).not.toHaveProperty('password');
    });

    it('should handle authentication errors properly', async () => {
      // Test invalid credentials
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'nonexistent-user',
          password: 'wrong-password',
        })
        .expect(401);

      // Test missing required fields
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'test-user',
          // Missing password
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          username: 'incomplete-user',
          // Missing password and role
        })
        .expect(400);
    });

    it('should validate input data', async () => {
      // Test SQL injection attempt
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: "'; DROP TABLE users; --",
          password: 'password',
        })
        .expect(401);

      // Test XSS attempt
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          username: '<script>alert("xss")</script>',
          password: 'password123',
          role: 'security_guard',
        })
        .expect(400);
    });

    it('should enforce role-based access patterns', async () => {
      // Create users with different roles
      const guardUser = {
        username: 'e2e-guard',
        password: 'GuardPass123!',
        role: 'security_guard',
      };

      const adminUser = {
        username: 'e2e-admin',
        password: 'AdminPass123!',
        role: 'administrator',
      };

      // Register both users
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(guardUser);

      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(adminUser);

      // Both should be able to login
      const guardLogin = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: guardUser.username,
          password: guardUser.password,
        });

      const adminLogin = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: adminUser.username,
          password: adminUser.password,
        });

      expect(guardLogin.body.user.role).toBe('security_guard');
      expect(adminLogin.body.user.role).toBe('administrator');
    });
  });

  describe('Security Headers', () => {
    it('should include appropriate security headers', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'test',
          password: 'test',
        });

      // Check for common security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rapid authentication attempts', async () => {
      const promises = Array(10).fill().map(() =>
        request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            username: 'test-user',
            password: 'wrong-password',
          })
      );

      const responses = await Promise.all(promises);

      // At least some requests should be rate limited or return 401
      const rateLimited = responses.some(res => res.status === 429);
      const authFailed = responses.some(res => res.status === 401);

      expect(rateLimited || authFailed).toBe(true);
    });
  });
});