'use strict'
/**
 * Context creates a sort of local session for every request that comes in to assign request_id
 * aggregate log namespace
 */
const cuid = require('cuid');
const applicationContext = global.applicationContext;
class Context {
  static setup(req, res, next) {
    let context = new Context(req, res)
    req.context = context
    next();
  }

  getNamespace(appNamespace) {
    if (appNamespace === null || appNamespace === undefined) {
      return this.appName;
    }

    return `${appNamespace}.${this.appName}`;
  }

  constructor(req, res) {
    this.appName = applicationContext.appName;
    this.req_id = req.headers['x-request-id'] || cuid();
    this.namespace = this.getNamespace(req.headers['x-app-namespace']);
    res.setHeader('x-request-id', this.req_id)
    res.setHeader('x-app-namespace', this.namespace)
    res.setHeader('Access-Control-Allow-Origin', '*') // only for this example, CORS should be configured in production APIs.
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-auth-token, x-request-id, x-app-namespace')
  }
}

module.exports = Context;
