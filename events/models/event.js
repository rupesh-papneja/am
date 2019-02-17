'use strict'
const applicationContext = global.applicationContext;

module.exports = Object.freeze({
  TableName: `${applicationContext.env}-events`,
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'eventType', AttributeType: 'S' },
    { AttributeName: 'eventName', AttributeType: 'S' }
  ],
  KeySchema: [
    {AttributeName: 'id', KeyType: 'HASH'}
  ],
  GlobalSecondaryIndexes: [{
    IndexName: 'eventTypeGlobalIndex',
    KeySchema: [{
      AttributeName: 'eventType',
      KeyType: 'HASH'
    }],
    Projection: {
      'ProjectionType': 'ALL'
    },
    ProvisionedThroughput: {
      ReadCapacityUnits: (applicationContext.db && applicationContext.db.ReadCapacityUnits ? applicationContext.db.ReadCapacityUnits : 10),
      WriteCapacityUnits: (applicationContext.db && applicationContext.db.WriteCapacityUnits ? applicationContext.db.WriteCapacityUnits : 25)
    }
  },
  {
    IndexName: 'eventNameGlobalIndex',
    KeySchema: [{
      AttributeName: 'eventName',
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
