import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';

describe('Protected routes without auth', () => {
  it('GET /api/transactions should return 401 when no token provided', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message');
  });

  it('GET /api/goals should return 401 when no token provided', async () => {
    const res = await request(app).get('/api/goals');
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message');
  });

  it('GET /api/reports/me should return 401 when no token provided', async () => {
    const res = await request(app).get('/api/reports/me');
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message');
  });
});
