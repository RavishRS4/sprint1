import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';

describe('Health endpoint', () => {
  it('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'ok');
    expect(res.body).to.have.property('timestamp');
  });
});
