let socket = io();


socket.on("join", (id, name) => {
    console.log(id, name);
    if (id == roomId && opponentName === undefined)
        opponentName = name;
        
        document.getElementById("ready-button").style.display = "block";
})


socket.on("start", id => {
    console.log("start");
    if (id == roomId) {
        console.log("start2");
        document.getElementById("board").style.display = "block";
        document.getElementById("awaiting-screen").style.display = "none";
    }
})

socket.on("red", (id, name) => {
    console.log(id, name);
    if (id == roomId && name == userName) {
        console.log("Red");
        turn = true;
    }
})

socket.on("blue", (id, name) => {
    console.log(id, name);
    if (id == roomId && name == userName) {
        console.log("Blue");
        pov = "blue";
        makeGrid(pov);
    }
})

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
})

socket.on("won", (id, name, reason) => {
    if (id == roomId) {
        win(name, reason);
    }
})
