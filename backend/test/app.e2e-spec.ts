import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Server } from 'http';

describe('App E2E', () => {
  let app: INestApplication;
  let server: Server;
  let jwt: string;
  let collaboratorId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / - deve retornar Hello World!', async () => {
    await request(server).get('/').expect(200).expect('Hello World');
  });

  it('POST /auth/login - deve autenticar e retornar JWT', async () => {
    const loginDto = { email: 'admin@empresa.com', password: '123456' };
    const res = await request(server)
      .post('/auth/login')
      .send(loginDto)
      .expect(201);
    console.log('LOGIN RESPONSE:', res.body);
    const { accessToken } = res.body as { accessToken: string };
    expect(accessToken).toBeDefined();
    jwt = accessToken;
  });

  it('POST /collaborators - deve criar colaborador (rota protegida)', async () => {
    const randomCpf = '123456789' + Math.floor(Math.random() * 90 + 10);
    const collaboratorDto = {
      name: 'João',
      email: `joao${Date.now()}@email.com`,
      cpf: randomCpf,
      birthDate: '2000-01-01',
    };
    const res = await request(server)
      .post('/collaborators')
      .set('Authorization', `Bearer ${jwt}`)
      .send(collaboratorDto)
      .expect(201);
    const { id } = res.body as { id: string };
    expect(id).toBeDefined();
    collaboratorId = id;
  });

  it('GET /collaborators/:cpf - deve consultar colaborador', async () => {
    const res = await request(server)
      .get(`/collaborators/search?cpf=12345678900`)
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200);
    const { name, cpf } = res.body as {
      name: string;
      cpf: string;
    };
    expect(cpf).toBe('12345678900');
    expect(name).toBe('João');
  });

  it('POST /medical-certificates - deve criar um atestado', async () => {
    const certDto = {
      collaboratorId,
      issueDate: '2025-08-13',
      leaveDays: 5,
      cidCode: 'A00',
      observations: 'Paciente: Maria, Médico: Dr. João',
    };
    const res = await request(server)
      .post('/medical-certificates')
      .set('Authorization', `Bearer ${jwt}`)
      .send(certDto)
      .expect(201);
    const { id } = res.body as { id: string };
    expect(id).toBeDefined();
  });

  it('GET /medical-certificates/:id - deve consultar um atestado', async () => {
    const res = await request(server)
      .get(
        `/medical-certificates?collaboratorId=${collaboratorId}&page=1&limit=10`,
      )
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200);
    const { data } = res.body as { data: any[] };
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });
});
