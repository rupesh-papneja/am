'use strict'

const uuid = require('uuid')
const applicationContext = global.applicationContext;

class DB {
  constructor () {
    this.AWS = applicationContext.env === 'local' ? require('aws-sdk') : applicationContext.AWS
    if (applicationContext.env === 'local') {
      this.AWS.config.update({
        region: applicationContext.awsRegion,
        endpoint: `http://${process.env.DB_HOST || 'localhost'}:8000`,
        accessKeyId: 'default',
        secretAccessKey: 'default'
      })
    }
    this.dynamodb = new this.AWS.DynamoDB();
    this.docClient = new this.AWS.DynamoDB.DocumentClient();
  }
  async init() {
    try {
      let t = await this.describeTable();
      if (t instanceof Error && applicationContext.env === 'local' && t.message.indexOf('non-existent table')) {
        await this.createTable()
      } else if (t instanceof Error) {
        applicationContext.logger.error(`Cannot connect to table ${applicationContext.db.model.TableName}, ${JSON.stringify(t, null, 2)}`)
        throw t;
      }
    } catch (e) {
      throw e;
    }
  }
  createTable() {
    let self = this
    return new Promise((resolve, reject) => {
      self.dynamodb.createTable(applicationContext.db.model, function(err, data) {
        if (err) {
          reject(err)
        } else {
          applicationContext.logger.info('Created table. Table description :', JSON.stringify(data, null, 2));
          resolve(data)
        }
      });
    })
  }
  describeTable() {
    let self = this
    return new Promise((resolve, reject) => {
      let p = {
        TableName: applicationContext.db.model.TableName
      }
      self.dynamodb.describeTable(p, function(err, data) {
        if (err) resolve(err)
        else resolve(data)
      })
    })
  }
  search(index, field, value) {
    let self = this
    return new Promise((resolve, reject) => {
      let params = {
        TableName: applicationContext.db.model.TableName,
        IndexName: index,
        KeyConditionExpression: `${field} = :v`,
        ExpressionAttributeValues: {
          ':v': value
        }
      }
      self.docClient.query(params, (err, data) => {
        if (err) {
          reject(err)
        } else {
          if (data && data.Items && data.Items.length > 0) {
            resolve(data)
          } else {
            reject(new Error(`No records based on index ${index} where ${field} eq ${value}`))
          }
        }
      });
    })
  }
  create(entity) {
    let self = this
    return new Promise((resolve, reject) => {
      entity.id = uuid.v1()
      let params = {
        TableName: applicationContext.db.model.TableName,
        Item: entity
      }
      self.docClient.put(params, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(entity)
        }
      });
    })
  }
  delete(id) {
    let self = this
    return new Promise((resolve, reject) => {
      let params = {
        TableName: applicationContext.db.model.TableName,
        Key: {
          'id': id
        }
      }
      self.docClient.delete(params, function(err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      });
    })
  }
  get(id) {
    let self = this
    return new Promise((resolve, reject) => {
      let params = {
        TableName: applicationContext.db.model.TableName,
        Key: {
          'id': id
        },
        ConsistentRead: true
      }
      self.docClient.get(params, function(err, data) {
        if (err) {
          reject(err)
        } else {
          if (data && data.Item) {
            resolve(data)
          } else {
            reject(new Error(`No record found for ${id}`))
          }
        }
      });
    })
  }
}
module.exports = () => {
  return new DB()
}
