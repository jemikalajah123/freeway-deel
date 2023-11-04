const request = require('supertest');
const app = require('../src/app');
const { Profile, Contract, Job } = require('../src/model');
const { expect } = require('chai');

describe('Contract APIs', () => {
  let testProfile;

  before(async () => {
    testProfile = await Profile.create({
      firstName: 'Test',
      lastName: 'User',
      profession: 'Tester',
      balance: 1000.0,
      type: 'client',
    });
  });

  after(async () => {
    await testProfile.destroy();
  });

  describe('GET /api/v1/contracts/:id', () => {
    it('should get a contract by ID', async () => {
      const testContract = { ClientId: testProfile.id, ContractorId: 2, status: 'in_progress', terms: 'Your contract terms here'};
      const contract = await Contract.create(testContract);

      const res = await request(app)
        .get(`/api/v1/contracts/${contract.id}`)
        .set('profile_id', `${testProfile.id}`);

      expect(res.status).to.equal(200);
      expect(res.body.data).to.have.property('id');
      expect(res.body.data.ClientId).to.equal(testProfile.id);
      expect(res.body.data.ContractorId).to.equal(2);
    });
  });

  describe('GET /api/v1/contracts', () => {
    it('should get all non-terminated contracts', async () => {
      const testContract = { ClientId: testProfile.id, ContractorId: 2, status: 'in_progress',  terms: 'Your contract terms here' };
      await Contract.create(testContract);

      const res = await request(app)
        .get('/api/v1/contracts')
        .set('profile_id', `${testProfile.id}`);

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.greaterThan(0);
    });
  });

  describe('GET /api/v1/jobs/unpaid', () => {
    it('should get all unpaid jobs for the user', async () => {
      const testContract = { ClientId: testProfile.id, ContractorId: 2, status: 'in_progress', terms: 'Your contract terms here'};
      const contract = await Contract.create(testContract)
      await Job.create({
        ContractId: contract.id,
        description: 'Test Job',
        price: 100.0,
        paid: null,
      });

      const res = await request(app)
        .get('/api/v1/jobs/unpaid')
        .set('profile_id', `${testProfile.id}`);

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.greaterThan(0);
    });
  });
});

describe('Payment APIs', () => {
  describe('POST /api/v1/jobs/:job_id/pay', () => {
    it('should make a successful payment for a job', async () => {
      const testPrice = 100.0;

      const testProfile = {
        firstName: 'Test',
        lastName: 'User',
        profession: 'Tester',
        balance: testPrice + 10.0,
        type: 'client',
      };

      const profile = await Profile.create(testProfile);
      const testContract = { ClientId: profile.id, ContractorId: 2, status: 'in_progress', terms: 'Your contract terms here'};
      const contract = await Contract.create(testContract);
      const testJob = {
        ContractId: contract.id,
        description: 'Test Job',
        price: testPrice,
        paid: null,
      };

      const job = await Job.create(testJob);

      const res = await request(app)
        .post(`/api/v1/jobs/${job.id}/pay`)
        .set('profile_id', `${profile.id}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Payment successful');
    });
  });

  describe('POST /api/v1/balances/deposit/:userId', () => {
    it('should make a successful deposit for a client', async () => {
      const testClientProfile = {
        firstName: 'Client',
        lastName: 'User',
        profession: 'Client',
        balance: 100.0,
        type: 'client',
      };

      const clientProfile = await Profile.create(testClientProfile);

      const testContract = { ClientId: clientProfile.id, ContractorId: 2, status: 'in_progress', terms: 'Your contract terms here'};
      const contract = await Contract.create(testContract)
      await Job.create({
        ContractId: contract.id,
        description: 'Test Job',
        price: 400.0,
      });
      const depositAmount = 50.0;

      const res = await request(app)
        .post(`/api/v1/balances/deposit/${clientProfile.id}`)
        .set('profile_id', `${clientProfile.id}`)
        .send({ amount: depositAmount });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Deposit successful');
    });

    it('should return an error for a deposit exceeding the limit', async () => {
      const testClientProfile = {
        firstName: 'Client',
        lastName: 'User',
        profession: 'Client',
        balance: 100.0,
        type: 'client',
      };

      const clientProfile = await Profile.create(testClientProfile);
      const depositAmount = 500.0;

      const res = await request(app)
        .post(`/api/v1/balances/deposit/${clientProfile.id}`)
        .set('profile_id', `${clientProfile.id}`)
        .send({ amount: depositAmount });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message', 'Deposit exceeds the limit');
    });
  });
});

describe('Admin APIs', () => {
  describe('GET /api/v1/admin/best-profession', () => {
    it('should return the best-paid profession', async () => {
      const contracts = [
        {
          ClientId: 1,
          ContractorId: 2,
          status: 'in_progress',
          terms: 'Your contract terms here',
          createdAt: new Date(),
        },
        {
          ClientId: 3,
          ContractorId: 4,
          terms: 'Your contract terms here',
          status: 'in_progress',
          createdAt: new Date(),
        },
      ];

      const jobs = [
        { ContractId: 1, description: 'Job 1', price: 100.0 },
        { ContractId: 2, description: 'Job 2', price: 200.0 },
        { ContractId: 3, description: 'Job 3', price: 300.0 },
        { ContractId: 4, description: 'Job 4', price: 400.0 },
      ];

      await Contract.bulkCreate(contracts);
      await Job.bulkCreate(jobs);

      const res = await request(app)
        .get('/api/v1/admin/best-profession')
        .query({ start: "2023-08-08", end: new Date() });

      expect(res.status).to.equal(200);
      expect(res.body.data).to.have.property('profession', 'Programmer');
    });
  });

  describe('GET /api/v1/admin/best-clients', () => {
    it('should return the best-paying clients', async () => {
      const contracts = [
        {
          ClientId: 1,
          ContractorId: 2,
          status: 'in_progress',
          terms: 'Your contract terms here',
          createdAt: new Date(),
        },
        {
          ClientId: 3,
          ContractorId: 4,
          terms: 'Your contract terms here',
          status: 'in_progress',
          createdAt: new Date(),
        },
      ];

      const jobs = [
        { ContractId: 1, description: 'Job 1', price: 100.0, paid: true },
        { ContractId: 2, description: 'Job 2', price: 200.0, paid: true },
        { ContractId: 3, description: 'Job 3', price: 300.0, paid: true },
        { ContractId: 4, description: 'Job 4', price: 400.0, paid: true },
      ];

      await Contract.bulkCreate(contracts);
      await Job.bulkCreate(jobs);

      const res = await request(app)
        .get('/api/v1/admin/best-clients')
        .query({ start: "2023-08-08", end: new Date() });

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.greaterThan(1);
    });
  });
});
