'use strict'

class Service {
  constructor() {
    require('./application');
    require('./core/bootstrap')();
  }
}
module.exports = new Service();
