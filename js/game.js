let keys = {};
let operatorIndex = 0;
let stars = [];

function initGame() {
    initPlayer();
    initUI();
}

function onKeyDown(e) {
    if (e.repeat) return;
    
    // Corrige o problema do TAB
    if (e.code === 'Tab') {
        e.preventDefault();
        operatorIndex = (operatorIndex + 1) % OPERATORS.length;
        return;
    }

    keys[e.code] = true;

    if (gameState === GAME_STATE.START && e.code === 'Space') {
        clearUI();
        resetGame();
        gameState = GAME_STATE.PLAYING;
        startWave(wave);
    }
    else if ((gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN) && e.code === 'Space') {
        clearUI();
        gameState = GAME_STATE.START;
        initUI();
    }
    else if (gameState === GAME_STATE.PLAYING) {
        if (e.code === 'KeyP') {
            if (gameState === GAME_STATE.PAUSED) {
                clearUI();
                gameState = GAME_STATE.PLAYING;
            } else {
                createOverlay('Paused', '<span class="pause-instruction">Tecle P para continuar</span>');
                gameState = GAME_STATE.PAUSED;
            }
        }
        if (e.code === 'Space') handleShoot();
    }
}

// ... (outras funções permanecem EXATAMENTE IGUAIS à sua versão original) ...
