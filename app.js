const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const utils = require("./utils.js");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/self", (req, res) => {
    res.render("self.ejs");
});

app.get("/play", (req, res) => {
    res.render("play.ejs");
});

app.get("/settings", (req, res) => {
    res.render("settings.ejs");
});

app.get("/rules", (req, res) => {
    res.render("rules.ejs");
});

app.get("/empty", async (req, res) => {
    let id = await utils.generateId();
    res.json({ id: id });
});

app.get("/create_new", async (req, res) => {
    let { id, quick, public } = req.query;
    try {
        await utils.createGame(+id, +quick, +public);
        res.sendStatus(200);
    } catch (e) {
        res.sendStatus(500);
    }
});

app.get("/game/:id", async (req, res) => {
    let id = +req.params.id;
    let game = await utils.find(id);

    if (!game) {
        res.render("msg.ejs", { msg: "This game room doesn't exist lol" });
    } else if (game.players.length == 2) {
        res.render("msg.ejs", { msg: "Game room full" });
    } else {
        let player = game.players[0];

        if (player === undefined) {
            player = "null";
        } else {
            player = `"${player}"`;
        }

        res.render("game.ejs", { id: id, name: player });
    }
});

app.get("/quick", async (req, res) => {
    let room = await utils.findQuick();

    if (room) {
        res.redirect("/game/" + room._id);
    } else {
        let id = await utils.generateId();
        await utils.createGame(id, 1, 0);
        res.redirect("/game/" + id);
    }
});

app.post("/create", async (req, res) => {
    let public = +req.body.public;
    let id = await utils.generateId();

    await utils.createGame(id, 0, public);

    res.redirect("/game/" + id);
});

app.get("*", (req, res) => {
    res.status(404).render("msg.ejs", { msg: "Nice try, nothing here" });
});

io.on("connection", socket => {
    console.log("A socket connected");

    socket.on("register", async (id, userName) => {
        let doc = await utils.find(+id);

        if (doc.players.length == 2) {
            console.log(
                userName + " is trying to access " + id + " that is full. "
            );
            io.emit("full", id, userName);
        } else {
            console.log(`${userName} joined room ${id}`);

            await utils.addPlayer(id, userName);
            let doc = await utils.find(+id);

            if (doc.players.length == 1) {
                console.log(id + ": One person have joined. ");
                io.emit("first", id, userName);
            } else if (doc.players.length == 2) {
                io.emit("join", id, userName);

                let i = utils.randInt(0, 1);
                io.emit("red", id, doc.players[i]);
                io.emit("blue", id, doc.players[1 - i]);
            }

            await utils.update(id);
        }
    });

    socket.on("move", async (id, name, from, to) => {
        console.log(`From: ${from}; To: ${to}`);
        io.emit("move", id, name, from, to);

        await utils.update(id);
    });

    socket.on("ready", async (id, name) => {
        console.log(name + " in " + id + " is ready");
        await utils.startingValue(id, name);

        let doc = await utils.find(+id);
        if (doc.start.length == 2) {
            console.log("Both players are ready");
            io.emit("start", id);
        } else if (doc.start.length != 1) {
            console.log("Check your server");
        }

        await utils.update(id);
    });

    socket.on("won", async (id, name, reason) => {
        io.emit("won", id, name, reason);

        await utils.update(id);
    });

    socket.on("rematch", (id, name, gameId) => {
        io.emit("rematch", id, name, gameId);

        console.log(`Room ${id} offers rematch`);
    });
});

server.listen((port = process.env.PORT || 3000), () => {
    console.log(`Running server at http://localhost:${port}`);
});
