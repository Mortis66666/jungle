require("dotenv").config();

const { MongoClient } = require("mongodb");
const uri = process.env.uri;
const client = new MongoClient(uri);

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function createGame(id, quick, public) {
    try {
        const rooms = client.db("db").collection("rooms");

        await rooms.insertOne({
            _id: id,
            quick: quick,
            public: public,
            players: [],
            start: [],
            timeCreated: Date.now(),
            lastUpdate: Date.now()
        });

        return id;
    } catch (e) {
        throw new e();
    } finally {
    }
}

async function update(id) {
    try {
        const rooms = client.db("db").collection("rooms");

        await rooms.updateOne(
            { _id: id },
            {
                $set: {
                    lastUpdate: Date.now()
                }
            }
        );
    } finally {
        console.log(`Room ${id} updated`);
    }
}

async function find(id) {
    try {
        const rooms = client.db("db").collection("rooms");
        return await rooms.findOne({ _id: id });
    } finally {
    }
}

async function findQuick() {
    try {
        const room = client.db("db").collection("rooms");

        return await room.findOne(
            {
                quick: 1,
                "players.1": {
                    $exists: false
                }
            },
            {
                sort: {
                    timeCreated: 1
                }
            }
        );
    } finally {
    }
}

async function all() {
    try {
        const rooms = client.db("db").collection("rooms");
        return await rooms.find().toArray();
    } finally {
    }
}

async function startingValue(id, player) {
    try {
        const rooms = client.db("db").collection("rooms");
        await rooms.updateOne(
            { _id: id },
            {
                $push: {
                    start: player
                }
            }
        );
    } finally {
    }
}

async function addPlayer(id, player) {
    try {
        const rooms = client.db("db").collection("rooms");
        await rooms.updateOne(
            { _id: id },
            {
                $push: {
                    players: player
                }
            }
        );
    } finally {
    }
}

async function generateId() {
    try {
        const rooms = client.db("db").collection("rooms");
        const availables = [...Array(10000 - 1000).keys()].map(x => x + 1000);

        for (let room of await all()) {
            availables.splice(availables.indexOf(room._id), 1);
        }

        return availables[randInt(0, availables.length - 1)];
    } finally {
    }
}

module.exports = {
    randInt: randInt,
    createGame: createGame,
    update: update,
    find: find,
    findQuick: findQuick,
    all: all,
    addPlayer: addPlayer,
    startingValue: startingValue,
    generateId: generateId
};
