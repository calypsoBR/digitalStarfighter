let hud = {};
let currentOverlay = null;

function initUI() {
    currentOverlay = createOverlay(
        'O Último Guerreiro Digital das Estrelas',
        '<span class="start-instruction">Tecle ESPAÇO para iniciar</span>'
    );
}

function createOverlay(title, subtext) {
    // Remove overlay existente
    if (currentOverlay && currentOverlay.parentNode) {
        currentOverlay.parentNode.removeChild(currentOverlay);
    }

    const overlay = document.createElement('div');
    overlay.className = 'overlay active';
    
    const titleEl = document.createElement('div');
    titleEl.className = 'overlay-title';
    titleEl.innerHTML = title;
    overlay.appendChild(titleEl);
    
    if (subtext) {
        const subEl = document.createElement('div');
        subEl.className = 'overlay-subtext';
        subEl.innerHTML = subtext;
        overlay.appendChild(subEl);
    }

    document.body.appendChild(overlay);
    return overlay;
}

function clearUI() {
    if (currentOverlay && currentOverlay.parentNode) {
        currentOverlay.parentNode.removeChild(currentOverlay);
        currentOverlay = null;
    }
    
    for (const key in hud) {
        if (hud[key] && hud[key].parentNode) {
            hud[key].parentNode.removeChild(hud[key]);
        }
    }
    hud = {};
}

function showGameOver() {
    currentOverlay = createOverlay(
        'GAME OVER',
        'Pontuação: ' + playerScore + '<br><br><span class="restart-instruction">Tecle ESPAÇO para reiniciar</span>'
    );
}

function showWin() {
    currentOverlay = createOverlay(
        'VITÓRIA!',
        'Pontuação: ' + playerScore + '<br><br><span class="restart-instruction">Tecle ESPAÇO para reiniciar</span>'
    );
}

function updateHUD() {
    if (!hud.health) {
        hud.health = document.createElement('div');
        hud.health.className = 'health-display';
        document.body.appendChild(hud.health);
    }
    hud.health.textContent = 'Health: ' + playerHealth;
    
    if (!hud.score) {
        hud.score = document.createElement('div');
        hud.score.className = 'score-display';
        document.body.appendChild(hud.score);
    }
    hud.score.textContent = 'Pontuação: ' + playerScore;
    
    if (!hud.psb) {
        hud.psb = document.createElement('div');
        hud.psb.className = 'psb-display';
        document.body.appendChild(hud.psb);
    }
    hud.psb.innerHTML = 'PSB: <span style="color:' + (playerPSB ? '#0090ff' : '#ff2222') + '">' + playerPSB + '</span>';
    
    if (!hud.op) {
        hud.op = document.createElement('div');
        hud.op.className = 'operator-display';
        document.body.appendChild(hud.op);
    }
    hud.op.innerHTML = 'Operator: <span class="operator-name">' + OPERATORS[operatorIndex].key + '</span>' +
                       ' <span class="operator-count">(' + bombCounts[OPERATORS[operatorIndex].key] + ')</span>';
}
