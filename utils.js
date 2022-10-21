require("dotenv").config();

const { MongoClient } = require("mongodb");
const uri = process.env.uri;
const client = new MongoClient(uri);

function randInt(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

async function createGame(id) {
    try {
        const rooms = client.db("db").collection("rooms");

        await rooms.insertOne({
            _id: id,
            players: [],
            start: [],
            lastUpdate: Date.now()
        });

        return id;

    } finally {
    }
}

async function update(id) {
    try {
        const rooms = client.db("db").collection("rooms");

        await rooms.updateOne({ _id: id }, {
            $set: {
                lastUpdate: Date.now()
            }
        });

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


async function startingValue(id, player) {
    try {
        const rooms = client.db("db").collection("rooms");
        await rooms.updateOne({ _id: id }, {
            $push: {
                start: player
            }
        });

    } finally {

    }
}

async function addPlayer(id, player) {
    try {
        const rooms = client.db("db").collection("rooms");
        await rooms.updateOne({ _id: id }, {
            $push: {
                players: player
            }
        });
    } finally {
    }
}

module.exports = {
    randInt: randInt,
    createGame: createGame,
    update: update,
    find: find,
    addPlayer: addPlayer,
    startingValue: startingValue
}
