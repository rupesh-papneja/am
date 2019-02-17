'use strict'
const applicationContext = global.applicationContext;

module.exports = Object.freeze({
  TableName: `${applicationContext.env}-offers`,
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'campaignId', AttributeType: 'S' }
  ],
  KeySchema: [
    {AttributeName: 'id', KeyType: 'HASH'}
  ],
  GlobalSecondaryIndexes: [{
    IndexName: 'campaignIdGlobalIndex',
    KeySchema: [{
      AttributeName: 'campaignId',
      KeyType: 'HASH'
    }],
    Projection: {
      'ProjectionType': 'ALL'
    },
    ProvisionedThroughput: {
      ReadCapacityUnits: (applicationContext.db && applicationContext.db.ReadCapacityUnits ? applicationContext.db.ReadCapacityUnits : 10),
      WriteCapacityUnits: (applicationContext.db && applicationContext.db.WriteCapacityUnits ? applicationContext.db.WriteCapacityUnits : 25)
    }
  }],
  ProvisionedThroughput: {
    ReadCapacityUnits: (applicationContext.db && applicationContext.db.ReadCapacityUnits ? applicationContext.db.ReadCapacityUnits : 10),
    WriteCapacityUnits: (applicationContext.db && applicationContext.db.WriteCapacityUnits ? applicationContext.db.WriteCapacityUnits : 25)
  }
}
)
