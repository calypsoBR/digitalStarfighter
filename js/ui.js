let hud = {};
let currentOverlay = null;
let pauseOverlay, startOverlay, gameOverOverlay, winOverlay;

function initUI() {
    startOverlay = createOverlay(
        'O Último Guerreiro Digital das Estrelas',
        '<span style="font-size:22px;">Tecle ESPAÇO para iniciar</span>'
    );
}

function updateHUD() {
    // Health display
    if (!hud.health) {
        hud.health = document.createElement('div');
        hud.health.className = 'health-display';
        document.body.appendChild(hud.health);
    }
    hud.health.innerHTML = 'Health: ' + playerHealth;
    
    // Score display
    if (!hud.score) {
        hud.score = document.createElement('div');
        hud.score.className = 'score-display';
        document.body.appendChild(hud.score);
    }
    hud.score.innerHTML = 'Pontuação: ' + playerScore;
    
    // PSB display
    if (!hud.psb) {
        hud.psb = document.createElement('div');
        hud.psb.style.position = 'fixed';
        hud.psb.style.left = '18px';
        hud.psb.style.bottom = '18px';
        hud.psb.style.color = '#fff';
        hud.psb.style.font = 'bold 32px monospace';
        hud.psb.style.textShadow = '0 0 8px #0077ff';
        document.body.appendChild(hud.psb);
    }
    hud.psb.innerHTML = 'PSB: <span style="color:' + (playerPSB ? '#0090ff' : '#ff2222') + '">' + playerPSB + '</span>';
    
    // Operator display
    if (!hud.op) {
        hud.op = document.createElement('div');
        hud.op.style.position = 'fixed';
        hud.op.style.bottom = '18px';
        hud.op.style.left = '50%';
        hud.op.style.transform = 'translateX(-50%)';
        hud.op.style.color = '#fff';
        hud.op.style.font = 'bold 28px monospace';
        hud.op.style.textShadow = '0 0 8px #fff';
        document.body.appendChild(hud.op);
    }
    const currentOp = OPERATORS[operatorIndex].key;
    hud.op.innerHTML = 'Operator: <span style="color:#fff;background:#222;padding:2px 10px;border-radius:7px;">' + 
                      currentOp + '</span> <span style="color:#00ff88;font-size:22px;">(' + bombCounts[currentOp] + ')</span>';
    
    // Wave display
    if (!hud.wave) {
        hud.wave = document.createElement('div');
        hud.wave.style.position = 'fixed';
        hud.wave.style.top = '12px';
        hud.wave.style.left = '50%';
        hud.wave.style.transform = 'translateX(-50%)';
        hud.wave.style.color = '#fff';
        hud.wave.style.font = 'bold 22px monospace';
        hud.wave.style.textShadow = '0 0 7px #0077ff';
        document.body.appendChild(hud.wave);
    }
    hud.wave.innerHTML = miniBoss ? 'Mini-Boss' : (gameState === GAME_STATE.PLAYING ? 'Wave ' + wave + ' of ' + maxWaves : '');
}


function createOverlay(title, subtext) {
    // Remove overlay existente primeiro
    if (currentOverlay) {
        currentOverlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    
    const titleEl = document.createElement('div');
    titleEl.className = 'overlay-title';
    titleEl.textContent = title;
    overlay.appendChild(titleEl);
    
    if (subtext) {
        const subEl = document.createElement('div');
        subEl.className = 'overlay-subtext';
        subEl.innerHTML = subtext;
        overlay.appendChild(subEl);
    }

    document.body.appendChild(overlay);
    currentOverlay = overlay;
    return overlay;
}


// NOVA FUNÇÃO ADICIONADA
function removeAllOverlays() {
    const overlays = document.querySelectorAll('.overlay');
    overlays.forEach(overlay => {
        overlay.classList.remove('active');
        setTimeout(() => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 300);
    });
    pauseOverlay = startOverlay = gameOverOverlay = winOverlay = null;
}

function showGameOver() {
    gameOverOverlay = createOverlay(
        'GAME OVER',
        'Pontuação: ' + playerScore + '<br><br>Tecle ESPAÇO para reiniciar'
    );
}

function showWin() {
    winOverlay = createOverlay(
        'VITÓRIA! VOCÊ ANIQUILOU A ARMADA KODAN!',
        'Pontuação: ' + playerScore + '<br><br>Tecle ESPAÇO para reiniciar'
    );
}

function clearUI() {
    if (currentOverlay) {
        currentOverlay.remove();
        currentOverlay = null;
    }
    
    // Limpa HUD
    for (const key in hud) {
        if (hud[key]?.parentNode) {
            hud[key].parentNode.removeChild(hud[key]);
        }
    }
    hud = {};
}
