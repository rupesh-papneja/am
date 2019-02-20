'use strict'
/**
 * Bootstrap file
 */
const http = require('http');
const applicationContext = global.applicationContext;
const db = require('../db')();
class Server {
  init() {
    this.service = require('./service')();
  }
  start() {
    http.createServer(this.service).listen(applicationContext.serviceOptions.port, () => {
      applicationContext.logger.info('Server listening on http://%s:%d', applicationContext.serviceOptions.address, applicationContext.serviceOptions.port);
    });
    process.on('uncaughtException', (e) => {
      applicationContext.logger.error(e);
    })
    process.on('unhandledRejection', e => {
      applicationContext.logger.error(e);
    });
  }
}

module.exports = async () => {
  let t = new Server();
  try {
    t.init();
    await db.init(); // making sure table exists before application starts up
    global.applicationContext.db.client = db; // setting db to global application context
    t.start();
    return t;
  } catch (e) {
    applicationContext.logger.error(e);
    process.exit(1);
  }
}
