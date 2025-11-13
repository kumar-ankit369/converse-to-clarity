const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');
const Team = require('../models/Team');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

let mongoServer;
let canRunDbTests = true;

// Skip DB tests on unsupported architectures (e.g. ia32) or when explicitly disabled
const skipDbTests = process.arch === 'ia32' || process.env.SKIP_DB_TESTS === '1';
if (skipDbTests) {
  console.warn('Skipping DB integration tests due to unsupported architecture or SKIP_DB_TESTS');
  canRunDbTests = false;
}

beforeAll(async () => {
  if (!canRunDbTests) return;

  // Try to use in-memory MongoDB, but fall back to MONGO_URI or localhost when binary
  // download isn't supported on the current architecture (e.g., ia32)
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  } catch (err) {
    console.warn('MongoMemoryServer not available:', err.message);
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/converse-to-clarity-test';
    try {
      await mongoose.connect(uri);
    } catch (connErr) {
      console.warn('Failed to connect to fallback MongoDB at', uri, connErr.message);
      canRunDbTests = false;
    }
  }
});

afterAll(async () => {
  try {
    await mongoose.disconnect();
  } catch (err) {}

  if (mongoServer && typeof mongoServer.stop === 'function') {
    try {
      await mongoServer.stop();
    } catch (err) {}
  }
});

afterEach(async () => {
  try {
    await User.deleteMany({});
    await Team.deleteMany({});
  } catch (err) {
    // ignore
  }
});

function genToken(user) {
  return jwt.sign({ userId: user._id.toString(), email: user.email, name: user.name }, JWT_SECRET);
}

test('owner can create a team and invite a member; owner can change role; admin cannot change roles', async () => {
  if (!canRunDbTests) {
    console.warn('Skipping DB tests because no MongoDB available on this platform');
    return;
  }
  // create owner user
  const owner = await User.create({ name: 'Owner', email: 'owner@example.com', password: 'pass1234' });
  const member = await User.create({ name: 'Member', email: 'member@example.com', password: 'pass1234' });
  const other = await User.create({ name: 'Other', email: 'other@example.com', password: 'pass1234' });

  const ownerToken = genToken(owner);
  const memberToken = genToken(member);

  // Owner creates team
  const createRes = await request(app)
    .post('/api/teams')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ name: 'Dev Team', description: 'A team' });

  expect(createRes.status).toBe(201);
  const teamId = createRes.body._id;

  // Owner invites member
  const inviteRes = await request(app)
    .post(`/api/teams/${teamId}/members`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ userId: member._id.toString(), role: 'member' });

  expect(inviteRes.status).toBe(200);
  const invited = inviteRes.body.members.find(m => m.userId._id.toString() === member._id.toString());
  expect(invited).toBeTruthy();
  expect(invited.role).toBe('member');

  // Owner changes member role to admin
  const memberObj = inviteRes.body.members.find(m => m.userId._id.toString() === member._id.toString());
  const changeRoleRes = await request(app)
    .put(`/api/teams/${teamId}/members/${memberObj._id}/role`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ role: 'admin' });

  expect(changeRoleRes.status).toBe(200);
  const updatedMember = changeRoleRes.body.members.find(m => m.userId._id.toString() === member._id.toString());
  expect(updatedMember.role).toBe('admin');

  // Now admin (member) attempts to change another member (other) - should be forbidden
  // First invite `other` as member by owner
  const inviteOther = await request(app)
    .post(`/api/teams/${teamId}/members`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ userId: other._id.toString(), role: 'member' });
  expect(inviteOther.status).toBe(200);

  const otherMemberObj = inviteOther.body.members.find(m => m.userId._id.toString() === other._id.toString());

  const adminChangeAttempt = await request(app)
    .put(`/api/teams/${teamId}/members/${otherMemberObj._id}/role`)
    .set('Authorization', `Bearer ${memberToken}`) // memberToken is now admin role per server change
    .send({ role: 'viewer' });

  // Should be 403 because only owner can change roles
  expect(adminChangeAttempt.status).toBe(403);
});

test('owner can transfer ownership to another member', async () => {
  if (!canRunDbTests) {
    console.warn('Skipping DB tests because no MongoDB available on this platform');
    return;
  }
  const owner = await User.create({ name: 'Owner2', email: 'owner2@example.com', password: 'pass1234' });
  const member = await User.create({ name: 'Member2', email: 'member2@example.com', password: 'pass1234' });

  const ownerToken = genToken(owner);

  // Owner creates team
  const createRes = await request(app)
    .post('/api/teams')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ name: 'Transfer Team', description: 'Team to transfer' });

  expect(createRes.status).toBe(201);
  const teamId = createRes.body._id;

  // Owner invites member
  const inviteRes = await request(app)
    .post(`/api/teams/${teamId}/members`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ userId: member._id.toString(), role: 'member' });

  expect(inviteRes.status).toBe(200);

  // Transfer ownership to member
  const transferRes = await request(app)
    .post(`/api/teams/${teamId}/transfer-owner`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ newOwnerId: member._id.toString() });

  expect(transferRes.status).toBe(200);
  const updatedTeam = transferRes.body;

  const newOwnerMember = updatedTeam.members.find(m => m.userId._id.toString() === member._id.toString());
  const oldOwnerMember = updatedTeam.members.find(m => m.userId._id.toString() === owner._id.toString());

  expect(newOwnerMember).toBeTruthy();
  expect(newOwnerMember.role).toBe('owner');
  expect(oldOwnerMember.role).toBe('admin');
});

test('transfer ownership fails when new owner is not a member', async () => {
  if (!canRunDbTests) {
    console.warn('Skipping DB tests because no MongoDB available on this platform');
    return;
  }
  const owner = await User.create({ name: 'Owner3', email: 'owner3@example.com', password: 'pass1234' });
  const nonMember = await User.create({ name: 'NonMember', email: 'nonmember@example.com', password: 'pass1234' });

  const ownerToken = genToken(owner);

  const createRes = await request(app)
    .post('/api/teams')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ name: 'Another Team', description: 'Test team' });

  expect(createRes.status).toBe(201);
  const teamId = createRes.body._id;

  // Attempt transfer to non-member
  const transferRes = await request(app)
    .post(`/api/teams/${teamId}/transfer-owner`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ newOwnerId: nonMember._id.toString() });

  expect(transferRes.status).toBe(400);
  expect(transferRes.body.message).toContain('existing team member');
});

test('non-owner cannot transfer ownership', async () => {
  if (!canRunDbTests) {
    console.warn('Skipping DB tests because no MongoDB available on this platform');
    return;
  }
  const owner = await User.create({ name: 'Owner4', email: 'owner4@example.com', password: 'pass1234' });
  const admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'pass1234' });
  const member = await User.create({ name: 'Member3', email: 'member3@example.com', password: 'pass1234' });

  const ownerToken = genToken(owner);
  const adminToken = genToken(admin);

  const createRes = await request(app)
    .post('/api/teams')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ name: 'Test Team', description: 'A test team' });

  expect(createRes.status).toBe(201);
  const teamId = createRes.body._id;

  // Invite admin and member
  await request(app)
    .post(`/api/teams/${teamId}/members`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ userId: admin._id.toString(), role: 'admin' });

  await request(app)
    .post(`/api/teams/${teamId}/members`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ userId: member._id.toString(), role: 'member' });

  // Admin attempts to transfer ownership
  const transferRes = await request(app)
    .post(`/api/teams/${teamId}/transfer-owner`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ newOwnerId: member._id.toString() });

  expect(transferRes.status).toBe(403);
  expect(transferRes.body.message).toContain('Only the owner');
});
