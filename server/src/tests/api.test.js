const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = 'test_secret';

const app = require('../app');
const User = require('../models/User');
const Category = require('../models/Category');
const SupportRequest = require('../models/Request');

let mongo;
let employeeToken;
let adminToken;
let category;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  category = await Category.create({ name: 'Credit requests' });

  const employeePassword = await bcrypt.hash('secret123', 10);
  await User.create({
    name: 'Emp',
    email: 'emp@company.com',
    password: employeePassword,
    branch: 'Business A',
    post: 'Manager',
    role: 'employee'
  });

  const adminPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'CEO',
    email: 'ceo@company.com',
    password: adminPassword,
    branch: 'Head Office',
    post: 'CEO',
    role: 'admin'
  });

  const empLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'emp@company.com', password: 'secret123' });
  employeeToken = empLogin.body.token;

  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'ceo@company.com', password: 'admin123' });
  adminToken = adminLogin.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});

test('registers a new employee', async () => {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Jane',
    email: 'jane@company.com',
    password: 'pass1234',
    branch: 'Business B',
    post: 'Supervisor'
  });

  expect(res.status).toBe(201);
  expect(res.body.user.email).toBe('jane@company.com');
});

test('employee submits request and admin approves it', async () => {
  const createRes = await request(app)
    .post('/api/requests')
    .set('Authorization', `Bearer ${employeeToken}`)
    .field('categoryId', category._id.toString())
    .field('title', 'Need extra funds')
    .field('description', 'Requesting additional monthly budget')
    .field('priority', 'High');

  expect(createRes.status).toBe(201);
  const reqId = createRes.body.request._id;

  const replyRes = await request(app)
    .post(`/api/requests/${reqId}/reply`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ message: 'Please provide invoices.' });

  expect(replyRes.status).toBe(200);
  expect(replyRes.body.request.status).toBe('In Progress');

  const decisionRes = await request(app)
    .post(`/api/requests/${reqId}/decision`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'Approved', reason: 'Budget available this quarter' });

  expect(decisionRes.status).toBe(200);
  expect(decisionRes.body.request.status).toBe('Approved');

  const stored = await SupportRequest.findById(reqId);
  expect(stored.thread.length).toBe(3);
});
