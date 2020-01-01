// Thomas Huber 2/24/18

// TODO: rotation collision
// TODO: spawn on very right
// TODO: bias towards spawning

// find canvas
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// pieces
I = {
    s : [[0,0,0,0],
         [1,1,1,1],
         [0,0,0,0],
         [0,0,0,0]],
    c : "#00BCD4",
    x : null,
    y : null};
J = {
    s : [[2,0,0],
         [2,2,2],
         [0,0,0]],
    c : "#FFEB3B",
    x : null,
    y : null};
L = {
    s : [[0,0,3],
         [3,3,3],
         [0,0,0]],
    c : "#9C27B0",
    x : null,
    y : null};
O = {
    s : [[4,4],
         [4,4]],
    c : "#4CAF50",
    x : null,
    y : null};
S = {
    s : [[0,5,5],
         [5,5,0],
         [0,0,0]],
    c : "#F44336",
    x : null,
    y : null};
T = {
    s : [[0,6,0],
         [6,6,6],
         [0,0,0]],
    c : "#2196F3",
    x : null,
    y : null};
Z = {
    s : [[7,7,0],
         [0,7,7],
         [0,0,0]],
    c : "#FF9800",
    x : null,
    y : null
};

// board size
const w = 10;
const h = 20;

// draw size of a single block
const p = window.innerHeight/36;

let score = 0;
let pause = false;
let t = 0;
let dt = .08;

canvas.width = w * p;
canvas.height = h * p;

let block = document.getElementById("block");
let points = document.getElementById("points");

// board
let board = [];
for (let r = 0; r < w; ++r) {
    board[r] = [];
    for (let c = 0; c < h; ++c) {
    	board[r][c] = 0;
    }
}

function rotate(piece) {
    // rotate 90 degrees clockwise (not original)
    let n = piece[0].length;
    for (let i = 0; i < n/2; i++) {
        for (let j = i; j < n-i-1; j++) {
            let temp = piece[i][j];
            piece[i][j] = piece[n-j-1][i];
            piece[n-j-1][i] = piece[n-i-1][n-j-1];
            piece[n-i-1][n-j-1] = piece[j][n-i-1];
            piece[j][n-i-1] = temp;
        }
    }
    return piece;
}

function draw(piece) {
    // draw board
    for (let i = 0; i < w; ++i) {
        for (let j = 0; j < h; ++j) {
            switch (board[i][j]) {
                case 0:
                    ctx.fillStyle = "#fff";
                    break;
                case 1:
                    ctx.fillStyle = I.c;
                    break;
                case 2:
                    ctx.fillStyle = J.c;
                    break;
                case 3:
                    ctx.fillStyle = L.c;
                    break;
                case 4:
                    ctx.fillStyle = O.c;
                    break;
                case 5:
                    ctx.fillStyle = S.c;
                    break;
                case 6:
                    ctx.fillStyle = T.c;
                    break;
                case 7:
                    ctx.fillStyle = Z.c;
                    break;
                default:
                    ctx.fillStyle = "#fff";
                    break;
            }
            ctx.fillRect(i*p, j*p, p, p);
            ctx.strokeStyle = "#333";
            ctx.strokeRect(i*p, j*p, p, p);
        }
    }

    // draw piece
    let len = piece.s[0].length;
    for (let i = currentPiece.x; i < currentPiece.x + len; ++i) {
        for (let j = currentPiece.y; j < currentPiece.y + len; ++j) {
            if (piece.s[i-currentPiece.x][j-currentPiece.y] >= 1) {
                ctx.fillStyle = piece.c;
                ctx.fillRect(i*p, j*p, p, p);
                ctx.strokeStyle = "#333";
                ctx.strokeRect(i*p, j*p, p, p);
            }
        }
    }
}

let nextPiece = newPiece();
let currentPiece;
let falling = false;

function newPiece() {
    switch(Math.floor(7 * Math.random())) {
        case 0:
            return I;
        case 1:
            return O;
        case 2:
            return J;
        case 3:
            return L;
        case 4:
            return S;
        case 5:
            return T;
        case 6:
            return Z;
    }
}

function addToBoard(piece) {
    let len = piece.s[0].length;
    for (let i = 0; i < len; ++i) {
        for (let j = 0; j < len; ++j) {
            if (piece.s[i][j] != 0) {
                board[i+piece.x][j+piece.y] = piece.s[i][j];
            }
        }
    }
    falling = false;
    score += 50;
}

function checkCollision(piece, dir) {
    let len = piece.s[0].length;
    switch (dir) {
        case 'ro':
            let rotated = piece.s;
            for (let i = 0; i < len/2; i++) {
                for (let j = i; j < len-i-1; j++) {
                    let temp = rotated[i][j];
                    rotated[i][j] = rotated[len-j-1][i];
                    rotated[len-j-1][i] = rotated[len-i-1][len-j-1];
                    rotated[len-i-1][len-j-1] = rotated[j][len-i-1];
                    rotated[j][len-i-1] = temp;
                }
            }
            // if space is already occupied
            for (let i = 0; i < len; ++i) {
                for (let j = 0; j < len; ++j) {
                    // checking for real elements in tetris shape
                    if (rotated[i][j] != 0) {
                        if (piece.x + i < 0 || piece.x + i > 9) {
                            console.log("blocked");
                            block.play();
                            return true;
                        }
                        if (board[piece.x+i][piece.y+j] > 0) {
                            console.log("blocked");
                            block.play();
                            return true;
                        }
                    }
                }
            }
        case 'd':
            for (let i = 0; i < len; ++i) {
                for (let j = 0; j < len; ++j) {
                    // checking for real elements in tetris shape
                    if (piece.s[i][j] != 0) {
                        // triggered at bottom
                        if (piece.y + j >= 19) {
                            return true;
                        // triggered if board element below block in shape is occupied
                        } else if (board[piece.x+i][j+piece.y+1] > 0) {
                            return true;
                        }
                    }
                }
            }
            return false;
        case 'l':
            for (let i = 0; i < len; ++i) {
                for (let j = 0; j < len; ++j) {
                    // checking for real elements in tetris shape
                    if (piece.s[i][j] != 0) {
                        // triggered at left side
                        if (piece.x + i == 0) {
                            return true;
                        // triggered if something is on left
                        } else if (board[piece.x+i-1][j+piece.y] > 0) {
                            return true;
                        }
                    }
                }
            }
            return false;
        case 'r':
            for (let i = 0; i < len; ++i) {
                for (let j = 0; j < len; ++j) {
                    // checking for real elements in tetris shape
                    if (piece.s[i][j] != 0) {
                        // triggered at right side
                        if (piece.x + i >= 9) {
                            return true;
                        // triggered if something is on right
                        } else if (board[piece.x+i+1][j+piece.y] > 0) {
                            return true;
                        }
                    }
                }
            }
            return false;
        default:
            return false;
    }
}

function checkLine() {
    for (let r = 19; r > 0; r--) {
        let full = true;
        for (let c = 0; c < w; c++) {
            if (board[c][r] == 0) {
                full = false;
            }
        }
        if (full) {
            score += 500;
            // only plays twice
            points.currentTime = 0;
            points.play();
            for (let c = 0; c < w; c++) {
                board[c][r] = 0;
                for (let row = r; row > 1; row--) {
                    board[c][row] = board[c][row-1];
                }
            }
        }
    }
}

function gameOver() {
    for (let c = 0; c < w; c++) {
        if (board[c][0] != 0) {
            score = 0;
            block.play();
            for (let r = 0; r < w; ++r) {
                board[r] = [];
                for (let c = 0; c < h; ++c) {
                	board[r][c] = 0;
                }
            }
        }
    }
}

function highScore() {
    if(typeof(Storage) !== "undefined") {
        if (localStorage.highScore) {
            if (score > Number(localStorage.highScore)) {
                localStorage.highScore = score;
            }
        } else {
            localStorage.highScore = 0;
        }
        document.getElementById('score').innerHTML = 'Score: ' + score + ' High: ' + localStorage.highScore;
    }
}

function GM() {
    // load up next piece
    if (!falling) {
        currentPiece = nextPiece;
        currentPiece.x = Math.floor((10 - currentPiece.s[0].length) * Math.random());
        currentPiece.y = 0
        nextPiece = newPiece();
        falling = true;
    }

    if (falling) {
        draw(currentPiece);
        if (t >= 1) {
            if (checkCollision(currentPiece, 'd')) {
                addToBoard(currentPiece);
                falling = false;
            } else {
                currentPiece.y++;
            }
            gameOver();
            checkLine();
            t = 0;
        }
    }

    t += dt;

    window.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }

        switch (event.keyCode) {
            case 40:
                console.log('Arrow Down');
                if (!checkCollision(currentPiece, 'd') && !pause) {
                    currentPiece.y++;
                }
                break;
            case 38:
                console.log('Arrow Up');
                if (!checkCollision(currentPiece, 'ro') && !pause) {
                    currentPiece.s = rotate(currentPiece.s);
                    currentPiece.s = rotate(currentPiece.s);
                } else {
                    currentPiece.s = rotate(currentPiece.s);
                    currentPiece.s = rotate(currentPiece.s);
                    currentPiece.s = rotate(currentPiece.s);
                }
                break;
            case 37:
                console.log('Arrow Left');
                if (!checkCollision(currentPiece, 'l') && !pause) {
                    currentPiece.x--;
                }
                break;
            case 39:
                console.log('Arrow Right');
                if (!checkCollision(currentPiece, 'r') && !pause) {
                    currentPiece.x++;
                }
                break;
            case 32:
                console.log('Space Bar');
                if (dt > 0) {
                    dt = 0;
                    pause = true;
                } else {
                    dt = .08;
                    pause = false;
                }
                break;
            default:
                return;
        }

        event.preventDefault();

    }, true);

    highScore();

    if (!pause)
        dt = .08;
    requestAnimationFrame(GM);
}

requestAnimationFrame(GM);
