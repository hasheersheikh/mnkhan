const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;

async function run() {
    const client = new MongoClient(uri);
    try {
        console.log("Attempting to connect to MongoDB...");
        await client.connect();
        console.log("Connected successfully to server");
        const db = client.db('mnkhan');
        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
    } catch (err) {
        console.error("Connection failed:");
        console.dir(err, { depth: null });
    } finally {
        await client.close();
    }
}

run();
