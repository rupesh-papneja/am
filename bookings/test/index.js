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
    request.get('/api/booking/heartbeat')
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
    request.options('/api/booking/heartbeat')
      .expect(200)
      .end((err, res) => {
        applicationContext.logger.info(`Test for options: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing options endpoint', (t) => {
    request.options('/api/booking')
      .expect(200)
      .end((err, res) => {
        applicationContext.logger.info(`Test for options: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing get invalid booking id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get('/api/booking/123456')
      .set('x-auth-token', 'XXSXSXS')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing get invalid booking id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing bad request without auth header', (t) => {
    request.post('/api/booking')
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
    request.post('/api/booking')
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
    request.post('/api/booking')
      .set('x-auth-token', 'invalid')
      .set('Content-Type', 'application/json')
      .send({
        eventId: 'XXXXXX',
        quantity: 5
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
    request.post('/api/booking')
      .set('x-auth-token', 'invalid')
      .set('Content-Type', 'application/json')
      .send({
        eventId: 'XXXXXX',
        quantity: 5
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

  test('Testing create invalid event  without nock', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.post('/api/booking')
      .set('x-auth-token', 'XXSXSXSXS')
      .set('Content-Type', 'application/json')
      .send({
        eventId: 'XXXXXX',
        quantity: 5
      })
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        id = res.body.id;
        applicationContext.logger.info(`Testing create: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing create invalid event', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    nock(`${applicationContext.eventsService}/${'XXXXXX'}`, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [404, {}])
      });
    request.post('/api/booking')
      .set('x-auth-token', 'XXSXSXSXS')
      .set('Content-Type', 'application/json')
      .send({
        eventId: 'XXXXXX',
        quantity: 5
      })
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        id = res.body.id;
        applicationContext.logger.info(`Testing create: ${err ? 'failed' : 'passed'} `)
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
    nock(`${applicationContext.eventsService}/${'XXXXXX'}`, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, {}])
      });
    request.post('/api/booking')
      .set('x-auth-token', 'XXSXSXSXS')
      .set('Content-Type', 'application/json')
      .send({
        eventId: 'XXXXXX',
        quantity: 5
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

  test('Testing get by booking id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get(`/api/booking/${id}`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing get by booking id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing search by event id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get(`/api/booking?eventId=XXXXXX`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing search by event id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing search by event id which is invalid', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get(`/api/booking?eventId=Invalid`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing search by event id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing delete by booking id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.delete(`/api/booking/${id}`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(204)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing delete by booking id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing delete by invalid booking id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.delete(`/api/booking/invalid`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing delete by invalid booking id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing get by booking id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get(`/api/booking/${id}`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing get by booking id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
})();
