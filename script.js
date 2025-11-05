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

// DOM Elements - will be initialized in DOMContentLoaded
let textarea, loading, loadingProgress, loadingText;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 DOMContentLoaded fired - initializing...');
  
  // Initialize DOM elements
  textarea = document.getElementById('textarea');
  loading = document.getElementById('loading');
  loadingProgress = document.getElementById('loading-bar-progress');
  loadingText = document.getElementById('loading-text');
  
  console.log('📦 DOM elements:', { 
    textarea: !!textarea, 
    loading: !!loading, 
    loadingProgress: !!loadingProgress, 
    loadingText: !!loadingText 
  });
  
  try {
    await initWebGL();
    console.log('✅ WebGL initialization complete, starting loading simulation');
  } catch (error) {
    console.error('⚠️ WebGL initialization error (continuing anyway):', error);
  }
  
  // Always run loading simulation regardless of WebGL success
  simulateLoading();
});

// ===== LOADING SIMULATION =====
function simulateLoading() {
  console.log('🔄 Starting loading simulation...');
  
  if (!loading || !loadingProgress || !loadingText) {
    console.error('❌ Loading elements not found!', { loading, loadingProgress, loadingText });
    // Force hide loading after 1 second even if elements missing
    setTimeout(() => {
      if (loading) loading.style.display = 'none';
      console.log('⚠️ Forced loading screen hide due to missing elements');
      displayWelcome();
    }, 1000);
    return;
  }
  
  // Failsafe: force hide after 5 seconds no matter what
  setTimeout(() => {
    if (loading && !loading.classList.contains('hidden')) {
      console.log('⏰ Failsafe: Force hiding loading screen after 5 seconds');
      loading.classList.add('hidden');
      displayWelcome();
    }
  }, 5000);
  
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
      console.log(`📊 Loading stage ${currentStage}: ${stages[currentStage].text}`);
      loadingProgress.style.width = stages[currentStage].progress + '%';
      loadingText.textContent = stages[currentStage].text;
      currentStage++;
    } else {
      console.log('✅ Loading complete, hiding loading screen...');
      clearInterval(interval);
      setTimeout(() => {
        loading.classList.add('hidden');
        console.log('👋 Loading screen hidden');
        console.log('📞 About to call displayWelcome()');
        displayWelcome();
        console.log('✅ displayWelcome() completed');
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
  console.log('Terminal ready - WebGL mode with 3D text wrap');
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
  // Styles now in CSS for proper 3D transform
  
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
  console.log('🎮 Initializing WebGL with complete shader pipeline...');
  
  try {
    const canvas = document.querySelector('.webgl');
    if (!canvas) {
      console.error('❌ Canvas not found!');
      return;
    }
    
    console.log('✅ Canvas found, creating scene...');
    
    // Load noise shader
    const noiseFragmentShader = await fetch('./shaders/noise.frag').then(r => r.text());
    const vertexShader = await fetch('./shaders/vertex.vert').then(r => r.text());
    console.log('✅ Shaders loaded');
    
    // ===== SCENE FOR RENDER TARGET (Screen Content) =====
    const sceneRTT = new THREE.Scene();
    sceneRTT.background = new THREE.Color(0x0a0a0a);
    
    // Camera for render target
    const resolution = 512 + 64;
    const cameraRTT = new THREE.OrthographicCamera(-0.1, 1.496, 0.1, -1.1, 1, 3);
    sceneRTT.add(cameraRTT);
    cameraRTT.position.set(0, 0, 1);
    
    // Create curved screen geometry for the RTT scene
    const screenGeometry = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 0.5, 0, Math.PI * 0.5);
    const screenMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00,
      wireframe: true
    });
    const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
    screenMesh.position.set(0.5, -0.5, 0);
    sceneRTT.add(screenMesh);
    
    // Add particles to RTT scene
    const rttParticlesGeometry = new THREE.BufferGeometry();
    const rttParticlesCount = 300;
    const rttPosArray = new Float32Array(rttParticlesCount * 3);
    
    for(let i = 0; i < rttParticlesCount * 3; i++) {
      rttPosArray[i] = (Math.random() - 0.5) * 2;
    }
    
    rttParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(rttPosArray, 3));
    const rttParticlesMaterial = new THREE.PointsMaterial({
      size: 0.01,
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8
    });
    
    const rttParticlesMesh = new THREE.Points(rttParticlesGeometry, rttParticlesMaterial);
    rttParticlesMesh.position.set(0.7, -0.5, 0);
    sceneRTT.add(rttParticlesMesh);
    
    console.log('✅ RTT scene created');
    
    // ===== MAIN SCENE (Background) =====
    const scene = new THREE.Scene();
    
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
    
    console.log('✅ Renderer created');
    
    // ===== EFFECT COMPOSER WITH FULL PIPELINE =====
    const rtTexture = new THREE.WebGLRenderTarget(resolution * 1.33, resolution, {
      format: THREE.RGBFormat,
    });
    
    const composer = new EffectComposer(renderer, rtTexture);
    composer.renderToScreen = false;
    
    const renderPass = new RenderPass(sceneRTT, cameraRTT);
    composer.addPass(renderPass);
    
    // Bloom pass for glow
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(128, 128),
      1.5,  // strength
      0.4,  // radius
      0.1   // threshold
    );
    composer.addPass(bloomPass);
    
    console.log('✅ EffectComposer configured with bloom');
    
    // Phosphor lag effect
    const lag = new Lag(composer.readBuffer, resolution * 1.33, resolution);
    console.log('✅ Phosphor lag effect initialized');
    
    // Noise and scanline shader
    const noiseShader = new ShaderToScreen(
      {
        uniforms: {
          uDiffuse: { value: lag.outputTexture.texture },
          uTime: { value: 1 },
          uProgress: { value: 1.2 },
        },
        vertexShader: vertexShader,
        fragmentShader: noiseFragmentShader,
      },
      resolution * 1.33,
      resolution
    );
    console.log('✅ Noise shader configured');
    
    // ===== BACKGROUND ELEMENTS =====
    const bgParticlesGeometry = new THREE.BufferGeometry();
    const bgParticlesCount = 1000;
    const bgPosArray = new Float32Array(bgParticlesCount * 3);
    
    for(let i = 0; i < bgParticlesCount * 3; i++) {
      bgPosArray[i] = (Math.random() - 0.5) * 10;
    }
    
    bgParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(bgPosArray, 3));
    const bgParticlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x00ff00,
      transparent: true,
      opacity: 0.3
    });
    
    const bgParticlesMesh = new THREE.Points(bgParticlesGeometry, bgParticlesMaterial);
    scene.add(bgParticlesMesh);
    
    console.log('✅ Background particles added');
    
    // ===== ANIMATION =====
    const clock = new THREE.Clock();
    let uProgress = 1.2;
    
    function animate() {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = clock.getDelta();
      
      // Animate RTT scene
      screenMesh.rotation.y = elapsedTime * 0.2;
      rttParticlesMesh.rotation.y = elapsedTime * 0.3;
      
      // Animate background
      bgParticlesMesh.rotation.y = elapsedTime * 0.05;
      
      // Update shader uniforms
      noiseShader.shader.uniforms.uTime.value = elapsedTime;
      noiseShader.shader.uniforms.uProgress.value = uProgress;
      
      uProgress -= deltaTime * 0.2;
      if (uProgress < 0) uProgress = 1.2;
      
      // Render pipeline: scene → composer → bloom → lag → noise → screen
      lag.render(renderer);
      composer.render();
      noiseShader.render(renderer);
      
      // Render main scene with shader output
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    console.log('✅ Animation started with full shader pipeline!');
    
    // Handle resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    console.log('🎉 WebGL initialized successfully with complete shader effects!');
  } catch (error) {
    console.error('❌ WebGL initialization failed:', error);
    console.error('Error stack:', error.stack);
  }
}

// Make executeCommand global for button clicks (temporarily disabled)
// window.executeCommand = executeCommand;
