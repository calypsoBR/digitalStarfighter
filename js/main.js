// Variáveis globais
let renderer, scene, camera;
let width = window.innerWidth, height = window.innerHeight;
let gameState = GAME_STATE.START;
let lastUpdate = performance.now();

// Inicialização principal
function init() {
    createRenderer();
    createCamera();
    createScene();
    createStars();
    initGame();
    gameLoop();
}

// Configuração do renderizador
function createRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(COLORS.BACKGROUND);
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);
}

// Configuração da câmera
function createCamera() {
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 0, 22);
}

// Criação da cena
function createScene() {
    scene = new THREE.Scene();
    let ambient = new THREE.AmbientLight(0xffffff, 0.7);
    let dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(0, 0, 10);
    scene.add(ambient, dir);
}

// Criação de estrelas de fundo
function createStars() {
    for (let i = 0; i < 80; i++) {
        let geo = new THREE.SphereGeometry(Math.random() * 0.05 + 0.02, 6, 6);
        let mat = new THREE.MeshBasicMaterial({ color: COLORS.STAR });
        let mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
            (Math.random() - 0.5) * PLAY_AREA.x * 1.2,
            (Math.random() - 0.5) * PLAY_AREA.y * 1.2,
            -3 - Math.random() * 3
        );
        scene.add(mesh);
        stars.push(mesh);
    }
}

// Loop principal do jogo
function gameLoop() {
    let now = performance.now();
    let dt = Math.min((now - lastUpdate) / 1000, 0.045);
    lastUpdate = now;
    
    if (gameState === GAME_STATE.PLAYING) {
        updateGame(dt);
    }
    
    renderer.render(scene, camera);
    requestAnimationFrame(gameLoop);
}

// Event listeners
window.addEventListener('resize', onWindowResize);
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

// Inicia o jogo
init();