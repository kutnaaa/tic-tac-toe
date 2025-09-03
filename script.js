const board = Array(9).fill(null);
const cells = document.querySelectorAll('.cell');
const status = document.querySelector('.status');
const newGameBtn = document.getElementById('new-game-btn');
const gameModeSelect = document.getElementById('game-mode');

let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'human'; // 'human', 'easy', 'medium', 'hard'

// Функції
function checkWin() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Рядки
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Стовпці
        [0, 4, 8], [2, 4, 6]             // Діагоналі
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            gameActive = false;
            highlightWin(pattern);
            if (gameMode === 'human') {
                status.textContent = `Переміг гравець ${board[a] === 'X' ? 'O' : 'X'}!`;
            } else {
                status.textContent = `Переміг гравець ${board[a]}!`;
            }
            return true;
        }
    }

    if (!board.includes(null)) {
        gameActive = false;
        status.textContent = "Нічия!";
        return true;
    }

    return false;
}

function highlightWin(pattern) {
    pattern.forEach(index => {
        cells[index].classList.add('win');
    });
}

function handleClick(index) {
    if (board[index] || !gameActive) return;

    board[index] = currentPlayer;
    cells[index].textContent = currentPlayer;
    cells[index].classList.add(currentPlayer === 'X' ? 'x' : 'o');
    cells[index].classList.add('scale-in'); // Анімація

    if (checkWin()) return;

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = `Хід гравця ${currentPlayer}`;

    if (gameMode !== 'human' && currentPlayer === 'O' && gameActive) {
        setTimeout(botMove, 500); // Затримка перед ходом бота
    }
}

function botMove() {
    let index;
    switch (gameMode) {
        case 'easy':
            index = easyBotMove();
            break;
        case 'medium':
            index = mediumBotMove();
            break;
        case 'hard':
            index = hardBotMove();
            break;
    }

    if (index !== null) {
        handleClick(index);
    }
}

function easyBotMove() {
    const availableMoves = board.reduce((acc, val, index) => {
        if (val === null) acc.push(index);
        return acc;
    }, []);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function mediumBotMove() {
    // 1. Перевірка, чи може бот виграти
    for (let i = 0; i < board.length; i++) {
        if (!board[i]) {
            let tempBoard = [...board]; // Створюємо копію дошки
            tempBoard[i] = 'O';
            if (checkWinForMove(tempBoard, 'O')) {
                return i;
            }
        }
    }

    // 2. Блокування виграшу гравця
    for (let i = 0; i < board.length; i++) {
        if (!board[i]) {
            let tempBoard = [...board]; // Створюємо копію дошки
            tempBoard[i] = 'X';
            if (checkWinForMove(tempBoard, 'X')) {
                return i;
            }
        }
    }

    // 3. Випадковий хід
    return easyBotMove();
}

function hardBotMove() {
    // Minimax algorithm
    function minimax(newBoard, player) {
        const availableMoves = newBoard.reduce((acc, val, index) => {
            if (val === null) acc.push(index);
            return acc;
        }, []);

        if (checkWinForMinimax(newBoard, 'X')) {
            return { score: -10 };
        } else if (checkWinForMinimax(newBoard, 'O')) {
            return { score: 10 };
        } else if (availableMoves.length === 0) {
            return { score: 0 };
        }

        const moves = [];
        for (let i = 0; i < availableMoves.length; i++) {
            const move = {};
            move.index = availableMoves[i];
            newBoard[availableMoves[i]] = player;

            if (player === 'O') {
                const result = minimax(newBoard, 'X');
                move.score = result.score;
            } else {
                const result = minimax(newBoard, 'O');
                move.score = result.score;
            }

            newBoard[availableMoves[i]] = null;
            moves.push(move);
        }

        let bestMove;
        if (player === 'O') {
            let bestScore = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        return moves[bestMove];
    }

    function checkWinForMinimax(board, player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c] && board[a] === player) {
                return true;
            }
        }
        return false;
    }

    if (board.every(cell => cell !== null)) {
        return null;
    }

    const bestMove = minimax(board.slice(), 'O');
    return bestMove.index;
}

function checkWinForMove(boardToCheck, player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Рядки
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Стовпці
        [0, 4, 8], [2, 4, 6]             // Діагоналі
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (boardToCheck[a] && boardToCheck[a] === boardToCheck[b] && boardToCheck[a] === boardToCheck[c] && boardToCheck[a] === player) {
            return true;
        }
    }

    return false;
}

function resetGame() {
    board.fill(null);
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'win', 'scale-in');
    });
    currentPlayer = 'X';
    gameActive = true;
    status.textContent = 'Хід гравця X';
    if (gameMode !== 'human' && currentPlayer === 'O') {
        setTimeout(botMove, 500);
    }
}

// Обробники подій
cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleClick(index));
});

newGameBtn.addEventListener('click', resetGame);

gameModeSelect.addEventListener('change', () => {
    gameMode = gameModeSelect.value;
    resetGame();
});

// Початкова ініціалізація
resetGame();