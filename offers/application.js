'use strict'

const bunyan = require('bunyan')
const bunyanFormat = require('bunyan-format')

const applicationContext = {
  appName: 'Offers',
  contextPath: 'offer',
  env: process.env.SERVICE_ENV || 'local',
  db: {
    ReadCapacityUnits: 10,
    WriteCapacityUnits: 25
  },
  serviceOptions: {
    port: 9003,
    address: 'localhost'
  },
  tokenService: process.env.TOKEN_SERVICE || 'http://localhost:9009/api/token/verify',
  campaignsService: process.env.CAMPAIGNS_SERVICE || 'http://campaigns:9002/api/campaign',
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
