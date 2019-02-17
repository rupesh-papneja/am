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
    request.get('/api/offer/heartbeat')
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
    request.options('/api/offer/heartbeat')
      .expect(200)
      .end((err, res) => {
        applicationContext.logger.info(`Test for options: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing options endpoint', (t) => {
    request.options('/api/offer')
      .expect(200)
      .end((err, res) => {
        applicationContext.logger.info(`Test for options: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing get invalid offer id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get('/api/offer/123456')
      .set('x-auth-token', 'XXSXSXS')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing get invalid offer id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing bad request without auth header', (t) => {
    request.post('/api/offer')
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
    request.post('/api/offer')
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
    request.post('/api/offer')
      .set('x-auth-token', 'invalid')
      .set('Content-Type', 'application/json')
      .send({
        campaignId: 'XXXXXX',
        description: 'Start of the year promotions 2019 Offer fixed price',
        quantity: 5,
        offerType: 'discountOnItemsPrice',
        percentage: 0.2,
        itemNumbers: [5]
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
    request.post('/api/offer')
      .set('x-auth-token', 'invalid')
      .set('Content-Type', 'application/json')
      .send({
        campaignId: 'XXXXXX',
        description: 'Start of the year promotions 2019 Offer fixed price',
        quantity: 5,
        offerType: 'discountOnItemsPrice',
        percentage: 0.2,
        itemNumbers: [5]
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

  test('Testing create invalid campaign  without nock', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.post('/api/offer')
      .set('x-auth-token', 'XXSXSXSXS')
      .set('Content-Type', 'application/json')
      .send({
        campaignId: 'XXXXXX',
        description: 'Start of the year promotions 2019 Offer fixed price',
        quantity: 5,
        offerType: 'discountOnItemsPrice',
        percentage: 0.2,
        itemNumbers: [5]
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

  test('Testing create invalid campaign', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    nock(`${applicationContext.campaignsService}/${'XXXXXX'}`, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [404, {}])
      });
    request.post('/api/offer')
      .set('x-auth-token', 'XXSXSXSXS')
      .set('Content-Type', 'application/json')
      .send({
        campaignId: 'XXXXXX',
        description: 'Start of the year promotions 2019 Offer fixed price',
        quantity: 5,
        offerType: 'discountOnItemsPrice',
        percentage: 0.2,
        itemNumbers: [5]
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
    nock(`${applicationContext.campaignsService}/${'XXXXXX'}`, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, {}])
      });
    request.post('/api/offer')
      .set('x-auth-token', 'XXSXSXSXS')
      .set('Content-Type', 'application/json')
      .send({
        campaignId: 'XXXXXX',
        description: 'Start of the year promotions 2019 Offer fixed price',
        quantity: 5,
        offerType: 'discountOnItemsPrice',
        percentage: 0.2,
        itemNumbers: [5]
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
    nock(`${applicationContext.campaignsService}/${'XXXXXX'}`, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, {}])
      });
    request.put(`/api/offer/${id}`)
      .set('x-auth-token', 'XXSXSXSXS')
      .set('Content-Type', 'application/json')
      .send({
        campaignId: 'XXXXXX',
        description: 'Start of the year promotions 2019 Offer fixed price',
        quantity: 5,
        offerType: 'discountOnItemsPrice',
        percentage: 0.1,
        itemNumbers: [5]
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
    nock(`${applicationContext.campaignsService}/${'XXXXXX'}`, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, {}])
      });
    request.put(`/api/offer/invalid`)
      .set('x-auth-token', 'XXSXSXSXS')
      .set('Content-Type', 'application/json')
      .send({
        campaignId: 'XXXXXX',
        description: 'Start of the year promotions 2019 Offer fixed price',
        quantity: 5,
        offerType: 'discountOnItemsPrice',
        percentage: 0.2,
        itemNumbers: [5]
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

  test('Testing get by offer id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get(`/api/offer/${id}`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing get by offer id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing search by campaign id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get(`/api/offer?campaignId=XXXXXX`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing search by campaign id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing search by campaign id which is invalid', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get(`/api/offer?campaignId=Invalid`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing search by campaign id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing delete by offer id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.delete(`/api/offer/${id}`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(204)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing delete by offer id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing delete by invalid offer id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.delete(`/api/offer/invalid`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing delete by invalid offer id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
  test('Testing get by offer id', (t) => {
    nock(applicationContext.tokenService, {allowUnmocked: true})
      .get('')
      .reply(function (uri, requestBody, cb) {
        cb(null, [200, null])
      });
    request.get(`/api/offer/${id}`)
      .set('x-auth-token', 'XXSXSXSXS')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing get by offer id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
})();
