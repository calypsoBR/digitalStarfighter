let projectiles = [], enemyProjectiles = [], explosions = [], powerUps = [];

function spawnProjectile(x, y, dx, dy, operator) {
    let mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.7, 10),
                            new THREE.MeshBasicMaterial({ color: COLORS.PROJECTILE, emissive: COLORS.PROJECTILE }));
    mesh.rotation.x = Math.PI/2;
    mesh.position.set(x, y + 0.8, 0.05);
    scene.add(mesh);
    projectiles.push({ mesh, dx, dy, operator, alive: true });
}

function spawnEnemyProjectile(x, y, dx, dy) {
    let mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.5, 8),
                            new THREE.MeshBasicMaterial({ color: COLORS.ENEMY_PROJECTILE }));
    mesh.rotation.x = Math.PI/2;
    mesh.position.set(x, y - 1.0, 0.05);
    scene.add(mesh);
    enemyProjectiles.push({ mesh, dx, dy, alive: true });
}

function spawnExplosion(x, y) {
    let group = [];
    for (let i = 0; i < 15; i++) {
        let mesh = new THREE.Mesh(new THREE.SphereGeometry(0.13 + Math.random()*0.09, 6, 6),
                                new THREE.MeshBasicMaterial({ color: Math.random() < 0.5 ? 0xff3300 : 0xff9900 }));
        mesh.position.set(x, y, 0.1);
        mesh.dx = (Math.random()-0.5)*2.2;
        mesh.dy = (Math.random()-0.5)*2.2;
        mesh.ttl = 0.45 + Math.random()*0.2;
        scene.add(mesh);
        group.push(mesh);
    }
    explosions.push({ group, time: 0 });
    
    if (Math.random() < 0.3) spawnPowerUp(x, y);
}

function spawnPowerUp(x, y) {
    let mesh = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16),
                            new THREE.MeshBasicMaterial({ color: COLORS.POWERUP, emissive: COLORS.POWERUP }));
    mesh.position.set(x, y, 0.1);
    scene.add(mesh);
    powerUps.push({ mesh, alive: true, ttl: 8.0, dy: -1.0 });
}

function updateProjectiles(dt) {
    // Atualiza projéteis do jogador
    for (let p of projectiles) {
        if (!p.alive) continue;
        p.mesh.position.x += p.dx * dt;
        p.mesh.position.y += p.dy * dt;
        
        if (Math.abs(p.mesh.position.x) > PLAY_AREA.x/2 + 2 || 
            Math.abs(p.mesh.position.y) > PLAY_AREA.y/2 + 2) {
            scene.remove(p.mesh);
            p.alive = false;
            continue;
        }
        
        checkProjectileCollisions(p);
    }
    projectiles = projectiles.filter(p => p.alive);
    
    // Atualiza projéteis inimigos
    for (let p of enemyProjectiles) {
        if (!p.alive) continue;
        p.mesh.position.x += p.dx * dt;
        p.mesh.position.y += p.dy * dt;
        
        if (Math.abs(p.mesh.position.x) > PLAY_AREA.x/2 + 2 || 
            Math.abs(p.mesh.position.y) > PLAY_AREA.y/2 + 2) {
            scene.remove(p.mesh);
            p.alive = false;
            continue;
        }
        
        checkEnemyProjectileCollision(p);
    }
    enemyProjectiles = enemyProjectiles.filter(p => p.alive);
    
    // Atualiza explosões
    for (let e of explosions) {
        for (let m of e.group) {
            m.position.x += m.dx * dt;
            m.position.y += m.dy * dt;
            m.ttl -= dt;
            if (m.ttl < 0) scene.remove(m);
        }
    }
    explosions = explosions.filter(e => e.group.some(m => m.ttl > 0));
    
    // Atualiza power-ups
    for (let pu of powerUps) {
        if (!pu.alive) continue;
        pu.mesh.position.y += pu.dy * dt;
        pu.ttl -= dt;
        
        if (pu.ttl < 0 || pu.mesh.position.y < -PLAY_AREA.y/2 - 1) {
            scene.remove(pu.mesh);
            pu.alive = false;
            continue;
        }
        
        checkPowerUpCollision(pu);
    }
    powerUps = powerUps.filter(pu => pu.alive);
}

function checkProjectileCollisions(p) {
    // Colisão com inimigos normais
    for (let e of enemies) {
        if (!e.alive) continue;
        let dist = Math.sqrt((e.mesh.position.x - p.mesh.position.x)**2 + 
                          (e.mesh.position.y - p.mesh.position.y)**2);
        if (dist < 0.8) {
            let op = OPERATORS[p.operator];
            let psb = playerPSB;
            let ev = e.ev;
            
            if (e.expr) {
                if (e.expr === 'A.B') ev = e.A & e.B;
                if (e.expr === 'A+B') ev = e.A | e.B;
                if (e.expr === 'A⊕B') ev = e.A ^ B;
            }
            
            if (op.fn(psb, ev) === 1) {
                e.health--;
                setBarValue(e.healthBar, e.health/e.maxHealth);
                
                if (e.health <= 0) {
                    e.alive = false;
                    scene.remove(e.mesh);
                    spawnExplosion(e.mesh.position.x, e.mesh.position.y);
                    playerScore += 100;
                    waveEnemies--;
                }
            }
            
            scene.remove(p.mesh);
            p.alive = false;
            break;
        }
    }
    
    // Colisão com mini-boss
    if (miniBoss && miniBoss.alive) {
        let dist = Math.sqrt((miniBoss.mesh.position.x - p.mesh.position.x)**2 + 
                          (miniBoss.mesh.position.y - p.mesh.position.y)**2);
        if (dist < 1.5) {
            let op = OPERATORS[p.operator];
            let psb = playerPSB;
            let B = bossGenerators[1].value;
            let expected = psb ^ B;
            
            if (op.fn(psb, B) === 1 && expected === 1) {
                bossHealth--;
                setBarValue(miniBoss.healthBar, bossHealth/bossMaxHealth);
                
                if (bossHealth <= 0) {
                    miniBoss.alive = false;
                    scene.remove(miniBoss.mesh);
                    spawnExplosion(miniBoss.mesh.position.x, miniBoss.mesh.position.y);
                    playerScore += 900;
                }
            }
            
            scene.remove(p.mesh);
            p.alive = false;
        }
    }
}

function checkEnemyProjectileCollision(p) {
    let dist = Math.sqrt((player.x - p.mesh.position.x)**2 + 
                      (player.y - p.mesh.position.y)**2);
    if (dist < 0.7) {
        scene.remove(p.mesh);
        p.alive = false;
        playerHealth--;
        setBarValue(playerHealthBar, playerHealth/playerMaxHealth);
        
        if (playerHealth <= 0) {
            gameState = GAME_STATE.GAME_OVER;
            showGameOver();
        }
    }
}

function checkPowerUpCollision(pu) {
    let dist = Math.sqrt((player.x - pu.mesh.position.x)**2 + 
                      (player.y - pu.mesh.position.y)**2);
    if (dist < 1.0) {
        for (let key in bombCounts) {
            bombCounts[key] = Math.min(bombCounts[key] + 5, 30);
        }
        scene.remove(pu.mesh);
        pu.alive = false;
        
        // Efeito visual
        let particles = [];
        for (let i = 0; i < 20; i++) {
            let mesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6),
                                    new THREE.MeshBasicMaterial({ color: COLORS.POWERUP }));
            mesh.position.set(pu.mesh.position.x, pu.mesh.position.y, 0.1);
            mesh.dx = (Math.random()-0.5)*3;
            mesh.dy = (Math.random()-0.5)*3;
            mesh.ttl = 0.8 + Math.random()*0.4;
            scene.add(mesh);
            particles.push(mesh);
        }
        explosions.push({ group: particles, time: 0 });
    }
}

function enemyFireLogic(dt) {
    let now = performance.now()/1000;
    if (now - lastEnemyFire > enemyFireDelay) {
        for (let e of enemies) {
            if (!e.alive) continue;
            let dx = player.x - e.mesh.position.x;
            let dy = player.y - e.mesh.position.y;
            let mag = Math.sqrt(dx*dx + dy*dy);
            if (mag === 0) mag = 1;
            dx /= mag; dy /= mag;
            
            if (Math.random() < 0.7) {
                spawnEnemyProjectile(e.mesh.position.x, e.mesh.position.y, dx*7, dy*7);
            }
        }
        
        if (miniBoss && miniBoss.alive && Math.random() < 0.8) {
            let dx = player.x - miniBoss.mesh.position.x;
            let dy = player.y - miniBoss.mesh.position.y;
            let mag = Math.sqrt(dx*dx + dy*dy);
            if (mag === 0) mag = 1;
            dx /= mag; dy /= mag;
            spawnEnemyProjectile(miniBoss.mesh.position.x, miniBoss.mesh.position.y - 0.6, dx*8, dy*8);
        }
        
        lastEnemyFire = now;
    }
}