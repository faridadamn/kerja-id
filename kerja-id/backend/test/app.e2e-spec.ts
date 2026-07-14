import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Test User',
          email: `test-${Date.now()}@example.com`,
          password: 'TestPass123!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user.email).toContain('@example.com');
        });
    });

    it('should reject duplicate email', async () => {
      const email = `dup-${Date.now()}@example.com`;
      // First registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ fullName: 'Test', email, password: 'TestPass123!' });

      // Duplicate
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ fullName: 'Test 2', email, password: 'TestPass123!' })
        .expect(409);
    });

    it('should reject weak password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Test',
          email: `weak-${Date.now()}@example.com`,
          password: '123',
        })
        .expect(400);
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Test',
          email: 'not-an-email',
          password: 'TestPass123!',
        })
        .expect(400);
    });
  });

  describe('/api/v1/auth/login (POST)', () => {
    it('should login with valid credentials', async () => {
      const email = `login-${Date.now()}@example.com`;
      const password = 'TestPass123!';

      // Register first
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ fullName: 'Login Test', email, password });

      // Login
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should reject wrong password', async () => {
      const email = `wrong-${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ fullName: 'Test', email, password: 'TestPass123!' });

      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password: 'WrongPass123!' })
        .expect(401);
    });

    it('should reject non-existent email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'TestPass123!' })
        .expect(401);
    });
  });

  describe('/api/v1/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body).toHaveProperty('database');
          expect(res.body).toHaveProperty('version');
        });
    });
  });
});
