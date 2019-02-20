'use strict'

const applicationContext = global.applicationContext;
const moment = require('moment')
const event = require('../clients/event')();

class Service {
  async search (req, res, next) {
    const db = global.applicationContext.db.client;
    let eventId = req.swagger.params.eventId.value;
    try {
      let result = await db.search('eventIdGlobalIndex', 'eventId', eventId)
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result.Items, null, 2));
    } catch (e) {
      applicationContext.logger.error(req.context, JSON.stringify(e))
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(
        {
          errors: [
            {status: 404, title: 'NotFound', message: `Record not found for ${eventId}`}
          ]
        }, null, 2
      ));
    }
  }
  async create (req, res, next) {
    const db = global.applicationContext.db.client;
    let request = req.swagger.params.body.value
    try {
      request.createdAt = moment().toJSON()
      let ev = await event.fetch(req.context, req.headers['x-auth-token'], request.eventId);
      if (!request.proposedPrice) {
        // get basePrice, calculate discount, and finalCost
        request.proposedPrice = ev.basePrice;
        request.discount = 0;
      } else {
        request.finalCost = request.quantity * request.proposedPrice;
      }
      let record = await db.create(request)
      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(record, null, 2));
    } catch (e) {
      applicationContext.logger.error(req.context, e);
      res.statusCode = 500;
      let n = 'ServerError';
      if (e.message === 'Invalid campaign') {
        n = 'NotFound'
        res.statusCode = 404;
      }
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(
        {
          errors: [
            {status: res.statusCode, title: n, message: e.message || e}
          ]
        }, null, 2
      ));
    }
  }

  async get (req, res, next) {
    const db = global.applicationContext.db.client;
    let id = req.swagger.params.id.value
    try {
      let record = await db.get(id)
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(record.Item, null, 2));
    } catch (e) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(
        {
          errors: [
            {status: 404, title: 'NotFound', message: `Record not found for ${id}`}
          ]
        }, null, 2
      ));
    }
  }

  async delete (req, res, next) {
    const db = global.applicationContext.db.client;
    let id = req.swagger.params.id.value
    try {
      await db.get(id);
      await db.delete(id);
      res.statusCode = 204;
      res.setHeader('Content-Type', 'application/json');
      res.end();
    } catch (e) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(
        {
          errors: [
            {status: 404, title: 'NotFound', message: `Record not found for ${id}`}
          ]
        }, null, 2
      ));
    }
  }
}

module.exports = () => {
  return new Service()
}
