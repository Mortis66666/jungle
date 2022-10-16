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
const moveSound = new Audio("/moveSound.wav");

var selected = null;
var redsTurn = true;
var infoMsg;
var highlightSquares = [];

document.querySelector(":root").style.setProperty('--length', gridLength + 'px');

function setup() {
    let canvas = createCanvas(
        gridWidth * gridLength,
        gridHeight * gridLength
    );
    canvas.parent("board");

    board = [
        "s5t",
        "1d3c1",
        "m1l1w1e"
    ]

    for (let row of board) {
        let pieces = [];
        for (let c of row) {
            if (+c) {
                for (let i = 0; i < c; i++) {
                    pieces.push(null);
                }
            } else {
                pieces.push(new Piece(pieces.length, grid.length, "blue", c));
            }
        }

        grid.push(pieces);
    }

    let i = 3;
    while (i--) {
        grid.push(Array(7).fill(null));
    }

    for (let row of board.reverse()) {
        let pieces = [];
        for (let c of row.split("").reverse().join("")) {
            if (+c) {
                for (let i = 0; i < c; i++) {
                    pieces.push(null);
                }
            } else {
                pieces.push(new Piece(pieces.length, grid.length, "red", c));
            }
        }

        grid.push(pieces);
    }

    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            if (isTrap(x, y)) {
                traps.push([x, y]);
            }
        }
    }

    textSize(gridLength * .5);
    infoMsg = document.querySelector("h1");
}


function draw() {
    infoMsg.innerHTML = (redsTurn ? "Red" : "Blue") + "'s turn";

    clear();
    drawGridLines();
    drawRiver();
    drawHighlightedSquares();
    drawTrap();
    drawDen();

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

    if (!red) {
        setTimeout(() => {
            document.getElementById("dialog").style.display = "block";
            document.getElementById("close-dialog").style.display = "block";
            document.getElementById("winning-html").innerHTML = "<h1> Blue won! Reload page to play again </h1>";
            document.getElementById("board").style.display = "none";
        }, 500);
    } else if (!blue) {
        setTimeout(() => {
            document.getElementById("dialog").style.display = "block";
            document.getElementById("close-dialog").style.display = "block";
            document.getElementById("winning-html").innerHTML = "<h1> Red won! Reload page to play again </h1>";
            document.getElementById("board").style.display = "none";
        }, 500);
    }
}

function mouseClicked() {
    if (mouseX && mouseY && mouseX < canvasWidth && mouseY < canvasHeight) {
        if (selected)
            selected.selected = false;

        let x = Math.floor(mouseX / gridLength);
        let y = Math.floor(mouseY / gridLength);

        let piece = grid[y][x];

        if (selected) {
            if (selected.canGo(x, y) && (!piece || selected.canEat(piece))) {
                // Eat piece
                grid[selected.y][selected.x] = null;
                selected.moveTo(x, y);
                grid[y][x] = selected;
                redsTurn = !redsTurn;

                playSound(moveSound);

                if (isDen(x, y) && y == redsTurn * 8) {
                    setTimeout(() => {


                        document.getElementById("dialog").style.display = "block";
                        document.getElementById("close-dialog").style.display = "block";
                        document.getElementById("winning-html").innerHTML = "<h1> " + (redsTurn ? "Blue" : "Red") + " won! Reload page to play again </h1>";
                        document.getElementById("board").style.display = "none";
                    }, 500);
                }
            }
            selected = null;

        } else if (piece && ["blue", "red"][redsTurn ? 1:0] != piece.color) {
            // Invalid selection
            console.log(redsTurn, 'invalid');
        } else if (piece) {
            // Select piece
            piece.selected = true;
            selected = piece;
        }


    } else {
        if (selected)
            selected.selected = false;

        selected = null;
    }
}


function drawGridLines() {
    stroke(0);
    strokeWeight(1);
    for (let x = 1; x < gridWidth; x++) {
        line(
            x * gridLength, 0,
            x * gridLength, gridHeight * gridLength
        );
    }

    for (let y = 1; y < gridHeight; y++) {
        line(
            0, y * gridLength,
            gridWidth * gridLength, y * gridLength
        );
    }
}

function drawRiver() {
    fill(56, 175, 205);
    rect(
        gridLength, 3 * gridLength,
        2 * gridLength, 3 * gridLength
    );
    
    rect(
        4 * gridLength, 3 * gridLength,
        2 * gridLength, 3 * gridLength
    );
}

function drawHighlightedSquares() {
    fill(156, 221, 236);

    for (let [x, y] of highlightSquares) {
        rect(
            x * gridLength, y * gridLength,
            gridLength, gridLength
        )
    }
}

function drawTrap() {
    for (let [x, y] of traps) {
        fill((y > 6) * 255, 0, (y < 2) * 255);
        text(
            "陷阱",
            x * gridLength,
            (y + .7) * gridLength
        )
    }
}

function drawDen() {
    for (let [x, y] of dens) {
        fill((y > 6) * 255, 0, (y < 2) * 255);
        text(
            "兽穴",
            x * gridLength,
            (y + .7) * gridLength
        )
    }
}

function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
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
