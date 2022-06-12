// test/db.ts
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

// Connect to DB
module.exports.connect = async () => {
    const mongod =  await MongoMemoryServer.create();

    const uri = mongod.getUri();

    const mongooseOpts = {
        useNewUrlParser: true,
        wtimeoutMS: 2500,
        maxPoolSize: 10,
    };

    await mongoose.connect(uri, mongooseOpts);
}

// Disconnect and close DB
module.exports.closeDatabase = async () => {
    const mongod =  await MongoMemoryServer.create();

    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
}

// Clear BD and delete data
module.exports.clearDatabase = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
}