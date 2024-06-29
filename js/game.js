document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button');
    const cells = document.querySelectorAll('.cell');
    const statusDisplay = document.querySelector('.status');
    const ticTacToe = document.querySelectorAll('.cell');
    const restartButton = document.querySelector('.restart');
    const modeButtons = document.querySelectorAll('.mode-selection button');
    const boardElement = document.querySelector('.grid');
    const sounds = {
        click: new Audio('assets/sounds/click.wav'),
        win: new Audio('assets/sounds/win.wav'),
        lose: new Audio('assets/sounds/lose.wav'),
        tied: new Audio('assets/sounds/tied.wav'),
        buttonClick: new Audio('assets/sounds/button-click.mp3'),
        buttonHover: new Audio('assets/sounds/button-hover.mp3'),
        gridHover: new Audio('assets/sounds/grid-hover.wav'),
        buttonRestart: new Audio('assets/sounds/button-restart.mp3'),
        background: new Audio('assets/sounds/background.mp3')
    };
    const soundToggle = document.getElementById('soundToggle');
    let isMuted = false;

    let gameActive = true;
    let currentPlayer = "X";
    let gameState = ["", "", "", "", "", "", "", "", ""];
    let mode = "normal";

    sounds.click.volume = 0.7;
    sounds.win.volume = 0.38;
    sounds.lose.volume = 0.3;
    sounds.tied.volume = 0.35;
    sounds.buttonClick.volume = 0.32;
    sounds.buttonHover.volume = 0.35;
    sounds.gridHover.volume = 0.12;
    sounds.buttonRestart.volume = 0.45;
    sounds.background.volume = 0.38;

    sounds.background.loop = true;
    document.addEventListener('click', function() {
        sounds.background.play();
      }, { once: true });

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    const handleCellClick = (clickedCellEvent) => {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (gameState[clickedCellIndex] !== "" || !gameActive) {
            return;
        }

        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();
        if (gameActive && mode !== "1v1") {
            boardElement.classList.add('disabled');
            setTimeout(() => {
                aiPlay();
                handleResultValidation();
                boardElement.classList.remove('disabled');
            }, 500);
        }
    };

    const handleCellPlayed = (clickedCell, clickedCellIndex) => {
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.innerHTML = `<span>${currentPlayer}</span>`;
        clickedCell.classList.add(currentPlayer);
        sounds.click.currentTime = 0;
        sounds.click.play();
    };

    const handleResultValidation = () => {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            let a = gameState[winCondition[0]];
            let b = gameState[winCondition[1]];
            let c = gameState[winCondition[2]];
            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                drawWinningLine(winCondition);
                break;
            }
        }
    
        if (roundWon) {
            if (mode !== "1v1" && currentPlayer === "O") {
                statusDisplay.innerHTML = `Você perdeu!`;
                sounds.lose.play();
            } else if (mode !== "1v1" && currentPlayer === "X") {
                statusDisplay.innerHTML = `Você ganhou!`;
                sounds.win.play();
            } else {
                statusDisplay.innerHTML = `Jogador ${currentPlayer} ganhou!`;
                sounds.win.play();
            }
            gameActive = false;
            return;
        }
    
        let roundDraw = !gameState.includes("");
        if (roundDraw) {
            statusDisplay.innerHTML = `Empate!`;
            sounds.tied.play();
            gameActive = false;
            return;
        }
    
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusDisplay.innerHTML = `É a vez do jogador ${currentPlayer}`;
    };

    const drawWinningLine = (winCondition) => {
        const [start, , end] = winCondition;
        const startCell = cells[start].getBoundingClientRect();
        const endCell = cells[end].getBoundingClientRect();
        const gridRect = document.querySelector('.grid').getBoundingClientRect();
        const line = document.createElement('div');
        line.classList.add('winning-line');
    
        const startX = startCell.left - gridRect.left + startCell.width / 2;
        const startY = startCell.top - gridRect.top + startCell.height / 2;
        const endX = endCell.left - gridRect.left + endCell.width / 2;
        const endY = endCell.top - gridRect.top + endCell.height / 2;
    
        line.style.left = `${startX}px`;
        line.style.top = `${startY}px`;
    
        const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        line.style.width = `${distance}px`;
        line.style.transform = `rotate(${Math.atan2(endY - startY, endX - startX)}rad)`;
    
        document.querySelector('.grid').appendChild(line);
    };

    const handleRestartGame = () => {
        gameActive = true;
        currentPlayer = "X";
        gameState = ["", "", "", "", "", "", "", "", ""];
        statusDisplay.innerHTML = `É a vez do jogador ${currentPlayer}`;
        cells.forEach(cell => {
            cell.textContent = "";
            cell.classList.remove("X", "O");
        });
        document.querySelector('.winning-line')?.remove();
    };

    const setGameMode = (selectedMode) => {
        mode = selectedMode;
        handleRestartGame();
    };

    const aiPlay = () => {
        let emptyCells = gameState.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);

        if (mode === "easy") {
            const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            handleCellPlayed(cells[randomIndex], randomIndex);
        } else if (mode === "normal") {
            let move = findNormalMove();
            handleCellPlayed(cells[move], move);
        } else if (mode === "hard") {
            let move = findBestMove(gameState, "O", 2);
            handleCellPlayed(cells[move], move);
        }
    };

    const findNormalMove = () => {
        // Primeiro, verifica se pode vencer na próxima jogada
        for (let i = 0; i < 9; i++) {
            if (gameState[i] === "") {
                gameState[i] = "O";
                if (checkWinner(gameState) === "O") {
                    gameState[i] = "";
                    return i;
                }
                gameState[i] = "";
            }
        }

        // Se não, verifica se precisa bloquear o jogador
        for (let i = 0; i < 9; i++) {
            if (gameState[i] === "") {
                gameState[i] = "X";
                if (checkWinner(gameState) === "X") {
                    gameState[i] = "";
                    return i;
                }
                gameState[i] = "";
            }
        }

        // Se não houver jogada de vitória ou bloqueio, escolhe uma célula aleatória
        let emptyCells = gameState.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    };

    const findBestMove = (board, player, depth) => {
        const opponent = player === "X" ? "O" : "X";
        let bestScore = player === "O" ? -Infinity : Infinity;
        let bestMove;

        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = player;
                let score = minimax(board, depth, false, player, opponent);
                board[i] = "";
                if (player === "O") {
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = i;
                    }
                } else {
                    if (score < bestScore) {
                        bestScore = score;
                        bestMove = i;
                    }
                }
            }
        }

        return bestMove;
    };

    const minimax = (board, depth, isMaximizing, player, opponent) => {
        const result = checkWinner(board);
        if (result !== null) {
            return result === "X" ? -10 : result === "O" ? 10 : 0;
        }

        if (depth === 0) {
            return evaluateBoard(board, player);
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === "") {
                    board[i] = player;
                    let score = minimax(board, depth - 1, false, player, opponent);
                    board[i] = "";
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === "") {
                    board[i] = opponent;
                    let score = minimax(board, depth - 1, true, player, opponent);
                    board[i] = "";
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    const checkWinner = (board) => {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        if (board.every(cell => cell !== "")) {
            return "draw";
        }
        return null;
    };

    const evaluateBoard = (board, player) => {
        const opponent = player === "X" ? "O" : "X";
        let score = 0;

        // Avalia linhas, colunas e diagonais
        for (let line of winningConditions) {
            let playerCount = 0;
            let opponentCount = 0;
            let emptyCount = 0;

            for (let index of line) {
                if (board[index] === player) playerCount++;
                else if (board[index] === opponent) opponentCount++;
                else emptyCount++;
            }

            if (playerCount === 3) score += 100;
            else if (playerCount === 2 && emptyCount === 1) score += 10;
            else if (playerCount === 1 && emptyCount === 2) score += 1;

            if (opponentCount === 3) score -= 100;
            else if (opponentCount === 2 && emptyCount === 1) score -= 10;
            else if (opponentCount === 1 && emptyCount === 2) score -= 1;
        }

        // Bônus para o centro
        if (board[4] === player) score += 5;
        else if (board[4] === opponent) score -= 5;

        return score;
    };

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    restartButton.addEventListener('click', handleRestartGame);
    modeButtons.forEach(button => button.addEventListener('click', (event) => {
        setGameMode(event.target.getAttribute('data-mode'));
    }));

    modeButtons.forEach(button => {
        button.addEventListener('click', function() {
            modeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (!button.classList.contains('restart')) {
                sounds.buttonClick.currentTime = 0;
                sounds.buttonClick.play();
                sounds.lose.currentTime = 100;
                sounds.win.currentTime = 100;
            } else {
                sounds.buttonRestart.currentTime = 0;
                sounds.buttonRestart.play();
                sounds.lose.currentTime = 100;
                sounds.win.currentTime = 100;
            }
        });
    
        button.addEventListener('mouseenter', () => {
            if (!button.classList.contains('restart')) {
                sounds.buttonHover.currentTime = 0;
                sounds.buttonHover.play();
            }
        });
    });

    ticTacToe.forEach(div => {
        div.addEventListener('mouseenter', () => {
            sounds.gridHover.currentTime = 0;
            sounds.gridHover.play();
        });
    });

    soundToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        soundToggle.classList.toggle('muted', isMuted);

        if (sounds.background) {
            if (isMuted) {
                sounds.background.pause();
            } else {
                sounds.background.play();
            }
        }
    });
});