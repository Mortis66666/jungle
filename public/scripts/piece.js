
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
        this.name = pieceName[type]
    }

    canGo(x, y) {
        return false;
    }

    draw() {
        let vx = this.drawX - this.x * gridLength;
        let vy = this.drawY - this.y * gridLength;

        if (!(vx * vy)) {
            // Not moving
            this.mx = 0;
            this.my = 0;
        }

        else if (!(this.mx * this.my)) {
            // Just started to move
            this.mx = vx;
            this.my = vy;
        }

        this.drawX += this.mx;
        this.drawY += this.my;

        noStroke();
        fill(this.color);
        ellipse(
            this.drawX + gridLength * .5,
            this.drawY + gridLength * .5,
            gridLength * .7
        );


        fill(255);
        text(
            this.name,
            this.drawX + gridLength * .25,
            this.drawY + gridLength * .7
        );
    }

    canEat(piece) {
        if (this.type == "e" && piece.type == "m") {
            return false;
        } else if (this.type == "m" && piece.type == "e") {
            return true;
        } else {
            return this.val >= piece.val;
        }
    }
}