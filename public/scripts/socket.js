let socket = io();

socket.on("join", (id, name) => {
    console.log(id, name);
    if (id == roomId && opponentName === null) {
        opponentName = name;

        document.getElementById("ready-button").style.display = "block";

        document.getElementById("join-2").style.display = "none";
        document.getElementById("join-3").style.display = "none";
        console.log("received opponentname (i have register)");
    }
});

socket.on("first", (id, name) => {
    if (id == roomId && userName == "") {
        console.log("received opponentname (i havent register)");
        opponentName = name;
    }
});

socket.on("start", id => {
    console.log("start");
    if (id == roomId) {
        console.log("start2");
        document.getElementById("awaiting-screen").style.display = "none";
    }
});

socket.on("full", (id, name) => {
    if (id == roomId && name == userName) {
        document.getElementById("awaiting-screen").style.display = "block";
        document.getElementById("ready-button").style.display = "none";

        let join3 = document.getElementById("join-3");

        join3.style.display = "block";
        join3.innerHTML = "Game room full!";
    }
});

socket.on("red", (id, name) => {
    console.log(id, name);
    if (id == roomId && name == userName) {
        console.log("Red");
        turn = true;
    }
});

socket.on("blue", (id, name) => {
    console.log(id, name);
    if (id == roomId && name == userName) {
        console.log("Blue");
        pov = "blue";
        makeGrid(pov);
    }
});

socket.on("move", (id, name, from, to) => {
    if (id == roomId && name == userName) {
        console.log("Opponent moved");
        let [fx, fy] = from;
        let [tx, ty] = to;

        let selected = grid[fy][fx];
        selected.moveTo(tx, ty);
        grid[fy][fx] = null;
        grid[ty][tx] = selected;
        turn = !turn;

        playSound(moveSound);
    }
});

socket.on("won", (id, name, reason) => {
    if (id == roomId) {
        win(name, reason);
    }
});

socket.on("rematch", (id, name, gameId) => {
    if (id == roomId && name == userName) {
        console.log("rematch");
        openDialog(
            `${opponentName} has offered a <a href="${gameId}">rematch</a>`,
            ["orange", "yellow", "lightgreen"][randInt(0, 2)],
            "black",
            10000
        );
    }
});
