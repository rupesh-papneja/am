'use strict'
const request = require('request')
const applicationContext = global.applicationContext;

class Client {
  fetch(context, token, id) {
    return new Promise((resolve, reject) => {
      let options = {
        url: `${applicationContext.campaignsService}/${id}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
          'x-request-id': context.req_id,
          'x-app-namespace': context.namespace
        },
        timeout: 5000,
        json: true
      }
      request(
        options,
        (error, response, body) => {
          if (error) {
            let e = new Error('Invalid campaign')
            e.code = 404
            e.status = 'NotFound'
            e.stack = error.stack
            reject(e)
          } else if (response.statusCode === 200) {
            resolve(body)
          } else {
            let e = new Error('Invalid campaign')
            e.code = 404
            e.status = 'NotFound'
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
