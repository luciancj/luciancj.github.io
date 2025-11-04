import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/ShaderPass.js';

// ===== CONFIGURATION =====
const config = {
  colors: {
    orange: 0xf99021,
    beige: 0xf6d4b1,
    gray: 0x525252,
    black: 0x000000
  },
  resolution: {
    base: 512,
    padding: 64,
    aspectRatio: 1.33
  }
};

// ===== DOM ELEMENTS =====
const loading = document.getElementById('loading');
const loadingProgress = document.getElementById('loading-bar-progress');
const loadingText = document.getElementById('loading-text');
const canvas = document.querySelector('canvas.webgl');
const textarea = document.getElementById('textarea');

// ===== TERMINAL STATE =====
let terminalLines = [];
let commandHistory = [];
let historyIndex = -1;
let currentInput = '';

// ===== THREE.JS SETUP =====
let scene, camera, renderer, composer;
let textMaterial, terminalGroup;
let clock = new THREE.Clock();

// ===== INITIALIZATION =====
async function init() {
  await simulateLoading();
  setupScene();
  setupRenderer();
  setupComposer();
  setupTerminal();
  setupEventListeners();
  animate();
  displayWelcome();
}

// ===== LOADING SIMULATION =====
function simulateLoading() {
  return new Promise((resolve) => {
    const stages = [
      { progress: 0.2, text: 'Loading system files...' },
      { progress: 0.4, text: 'Initializing graphics...' },
      { progress: 0.6, text: 'Starting terminal...' },
      { progress: 0.8, text: 'Loading user data...' },
      { progress: 1.0, text: 'Ready!' }
    ];

    let currentStage = 0;
    
    function nextStage() {
      if (currentStage < stages.length) {
        const stage = stages[currentStage];
        loadingProgress.style.transform = `scaleX(${stage.progress})`;
        loadingText.textContent = stage.text;
        currentStage++;
        setTimeout(nextStage, 400);
      } else {
        setTimeout(() => {
          loading.style.opacity = '0';
          setTimeout(() => {
            loading.style.display = 'none';
            resolve();
          }, 300);
        }, 200);
      }
    }
    
    nextStage();
  });
}

// ===== SCENE SETUP =====
function setupScene() {
  // Create scene with beige background
  scene = new THREE.Scene();
  scene.background = new THREE.Color(config.colors.beige);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambientLight);

  // Setup camera
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  camera = new THREE.PerspectiveCamera(
    50,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.set(0, 0, 5);
  scene.add(camera);
}

// ===== RENDERER SETUP =====
function setupRenderer() {
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false
  });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
}

// ===== EFFECT COMPOSER SETUP =====
function setupComposer() {
  composer = new EffectComposer(renderer);
  
  // Render pass
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Bloom pass for phosphor glow
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(128, 128),
    1.1,  // strength
    0.4,  // radius
    0     // threshold
  );
  composer.addPass(bloomPass);

  // Custom CRT shader pass
  const crtShader = {
    uniforms: {
      tDiffuse: { value: null },
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float time;
      uniform vec2 resolution;
      varying vec2 vUv;
      
      // Scanlines
      float scanline(vec2 uv, float lines) {
        return sin(uv.y * lines * 6.28318) * 0.04;
      }
      
      // Random noise
      float noise(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
      }
      
      void main() {
        vec2 uv = vUv;
        vec4 color = texture2D(tDiffuse, uv);
        
        // Add scanlines
        float scanlineEffect = scanline(uv, 288.0);
        color.rgb += vec3(scanlineEffect);
        
        // Add subtle noise
        float n = noise(uv * time * 0.0001) * 0.03;
        color.rgb += vec3(n);
        
        // Vignette
        vec2 vignetteUv = uv * (1.0 - uv.yx);
        float vignette = pow(vignetteUv.x * vignetteUv.y * 15.0, 0.25);
        color.rgb *= vignette;
        
        gl_FragColor = color;
      }
    `
  };

  const crtPass = new ShaderPass(crtShader);
  composer.addPass(crtPass);
}

// ===== TERMINAL SETUP =====
function setupTerminal() {
  terminalGroup = new THREE.Group();
  scene.add(terminalGroup);

  textMaterial = new THREE.MeshBasicMaterial({ 
    color: config.colors.orange 
  });

  // Position terminal group
  terminalGroup.position.set(-3, 2, 0);
}

// ===== TEXT RENDERING (Simplified - using sprites for now) =====
function addTerminalLine(text, color = config.colors.orange) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 1024;
  canvas.height = 64;
  
  context.font = '32px "VT323", monospace';
  context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
  context.fillText(text, 10, 45);
  
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  
  sprite.scale.set(6, 0.375, 1);
  sprite.position.y = -terminalLines.length * 0.4;
  
  terminalGroup.add(sprite);
  terminalLines.push(sprite);
  
  // Limit lines and remove old ones
  if (terminalLines.length > 20) {
    const oldSprite = terminalLines.shift();
    terminalGroup.remove(oldSprite);
    
    // Reposition remaining lines
    terminalLines.forEach((line, index) => {
      line.position.y = -index * 0.4;
    });
  }
}

// ===== WELCOME MESSAGE =====
function displayWelcome() {
  addTerminalLine('=================================');
  addTerminalLine('  LUCIAN COJOCARU - PORTFOLIO');
  addTerminalLine('=================================');
  addTerminalLine('');
  addTerminalLine('Type "help" for available commands');
  addTerminalLine('');
  addTerminalLine('visitor@lucian:~$');
}

// ===== COMMAND EXECUTION =====
function executeCommand(cmd) {
  const command = cmd.trim().toLowerCase();
  
  addTerminalLine(`visitor@lucian:~$ ${cmd}`);
  
  switch(command) {
    case 'help':
      addTerminalLine('Available commands:');
      addTerminalLine('  help     - Show this help message');
      addTerminalLine('  about    - About me');
      addTerminalLine('  projects - View my projects');
      addTerminalLine('  skills   - Technical skills');
      addTerminalLine('  contact  - Contact information');
      addTerminalLine('  clear    - Clear terminal');
      break;
      
    case 'about':
      addTerminalLine('Full Stack Developer');
      addTerminalLine('Passionate about web technologies');
      addTerminalLine('and interactive experiences');
      break;
      
    case 'projects':
      addTerminalLine('▸ Interactive Retro Terminal');
      addTerminalLine('▸ WebGL 3D Visualizations');
      addTerminalLine('▸ Full Stack Applications');
      break;
      
    case 'skills':
      addTerminalLine('JavaScript, TypeScript, React');
      addTerminalLine('Three.js, WebGL, GLSL');
      addTerminalLine('Node.js, Python, SQL');
      break;
      
    case 'contact':
      addTerminalLine('Email: lucian@example.com');
      addTerminalLine('GitHub: github.com/luciancj');
      addTerminalLine('LinkedIn: linkedin.com/in/luciancj');
      break;
      
    case 'clear':
      clearTerminal();
      return;
      
    default:
      if (command) {
        addTerminalLine(`Command not found: ${command}`);
        addTerminalLine('Type "help" for available commands');
      }
  }
  
  addTerminalLine('');
  addTerminalLine('visitor@lucian:~$');
}

function clearTerminal() {
  terminalLines.forEach(sprite => terminalGroup.remove(sprite));
  terminalLines = [];
  displayWelcome();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Button clicks
  document.getElementById('help-btn').addEventListener('click', () => executeCommand('help'));
  document.getElementById('about-btn').addEventListener('click', () => executeCommand('about'));
  document.getElementById('projects-btn').addEventListener('click', () => executeCommand('projects'));
  document.getElementById('contact-btn').addEventListener('click', () => executeCommand('contact'));
  document.getElementById('clear-btn').addEventListener('click', () => executeCommand('clear'));
  
  // Window resize
  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

// ===== ANIMATION LOOP =====
function animate() {
  requestAnimationFrame(animate);
  
  const elapsedTime = clock.getElapsedTime();
  
  // Update shader time
  if (composer.passes[2] && composer.passes[2].uniforms) {
    composer.passes[2].uniforms.time.value = elapsedTime;
  }
  
  // Gentle rotation animation
  if (terminalGroup) {
    terminalGroup.rotation.y = Math.sin(elapsedTime * 0.1) * 0.02;
  }
  
  composer.render();
}

// ===== START =====
init();
