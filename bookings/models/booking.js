'use strict'
const applicationContext = global.applicationContext;

module.exports = Object.freeze({
  TableName: `${applicationContext.env}-bookings`,
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'eventId', AttributeType: 'S' }
  ],
  KeySchema: [
    {AttributeName: 'id', KeyType: 'HASH'}
  ],
  GlobalSecondaryIndexes: [{
    IndexName: 'eventIdGlobalIndex',
    KeySchema: [{
      AttributeName: 'eventId',
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
