'use strict'

const applicationContext = global.applicationContext;
const moment = require('moment')

class Service {
  async search (req, res, next) {
    const db = global.applicationContext.db.client;
    let campaignName = req.swagger.params.campaignName.value;
    try {
      let result = await db.search('campaignNameGlobalIndex', 'campaignName', campaignName)
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
            {status: 404, title: 'NotFound', message: `Record not found for ${campaignName}`}
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
      let record = await db.create(request)
      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(record, null, 2));
    } catch (e) {
      applicationContext.logger.error(req.context, e);
      res.statusCode = 500;
      let n = 'ServerError';
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

  async update (req, res, next) {
    const db = global.applicationContext.db.client;
    let id = req.swagger.params.id.value
    try {
      let saved = await db.get(id)
      let request = req.swagger.params.body.value;
      request.createdAt = saved.createdAt;
      request.updatedAt = moment().toJSON();
      let record = await db.update(id, request)
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(record, null, 2));
    } catch (e) {
      applicationContext.logger.error(req.context, JSON.stringify(e))
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
