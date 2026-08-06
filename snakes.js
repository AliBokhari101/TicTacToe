//snakes
const SNAKE_PAIRS = [
    { head: 98, tail: 78 },
    { head: 95, tail: 75 },
    { head: 92, tail: 71 },
    { head: 73, tail: 53 },
    { head: 54, tail: 34 },
    { head: 48, tail: 26 },
    { head: 16, tail: 6 }
];

//ladders
const LADDER_PAIRS = [
    { bottom: 4, top: 14 },
    { bottom: 9, top: 31 },
    { bottom: 20, top: 38 },
    { bottom: 28, top: 84 },
    { bottom: 40, top: 59 },
    { bottom: 51, top: 67 },
    { bottom: 63, top: 81 },
    { bottom: 71, top: 91 }
];

//Dice faces
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

//soundeffects and function
const snakesounds = {
    diceRoll: new Audio('sounds/dice_roll-sound.mp3'),
    movement: new Audio('sounds/piece_move-sound.mp3'),
    ladder: new Audio('sounds/ladder_climb-sound.mp3'),
    snake: new Audio('sounds/snake_bite-sound.mp3'),
    victory: new Audio('sounds/victory-sound.mp3'),
    jump:new Audio('sounds/jump-sound')
}

function playsound(audio) {
    audio.currentTime = 0;
    audio.play().catch(function () { });
}

// Lookup objects for move validation
const snake = {};
SNAKE_PAIRS.forEach(p => (snake[p.head] = p.tail));

const ladders = {};
LADDER_PAIRS.forEach(p => (ladders[p.bottom] = p.top));

// Game state
let playerPosition = 1;
let aiPosition = 1;
let playerTurn = true;
let isRolling = false;

// DOM 
const snakeBoard = document.getElementById('snakes-board');
const rollDiceBtn = document.getElementById('roll-dice-btn');
const snakesBackBtn = document.getElementById('snakes-back-btn');
const snakeRestartBtn = document.getElementById('snakes-restart-btn');
const turnIndicator = document.getElementById('snakes-turn-indicator');
const diceResult = document.getElementById('dice-result-badge');

// Creating board
function createBoard() {
    snakeBoard.innerHTML = '';

    for (let row = 10; row >= 1; row--) {
        let rowCells = [];
        const isEvenRow = row % 2 === 0;
        for (let col = 1; col <= 10; col++) {
            let cellNum;
            if (isEvenRow) {
                cellNum = (row - 1) * 10 + col;
            } else {
                cellNum = row * 10 - col + 1;
            }
            rowCells.push(cellNum);
        }

        rowCells.forEach(num => {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'snake-cell';
            cellDiv.id = `snake-cell-${num}`;

            const numLabel = document.createElement('span');
            numLabel.className = 'cell-num';
            numLabel.textContent = num;
            cellDiv.appendChild(numLabel);

            // unique colors for Snakes
            SNAKE_PAIRS.forEach((p, idx) => {
                if (num === p.head) {
                    cellDiv.classList.add('snake-head', `sp-${idx + 1}`);
                } else if (num === p.tail) {
                    cellDiv.classList.add('snake-tail', `sp-${idx + 1}`);
                }
            });

            // unique colors for ladders
            LADDER_PAIRS.forEach((p, idx) => {
                if (num === p.bottom) {
                    cellDiv.classList.add('ladder-bottom', `lp-${idx + 1}`);
                } else if (num === p.top) {
                    cellDiv.classList.add('ladder-top', `lp-${idx + 1}`);
                }
            });

            const tokenBox = document.createElement('div');
            tokenBox.className = 'tokens-container';
            tokenBox.id = `token-box-${num}`;
            cellDiv.appendChild(tokenBox);

            snakeBoard.appendChild(cellDiv);
        });
    }
    renderTokens();
}

function renderTokens() {
    document.querySelectorAll('.tokens-container').forEach(box => (box.innerHTML = ''));

    // P1 Token
    const p1Box = document.getElementById(`token-box-${playerPosition}`);
    if (p1Box) {
        const p1Token = document.createElement('span');
        p1Token.className = 'player-token';
        p1Token.textContent = 'P1';
        p1Box.appendChild(p1Token);
    }

    // AI Token
    const aiBox = document.getElementById(`token-box-${aiPosition}`);
    if (aiBox) {
        const aiToken = document.createElement('span');
        aiToken.className = 'ai-token';
        aiToken.textContent = 'AI';
        aiBox.appendChild(aiToken);
    }
}

//delay function for smooth animations
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

//GAMEPLAY LOGIC:
// DICE AND PLAYER TURN LOGIC
rollDiceBtn.addEventListener('click', async () => {
    if (isRolling || !playerTurn) return;

    isRolling = true;
    rollDiceBtn.disabled = true;
    
    playsound(snakesounds.diceRoll);

    for (let shuffle = 0; shuffle < 8; shuffle++) {
        const randomFace = DICE_FACES[Math.floor(Math.random() * DICE_FACES.length)];
        diceResult.textContent = `DICE: ${randomFace}`;
        await sleep(100);
    }

    const dice = Math.floor(Math.random() * 6) + 1;
    diceResult.textContent = `DICE: ${dice} ${DICE_FACES[dice - 1]}`;

    const targetPos = playerPosition + dice;



    //Walk tile-by-tile forward
    if (targetPos <= 100) {
        for (let i = 0; i < dice; i++) {
            playerPosition++;
            renderTokens();
            playsound(snakesounds.movement);
            await sleep(180);
        }

        //Check for Snake slide or Ladder climb 
        if (snake[playerPosition]) {
            await sleep(300);
            playsound(snakesounds.snake);
            playerPosition = snake[playerPosition];
            renderTokens();
        } else if (ladders[playerPosition]) {
            await sleep(300);
            playsound(snakesounds.ladder);
            playerPosition = ladders[playerPosition];
            renderTokens();
        }
    }

    //Check Win
    if (playerPosition === 100) {
        playsound(snakesounds.victory);
        Swal.fire({
            title: 'You Won Snakes & Ladders! 🏆',
            icon: 'success',
            confirmButtonText: 'Play Again'
        }).then(() => resetSnakesGame());
        return;
    }

    //Pass turn to AI
    playerTurn = false;
    turnIndicator.textContent = 'AI THINKING...';
    setTimeout(handleAiTurn, 1000);
});

// AI LOGIC
async function handleAiTurn() {
    playsound(snakesounds.diceRoll);
    for (let shuffle = 0; shuffle < 8; shuffle++) {
        const randomFace = DICE_FACES[Math.floor(Math.random() * DICE_FACES.length)];
        diceResult.textContent = `DICE: ${randomFace}`;
        await sleep(100);
    }

    const dice = Math.floor(Math.random() * 6) + 1;
    diceResult.textContent = `DICE: ${dice} ${DICE_FACES[dice - 1]}`;

    const targetPos = aiPosition + dice;

    // Walk AI tile-by-tile 
    if (targetPos <= 100) {
        for (let i = 0; i < dice; i++) {
            aiPosition++;
            renderTokens();
            playsound(snakesounds.movement);
            await sleep(180);
        }

        //Check for Snake slide or Ladder climb
        if (snake[aiPosition]) {
            await sleep(300);
            playsound(snakesounds.snake);
            aiPosition = snake[aiPosition];
            renderTokens();
        } else if (ladders[aiPosition]) {
            await sleep(300);
            playsound(snakesounds.ladder);
            aiPosition = ladders[aiPosition];
            renderTokens();
        }
    }

    if (aiPosition === 100) {
        Swal.fire({
            title: 'AI Won Snakes & Ladders!',
            icon: 'error',
            confirmButtonText: 'Try Again'
        }).then(() => resetSnakesGame());
        return;
    }

    playerTurn = true;
    isRolling = false;
    rollDiceBtn.disabled = false;
    turnIndicator.textContent = 'YOUR TURN';
}


function resetSnakesGame() {
    playsound(snakesounds.jump);
    playerPosition = 1;
    aiPosition = 1;
    playerTurn = true;
    isRolling = false;
    rollDiceBtn.disabled = false;
    turnIndicator.textContent = 'YOUR TURN';
    diceResult.textContent = 'DICE: -';
    renderTokens();
}

snakeRestartBtn.addEventListener('click', resetSnakesGame);

snakesBackBtn.addEventListener('click', () => {
    resetSnakesGame();
    document.getElementById('snakes-game-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
});

createBoard();


