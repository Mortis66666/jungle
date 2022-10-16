const express = require('express');
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
})

app.get("/self", (req, res) => {
    res.render("self.ejs");
})

app.route("/game/:id")
    .post(async (req, res) => {
        let id = +req.params.id;
        await utils.createGame(id);

        res.render("game.ejs", { name: null, id: id });
    })
    .get(async (req, res) => {
        let id = +req.params.id;
        let game = await utils.find(id);

        if (!game) {
            res.send("<h1>This game room doesn't exist lol</h1>");
        } else if (game.players.length == 2 ) {
            res.send("<h1>Game room full</h1>");
        } else {
            res.render("game.ejs", { id: id, name: `"${game.players[0]}"` });
        }
    })

app.get("/create", (req, res) => {
    res.render("create.ejs");
})

app.get("*", (req, res) => {
    res.status(404).send("<h1>Nice try, nothing here</h1>");
})

io.on("connection", socket => {
    console.log("A socket connected");

    socket.on("register", async (id, userName) => {
        let doc3 = await utils.find(+id);

        if (doc3.players.length == 2) {
            console.log(userName + " is trying to access " + id + " that is full. ");

        } else {
            
            console.log(`${userName} joined room ${id}`);

            await utils.addPlayer(id, userName);
            let doc = await utils.find(+id);

            if (doc.players.length == 1) {
                console.log(id + ": One person have joined. ");
            } else if (doc.players.length == 2) {
                io.emit("join", id, userName);

                let i = utils.randInt(0, 1);
                io.emit("red", id, doc.players[i]);
                io.emit("blue", id, doc.players[1-i]);
            }   
            
        }
    });

    socket.on("move", (id, name, from, to) => {
        console.log(`From: ${from}; To: ${to}`);
        io.emit("move", id, name, from, to);
    });

    socket.on("ready", async (id, name) => {
        console.log(name + " in " + id + " is ready");
        await utils.startingValue(id, name);
        
        let doc2 = await utils.find(+id);
        if (doc2.start.length == 2) {
            console.log("Both players are ready");
            io.emit("start", id);
        } else if (doc2.start.length != 1) {
            console.log("Check your server");
        }
    });

    socket.on("won", (id, name) => {
        io.emit("won", id, name);
    })
})


server.listen(port = process.env.PORT || 3000, () => {
    console.log(`Running server at http://localhost:${port}`);
})

