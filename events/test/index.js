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
    request.get('/api/event/heartbeat')
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
    request.options('/api/event/heartbeat')
      .expect(200)
      .end((err, res) => {
        applicationContext.logger.info(`Test for options: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing options endpoint', (t) => {
    request.options('/api/event')
      .expect(200)
      .end((err, res) => {
        applicationContext.logger.info(`Test for options: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing get invalid event id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get('/api/event/123456')
      .set('x-auth-token', 'XXSXSXS')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing get invalid event id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing bad request without auth header', (t) => {
    request.post('/api/event')
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
    request.post('/api/event')
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
    request.post('/api/event')
      .set('x-auth-token', 'invalid')
      .set('Content-Type', 'application/json')
      .send({
        eventName: 'Kids Party',
        eventType: 'party',
        basePrice: 220.00
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
    request.post('/api/event')
      .set('x-auth-token', 'invalid')
      .set('Content-Type', 'application/json')
      .send({
        eventName: 'Kids Party',
        eventType: 'party',
        basePrice: 220.00
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
    request.post('/api/event')
      .set('x-auth-token', 'XXSXSXSXS')
      .set('Content-Type', 'application/json')
      .send({
        eventName: 'Kids Party',
        eventType: 'party',
        basePrice: 220.00
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
    request.put(`/api/event/${id}`)
      .set('x-auth-token', 'XXSXSXSXS')
      .set('Content-Type', 'application/json')
      .send({
        eventName: 'Kids Party',
        eventType: 'party',
        basePrice: 230.00
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

  test('Testing get by event id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get(`/api/event/${id}`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing get by event id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing search by event name and event type', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get(`/api/event?eventName=Kids Party&eventType=party`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing search by event name and event type: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing search by event name', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get(`/api/event?eventName=Kids Party`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing search by event name: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing search by event type', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get(`/api/event?eventType=party`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing search by event type: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing search by event name which is invalid', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get(`/api/event?eventName=Invalid`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing search by event name: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing delete by event id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.delete(`/api/event/${id}`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(204)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing delete by event id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing get by event id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get(`/api/event/${id}`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing get by event id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
})();
