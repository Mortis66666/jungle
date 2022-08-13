
const pieceVals = [
    "m", "c", "d", "w", "l", "t", "s", "e"
];

const pieceName = {};

for (let [i, name] of "鼠猫狗狼豹虎狮象".split``.entries()) {
    pieceName[pieceVals[i]] = name;
}



class Piece {
    constructor(x, y, color, type) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;

        this.drawX = x * gridLength;
        this.drawY = y * gridLength;

        this.mx = 0;
        this.my = 0;

        this.val = pieceVals.findIndex(e => e == type);
        this.selected = false;
        this.name = pieceName[type];
    }


    draw() {
        let vx = this.x * gridLength - this.drawX;
        let vy = this.y * gridLength - this.drawY;

        if (vx == 0 && vy == 0) {
            // Not moving
            this.mx = 0;
            this.my = 0;
        } else if (this.mx == 0 && this.my == 0) {
            // Just started to move
            this.mx = vx / 30;
            this.my = vy / 30;
        }

        this.drawX += this.mx;
        this.drawY += this.my;

        stroke(0);
        strokeWeight(this.selected * 5);
        fill(this.color);
        ellipse(
            this.drawX + gridLength * .5,
            this.drawY + gridLength * .5,
            gridLength * .7
        );


        noStroke();
        fill(255);
        text(
            this.name,
            this.drawX + gridLength * .25,
            this.drawY + gridLength * .7
        );
    }

    canGo(x, y) {
        if (isRiver(x, y) && this.type != "m") {
            return false;
        }

        if (this.type == "s" || this.type == "t") {
            if (x == this.x) {
                for (let i = Math.min(y, this.y) + 1; i < Math.max(y, this.y); i++) {
                    let p = grid[i][x];
                    if (!isRiver(x, i) || (p && p.color != this.color)) {
                        return false;
                    }
                }
                return true;
            } else if (y == this.y) {
                for (let i = Math.min(x, this.x) + 1; i < Math.max(x, this.x); i++) {
                    let p = grid[y][i];
                    if (!isRiver(i, y) || (p && p.color != this.color)) {
                        return false;
                    }
                }
                return true;
            }
        }

        return Math.abs(x - this.x) + Math.abs(y - this.y) == 1;
    }


    canEat(piece) {
        if (this.color == piece.color) {
            return false;
        } else if (isTrap(piece.x, piece.y)) {
            return true;
        } else if (this.type == "e" && piece.type == "m") {
            return false;
        } else if (this.type == "m") {
            if (!isRiver(this.x, this.y)) {
                return "me".includes(piece.type);
            }
            return false;
        } else {
            return this.val >= piece.val;
        }
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;
    }

    drawLegalMoves() {
        fill(0, 0, 0, 40);
        noStroke();

        for (let x = 0; x < gridWidth; x++) {
            for (let y = 0; y < gridHeight; y++) {
                if (this.canGo(x, y) && (!grid[y][x] || this.canEat(grid[y][x]))) {
                    circle(
                        (x + .5) * gridLength,
                        (y + .5) * gridLength,
                        gridLength * .4
                    );
                }
            }
        }
    }
}