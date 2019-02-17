'use strict';

const swaggerTools = require('swagger-tools');
const jsyaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const tokenService = require('../clients/token')();
const controller = require('./service')();
const applicationContext = global.applicationContext;

class Service {
  constructor (app) {
    this.app = app;
  }
  setup () {
    const self = this;
    // swaggerRouter configuration
    const options = {
      controllers: {
        heartbeat: async (req, res, next) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'server running', version: '0.0.1' }));
        },
        search: async (req, res, next) => {
          controller.search(req, res, next)
        },
        create: async (req, res, next) => {
          controller.create(req, res, next)
        },
        retrieve: async (req, res, next) => {
          controller.get(req, res, next)
        },
        update: async (req, res, next) => {
          controller.update(req, res, next)
        },
        delete: async (req, res, next) => {
          controller.delete(req, res, next)
        }
      }
    };
    // setting up db model
    global.applicationContext.db.model = require('../models/offer');

    const spec = fs.readFileSync(path.join(__dirname, '/../api/swagger.yaml'), 'utf8')
    const swaggerDoc = jsyaml.safeLoad(spec)
    fs.writeFile(path.join(__dirname, '/../api/swagger.json'),
      JSON.stringify(swaggerDoc, null, 2), (err) => {
        if (err) {
          applicationContext.logger.error('Error occurred while writing yml file')
        }
      });
    swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
      self.app.use(middleware.swaggerMetadata());
      self.app.use(middleware.swaggerValidator({validateResponse: true}));
      self.app.use(middleware.swaggerSecurity({
        ApiKeyAuth: async (req, authOrSecDef, token, callback) => {
          try {
            await tokenService.auth(req)
            callback(null)
          } catch (e) {
            applicationContext.logger.error(e);
            callback(e)
          }
        }
      }))
      self.app.use(middleware.swaggerRouter(options))
      self.app.use(middleware.swaggerUi(swaggerDoc, {
        apiDocs: `/api-docs`,
        swaggerUi: `/docs`,
        swaggerUiDir: __dirname.concat('/../core/dist')}
      ))
      self.app.use((err, req, res, next) => {
        applicationContext.logger.error(req.context, err);
        res.setHeader('Content-Type', 'application/json');
        if (err.code === 'SCHEMA_VALIDATION_FAILED' || err.code === 'REQUIRED') {
          res.statusCode = 400
        } else if (err.code && !isNaN(parseInt(err.code))) {
          res.statusCode = err.code
        } else {
          res.statusCode = 500
        }
        res.end(JSON.stringify({
          errors: [err]
        }))
      })
    });
  }
}

module.exports = (app) => {
  const s = new Service(app);
  s.setup();
  return s;
}
