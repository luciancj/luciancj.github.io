import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { CRTShaderEffect } from './crtShader.js';

console.log('Script.js loaded successfully');
console.log('THREE imported:', typeof THREE);
console.log('CRTShaderEffect imported:', typeof CRTShaderEffect);

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
        displayWelcome();
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
  
  // Add visible welcome text to the terminal container
  const terminalContainer = document.getElementById('terminal-container');
  const welcomeText = document.createElement('div');
  welcomeText.style.cssText = `
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    color: var(--terminal-green);
    font-family: 'VT323', monospace;
    font-size: 1.2rem;
    line-height: 1.6;
    z-index: 100;
    text-shadow: 0 0 10px var(--glow-color);
  `;
  
  welcomeText.innerHTML = `
<pre style="margin: 0;">
██╗  ██╗███████╗██╗     ██╗      ██████╗ 
██║  ██║██╔════╝██║     ██║     ██╔═══██╗
███████║█████╗  ██║     ██║     ██║   ██║
██╔══██║██╔══╝  ██║     ██║     ██║   ██║
██║  ██║███████╗███████╗███████╗╚██████╔╝
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝ ╚═════╝ 
</pre>

<div style="margin-top: 20px;">
<span style="color: #00ff00; font-weight: bold;">SYSTEM READY - LUCIAN-OS v1.0.0</span>
</div>

<div style="margin-top: 15px;">
Welcome to my interactive retro terminal portfolio!
</div>

<div style="margin-top: 10px; color: #00ff88;">
<strong>Available commands:</strong> help | about | projects | contact
</div>

<div style="margin-top: 20px;">
<span style="color: #888;">visitor@lucian:~$</span> <span style="animation: blink 1s infinite;">_</span>
</div>
  `;
  
  terminalContainer.appendChild(welcomeText);
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
  try {
    const canvas = document.querySelector('.webgl');
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create geometric shapes
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const material = new THREE.MeshNormalMaterial({
      wireframe: true
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);
    
    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x00ff00,
      transparent: true,
      opacity: 0.6
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Animation
    const clock = new THREE.Clock();
    
    function animate() {
      const elapsedTime = clock.getElapsedTime();
      
      // Rotate shapes
      torusKnot.rotation.x = elapsedTime * 0.3;
      torusKnot.rotation.y = elapsedTime * 0.2;
      
      // Rotate particles
      particlesMesh.rotation.y = elapsedTime * 0.05;
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  } catch (error) {
    console.error('WebGL initialization failed:', error);
  }
}

// ===== CRT SHADER EFFECTS =====
function initCRTShader() {
  try {
    crtEffect = new CRTShaderEffect();
    const success = crtEffect.init();
    if (success) {
      console.log('CRT shader effects active');
    } else {
      console.warn('CRT shader effects could not be initialized');
    }
  } catch (error) {
    console.error('CRT shader initialization error:', error);
  }
}

// Make executeCommand global for button clicks (temporarily disabled)
// window.executeCommand = executeCommand;
