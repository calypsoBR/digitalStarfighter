// Constantes globais
const GAME_STATE = {
    START: 0,
    PLAYING: 1,
    PAUSED: 2,
    GAME_OVER: 3,
    WIN: 4
};

const OPERATORS = [
    { key: 'AND', fn: (a, b) => a & b },
    { key: 'OR', fn: (a, b) => a | b },
    { key: 'XOR', fn: (a, b) => a ^ b },
    { key: 'NOT', fn: (a) => 1 - a },
    { key: 'NAND', fn: (a, b) => 1 - (a & b) },
    { key: 'NOR', fn: (a, b) => 1 - (a | b) },
    { key: 'XNOR', fn: (a, b) => 1 - (a ^ b) }
];

const PLAY_AREA = { x: 16, y: 10 };
const COLORS = {
    PLAYER: 0x0077ff,
    ENEMY: 0xff3300,
    PROJECTILE: 0xffffff,
    ENEMY_PROJECTILE: 0xff2200,
    STAR: 0xffffff,
    POWERUP: 0x00ff00,
    BACKGROUND: 0x0a0e2a
};

// Funções utilitárias
function createBar(w, h, color, border) {
    let group = new THREE.Group();
    let bgGeo = new THREE.PlaneGeometry(w + border, h + border);
    let bgMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    let bg = new THREE.Mesh(bgGeo, bgMat);
    group.add(bg);
    
    let fgGeo = new THREE.PlaneGeometry(w, h);
    let fgMat = new THREE.MeshBasicMaterial({ color: color });
    let fg = new THREE.Mesh(fgGeo, fgMat);
    fg.position.z = 0.01;
    fg.name = 'bar';
    group.add(fg);
    
    return group;
}

function setBarValue(bar, frac) {
    let fg = bar.children.find(m => m.name === 'bar');
    fg.scale.x = Math.max(0.01, frac);
    fg.position.x = -(1 - frac) * (fg.geometry.parameters.width / 2);
}

function createTextSprite(text, color, size = 1) {
    let canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    let ctx = canvas.getContext('2d');
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.clearRect(0, 0, 256, 128);
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = color;
    ctx.fillText(text, 128, 64);
    
    let tex = new THREE.CanvasTexture(canvas);
    let mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    let sprite = new THREE.Sprite(mat);
    sprite.scale.set(size, size/2, 1);
    return sprite;
}