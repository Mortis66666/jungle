const gridWidth = 7;
const gridHeight = 9;
const gridLength = 75;
const grid = [];
const canvasWidth = gridWidth * gridLength;
const canvasHeight = gridHeight * gridLength;


var selected = null;
var redsTurn = true;
var infoMsg;

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

    textSize(gridLength * .5);
    infoMsg = document.querySelector("h1");
}


function draw() {
    infoMsg.innerHTML = (redsTurn ? "Red" : "Blue") + "'s turn";

    clear();
    drawGridLines();
    drawRiver();

    for (let row of grid) {
        for (let piece of row) {
            piece && piece.draw();
        }
    }
}

function mouseClicked() {
    if (mouseX && mouseY && mouseX < canvasWidth && mouseY < canvasHeight) {
        if (selected)
            selected.selected = false;

        let x = Math.floor(mouseX / gridLength);
        let y = Math.floor(mouseY / gridLength);

        let piece = grid[y][x];

        console.log(piece);

        if (selected) {
            if (selected.canGo(x, y) && (!piece || selected.canEat(piece))) {
                // Eat piece
                grid[selected.y][selected.x] = null;
                selected.moveTo(x, y);
                grid[y][x] = selected;
                redsTurn = !redsTurn;
                console.log("moved to %d, %d", x, y);
            }
            selected = null;

        } else if (piece && ["blue", "red"][redsTurn ? 1:0] != piece.color) {
            // Invalid selection
            console.log(redsTurn, 'invalid');
        } else {
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

function isRiver(x, y) {
    return inRange(3, 5, y) && [1, 2, 4, 5].includes(x);
}

function isTrap(x, y) {

}

function inRange(min, max, n) {
    return min <= n && n <= max;
}


