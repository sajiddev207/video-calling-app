const { createClient } = require("redis");
const client = createClient();

client.on('error', (err) => console.log('Redis Server Error ', err));

client.connect();

async function setKey(key, value) {
    try {
        await client.set(key, value);
        console.log('Key successfully set.');
        return { status: true, data: null };
    } catch (error) {
        console.error('Error while set key in redis:', error);
        return { status: false, data: null };
    }
}

async function getKey(key) {
    try {
        let data = await client.get(key);
        return { status: true, data: data };
    } catch (error) {
        console.error('Error while set key in redis:', error);
        return { status: false, data: null };
    }
}

async function delKey(key) {
    try {
        console.log('key_____', key);
        let data = await client.del(key);
        return { status: true, data: data };
    } catch (error) {
        console.error('Error while set key in redis:', error);
        return { status: false, data: null };
    }
}

module.exports = {
    setKey: setKey,
    getKey: getKey,
    delKey: delKey
}