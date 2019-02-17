'use strict'
/**
 * Initial Service setup
 */
const connect = require('connect');
const app = connect();
const context = require('./modules/context');
const compression = require('compression');
const applicationContext = global.applicationContext;

class Service {
  static setup() {
    app.use((req, res, next) => { context.setup(req, res, next) })
    app.use((req, res, next) => {
      if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end(null);
      } else {
        next()
      }
    })
    app.use(compression());
    // calls initialization method for setting up controllers for the API.
    applicationContext.init(app);
  }
}

module.exports = () => {
  Service.setup()
  return app
}
