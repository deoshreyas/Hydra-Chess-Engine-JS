let controlsdiv = document.getElementsByClassName("controls-form");
let controls = document.getElementById("controls");
let depth, board, game;
let chessboard = document.getElementsByClassName("chessboard");
let globalSum = 0;
let positionCount;

// DRAW BOARD AND SET ATTRIBUTES
function loadBoard() {
    board = document.querySelector("chess-board");
    playGame(board);
}

// HANDLE CONTROLS FORM SUBMISSION
controls.addEventListener("submit", (e) => {
    e.preventDefault(); // PREVENT RELOAD

    // DISPLAY CHESS BOARD AND GET FORM VALUES
    depth = document.getElementById("depth").value;
    controlsdiv[0].style.display = "none";
    chessboard[0].style.display = "block";
    document.getElementsByClassName("info")[0].style.display = "block";

    game = new Chess();

    loadBoard();
});

// EVALUATION FUNCTION 
function evaluateBoard(game, move, prevSum, color) {
    // FIXED PARAMETERS
    let weights = { 'p': 100, 'n': 280, 'b': 320, 'r': 479, 'q': 929, 'k': 60000, 'k_e': 60000 };
    let pst_w = {
        'p': [
            [100, 100, 100, 100, 105, 100, 100, 100],
            [78, 83, 86, 73, 102, 82, 85, 90],
            [7, 29, 21, 44, 40, 31, 44, 7],
            [-17, 16, -2, 15, 14, 0, 15, -13],
            [-26, 3, 10, 9, 6, 1, 0, -23],
            [-22, 9, 5, -11, -10, -2, 3, -19],
            [-31, 8, -7, -37, -36, -14, 3, -31],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        'n': [
            [-66, -53, -75, -75, -10, -55, -58, -70],
            [-3, -6, 100, -36, 4, 62, -4, -14],
            [10, 67, 1, 74, 73, 27, 62, -2],
            [24, 24, 45, 37, 33, 41, 25, 17],
            [-1, 5, 31, 21, 22, 35, 2, 0],
            [-18, 10, 13, 22, 18, 15, 11, -14],
            [-23, -15, 2, 0, 2, 0, -23, -20],
            [-74, -23, -26, -24, -19, -35, -22, -69]
        ],
        'b': [
            [-59, -78, -82, -76, -23, -107, -37, -50],
            [-11, 20, 35, -42, -39, 31, 2, -22],
            [-9, 39, -32, 41, 52, -10, 28, -14],
            [25, 17, 20, 34, 26, 25, 15, 10],
            [13, 10, 17, 23, 17, 16, 0, 7],
            [14, 25, 24, 15, 8, 25, 20, 15],
            [19, 20, 11, 6, 7, 6, 20, 16],
            [-7, 2, -15, -12, -14, -15, -10, -10]
        ],
        'r': [
            [35, 29, 33, 4, 37, 33, 56, 50],
            [55, 29, 56, 67, 55, 62, 34, 60],
            [19, 35, 28, 33, 45, 27, 25, 15],
            [0, 5, 16, 13, 18, -4, -9, -6],
            [-28, -35, -16, -21, -13, -29, -46, -30],
            [-42, -28, -42, -25, -25, -35, -26, -46],
            [-53, -38, -31, -26, -29, -43, -44, -53],
            [-30, -24, -18, 5, -2, -18, -31, -32]
        ],
        'q': [
            [6, 1, -8, -104, 69, 24, 88, 26],
            [14, 32, 60, -10, 20, 76, 57, 24],
            [-2, 43, 32, 60, 72, 63, 43, 2],
            [1, -16, 22, 17, 25, 20, -13, -6],
            [-14, -15, -2, -5, -1, -10, -20, -22],
            [-30, -6, -13, -11, -16, -11, -16, -27],
            [-36, -18, 0, -19, -15, -15, -21, -38],
            [-39, -30, -31, -13, -31, -36, -34, -42]
        ],
        'k': [
            [4, 54, 47, -99, -99, 60, 83, -62],
            [-32, 10, 55, 56, 56, 55, 10, 3],
            [-62, 12, -57, 44, -67, 28, 37, -31],
            [-55, 50, 11, -4, -19, 13, 0, -49],
            [-55, -43, -52, -28, -51, -47, -8, -50],
            [-47, -42, -43, -79, -64, -32, -29, -32],
            [-4, 3, -14, -50, -57, -18, 13, 4],
            [17, 30, -3, -14, 6, -1, 40, 18]
        ],
        // Endgame King Table
        'k_e': [
            [-50, -40, -30, -20, -20, -30, -40, -50],
            [-30, -20, -10, 0, 0, -10, -20, -30],
            [-30, -10, 20, 30, 30, 20, -10, -30],
            [-30, -10, 30, 40, 40, 30, -10, -30],
            [-30, -10, 30, 40, 40, 30, -10, -30],
            [-30, -10, 20, 30, 30, 20, -10, -30],
            [-30, -30, 0, 0, 0, 0, -30, -30],
            [-50, -30, -30, -30, -30, -30, -30, -50]
        ]
    };
    let pst_b = {
        'p': pst_w['p'].slice().reverse(),
        'n': pst_w['n'].slice().reverse(),
        'b': pst_w['b'].slice().reverse(),
        'r': pst_w['r'].slice().reverse(),
        'q': pst_w['q'].slice().reverse(),
        'k': pst_w['k'].slice().reverse(),
        'k_e': pst_w['k_e'].slice().reverse()
    }
    let pstOpponent = { 'w': pst_b, 'b': pst_w };
    let pstSelf = { 'w': pst_w, 'b': pst_b };

    // EVALUATION
    if (game.in_checkmate()) {
        if (move.color === color) { // OPPONENT IN CHECKMATE
            return 10 ** 10;
        } else { // WE ARE IN CHECKMATE
            return -(10 ** 10);
        }
    }

    if (game.in_draw() || game.in_threefold_repetition() || game.in_stalemate()) { // GAME IS DRAWN
        return 0;
    }

    if (game.in_check()) {
        if (move.color === color) { // OPPONENT IN CHECK
            prevSum += 50;
        } else { // WE ARE IN CHECK
            prevSum -= 50;
        }
    }

    let from = [
        8 - parseInt(move.from[1]),
        move.from.charCodeAt(0) - 'a'.charCodeAt(0),
    ];
    let to = [
        8 - parseInt(move.to[1]),
        move.to.charCodeAt(0) - 'a'.charCodeAt(0),
    ];

    // SPECIAL KING ENDGAME BEHAVIOUR
    if (prevSum < -1500) {
        if (move.piece === 'k') {
            move.piece = 'k_e';
        }
    }

    if ('captured' in move) {
        if (move.color === color) { // OPPONENT PIECE CAPTURED
            prevSum +=
                weights[move.captured] +
                pstOpponent[move.color][move.captured][to[0]][to[1]];
        } else { // OUR PIECE CAPTURED
            prevSum -=
                weights[move.captured] +
                pstSelf[move.color][move.captured][to[0]][to[1]];
        }
    }

    // PROMOTIONS
    if (move.flags.includes('p')) {
        // NOTE: promote to queen for simplicity
        move.promotion = 'q';
        if (move.color === color) { // OUR PIECE PROMOTED 
            prevSum -=
                weights[move.piece] + pstSelf[move.color][move.piece][from[0]][from[1]];
            prevSum +=
                weights[move.promotion] +
                pstSelf[move.color][move.promotion][to[0]][to[1]];
        } else { // OPPONENT PIECE PROMOTED
            prevSum +=
                weights[move.piece] + pstSelf[move.color][move.piece][from[0]][from[1]];
            prevSum -=
                weights[move.promotion] +
                pstSelf[move.color][move.promotion][to[0]][to[1]];
        }
    } else {
        if (move.color !== color) {
            prevSum += pstSelf[move.color][move.piece][from[0]][from[1]];
            prevSum -= pstSelf[move.color][move.piece][to[0]][to[1]];
        } else {
            prevSum -= pstSelf[move.color][move.piece][from[0]][from[1]];
            prevSum += pstSelf[move.color][move.piece][to[0]][to[1]];
        }
    }

    return prevSum;
}

// CHESS ENGINE
function makeMove() {
    function minimax(game, depth, alpha, beta, isMaximizingPlayer, sum, color) {
        positionCount++;
        let children = game.moves({ verbose: true });
        
        // RANDOM MOVE SORTING (don't pick the same move twice)
        children.sort(function (a, b) {
            return 0.5 - Math.random();
        });

        let currMove;
        // BASE CONDITION
        if (depth === 0 || children.length === 0) {
            return [null, sum];
        }

        // MAXIMUM-MINIMUM FROM POSSIBLE MOVES
        let maxValue = -Infinity;
        let minValue = Infinity;
        let bestMove;
        for (let i = 0; i < children.length; i++) {
            currMove = children[i];

            // Note: in our case, the 'children' are simply modified game states
            let currPrettyMove = game.move(currMove);
            let newSum = evaluateBoard(game, currPrettyMove, sum, color);
            let [childBestMove, childValue] = minimax(
                game,
                depth - 1,
                alpha,
                beta,
                !isMaximizingPlayer,
                newSum,
                color
            );

            game.undo();

            if (isMaximizingPlayer) {
                if (childValue > maxValue) {
                    maxValue = childValue;
                    bestMove = currPrettyMove;
                }
                if (childValue > alpha) {
                    alpha = childValue;
                }
            } else {
                if (childValue < minValue) {
                    minValue = childValue;
                    bestMove = currPrettyMove;
                }
                if (childValue < beta) {
                    beta = childValue;
                }
            }

            // Alpha-beta pruning
            if (alpha >= beta) {
                break;
            }
        }

        if (isMaximizingPlayer) {
            return [bestMove, maxValue];
        } else {
            return [bestMove, minValue];
        }
    }

    // MAKE THE BEST MOVE
    positionCount = 0;
    globalSum = 0;
    let d1 = new Date().getTime();
    let bestMove = minimax(game, depth, -Infinity, Infinity, true, globalSum, "b")[0];
    let d2 = new Date().getTime();
    let positionsPerS = ((positionCount*1000)/(d2-d1)).toFixed(3);
    globalSum = evaluateBoard(game, bestMove, globalSum, "b");
    game.move(bestMove);
    board.setPosition(game.fen());
    document.getElementById("eval").setAttribute("value", 2000 + globalSum);
    document.getElementById("positionCountInfo").innerHTML = positionCount + " positions analyzed in " + (d2 - d1)/1000 + " seconds, i.e. " + positionsPerS + " positions per second.";

    // CHECK IF PLAYER CANNOT MOVE 
    let result = document.getElementById("result");
    if (game.in_checkmate()) {
        result.style.display = "block";
        result.innerHTML = "Player Checkmated";
        return;
    } else if (game.in_draw()) {
        result.style.display = "block";
        result.innerHTML = "Player Drawn";
        return;
    } else if (game.in_stalemate()) {
        result.style.display = "block";
        result.innerHTML = "Player Stalemated";
        return;
    }
}

// GAME PLAYING FUNCTION
function playGame(board) {
    // WHEN PLAYER PICKS UP PIECE
    board.addEventListener("drag-start", (e) => {
        const { piece } = e.detail;

        // DO NOT PICK UP PIECES IF GAME OVER
        if (game.game_over()) {
            e.preventDefault();
            return;
        }

        // ONLY PICK UP YOUR OWN PIECES
        if (piece.search(/^b/) !== -1) {
            e.preventDefault();
            return;
        }
    });

    // WHEN PLAYER DROPS PIECE
    board.addEventListener("drop", (e) => {
        const { source, target, setAction } = e.detail;

        // RETURN IF MOVE ILLEGAL
        let isLegal = game.move({
            from: source,
            to: target,
            promotion: 'q' // ALWAYS PROMOTE TO QUEEN FOR SIMPLICITY
        });
        if (!isLegal) {
            setAction("snapback");
            return;
        }

        // CHECK IF COMPUTER CANNOT MOVE
        let result = document.getElementById("result");
        if (game.in_checkmate()) {
            result.style.display = "block";
            result.innerHTML = "Engine Checkmated";
            return;
        } else if (game.in_draw()) {
            result.style.display = "block";
            result.innerHTML = "Engine Drawn";
            return;
        } else if (game.in_stalemate()) {
            result.style.display = "block";
            result.innerHTML = "Engine Stalemated";
            return;
        }

        // CALL COMPUTER TO MAKE MOVE
        makeMove();
    });

    // UPDATE BOARD AFTER PIECE IS DROPPED
    board.addEventListener("snap-end", (e) => {
        board.setPosition(game.fen());
    });
}