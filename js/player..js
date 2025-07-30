let player, playerShip, playerThruster, playerPSBMesh, playerHealthBar;
let playerPSB = 1, playerHealth = 5, playerMaxHealth = 5;
let playerScore = 0, playerSpeed = 7.5;
let lastFire = 0, fireDelay = 0.25;
let bombCounts = {}, bombReplenishedAtScore = {};

function initPlayer() {
    // Criação da nave do jogador
    let geo = new THREE.ConeGeometry(0.6, 1.6, 5);
    let mat = new THREE.MeshLambertMaterial({ color: COLORS.PLAYER });
    playerShip = new THREE.Mesh(geo, mat);
    playerShip.rotation.z = Math.PI;
    playerShip.position.set(0, -PLAY_AREA.y / 2.2, 0);
    scene.add(playerShip);

    // Propulsor
    let thrusterGeo = new THREE.CylinderGeometry(0.18, 0.01, 0.4, 8);
    let thrusterMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.7 });
    playerThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    playerThruster.position.set(0, -0.95, 0);
    playerThruster.rotation.x = Math.PI / 2;
    playerShip.add(playerThruster);

    // Barra de saúde
    playerHealthBar = createBar(1.5, 0.12, 0x00ff55, 0.2);
    playerHealthBar.position.set(0, 1.2, 0);
    playerShip.add(playerHealthBar);

    // Display PSB
    playerPSBMesh = createPSBMesh(playerPSB);
    playerPSBMesh.position.set(0, 1.7, 0);
    scene.add(playerPSBMesh);

    player = { x: 0, y: -PLAY_AREA.y / 2.2 };
    initBombCounts();
}

function createPSBMesh(val) {
    return createTextSprite(val ? '1' : '0', val ? '#0090ff' : '#ff2222', 0.9);
}

function updatePSBMesh(val) {
    playerPSBMesh.material.map.image = createTextSprite(val ? '1' : '0', val ? '#0090ff' : '#ff2222', 0.9).material.map.image;
    playerPSBMesh.material.map.needsUpdate = true;
    playerPSBMesh.psbValue = val;
}

function initBombCounts() {
    OPERATORS.forEach(op => {
        bombCounts[op.key] = 15;
        bombReplenishedAtScore[op.key] = {};
    });
}

function updatePlayer(dt) {
    let moveX = 0, moveY = 0;
    if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;
    if (keys['KeyW'] || keys['ArrowUp']) moveY += 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveY -= 1;

    let mag = Math.sqrt(moveX * moveX + moveY * moveY);
    if (mag > 0) {
        moveX /= mag; moveY /= mag;
        player.x += moveX * playerSpeed * dt;
        player.y += moveY * playerSpeed * dt;
        player.x = Math.max(-PLAY_AREA.x / 2 + 0.8, Math.min(PLAY_AREA.x / 2 - 0.8, player.x));
        player.y = Math.max(-PLAY_AREA.y / 2 + 0.7, Math.min(PLAY_AREA.y / 2 - 0.7, player.y));
        
        playerShip.position.set(player.x, player.y, 0);
        playerPSBMesh.position.set(player.x, player.y + 1.7, 0);
    }
    
    playerThruster.material.opacity = 0.7 + 0.2 * Math.abs(Math.sin(performance.now() / 110));
}