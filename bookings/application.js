'use strict'

const bunyan = require('bunyan')
const bunyanFormat = require('bunyan-format')

const applicationContext = {
  appName: 'Bookings',
  contextPath: 'booking',
  env: process.env.SERVICE_ENV || 'local',
  db: {
    ReadCapacityUnits: 10,
    WriteCapacityUnits: 25
  },
  serviceOptions: {
    port: 9004,
    address: 'localhost'
  },
  tokenService: process.env.TOKEN_SERVICE || 'http://localhost:9009/api/token/verify',
  eventsService: process.env.EVENTS_SERVICE || 'http://events:9001/api/event',
  awsRegion: 'ap-southeast-2',
  awsApiVersion: '2014-11-06'
}

// initializing up global aws configuration
applicationContext.AWS = require('aws-sdk')
applicationContext.AWS.config.update({
  region: applicationContext.awsRegion
});

// setting up logger
const options = {
  name: `${(process.env.SERVICE_ENV || 'local')}:${(applicationContext.appName || '')}`,
  src: true,
  stream: bunyanFormat({outputMode: process.env.LOG_OUTPUT_MODE || 'json', levelInString: true}),
  level: process.env.LOGLEVEL || 'debug'
};
applicationContext.logger = bunyan.createLogger(options);

// callback method to setup app object
applicationContext.init = function (app) {
  require('./controllers/setup')(app)
}
global.applicationContext = applicationContext;
