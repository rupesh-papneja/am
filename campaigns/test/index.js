'use strict'
const test = require('tape');
const supertest = require('supertest');
const nock = require('nock');
require('../application');
const applicationContext = global.applicationContext;

const request = supertest(`http://${applicationContext.serviceOptions.address}:${applicationContext.serviceOptions.port}`);

(async () => {
  await require('../core/bootstrap')();
  test.onFinish(() => {
    process.exit(0);
  });

  let id = null;

  test('Testing heartbeat endpoint', (t) => {
    request.get('/api/campaign/heartbeat')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Test for heartbeat: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing options endpoint', (t) => {
    request.options('/api/campaign/heartbeat')
      .expect(200)
      .end((err, res) => {
        applicationContext.logger.info(`Test for options: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing options endpoint', (t) => {
    request.options('/api/campaign')
      .expect(200)
      .end((err, res) => {
        applicationContext.logger.info(`Test for options: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing get invalid campaign id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get('/api/campaign/123456')
      .set('x-auth-token', 'XXSXSXS')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing get invalid campaign id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing bad request without auth header', (t) => {
    request.post('/api/campaign')
      .expect(400)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing bad request without auth header: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing bad request without body', (t) => {
    request.post('/api/campaign')
      .set('x-auth-token', 'XXSXSXS')
      .expect(400)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing bad request without body: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing invalid auth token with body and without nock', (t) => {
    request.post('/api/campaign')
      .set('x-auth-token', 'invalid')
      .set('Content-Type', 'application/json')
      .send({
        campaignName: 'Promotions 2019',
        description: 'Start of the year promotions 2019',
        startDate: '2019-01-01',
        endDate: '2019-03-01'
      })
      .expect(403)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing invalid auth token with body and without nock: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing invalid auth token with body', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [403, null])
      });
    request.post('/api/campaign')
      .set('x-auth-token', 'invalid')
      .set('Content-Type', 'application/json')
      .send({
        campaignName: 'Promotions 2019',
        description: 'Start of the year promotions 2019',
        startDate: '2019-01-01',
        endDate: '2019-03-01'
      })
      .expect(403)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing invalid auth token with body: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing create', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.post('/api/campaign')
      .set('x-auth-token', 'XXSXSXSXS')
      .set('Content-Type', 'application/json')
      .send({
        campaignName: 'Promotions 2019',
        description: 'Start of the year promotions 2019',
        startDate: '2019-01-01',
        endDate: '2019-03-01'
      })
      .expect(201)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        id = res.body.id;
        applicationContext.logger.info(`Testing create: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing update', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.put(`/api/campaign/${id}`)
      .set('x-auth-token', 'XXSXSXSXS')
      .set('Content-Type', 'application/json')
      .send({
        campaignName: 'Promotions 2019',
        description: 'Start of the year promotions 2019',
        startDate: '2019-01-05',
        endDate: '2019-04-01'
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        id = res.body.id;
        applicationContext.logger.info(`Testing update: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing update invalid', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.put(`/api/campaign/invalid`)
      .set('x-auth-token', 'XXSXSXSXS')
      .set('Content-Type', 'application/json')
      .send({
        campaignName: 'Promotions 2019',
        description: 'Start of the year promotions 2019',
        startDate: '2019-01-05',
        endDate: '2019-04-01'
      })
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing update invalid: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing get by campaign id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get(`/api/campaign/${id}`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing get by campaign id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing search by campaign name', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get(`/api/campaign?campaignName=Promotions 2019`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing search by campaign name: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing search by campaign name which is invalid', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get(`/api/campaign?campaignName=Invalid`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing search by campaign name: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing delete by campaign id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.delete(`/api/campaign/${id}`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(204)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing delete by campaign id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing delete by invalid campaign id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.delete(`/api/campaign/invalid`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing delete by invalid campaign id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing get by campaign id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get(`/api/campaign/${id}`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing get by campaign id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
})();
