let keys = {};
let operatorIndex = 0;
let stars = [];

function initGame() {
    initPlayer();
    initUI();
}

function updateGame(dt) {
    updatePlayer(dt);
    updateProjectiles(dt);
    enemyFireLogic(dt);
    updateEnemies(dt);
    checkWaveProgress();
    updateHUD();
    checkScoreForBombReplenish();
}

function updateEnemies(dt) {
    let now = performance.now();
    for (let e of enemies) {
        if (!e.alive) continue;
        let t = Math.sin(now/800 + e.mesh.position.x*0.7)*0.7;
        e.mesh.position.y += Math.sin(now/1300 + e.mesh.position.x*0.5)*0.3*dt;
        e.mesh.position.x += t*dt*0.25;
    }
    
    if (miniBoss && miniBoss.alive) {
        updateBossGenerators(dt);
        if (now % 1500 < 40) updateBossGenValues();
    }
}

function checkWaveProgress() {
    if (waveEnemies === 0 && !miniBoss && wave <= maxWaves) {
        if (wave === maxWaves) {
            startMiniBoss();
        } else {
            wave++;
            startWave(wave);
        }
    }
    
    if (miniBoss && !miniBoss.alive && gameState === GAME_STATE.PLAYING) {
        gameState = GAME_STATE.WIN;
        showWin();
    }
}

function checkScoreForBombReplenish() {
    const thresholds = [500, 1500, 3000, 5000, 8000];
    for (const t of thresholds) {
        if (playerScore >= t && !bombReplenishedAtScore[t]) {
            for (let key in bombCounts) {
                bombCounts[key] = Math.min(bombCounts[key] + 10, 30);
            }
            bombReplenishedAtScore[t] = true;
            break;
        }
    }
}

function resetGame() {
    clearUI();
    while (scene.children.length) scene.remove(scene.children[0]);
    
    stars = [];
    enemies = [];
    projectiles = [];
    enemyProjectiles = [];
    explosions = [];
    powerUps = [];
    miniBoss = null;
    bossGenerators = [];
    
    createStars();
    initGame();
    
    playerHealth = playerMaxHealth;
    playerScore = 0;
    wave = 1;
    operatorIndex = 0;
    playerPSB = 1;
    updatePSBMesh(playerPSB);
    lastFire = 0;
    lastEnemyFire = 0;
    waveEnemies = 0;
    bossHealth = bossMaxHealth;
    
    initBombCounts();
    bombReplenishedAtScore = {};
    
    if (gameState === GAME_STATE.PLAYING) {
        startWave(wave);
    }
}

function onKeyDown(e) {
    if (e.repeat) return;
    keys[e.code] = true;
    
    if (gameState === GAME_STATE.START && e.code === 'Space') {
        removeOverlay(startOverlay);
        resetGame();
        gameState = GAME_STATE.PLAYING;
        startWave(wave);
    } 
    else if ((gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN) && e.code === 'Space') {
        removeOverlay(gameOverOverlay || winOverlay);
        clearUI();
        gameState = GAME_STATE.START;
        initUI();
    }
    else if (gameState === GAME_STATE.PLAYING) {
        if (e.code === 'KeyP') togglePause();
        if (e.code === 'Tab') operatorIndex = (operatorIndex + 1) % OPERATORS.length;
        if (e.code === 'Space') handleShoot();
    }
    else if (gameState === GAME_STATE.PAUSED && e.code === 'KeyP') {
        togglePause();
    }
}

function togglePause() {
    if (pauseOverlay) {
        removeOverlay(pauseOverlay);
        pauseOverlay = null;
        gameState = GAME_STATE.PLAYING;
    } else {
        pauseOverlay = createOverlay('Paused', '<span style="font-size:22px;">Tecle P para retomar</span>');
        gameState = GAME_STATE.PAUSED;
    }
}

function handleShoot() {
    if (OPERATORS[operatorIndex].key === 'NOT') {
        playerPSB = 1 - playerPSB;
        updatePSBMesh(playerPSB);
    } else {
        let now = performance.now()/1000;
        const opKey = OPERATORS[operatorIndex].key;
        if (bombCounts[opKey] > 0 && now - lastFire > fireDelay) {
            fireProjectile();
            bombCounts[opKey]--;
            lastFire = now;
        }
    }
}

function fireProjectile() {
    let target = null, minDist = 1000;
    
    // Encontrar alvo mais próximo
    for (let e of enemies) {
        if (!e.alive) continue;
        let d = (e.mesh.position.x - player.x)**2 + (e.mesh.position.y - player.y)**2;
        if (d < minDist) { minDist = d; target = e; }
    }
    
    if (miniBoss && miniBoss.alive) {
        let d = (miniBoss.mesh.position.x - player.x)**2 + (miniBoss.mesh.position.y - player.y)**2;
        if (d < minDist) { minDist = d; target = miniBoss; }
    }
    
    if (!target) return;
    
    // Calcular direção
    let dx = target.mesh.position.x - player.x;
    let dy = target.mesh.position.y - player.y;
    let mag = Math.sqrt(dx*dx + dy*dy);
    if (mag === 0) mag = 1;
    dx /= mag; dy /= mag;
    
    spawnProjectile(player.x, player.y, dx*13, dy*13, operatorIndex);
}

function onKeyUp(e) {
    keys[e.code] = false;
}

function onWindowResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
}

function removeOverlay(overlay) {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
}