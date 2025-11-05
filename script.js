import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderToScreen } from './shaderToScreen.js';
import { Lag } from './lag.js';

console.log('Script.js loaded successfully');
console.log('THREE imported:', typeof THREE);

// Terminal State
let commandHistory = [];
let historyIndex = -1;
let currentPath = '~';
let crtEffect = null;

// DOM Elements
const textarea = document.getElementById('textarea');
const loading = document.getElementById('loading');
const loadingProgress = document.getElementById('loading-bar-progress');
const loadingText = document.getElementById('loading-text');

console.log('DOM elements:', { textarea, loading, loadingProgress, loadingText });

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fired');
  try {
    initWebGL();
    simulateLoading();
  } catch (error) {
    console.error('Initialization error:', error);
  }
});

// ===== LOADING SIMULATION =====
function simulateLoading() {
  console.log('Starting loading simulation...');
  
  if (!loading || !loadingProgress || !loadingText) {
    console.error('Loading elements not found!', { loading, loadingProgress, loadingText });
    return;
  }
  
  const stages = [
    { progress: 20, text: 'Loading system files...' },
    { progress: 40, text: 'Initializing graphics...' },
    { progress: 60, text: 'Starting terminal...' },
    { progress: 80, text: 'Loading user data...' },
    { progress: 100, text: 'Ready!' }
  ];

  let currentStage = 0;
  const interval = setInterval(() => {
    if (currentStage < stages.length) {
      console.log(`Loading stage ${currentStage}: ${stages[currentStage].text}`);
      loadingProgress.style.width = stages[currentStage].progress + '%';
      loadingText.textContent = stages[currentStage].text;
      currentStage++;
    } else {
      console.log('Loading complete, hiding loading screen...');
      clearInterval(interval);
      setTimeout(() => {
        loading.classList.add('hidden');
        console.log('Loading screen hidden');
        console.log('About to call displayWelcome()');
        displayWelcome();
        console.log('displayWelcome() completed');
      }, 500);
    }
  }, 400);
}

// ===== TERMINAL FUNCTIONS =====
// Terminal functions temporarily disabled for WebGL-only mode
/*
function initTerminal() {
  terminalInput.addEventListener('keydown', handleKeyDown);
  terminalInput.focus();
  
  // Keep input focused
  document.addEventListener('click', () => {
    terminalInput.focus();
  });
}

function handleKeyDown(e) {
  if (e.key === 'Enter') {
    const command = terminalInput.value.trim();
    if (command) {
      commandHistory.push(command);
      historyIndex = commandHistory.length;
      executeCommand(command);
    }
    terminalInput.value = '';
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      terminalInput.value = commandHistory[historyIndex];
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      terminalInput.value = commandHistory[historyIndex];
    } else {
      historyIndex = commandHistory.length;
      terminalInput.value = '';
    }
  } else if (e.key === 'Tab') {
    e.preventDefault();
    // Auto-complete functionality could go here
  }
}
*/

function displayWelcome() {
  console.log('Terminal ready - WebGL mode');
  console.log('displayWelcome() START');
  
  // Add visible welcome text to the terminal container
  const terminalContainer = document.getElementById('terminal-container');
  console.log('terminalContainer:', terminalContainer);
  
  if (!terminalContainer) {
    console.error('terminal-container not found!');
    return;
  }
  
  const welcomeText = document.createElement('div');
  welcomeText.id = 'welcome-text';
  welcomeText.style.cssText = `
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    bottom: 20px;
    color: #00ff00;
    font-family: 'VT323', monospace;
    font-size: 1.2rem;
    line-height: 1.6;
    z-index: 100;
    text-shadow: 0 0 10px rgba(0,255,0,0.5);
    overflow-y: auto;
  `;
  
  welcomeText.innerHTML = `
<pre style="margin: 0; color: #00ff00;">
██╗  ██╗███████╗██╗     ██╗      ██████╗ 
██║  ██║██╔════╝██║     ██║     ██╔═══██╗
███████║█████╗  ██║     ██║     ██║   ██║
██╔══██║██╔══╝  ██║     ██║     ██║   ██║
██║  ██║███████╗███████╗███████╗╚██████╔╝
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝ ╚═════╝ 
</pre>

<div style="margin-top: 20px; color: #00ff00;">
<span style="font-weight: bold;">SYSTEM READY - LUCIAN-OS v1.0.0</span>
</div>

<div style="margin-top: 15px; color: #00ff00;">
Welcome to my interactive retro terminal portfolio!
</div>

<div style="margin-top: 10px; color: #00ff88;">
<strong>Available commands:</strong> help | about | projects | contact | clear
</div>

<div style="margin-top: 20px; color: #00ff00;">
<div id="output"></div>
<div style="display: flex; align-items: center;">
<span style="color: #888;">visitor@lucian:~$</span>&nbsp;
<input type="text" id="command-input" 
  style="flex: 1; background: transparent; border: none; outline: none; color: #00ff00; font-family: 'VT323', monospace; font-size: 1.2rem;" 
  autofocus />
</div>
</div>
  `;
  
  terminalContainer.appendChild(welcomeText);
  console.log('Welcome text added to container');
  console.log('terminalContainer children:', terminalContainer.children.length);
  
  // Setup command input
  const commandInput = document.getElementById('command-input');
  const output = document.getElementById('output');
  
  if (commandInput) {
    commandInput.focus();
    commandInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const command = commandInput.value.trim();
        if (command) {
          handleCommand(command, output);
        }
        commandInput.value = '';
      }
    });
    
    // Keep input focused
    document.addEventListener('click', () => commandInput.focus());
  }
}

function handleCommand(command, output) {
  const line = document.createElement('div');
  line.style.marginTop = '10px';
  line.style.color = '#00ff00';
  
  line.innerHTML = `<div style="color: #888;">visitor@lucian:~$ ${command}</div>`;
  
  const response = document.createElement('div');
  response.style.marginTop = '5px';
  
  switch(command.toLowerCase()) {
    case 'help':
      response.innerHTML = `
<div style="color: #00ff00;">Available commands:</div>
<div style="margin-left: 20px;">
  <div><span style="color: #00ff88;">help</span> - Show this help message</div>
  <div><span style="color: #00ff88;">about</span> - About me</div>
  <div><span style="color: #00ff88;">projects</span> - My projects</div>
  <div><span style="color: #00ff88;">contact</span> - Contact information</div>
  <div><span style="color: #00ff88;">clear</span> - Clear terminal</div>
</div>`;
      break;
      
    case 'about':
      response.innerHTML = `
<div style="color: #00ff00;">ABOUT LUCIAN COJOCARU</div>
<div style="margin-top: 10px;">
  Developer | Tech Enthusiast | Retro Computing Fan
</div>
<div style="margin-top: 10px;">
  Passionate about creating unique, interactive web experiences.
</div>`;
      break;
      
    case 'projects':
      response.innerHTML = `
<div style="color: #00ff00;">MY PROJECTS</div>
<div style="margin-top: 10px;">
  <div>→ Retro Terminal Portfolio (you're here!)</div>
  <div>→ More coming soon...</div>
</div>`;
      break;
      
    case 'contact':
      response.innerHTML = `
<div style="color: #00ff00;">CONTACT</div>
<div style="margin-top: 10px;">
  <div>→ GitHub: github.com/luciancj</div>
  <div>→ Email: [your email]</div>
</div>`;
      break;
      
    case 'clear':
      output.innerHTML = '';
      return;
      
    default:
      response.innerHTML = `<div style="color: #ff4444;">Command not found: ${command}</div>
<div style="color: #888;">Type 'help' for available commands</div>`;
  }
  
  line.appendChild(response);
  output.appendChild(line);
  
  // Scroll to bottom
  output.parentElement.scrollTop = output.parentElement.scrollHeight;
}

// Command execution temporarily disabled for WebGL-only mode
/*
function executeCommand(command) {
  const cmd = command.trim().toLowerCase();
  
  // Display command
  addOutput(`<span class="command-line">visitor@lucian:${currentPath}$ ${command}</span>`);
  
  // Execute command
  switch(cmd) {
    case 'help':
      showHelp();
      break;
    case 'about':
      showAbout();
      break;
    case 'projects':
      showProjects();
      break;
    case 'skills':
      showSkills();
      break;
    case 'contact':
      showContact();
      break;
    case 'clear':
    case 'cls':
      clearTerminal();
      break;
    case 'ls':
    case 'dir':
      showDirectory();
      break;
    case 'whoami':
      addOutput('visitor');
      break;
    case 'date':
      addOutput(new Date().toString());
      break;
    case 'pwd':
      addOutput(currentPath);
      break;
    case 'neofetch':
      showNeofetch();
      break;
    case 'cat readme':
    case 'cat readme.md':
      showReadme();
      break;
    case 'tree':
      showTree();
      break;
    case '':
      break;
    default:
      addOutput(`<span class="error">Command not found: ${command}</span>`);
      addOutput('<span class="info">Type "help" for available commands</span>');
  }
  
  scrollToBottom();
}

function addOutput(text) {
  const line = document.createElement('div');
  line.className = 'output-line';
  line.innerHTML = text;
  terminalOutput.appendChild(line);
}

function clearTerminal() {
  terminalOutput.innerHTML = '';
}

function scrollToBottom() {
  const container = document.getElementById('terminal-content');
  container.scrollTop = container.scrollHeight;
}

// ===== COMMAND IMPLEMENTATIONS =====
function showHelp() {
  const help = `
<span class="header">AVAILABLE COMMANDS:</span>

  <span class="success">help</span>        - Display this help message
  <span class="success">about</span>       - Learn about me
  <span class="success">projects</span>    - View my projects
  <span class="success">skills</span>      - See my technical skills
  <span class="success">contact</span>     - Get in touch
  <span class="success">clear</span>       - Clear the terminal
  <span class="success">ls</span>          - List directory contents
  <span class="success">neofetch</span>    - Display system information
  <span class="success">tree</span>        - Show directory tree
  <span class="success">cat readme</span>  - Read the readme file

<span class="info">Tip: Use ↑ and ↓ arrow keys to navigate command history</span>
`;
  addOutput(help);
}

function showAbout() {
  const about = `
<span class="header">ABOUT LUCIAN COJOCARU</span>

Hello! I'm Lucian, a passionate developer and technology enthusiast.

<span class="success">└─▶</span> Currently working on innovative projects
<span class="success">└─▶</span> Love creating interactive and unique experiences
<span class="success">└─▶</span> Passionate about retro computing aesthetics
<span class="success">└─▶</span> Always learning and exploring new technologies

<span class="info">💡 This entire website is an interactive retro terminal!</span>

Type <span class="success">'projects'</span> to see what I've been working on.
`;
  addOutput(about);
}

function showProjects() {
  const projects = `
<span class="header">MY PROJECTS</span>

<span class="success">┌─[Project 1: Retro Terminal Portfolio]</span>
<span class="success">│</span> This interactive website you're currently exploring!
<span class="success">│</span> Technologies: HTML, CSS, JavaScript, Three.js
<span class="success">└─▶</span> Features: Interactive 3D, retro aesthetics, command-line interface

<span class="success">┌─[Project 2: Your Next Project]</span>
<span class="success">│</span> Description of another cool project
<span class="success">│</span> Technologies: List your tech stack
<span class="success">└─▶</span> Highlights: Key features and achievements

<span class="success">┌─[Project 3: Another Amazing Project]</span>
<span class="success">│</span> Brief description
<span class="success">│</span> Technologies: Tech stack here
<span class="success">└─▶</span> Link: https://github.com/yourusername

<span class="info">Want to collaborate? Type 'contact' to reach out!</span>
`;
  addOutput(projects);
}

function showSkills() {
  const skills = `
<span class="header">TECHNICAL SKILLS</span>

<span class="success">[████████████████████] 100%</span> HTML/CSS/JavaScript
<span class="success">[██████████████████░░]  90%</span> Web Development
<span class="success">[████████████████░░░░]  80%</span> Three.js / WebGL
<span class="success">[██████████████░░░░░░]  70%</span> Node.js
<span class="success">[████████████░░░░░░░░]  60%</span> Python

<span class="info">╔═══════════════════════════════════╗</span>
<span class="info">║  SPECIALIZATIONS:                 ║</span>
<span class="info">║  • Frontend Development           ║</span>
<span class="info">║  • Interactive Experiences        ║</span>
<span class="info">║  • 3D Graphics & Animation        ║</span>
<span class="info">║  • Retro Computing & Design       ║</span>
<span class="info">╚═══════════════════════════════════╝</span>
`;
  addOutput(skills);
}

function showContact() {
  const contact = `
<span class="header">CONTACT INFORMATION</span>

<span class="success">📧 Email:</span>     your.email@example.com
<span class="success">🔗 GitHub:</span>    <a href="https://github.com/luciancj" target="_blank">github.com/luciancj</a>
<span class="success">💼 LinkedIn:</span>  <a href="https://linkedin.com/in/yourprofile" target="_blank">linkedin.com/in/yourprofile</a>
<span class="success">🐦 Twitter:</span>   <a href="https://twitter.com/yourhandle" target="_blank">@yourhandle</a>

<span class="info">┌─────────────────────────────────┐</span>
<span class="info">│ Feel free to reach out!         │</span>
<span class="info">│ I'm always open to:             │</span>
<span class="info">│  • Collaboration opportunities  │</span>
<span class="info">│  • Interesting projects         │</span>
<span class="info">│  • Tech discussions             │</span>
<span class="info">└─────────────────────────────────┘</span>
`;
  addOutput(contact);
}

function showDirectory() {
  const dir = `
<span class="info">total 5</span>
drwxr-xr-x  2 lucian lucian 4096 Nov  4 2025 <span class="success">projects/</span>
drwxr-xr-x  2 lucian lucian 4096 Nov  4 2025 <span class="success">skills/</span>
-rw-r--r--  1 lucian lucian 1234 Nov  4 2025 README.md
-rw-r--r--  1 lucian lucian  567 Nov  4 2025 about.txt
-rw-r--r--  1 lucian lucian  890 Nov  4 2025 contact.txt
`;
  addOutput(dir);
}

function showNeofetch() {
  const neofetch = `
<span class="ascii-art">     _____          OS: LUCIAN-OS 1.0.0 LTS
    /     \\         Host: Retro Terminal
   /  ^   ^\\        Kernel: JavaScript v1.0
  |  (o) (o)|       Shell: RetroSH
   \\   <   /        Terminal: WebTerminal
    | === |         CPU: Your Browser
     \\___/          GPU: WebGL Renderer
      | |           Memory: Unlimited
     _| |_          </span>

<span class="success">Theme:</span> Retro CRT Green-on-Black
<span class="success">Uptime:</span> ${Math.floor(performance.now() / 1000)} seconds
`;
  addOutput(neofetch);
}

function showReadme() {
  const readme = `
<span class="header"># LUCIAN COJOCARU - README.md</span>

## Welcome to my Interactive Portfolio Terminal

This is a unique portfolio website designed as an interactive 
retro computer terminal. 

### Features:
- ✓ Fully functional command-line interface
- ✓ 3D WebGL background with Three.js
- ✓ Authentic CRT screen effects
- ✓ Command history navigation
- ✓ Retro computing aesthetics

### Quick Start:
Type 'help' to see all available commands.

### About This Project:
Built with vanilla JavaScript, Three.js, and a passion for 
retro computing. No frameworks, just pure code.

<span class="info">Made with ❤️  by Lucian Cojocaru</span>
`;
  addOutput(readme);
}

function showTree() {
  const tree = `
<span class="success">.</span>
├── <span class="success">about.txt</span>
├── <span class="success">contact.txt</span>
├── <span class="success">README.md</span>
├── <span class="info">projects/</span>
│   ├── <span class="success">retro-terminal.md</span>
│   ├── <span class="success">project-2.md</span>
│   └── <span class="success">project-3.md</span>
└── <span class="info">skills/</span>
    ├── <span class="success">frontend.txt</span>
    ├── <span class="success">backend.txt</span>
    └── <span class="success">tools.txt</span>

2 directories, 9 files
`;
  addOutput(tree);
}
*/

// ===== THREE.JS / WEBGL BACKGROUND =====
async function initWebGL() {
  console.log('🎮 Initializing WebGL with CRT bulge effect...');
  
  try {
    const canvas = document.querySelector('.webgl');
    if (!canvas) {
      console.error('❌ Canvas not found!');
      return;
    }
    
    console.log('✅ Canvas found, creating scene...');
    
    // ===== MAIN SCENE =====
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 3;
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: false,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    console.log('✅ Renderer created');
    
    // ===== CURVED SCREEN WITH BULGE EFFECT =====
    console.log('Creating curved CRT screen...');
    
    // Create a sphere geometry for the CRT bulge effect
    const screenGeometry = new THREE.SphereGeometry(2, 64, 64, 0, Math.PI * 0.6, 0, Math.PI * 0.6);
    
    // Custom shader for the CRT screen with barrel distortion
    const screenMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x00ff00) },
        uScanlineIntensity: { value: 0.05 },
        uNoiseIntensity: { value: 0.02 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uScanlineIntensity;
        uniform float uNoiseIntensity;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        // Random noise function
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }
        
        // Scanline effect
        float scanline(float y) {
          return sin(y * 800.0) * uScanlineIntensity;
        }
        
        void main() {
          // Create grid pattern
          vec2 grid = fract(vUv * 20.0);
          float gridLines = step(0.95, grid.x) + step(0.95, grid.y);
          
          // Add scanlines
          float scan = scanline(vUv.y);
          
          // Add noise
          float noise = random(vUv + uTime) * uNoiseIntensity;
          
          // Fade towards edges for CRT vignette
          float vignette = 1.0 - length(vUv - 0.5) * 0.8;
          vignette = smoothstep(0.3, 1.0, vignette);
          
          // Combine effects
          vec3 color = uColor * (0.3 + gridLines * 0.7);
          color += scan + noise;
          color *= vignette;
          
          // Phosphor glow
          float glow = 1.0 - length(vUv - 0.5) * 0.5;
          color += uColor * glow * 0.1;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide,
      transparent: false
    });
    
    const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
    screenMesh.rotation.y = -Math.PI * 0.3;
    scene.add(screenMesh);
    
    console.log('✅ Curved screen added to scene');
    
    // ===== PARTICLES WITH DEPTH =====
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount; i++) {
      // Position particles in a volume behind the screen
      posArray[i * 3] = (Math.random() - 0.5) * 8;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 8;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 5 - 2;
      
      // Green color with variation
      const brightness = 0.5 + Math.random() * 0.5;
      colorArray[i * 3] = 0;
      colorArray[i * 3 + 1] = brightness;
      colorArray[i * 3 + 2] = 0;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    console.log('✅ Particles added');
    
    // ===== OSCILLOSCOPE LINES =====
    const lineGeometry = new THREE.BufferGeometry();
    const linePoints = 200;
    const linePositions = new Float32Array(linePoints * 3);
    
    for(let i = 0; i < linePoints; i++) {
      linePositions[i * 3] = (i / linePoints - 0.5) * 6;
      linePositions[i * 3 + 1] = 0;
      linePositions[i * 3 + 2] = -1;
    }
    
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8
    });
    
    const oscilloscopeLine = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(oscilloscopeLine);
    
    console.log('✅ Oscilloscope line added');
    
    // ===== POST-PROCESSING WITH BLOOM =====
    console.log('Setting up bloom pass...');
    
    const composer = new EffectComposer(renderer);
    
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Bloom for glow
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,  // strength
      0.4,  // radius
      0.85  // threshold
    );
    composer.addPass(bloomPass);
    
    console.log('✅ Post-processing configured');
    
    // ===== ANIMATION =====
    const clock = new THREE.Clock();
    
    function animate() {
      const elapsedTime = clock.getElapsedTime();
      
      // Update screen shader
      screenMaterial.uniforms.uTime.value = elapsedTime;
      
      // Gentle screen movement
      screenMesh.rotation.y = -Math.PI * 0.3 + Math.sin(elapsedTime * 0.2) * 0.05;
      
      // Animate particles
      const positions = particlesGeometry.attributes.position.array;
      for(let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        // Drift particles slowly
        positions[i3 + 1] += Math.sin(elapsedTime + positions[i3]) * 0.0005;
        positions[i3] += Math.cos(elapsedTime + positions[i3 + 1]) * 0.0003;
      }
      particlesGeometry.attributes.position.needsUpdate = true;
      
      // Animate oscilloscope line
      const linePos = lineGeometry.attributes.position.array;
      for(let i = 0; i < linePoints; i++) {
        const i3 = i * 3;
        const x = linePos[i3];
        linePos[i3 + 1] = Math.sin(x * 2 + elapsedTime * 2) * 0.3 +
                          Math.sin(x * 5 + elapsedTime * 3) * 0.1;
      }
      lineGeometry.attributes.position.needsUpdate = true;
      
      // Render with post-processing
      composer.render();
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    console.log('✅ Animation started!');
    
    // Handle resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    });
    
    console.log('🎉 WebGL initialized successfully with CRT bulge effect!');
  } catch (error) {
    console.error('❌ WebGL initialization failed:', error);
    console.error('Error stack:', error.stack);
  }
}

// Make executeCommand global for button clicks (temporarily disabled)
// window.executeCommand = executeCommand;
