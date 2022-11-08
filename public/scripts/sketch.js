const gridWidth = 7;
const gridHeight = 9;
const screenWidth = screen.width;
const screenHeight = screen.height;
var gridLengthI;
//#region
if (screenWidth > 650) {
    if (screenHeight > 910) {
        gridLengthI = 90;
    } else {
        gridLengthI = 75;
    }
} else if (screenWidth > 550) {
    if (screenHeight > 767) {
        gridLengthI = 75;
    } else {
        gridLengthI = 75;
    }
} else if (screenWidth > 300) {
    if (screenHeight > 450) {
        gridLengthI = 45;
    } else {
        gridLengthI = 75;
    }
} else {
    gridLengthI = 15;
}
//#endregion
const gridLength = gridLengthI;
const grid = [];
const canvasWidth = gridWidth * gridLength;
const canvasHeight = gridHeight * gridLength;
const traps = [];
const dens = [
    [3, 0],
    [3, 8]
];
const board = ["s5t", "1d3c1", "m1l1w1e"];
const moveSound = new Audio("/moveSound.wav");

var selected = null;
var turn = false;
var infoMsg;
var dialog;
var opponentName;
var roomId;
var pov = "red";
var userName = "";
var gameOver = false;
var highlightSquares = [];

document
    .querySelector(":root")
    .style.setProperty("--length", gridLength + "px");

function setup() {
    let canvas = createCanvas(gridWidth * gridLength, gridHeight * gridLength);
    canvas.parent("board");

    makeGrid(pov);

    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            if (isTrap(x, y)) {
                traps.push([x, y]);
            }
        }
    }

    textSize(gridLength * 0.5);

    infoMsg = document.querySelector("h1");
    dialog = document.getElementById("dialog1");
    opponentName = eval(document.getElementById("o-name").innerHTML);
    roomId = +document.getElementById("rid").innerHTML;

    document.getElementById("resign").onclick = () => {
        socket.emit("won", roomId, opponentName, "resignation");
    };

    document.getElementById("dialog-close").onclick = () => {
        dialog.style.animationName = "dialog1-close";
    };

    let rematchForm = document.getElementById("rematch-form");

    rematchForm.action = `/game/${randInt(1000, 9999)}`;

    rematchForm.onsubmit = () => {
        socket.emit(
            "rematch",
            roomId,
            opponentName,
            document.getElementById("rematch-form").action
        );
        return true;
    };

    let name = localStorage.getItem("name");

    if (name) {
        document.getElementById("username").value = name;
    }

    console.log("%cWARNING", "font-size:10em;color:red;");
    console.log(
        `%cThis is a browser feature intended for developers.
    Do NOT copy and paste something here if you do not understand it.

    You can learn more at:
    https://en.wikipedia.org/wiki/Self-XSS`,
        "font-size:2em"
    );
}

function draw() {
    if (gameOver) {
        infoMsg.innerHTML = "Game over";
    }

    if (opponentName) {
        infoMsg.innerHTML = (turn ? "Your" : opponentName + "'s") + " turn";
    } else {
        infoMsg.innerHTML = "Waiting for opponent...";
    }

    clear();
    drawRiver();
    drawHighlightedSquares();
    drawGridLines();
    drawTrap(pov);
    drawDen(pov);

    for (let row of grid) {
        for (let piece of row) {
            piece && piece.draw();
        }
    }

    selected && selected.drawLegalMoves();

    let red = 0;
    let blue = 0;

    for (let row of grid) {
        for (let piece of row) {
            if (piece) {
                if (piece.color == "red") {
                    red++;
                } else {
                    blue++;
                }
            }
        }
    }

    let name = null;

    if (!red) {
        name = pov == "red" ? opponentName : "You";
    } else if (!blue) {
        name = pov == "red" ? "You" : opponentName;
    }

    if (name) {
        win(name, "killing every opponent's pieces");
    }
}

function mouseClicked() {
    if (!turn || gameOver) return;
    if (mouseX && mouseY && mouseX < canvasWidth && mouseY < canvasHeight) {
        if (selected) selected.selected = false;

        let x = Math.floor(mouseX / gridLength);
        let y = Math.floor(mouseY / gridLength);

        let piece = grid[y][x];

        if (selected) {
            if (selected.canGo(x, y) && (!piece || selected.canEat(piece))) {
                socket.emit(
                    "move",
                    roomId,
                    opponentName,
                    [6 - selected.x, 8 - selected.y],
                    [6 - x, 8 - y]
                );

                grid[selected.y][selected.x] = null;
                selected.moveTo(x, y);
                grid[y][x] = selected;
                turn = !turn;

                playSound(moveSound);

                if (isDen(x, y) && y == 0) {
                    socket.emit("won", roomId, userName, "entering the den");
                }
            }
            selected = null;
        } else if (piece && pov != piece.color) {
            // Invalid selection
            console.log(turn, "invalid");
        } else if (piece) {
            // Select piece
            piece.selected = true;
            selected = piece;
        }
    } else {
        if (selected) selected.selected = false;

        selected = null;
    }
}

function makeGrid(pov) {
    grid.length = 0;

    for (let row of board) {
        let pieces = [];
        for (let c of row) {
            if (+c) {
                for (let i = 0; i < c; i++) {
                    pieces.push(null);
                }
            } else {
                pieces.push(
                    new Piece(
                        pieces.length,
                        grid.length,
                        pov == "red" ? "blue" : "red",
                        c
                    )
                );
            }
        }

        grid.push(pieces);
    }

    let i = 3;
    while (i--) {
        grid.push(Array(7).fill(null));
    }

    for (let row of [...board].reverse()) {
        let pieces = [];
        for (let c of row.split("").reverse().join("")) {
            if (+c) {
                for (let i = 0; i < c; i++) {
                    pieces.push(null);
                }
            } else {
                pieces.push(new Piece(pieces.length, grid.length, pov, c));
            }
        }

        grid.push(pieces);
    }
}

function drawGridLines() {
    stroke(0);
    strokeWeight(1);
    for (let x = 1; x < gridWidth; x++) {
        line(x * gridLength, 0, x * gridLength, gridHeight * gridLength);
    }

    for (let y = 1; y < gridHeight; y++) {
        line(0, y * gridLength, gridWidth * gridLength, y * gridLength);
    }
}

function drawRiver() {
    fill(56, 175, 205);
    rect(gridLength, 3 * gridLength, 2 * gridLength, 3 * gridLength);

    rect(4 * gridLength, 3 * gridLength, 2 * gridLength, 3 * gridLength);
}

function drawHighlightedSquares() {
    fill(156, 221, 236);

    for (let [x, y] of highlightSquares) {
        rect(x * gridLength, y * gridLength, gridLength, gridLength);
    }
}

function drawTrap(pov) {
    let rv = pov == "red" ? "blue" : "red";
    for (let [x, y] of traps) {
        fill(y > 6 ? pov : rv);
        text("陷阱", x * gridLength, (y + 0.7) * gridLength);
    }
}

function drawDen(pov) {
    let rv = pov == "red" ? "blue" : "red";
    for (let [x, y] of dens) {
        fill(y > 6 ? pov : rv);
        text("兽穴", x * gridLength, (y + 0.7) * gridLength);
    }
}

function win(name, reason) {
    document.getElementById("resign").style.display = "none";
    document.getElementById("rematch").classList.remove("hide");
    gameOver = true;
    openDialog(
        `${name} won by ${reason}!`,
        name == userName ? "green" : "red",
        "white",
        7000
    );
}

function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

function register() {
    var username = document.getElementById("username");

    if (username.value != "") {
        if (username.value != opponentName) {
            userName = username.value;
            localStorage.setItem("name", userName);
            document.getElementById("rematch-username").value = userName;
            socket.emit("register", roomId, userName);
            //registered

            document.getElementById("username").style.display = "none";
            document.getElementById("join").style.display = "none";
            document.getElementById("usernamenotvalid").style.display = "none";

            if (opponentName) {
                document.getElementById("ready-button").style.display = "block";

                document.getElementById("join-2").style.display = "none";
                document.getElementById("join-3").style.display = "none";
            }
        } else {
            usernameNotValid("The name is taken by opponent, try again. ");
        }
    } else {
        usernameNotValid("Do not leave the username blank, try again. ");
    }
}

function openDialog(msg, colour, textColor, duration) {
    let dialogMsg = document.getElementById("dialog-message");

    dialog.style.display = "flex";
    dialog.style.backgroundColor = colour;
    dialog.style.animationName = "dialog1-open";

    dialogMsg.innerHTML = msg;
    dialogMsg.style.color = textColor;

    setTimeout(() => {
        dialog.style.animationName = "dialog1-close";
    }, duration);
}

function usernameNotValid(msg) {
    document.getElementById("usernamenotvalid").innerHTML =
        `<p> ` + msg + ` </p>`;
}

function ready() {
    socket.emit("ready", roomId, userName);

    document.getElementById("ready-button").style.display = "none";
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function isRiver(x, y) {
    return inRange(3, 5, y) && [1, 2, 4, 5].includes(x);
}

function isTrap(x, y) {
    let xabs = Math.abs(x - 3);
    return [xabs + y, xabs + 8 - y].includes(1);
}

function isDen(x, y) {
    return x == 3 && [0, 8].includes(y);
}

function inRange(min, max, n) {
    return min <= n && n <= max;
}
