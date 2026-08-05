let playerSymbol = 'X';
let aiSymbol = 'O';
let boardState = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let currentPlayer = 'X';

//SCREEN ELEMENTS
const homeScreen = document.getElementById('home-screen');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const snakeGameScreen = document.getElementById('snakes-game-screen');

//GAME ELEMENTS
const symbolBtns = document.querySelectorAll('.symbol-btn');
const cells = document.querySelectorAll('.cell');
const backbtn = document.getElementById('back-btn');
const restartBtn = document.querySelector('.restart-btn');

//NAV BUTTONS
const navTttBtn = document.getElementById('nav-ttt-btn');
const navSnakesBtn = document.getElementById('nav-snakes-btn');
const tttHomeBtn = document.getElementById('ttt-home-btn');


const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]

//nav handlers
navTttBtn.addEventListener('click',function(){
    homeScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    console.log("Tic Tac Toe Loaded");
});

tttHomeBtn.addEventListener('click',()=>{
    startScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
});

navSnakesBtn.addEventListener('click',()=>{
    homeScreen.classList.add('hidden');
    snakeGameScreen.classList.remove('hidden');
    console.log("Snake Game Loaded");
})

//TIC TAC SYMBOL SELECTION
symbolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        playerSymbol = btn.getAttribute('data-symbol');
        aiSymbol = playerSymbol === 'X' ? 'O' : 'X';
        currentPlayer = 'X';

        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');

        if (playerSymbol === 'O') {
            currentPlayer = aiSymbol;
            setTimeout(aiMove, 1200);
        }
    });
});

backbtn.addEventListener('click', function () {
    resetgame();
    gameScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
})

restartBtn.addEventListener('click', resetgame);

function resetgame() {
    boardState = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = playerSymbol;
    cells.forEach(cell => {
        cell.textContent = '';
    });
    if(playerSymbol==='O'){
        setTimeout(aiMove, 500);
    }
}

cells.forEach((cell, index) => {
    cell.addEventListener('click', function () {
        if (!gameActive || cell.textContent !== '' || currentPlayer == aiSymbol) {
            return;
        }
        boardState[index] = currentPlayer;
        cell.textContent = currentPlayer;

        if (checkwin()) {
            gameActive = false;
            Swal.fire({
                title: `${currentPlayer} wins!`,
                icon: 'success',
                confirmButtonText: 'Play Again'
            }).then(() => {
                resetgame();
            })
        }

        else if (checkdraw()) {
            gameActive = false;
            Swal.fire({
                title: `It's a draw!`,
                icon: 'info',
                confirmButtonText: 'Play Again'
            }).then(() => {
                resetgame();
            })
        }

        else {
            currentPlayer = aiSymbol;
            setTimeout(aiMove, 1200);
        }

    });
});

function checkdraw() {
    return boardState.every(cell => cell !== '');
}
function checkwin() {
    return winningCombos.some(combination => {
        const [a, b, c] = combination;
        return (
            boardState[a] !== '' &&
            boardState[a] === boardState[b] &&
            boardState[a] === boardState[c]
        );
    });
}

//ai move logic

function availableMoves() {
    let emptycells = [];
    boardState.forEach((cell, index) => {
        if (cell === '') {
            emptycells.push(index);
        }
    });
    return emptycells;
}

function aichoice() {
    const moves = availableMoves();
    if (moves.length > 0) {
        const randomIndex = Math.floor(Math.random() * moves.length);
        return moves[randomIndex];
    }
    return null;
}

function aiMove() {
    if (!gameActive) return;

    const move = aichoice();
    if (move === undefined) return;

    boardState[move] = aiSymbol;
    cells[move].textContent = aiSymbol;

    if (checkwin()) {
        gameActive = false;
        Swal.fire({
            title: `${aiSymbol} wins!`,
            icon: 'success',
            confirmButtonText: 'Play Again'
        }).then(() => {
            resetgame();
        })
    }
    else if (checkdraw()) {
        gameActive = false;
        Swal.fire({
            title: `It's a draw!`,
            icon: 'info',
            confirmButtonText: 'Play Again'
        }).then(() => {
            resetgame();
        })
    }
    else { currentPlayer = playerSymbol; }
}