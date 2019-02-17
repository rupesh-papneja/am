'use strict'
const request = require('request')
const applicationContext = global.applicationContext;

class Client {
  auth(req) {
    return new Promise((resolve, reject) => {
      let options = {
        url: applicationContext.tokenService,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': req.headers['x-auth-token'],
          'x-request-id': req.context.req_id,
          'x-app-namespace': req.context.namespace
        },
        timeout: 5000
      }
      request(
        options,
        (error, response, body) => {
          if (error) {
            let e = new Error('Invalid session token')
            e.code = 403
            e.status = 'Forbidden'
            e.stack = error.stack
            reject(e)
          } else if (response.statusCode === 200) {
            resolve({})
          } else {
            let e = new Error('Invalid session token')
            e.code = 403
            e.status = 'Forbidden'
            reject(e)
          }
        }
      )
    })
  }
}
module.exports = () => {
  return new Client()
}
