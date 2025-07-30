const ENEMY_TYPES = [
    { shape: 'cube', ev: () => Math.round(Math.random()) },
    { shape: 'cube', ev: () => Math.round(Math.random()), ab: true },
    { shape: 'tetra', ev: () => Math.round(Math.random()), ab: true },
    { shape: 'tetra', ev: () => Math.round(Math.random()), ab: true, expr: 'A.B' },
    { shape: 'tetra', ev: () => Math.round(Math.random()), ab: true, expr: 'A+B' },
    { shape: 'tetra', ev: () => Math.round(Math.random()), ab: true, expr: 'A⊕B' }
];

let enemies = [], miniBoss = null, bossGenerators = [];
let wave = 1, maxWaves = 4, waveEnemies = 0;
let lastEnemyFire = 0, enemyFireDelay = 1.5;
let bossHealth = 10, bossMaxHealth = 10;

function spawnEnemy(type, x, y) {
    let mesh;
    if (type.shape === 'cube') {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), 
                            new THREE.MeshLambertMaterial({ color: COLORS.ENEMY }));
    } else {
        mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(0.7), 
                            new THREE.MeshLambertMaterial({ color: COLORS.ENEMY }));
    }
    
    mesh.position.set(x, y, 0);
    let health = 2 + wave;
    let healthBar = createBar(1.1, 0.11, 0xff4444, 0.18);
    healthBar.position.set(0, -0.77, 0);
    mesh.add(healthBar);
    
    let ab = type.ab;
    let A = ab ? Math.round(Math.random()) : null;
    let B = ab ? Math.round(Math.random()) : null;
    let ev, evText, expr = type.expr;
    
    if (!expr) {
        ev = typeof type.ev === 'function' ? type.ev() : type.ev;
        evText = ev.toString();
    } else {
        evText = expr.replace('&', '.').replace('|', '+').replace('^', '⊕');
        if (expr === 'A.B') ev = A & B;
        if (expr === 'A+B') ev = A | B;
        if (expr === 'A⊕B') ev = A ^ B;
    }
    
    let evMesh = createEVSprite(evText, A, B, expr);
    evMesh.position.set(0, 1, 0);
    mesh.add(evMesh);
    scene.add(mesh);
    
    return { mesh, health, maxHealth: health, healthBar, ev, evMesh, ab, A, B, expr, alive: true, type };
}

function createEVSprite(text, A, B, expr) {
    let canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 128;
    let ctx = canvas.getContext('2d');
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.clearRect(0, 0, 256, 128);
    ctx.shadowColor = '#ff3300';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ff3300';
    ctx.fillText(text, 128, 64);
    
    if (A !== null && B !== null && expr) {
        ctx.font = '30px Arial';
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.fillText(`A:${A} B:${B}`, 128, 105);
    }
    
    let tex = new THREE.CanvasTexture(canvas);
    let mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    let sprite = new THREE.Sprite(mat);
    sprite.scale.set(3.2, 1.5, 1);
    return sprite;
}

function startWave(n) {
    let nEnemies = Math.min(4 + n, 7);
    waveEnemies = nEnemies;
    
    for (let i = 0; i < nEnemies; i++) {
        let type;
        if (n === 1) type = ENEMY_TYPES[0];
        else if (n === 2) type = ENEMY_TYPES[1 + (i % 2)];
        else type = ENEMY_TYPES[2 + (i % 3)];
        
        let x = -PLAY_AREA.x/2 + 1.5 + (i%nEnemies)*(PLAY_AREA.x-3)/(nEnemies-1);
        let y = PLAY_AREA.y/2 - 1.5 - Math.random()*1.4;
        enemies.push(spawnEnemy(type, x, y));
    }
}

function startMiniBoss() {
    let mesh = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.1, 1.1),
                            new THREE.MeshLambertMaterial({ color: COLORS.ENEMY }));
    mesh.position.set(0, PLAY_AREA.y/2.5, 0);
    
    let healthBar = createBar(2.2, 0.18, 0xff4444, 0.23);
    healthBar.position.set(0, -0.95, 0);
    mesh.add(healthBar);
    
    let evMesh = createEVSprite('A⊕B', null, null, null);
    evMesh.position.set(0, 1.1, 0);
    mesh.add(evMesh);
    scene.add(mesh);
    
    bossGenerators = [];
    let genA = createBossGen('A');
    let genB = createBossGen('B');
    genA.angle = 0; genB.angle = Math.PI;
    genA.value = Math.round(Math.random());
    genB.value = Math.round(Math.random());
    updateBossGenPositions();
    
    miniBoss = { mesh, health: bossHealth, maxHealth: bossMaxHealth, 
                healthBar, evMesh, alive: true, expr: 'A^B' };
}

function createBossGen(label) {
    let mesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 10),
                            new THREE.MeshBasicMaterial({ color: 0xffbb33 }));
    let spr = createEVSprite(label+':0', null, null, null);
    spr.position.set(0, 0.55, 0);
    mesh.add(spr);
    scene.add(mesh);
    return { mesh, label, value: 0, sprite: spr, angle: 0 };
}

function updateBossGenerators(dt) {
    if (!miniBoss) return;
    for (let i = 0; i < bossGenerators.length; i++) {
        let g = bossGenerators[i];
        g.angle += dt * 0.7 * (i === 0 ? 1 : -1);
    }
    updateBossGenPositions();
}

function updateBossGenPositions() {
    let r = 1.8, cy = miniBoss.mesh.position.y, cx = miniBoss.mesh.position.x;
    for (let g of bossGenerators) {
        g.mesh.position.set(cx + Math.cos(g.angle)*r, cy + Math.sin(g.angle)*1.05, 0.1);
    }
}

function updateBossGenValues() {
    for (let g of bossGenerators) {
        g.value = Math.round(Math.random());
        g.sprite.material.map.image = createTextSprite(`${g.label}:${g.value}`, '#ffbb33', 0.5).material.map.image;
        g.sprite.material.map.needsUpdate = true;
    }
}