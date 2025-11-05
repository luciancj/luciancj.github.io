// Terminal Portfolio - keeping the Macrodata Refinement visual style
// for CRT Shader
let shaderLayer, crtShader;
let g; //p5 graphics instance
let useShader;

// Background and Foreground colours (from original)
const mobilePalette = {
  BG: '#0A0F0A',
  FG: '#33FF33',
  SELECT: '#66FF66',
  LEVELS: {
    WO: '#29CC29',
    FC: '#3DFF3D',
    DR: '#24BB24',
    MA: '#47FF47',
  }
};

const shaderPalette = {
  BG: '#0D110D',
  FG: '#33FF33',
  SELECT: '#66FF66',
  LEVELS: {
    WO: '#29CC29',
    FC: '#3DFF3D',
    DR: '#24BB24',
    MA: '#47FF47',
  }
};

let palette = mobilePalette;
let smaller;
let buffer = 120; // Increased to add padding between header box and terminal text

// CRT power-on effect
let powerOnProgress = 0;
let powerOnComplete = false;
let powerOnDuration = 120; // frames (about 2 seconds at 60fps)

// Oscilloscope effects
let scanlineY = 0;
let scanlineSpeed = 2;
let flickerAmount = 0;

// Bin system
const keys = ['WO', 'FC', 'DR', 'MA'];
let bins = [];
let levelH;

// Terminal state
let terminalOutput = [];
let currentInput = '';
let commandHistory = [];
let historyIndex = -1;
let cursorBlink = true;
let lastBlinkTime = 0;
let lumon;
let scrollOffset = 0; // For terminal scrolling

// File system navigation state
let currentPath = '~';
let currentRepo = null;
let fileSystem = {
  '~': {
    type: 'directory',
    contents: ['projects']
  },
  '~/projects': {
    type: 'directory',
    contents: [] // Will be populated with GitHub repos
  }
};

// Portfolio data
const portfolioData = {
  name: 'Guest User',
  role: 'Developer',
  email: 'your.email@example.com',
  github: 'https://github.com/luciancj',
  githubUsername: 'luciancj',
  projects: [] // Will be populated from GitHub API
};

let githubReposLoaded = false;

// Logo configuration
const LOGO_PATH = 'images/bme-logo-crt.png';

function preload() {
  crtShader = loadShader('shaders/crt.vert.glsl', 'shaders/crt.frag.glsl');
  lumon = loadImage(LOGO_PATH);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  
  // Initialize graphics buffer for main drawing
  g = createGraphics(width, height);
  g.pixelDensity(1);
  
  // Initialize shader layer (WEBGL required for shaders)
  shaderLayer = createGraphics(width, height, WEBGL);
  shaderLayer.pixelDensity(1);
  crtShader.setUniform('u_resolution', [g.width, g.height]);
  
  smaller = min(g.width, g.height);
  
  // Determine if we should use shaders based on device
  useShader = !isTouchScreenDevice();
  palette = useShader ? shaderPalette : mobilePalette;
  
  // Initialize bins
  levelH = buffer * 1.7;
  let binWidth = g.width / 5;
  for (let i = 0; i < 5; i++) {
    bins.push(new Bin(binWidth, i, 100, {
      WO: floor(random(0, 25)),
      FC: floor(random(0, 25)),
      DR: floor(random(0, 25)),
      MA: floor(random(0, 25))
    }));
  }
  
  // Setup terminal
  addOutput('LUMON INDUSTRIES');
  addOutput('Macrodata Refinement Terminal v1.0');
  addOutput('');
  addOutput('Welcome to the terminal.');
  addOutput('Type "help" for available commands');
  addOutput('');
  
  // Fetch GitHub repositories
  fetchGitHubRepos();
}

function draw() {
  g.colorMode(RGB);
  g.background(palette.BG);
  g.textFont('Courier');
  
  // CRT power-on effect
  if (!powerOnComplete) {
    drawPowerOnEffect();
    powerOnProgress++;
    if (powerOnProgress >= powerOnDuration) {
      powerOnComplete = true;
    }
    return;
  }
  
  // Draw header (like the game's top bar)
  drawTop();
  
  // Draw terminal content
  drawTerminal();
  
  // Draw bins and footer together (like the game's bottom section)
  drawBottom();
  
  // Draw oscilloscope effects
  drawOscilloscopeEffects();
  
  // Draw custom cursor
  drawCursor(mouseX, mouseY);

  // Apply CRT shader if enabled
  if (useShader) {
    shaderLayer.rect(0, 0, g.width, g.height);
    shaderLayer.shader(crtShader);
    crtShader.setUniform('u_tex', g);
    background(palette.BG);
    imageMode(CORNER);
    image(shaderLayer, 0, 0, g.width, g.height);
  } else {
    image(g, 0, 0, g.width, g.height);
  }
}

function drawPowerOnEffect() {
  // Realistic valve TV power-on effect
  // Phase 1: Horizontal line expands (Line Output warming up)
  // Phase 2: Vertical expansion begins (Frame Oscillator warming up)
  // Phase 3: Overshoots then settles (EHT stabilizing)
  
  let progress = powerOnProgress / powerOnDuration;
  
  g.background(0); // Pure black
  
  let centerX = g.width / 2;
  let centerY = g.height / 2;
  
  // Phase timings
  let horizontalPhase = min(progress / 0.25, 1); // 0-25%: horizontal expansion
  let verticalPhase = max(min((progress - 0.15) / 0.4, 1), 0); // 15-55%: vertical expansion
  let settlePhase = max(min((progress - 0.55) / 0.45, 1), 0); // 55-100%: settling
  
  // Horizontal expansion (Line Output stage warming up)
  // Starts as a dot, quickly expands to full width with slight overshoot
  let horizontalEase = 1 - pow(1 - horizontalPhase, 2); // Quick expansion
  let horizontalOvershoot = horizontalPhase < 1 ? sin(horizontalPhase * PI) * 0.05 : 0;
  let widthScale = horizontalEase * (1 + horizontalOvershoot);
  
  // Vertical expansion (Frame Oscillator warming up - slower)
  let verticalEase = 1 - pow(1 - verticalPhase, 3); // Slower expansion
  let verticalOvershoot = (verticalPhase > 0.8 && verticalPhase < 1) ? 
    sin((verticalPhase - 0.8) / 0.2 * PI) * 0.2 : 0;
  let heightScale = verticalEase * (1 + verticalOvershoot);
  
  // Settling phase - pull back from overshoot, increase brightness/sharpness
  if (settlePhase > 0) {
    widthScale = lerp(widthScale, 0.98, settlePhase * 0.3); // Settle slightly smaller
    heightScale = lerp(heightScale, 0.98, settlePhase * 0.3);
  }
  
  // Calculate dimensions
  let currentWidth = g.width * widthScale;
  let currentHeight = max(g.height * heightScale, 1); // Start as thin line
  
  // Blur/Glow based on warmup state (heavy blur early, sharp later)
  let blurAmount = 0;
  let glowIntensity = 0;
  
  if (progress < 0.3) {
    // Heavy blur early - electron guns not focused
    blurAmount = 20 * (1 - progress / 0.3);
    glowIntensity = 0.6;
  } else if (progress < 0.7) {
    // Reducing blur as EHT comes up
    blurAmount = 8 * (1 - (progress - 0.3) / 0.4);
    glowIntensity = 0.4 * (1 - (progress - 0.3) / 0.4);
  } else {
    // Sharp and bright once settled
    blurAmount = 2;
    glowIntensity = 0.1;
  }
  
  // Brightness increases as EHT builds up
  let brightness = progress < 0.5 ? 
    0.3 + (progress / 0.5) * 0.7 : 
    1.0;
  
  g.push();
  g.rectMode(CENTER);
  
  // Draw main beam area
  g.noStroke();
  
  // Apply glow/halation effect
  if (glowIntensity > 0.05) {
    for (let i = 0; i < 5; i++) {
      let glowSize = blurAmount * (i + 1) * 0.5;
      g.fill(palette.FG);
      g.drawingContext.globalAlpha = glowIntensity * brightness * (1 - i * 0.2);
      g.rect(centerX, centerY, currentWidth + glowSize * 2, currentHeight + glowSize * 2);
    }
  }
  
  // Main screen content
  g.fill(palette.BG);
  g.drawingContext.globalAlpha = brightness * 0.9;
  g.rect(centerX, centerY, currentWidth, currentHeight);
  
  // Horizontal scanlines effect (fake scan lines)
  if (currentHeight > 4 && progress > 0.2) {
    g.drawingContext.globalAlpha = 0.3 * brightness;
    g.stroke(palette.FG);
    g.strokeWeight(1);
    let scanlineSpacing = 4;
    for (let y = centerY - currentHeight/2; y < centerY + currentHeight/2; y += scanlineSpacing) {
      let lineWidth = currentWidth * (1 - abs(y - centerY) / (currentHeight/2) * 0.1);
      g.line(centerX - lineWidth/2, y, centerX + lineWidth/2, y);
    }
  }
  
  // Initial bright center line (electron beam before EHT is up)
  if (progress < 0.15) {
    g.stroke(palette.SELECT);
    g.strokeWeight(2);
    g.drawingContext.globalAlpha = 0.8 * (1 - progress / 0.15);
    g.line(centerX - currentWidth/2, centerY, centerX + currentWidth/2, centerY);
  }
  
  // "WARMING UP" text early phase
  if (progress < 0.4) {
    g.fill(palette.FG);
    g.noStroke();
    g.textFont('Courier');
    g.textSize(16);
    g.textAlign(CENTER, CENTER);
    g.drawingContext.globalAlpha = sin(progress / 0.4 * PI) * brightness;
    g.text('WARMING UP...', centerX, centerY);
  }
  
  // Static noise while warming up (signal interference)
  if (progress < 0.8 && currentHeight > 10) {
    g.drawingContext.globalAlpha = 0.2 * (1 - progress / 0.8) * brightness;
    for (let i = 0; i < 100; i++) {
      let x = centerX + random(-currentWidth/2, currentWidth/2);
      let y = centerY + random(-currentHeight/2, currentHeight/2);
      g.stroke(random() > 0.5 ? palette.FG : palette.BG);
      g.strokeWeight(1);
      g.point(x, y);
    }
  }
  
  g.pop();
  
  // Apply to screen
  if (useShader) {
    shaderLayer.rect(0, 0, g.width, g.height);
    shaderLayer.shader(crtShader);
    crtShader.setUniform('u_tex', g);
    background(0);
    imageMode(CORNER);
    image(shaderLayer, 0, 0, g.width, g.height);
  } else {
    image(g, 0, 0, g.width, g.height);
  }
}

function drawTop() {
  g.rectMode(CORNER);
  g.stroke(palette.FG);
  let w = g.width * 0.9;
  g.strokeWeight(2);
  let wx = (g.width - w) * 0.5;
  g.noFill();
  let boxHeight = 70; // Increased from 50 to 70 for better logo fit
  g.rect(wx, 25, w, boxHeight);
  g.noStroke();
  
  g.fill(palette.BG);
  g.stroke(palette.FG);
  g.strokeWeight(4);
  g.textSize(32);
  g.textFont('Courier');
  g.textAlign(LEFT, CENTER);
  
  // Show name on left
  g.fill(palette.FG);
  g.stroke(palette.BG);
  g.text(portfolioData.name, wx + 20, 25 + boxHeight / 2); // Center text in taller box
  
  // Draw BME logo inside the box on the right
  g.push();
  g.imageMode(CORNER);
  g.tint(palette.FG);
  // Position logo inside the box, aligned to the right with padding
  let logoX = wx + w - lumon.width - 25; // More padding to fit within box bounds
  let logoY = 25 + (boxHeight - lumon.height) / 2; // Center vertically in the taller box
  g.image(lumon, logoX, logoY);
  g.pop();
  
  g.fill(palette.BG);
  g.stroke(palette.FG);
}

function drawBottom() {
  // Draw bins first (like original game)
  for (let bin of bins) {
    bin.show();
  }
  
  // Draw footer bar at the very bottom with coordinates text (like original game)
  g.rectMode(CORNER);
  g.fill(palette.FG);
  g.rect(0, g.height - 20, g.width, 20);
  g.fill(palette.BG);
  g.textFont('Courier');
  g.textAlign(CENTER, CENTER);
  g.textSize(14);
  // Display help text in the footer like original game shows coordinates
  g.text('Type "help" for commands', g.width * 0.5, g.height - 10);
}

function drawOscilloscopeEffects() {
  // Moving scanline effect (like oscilloscope sweep)
  scanlineY += scanlineSpeed;
  if (scanlineY > g.height) {
    scanlineY = 0;
  }
  
  // Draw bright horizontal scanline
  g.push();
  g.stroke(palette.SELECT);
  g.strokeWeight(2);
  g.drawingContext.globalAlpha = 0.4;
  g.line(0, scanlineY, g.width, scanlineY);
  
  // Add glow effect to scanline
  g.stroke(palette.FG);
  g.strokeWeight(1);
  g.drawingContext.globalAlpha = 0.2;
  g.line(0, scanlineY - 1, g.width, scanlineY - 1);
  g.line(0, scanlineY + 1, g.width, scanlineY + 1);
  g.pop();
  
  // Random horizontal flicker lines (like signal interference)
  if (random() > 0.95) {
    let flickerY = random(g.height);
    g.push();
    g.stroke(palette.FG);
    g.strokeWeight(1);
    g.drawingContext.globalAlpha = 0.3;
    g.line(0, flickerY, g.width, flickerY);
    g.pop();
  }
  
  // Subtle screen flicker
  if (frameCount % 120 === 0) {
    flickerAmount = random(0.02, 0.05);
  } else {
    flickerAmount *= 0.95;
  }
  
  if (flickerAmount > 0.01) {
    g.push();
    g.noStroke();
    g.fill(palette.FG);
    g.drawingContext.globalAlpha = flickerAmount;
    g.rect(0, 0, g.width, g.height);
    g.pop();
  }
  
  // Edge glow effect (phosphor persistence)
  g.push();
  g.noFill();
  g.stroke(palette.FG);
  g.strokeWeight(1);
  g.drawingContext.globalAlpha = 0.1;
  g.rect(2, 2, g.width - 4, g.height - 4);
  g.rect(4, 4, g.width - 8, g.height - 8);
  g.pop();
}

function drawTerminal() {
  g.fill(palette.FG);
  g.noStroke();
  g.textFont('Courier');
  g.textSize(16);
  g.textAlign(LEFT, TOP);

  let y = buffer; // Start after top bar
  let x = 30;
  let lineHeight = 24;
  let maxY = g.height - buffer; // Stop before bottom bar

  // Calculate max visible lines
  let maxVisibleLines = Math.floor((maxY - y - lineHeight * 2) / lineHeight);
  
  // Limit scroll offset
  let maxScroll = Math.max(0, terminalOutput.length - maxVisibleLines);
  scrollOffset = constrain(scrollOffset, 0, maxScroll);
  
  // Draw output with scroll offset
  let startIndex = scrollOffset;
  let endIndex = Math.min(terminalOutput.length, startIndex + maxVisibleLines);
  
  for (let i = startIndex; i < endIndex; i++) {
    if (y + lineHeight > maxY - lineHeight * 2) break;
    let line = terminalOutput[i];
    g.fill(line.color);
    g.text(line.text, x, y);
    y += lineHeight;
  }

  // Draw input line (make sure it's always visible)
  if (y > maxY - lineHeight * 2) {
    y = maxY - lineHeight * 2;
  }
  
  // Draw prompt with current directory
  g.fill(palette.SELECT);
  let prompt = currentPath + ' > ';
  g.text(prompt, x, y);
  
  g.fill(palette.FG);
  let promptWidth = g.textWidth(prompt);
  g.text(currentInput, x + promptWidth, y);

  // Blinking cursor
  if (millis() - lastBlinkTime > 500) {
    cursorBlink = !cursorBlink;
    lastBlinkTime = millis();
  }
  if (cursorBlink) {
    g.fill(palette.SELECT);
    g.rect(x + promptWidth + g.textWidth(currentInput), y + 2, 10, 18);
  }
}

function addOutput(text, color = null) {
  terminalOutput.push({
    text: text,
    color: color || palette.FG
  });
  
  // Keep only last 100 lines
  if (terminalOutput.length > 100) {
    terminalOutput.shift();
  }
  
  // Auto-scroll to bottom when new content is added
  scrollOffset = terminalOutput.length;
}

function executeCommand(cmd) {
  let originalCmd = cmd.trim();
  cmd = originalCmd.toLowerCase();
  
  addOutput('> ' + originalCmd, palette.SELECT);
  
  if (cmd === '') {
    return;
  }

  if (cmd === 'help') {
    addOutput('');
    addOutput('Available commands:', palette.SELECT);
    addOutput('  help      - Show this help message');
    addOutput('  about     - About me');
    addOutput('  projects  - View my projects');
    addOutput('  contact   - Contact information');
    addOutput('  skills    - My technical skills');
    addOutput('  ls        - List files/directories');
    addOutput('  tree      - Show directory tree');
    addOutput('  cd <dir>  - Change directory');
    addOutput('  pwd       - Print working directory');
    addOutput('  open <file> - Open file on GitHub');
    addOutput('  clear     - Clear terminal');
    addOutput('  github    - Open GitHub profile');
    addOutput('');
  }
  else if (cmd === 'pwd') {
    addOutput(currentPath);
    addOutput('');
  }
  else if (cmd === 'ls') {
    addOutput('');
    handleLs();
  }
  else if (cmd === 'tree') {
    addOutput('');
    handleTree();
  }
  else if (cmd.startsWith('cd ')) {
    let target = originalCmd.substring(3).trim();
    handleCd(target);
  }
  else if (cmd.startsWith('open ')) {
    let filename = originalCmd.substring(5).trim();
    handleOpen(filename);
  }
  else if (cmd === 'about') {
    addOutput('');
    addOutput('Name: ' + portfolioData.name, palette.SELECT);
    addOutput('Role: ' + portfolioData.role);
    addOutput('');
    addOutput('I am a developer passionate about creating');
    addOutput('interactive experiences and beautiful code.');
    addOutput('');
  }
  else if (cmd === 'projects') {
    addOutput('');
    if (!githubReposLoaded) {
      addOutput('Loading projects from GitHub...', palette.SELECT);
      addOutput('');
    } else if (portfolioData.projects.length === 0) {
      addOutput('No projects found', palette.SELECT);
      addOutput('');
    } else {
      addOutput(`My Projects (${portfolioData.projects.length} total):`, palette.SELECT);
      addOutput('');
      portfolioData.projects.forEach((proj, i) => {
        let title = `${i + 1}. ${proj.name}`;
        if (proj.language) title += ` [${proj.language}]`;
        if (proj.stars > 0) title += ` ⭐${proj.stars}`;
        addOutput(title, palette.SELECT);
        addOutput(`   ${proj.desc}`);
        if (proj.updated) addOutput(`   Last updated: ${proj.updated}`, palette.FG);
        addOutput(`   ${proj.link}`, palette.FG);
        addOutput('');
      });
    }
  }
  else if (cmd === 'contact') {
    addOutput('');
    addOutput('Contact Information:', palette.SELECT);
    addOutput('');
    addOutput('Email:  ' + portfolioData.email);
    addOutput('GitHub: ' + portfolioData.github);
    addOutput('');
  }
  else if (cmd === 'skills') {
    addOutput('');
    addOutput('Technical Skills:', palette.SELECT);
    addOutput('');
    addOutput('Languages: JavaScript, Python, Java, C++');
    addOutput('Frameworks: React, Node.js, p5.js');
    addOutput('Tools: Git, Docker, VS Code, Linux');
    addOutput('');
  }
  else if (cmd === 'clear') {
    terminalOutput = [];
  }
  else if (cmd === 'github') {
    addOutput('Opening GitHub profile...', palette.SELECT);
    window.open(portfolioData.github, '_blank');
  }
  else {
    addOutput(`Command not found: ${originalCmd}`, '#ff4444');
    addOutput('Type "help" for available commands');
    addOutput('');
  }
}

function keyPressed() {
  if (keyCode === ENTER) {
    if (currentInput.trim() !== '') {
      commandHistory.push(currentInput);
      historyIndex = commandHistory.length;
      executeCommand(currentInput);
    }
    currentInput = '';
    return false;
  }
  else if (keyCode === BACKSPACE) {
    currentInput = currentInput.slice(0, -1);
    return false;
  }
  else if (keyCode === UP_ARROW) {
    if (historyIndex > 0) {
      historyIndex--;
      currentInput = commandHistory[historyIndex];
    }
    return false;
  }
  else if (keyCode === DOWN_ARROW) {
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      currentInput = commandHistory[historyIndex];
    } else {
      historyIndex = commandHistory.length;
      currentInput = '';
    }
    return false;
  }
  return true;
}

function keyTyped() {
  if (key.length === 1 && key !== '\n' && key !== '\r') {
    currentInput += key;
  }
  return false;
}

function mouseWheel(event) {
  // Scroll the terminal output
  scrollOffset += event.delta > 0 ? 1 : -1;
  return false; // Prevent default scrolling
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  g.resizeCanvas(windowWidth, windowHeight);
  shaderLayer.resizeCanvas(windowWidth, windowHeight);
  crtShader.setUniform('u_resolution', [g.width, g.height]);
  smaller = min(g.width, g.height);
  
  // Resize bins
  let binWidth = g.width / 5;
  for (let i = 0; i < bins.length; i++) {
    bins[i].resize(binWidth);
  }
}

// Custom cursor from original game (exact implementation with CRT curvature)
function drawCursor(xPos, yPos) {
  // prevents the cursor appearing in top left corner on page load
  if (xPos == 0 && yPos == 0) return;
  
  // Wrap cursor position around screen edges
  let wrappedX = xPos;
  let wrappedY = yPos;
  
  // Horizontal wrapping
  if (wrappedX < 0) wrappedX = g.width + wrappedX;
  if (wrappedX > g.width) wrappedX = wrappedX - g.width;
  
  // Vertical wrapping
  if (wrappedY < 0) wrappedY = g.height + wrappedY;
  if (wrappedY > g.height) wrappedY = wrappedY - g.height;
  
  // Apply CRT curvature distortion if shader is enabled
  let distortedX = wrappedX;
  let distortedY = wrappedY;
  let scaleX = 1.0;
  let scaleY = 1.0;
  
  if (useShader) {
    // Normalize coordinates to 0-1
    let uvX = wrappedX / g.width;
    let uvY = wrappedY / g.height;
    
    // Convert to -1 to 1 range (same as shader)
    let normX = uvX * 2.0 - 1.0;
    let normY = uvY * 2.0 - 1.0;
    
    // Apply curvature distortion (matching shader's curveRemapUV)
    const curvature = 4.5;
    let offsetX = abs(normY) / curvature;
    let offsetY = abs(normX) / curvature;
    
    let distortX = normX + normX * offsetX * offsetX;
    let distortY = normY + normY * offsetY * offsetY;
    
    // Convert back to screen space
    distortedX = (distortX * 0.5 + 0.5) * g.width;
    distortedY = (distortY * 0.5 + 0.5) * g.height;
    
    // Calculate scale distortion based on position
    // Cursor gets stretched near edges - increased multiplier for more visible distortion
    scaleX = 1.0 + abs(normX) * 0.8;
    scaleY = 1.0 + abs(normY) * 0.8;
  }
  
  g.push();
  // this offset makes the box draw from point of cursor 
  g.translate(distortedX + 10, distortedY + 10);
  g.scale(0.8 * scaleX, 0.8 * scaleY); // Reduced from 1.2 to 0.8 for smaller cursor
  g.fill(palette.BG);
  g.stroke(palette.FG);
  g.strokeWeight(3);
  g.beginShape();
  g.rotate(-PI / 5);
  g.vertex(0, -10);
  g.vertex(7.5, 10);
  g.vertex(0, 5);
  g.vertex(-7.5, 10);
  g.endShape(CLOSE);
  g.pop();
}

// Simplified Bin class for portfolio display
class Bin {
  constructor(w, i, goal, levels) {
    this.w = w;
    this.i = i;
    this.x = i * w + w * 0.5;
    this.y = g.height - buffer * 0.75;
    this.goal = goal;
    this.levelGoal = this.goal / 4;
    this.levels = levels ?? {
      WO: 0,
      FC: 0,
      DR: 0,
      MA: 0,
    };
    this.count = Object.values(this.levels).reduce((prev, curr) => prev + curr);
  }

  show() {
    g.push();
    this.count = this.levels.WO + this.levels.FC + this.levels.DR + this.levels.MA;
    this.count = constrain(this.count, 0, this.goal);
    let perc = this.count / this.goal;
    g.rectMode(CENTER);
    let rw = this.w - this.w * 0.25;

    this.drawBottomOutlines(rw, buffer);
    this.drawProgressBar(rw, buffer, perc);
    this.writeIndex();
    this.writePercentage(perc, rw, buffer);
    
    g.pop();
  }

  drawBottomOutlines(rw, buffer) {
    // Extra layer to block tray sliding
    g.noStroke();
    g.fill(palette.BG);
    g.rectMode(CORNER);
    let extra = 4;
    g.rect(
      this.x - rw * 0.5 - extra,
      this.y - buffer * 0.125,
      rw + extra * 2,
      buffer
    );

    g.stroke(palette.FG);
    g.strokeWeight(1);
    g.fill(palette.BG);

    g.rectMode(CENTER);
    g.rect(this.x, this.y, rw, buffer * 0.25);
    g.rect(this.x, this.y + buffer * 0.3, rw, buffer * 0.25);
  }

  drawProgressBar(rw, buffer, perc) {
    g.fill(palette.FG);
    g.noStroke();
    g.rectMode(CORNER);

    let h = buffer * 0.25;
    g.rect(this.x - rw * 0.5, this.y + buffer * 0.3 - h * 0.5, rw * perc, h);
  }

  writeIndex() {
    g.textSize(18);
    g.textFont('Courier');
    g.textAlign(CENTER, CENTER);
    g.fill(palette.FG);
    g.noStroke();
    g.text(nf(this.i, 2, 0), this.x, this.y);
  }

  writePercentage(perc, rw, buffer) {
    g.textAlign(LEFT, CENTER);
    g.stroke(palette.FG);
    g.strokeWeight(2);
    g.fill(palette.BG);
    g.text(
      `${floor(nf(100 * perc, 2, 0))}%`,
      this.x - rw * 0.45,
      this.y + buffer * 0.3
    );
  }

  resize(newW) {
    this.w = newW;
    this.x = this.i * newW + newW * 0.5;
    this.y = g.height - buffer * 0.75;    
  }
}

// GitHub API integration
async function fetchGitHubRepos() {
  try {
    const username = portfolioData.githubUsername;
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
    
    if (!response.ok) {
      console.error('Failed to fetch GitHub repos:', response.status);
      // Add some default repos as fallback
      portfolioData.projects = [
        {
          name: 'luciancj.github.io',
          desc: 'Terminal Portfolio Website',
          link: 'https://github.com/luciancj/luciancj.github.io',
          repo: 'luciancj/luciancj.github.io'
        }
      ];
      githubReposLoaded = true;
      return;
    }
    
    const repos = await response.json();
    
    // Transform GitHub repos to our format
    portfolioData.projects = repos.map(repo => ({
      name: repo.name,
      desc: repo.description || 'No description available',
      link: repo.html_url,
      repo: repo.full_name,
      stars: repo.stargazers_count,
      language: repo.language,
      updated: new Date(repo.updated_at).toLocaleDateString()
    }));
    
    githubReposLoaded = true;
    console.log(`Loaded ${portfolioData.projects.length} repositories from GitHub`);
    
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    // Add default repos as fallback
    portfolioData.projects = [
      {
        name: 'luciancj.github.io',
        desc: 'Terminal Portfolio Website',
        link: 'https://github.com/luciancj/luciancj.github.io',
        repo: 'luciancj/luciancj.github.io'
      }
    ];
    githubReposLoaded = true;
  }
}

// File system command handlers
function handleLs() {
  if (currentPath === '~') {
    addOutput('projects/', palette.SELECT);
  } else if (currentPath === '~/projects') {
    if (!githubReposLoaded) {
      addOutput('Loading repositories from GitHub...', palette.SELECT);
    } else if (portfolioData.projects.length === 0) {
      addOutput('(empty)');
    } else {
      addOutput(`Total: ${portfolioData.projects.length} repositories`, palette.SELECT);
      addOutput('');
      portfolioData.projects.forEach(proj => {
        let info = proj.name;
        if (proj.language) info += ` [${proj.language}]`;
        if (proj.stars > 0) info += ` ⭐${proj.stars}`;
        addOutput(info + '/', palette.FG);
      });
    }
  } else if (currentRepo) {
    addOutput('Fetching files from GitHub...', palette.SELECT);
    addOutput('Use "open <filename>" to view files on GitHub');
    addOutput('');
    addOutput('Common files:', palette.SELECT);
    addOutput('  README.md');
    addOutput('  index.html');
    addOutput('  package.json');
    addOutput('  .gitignore');
  }
  addOutput('');
}

function handleTree() {
  if (currentPath === '~') {
    addOutput('~', palette.SELECT);
    addOutput('└── projects/', palette.FG);
    if (portfolioData.projects.length > 0) {
      portfolioData.projects.forEach((proj, i) => {
        let isLast = i === portfolioData.projects.length - 1;
        let prefix = isLast ? '    └── ' : '    ├── ';
        addOutput(prefix + proj.name + '/', palette.FG);
      });
    }
  } else if (currentPath === '~/projects') {
    addOutput('~/projects', palette.SELECT);
    if (portfolioData.projects.length === 0) {
      addOutput('(empty)');
    } else {
      portfolioData.projects.forEach((proj, i) => {
        let isLast = i === portfolioData.projects.length - 1;
        let prefix = isLast ? '└── ' : '├── ';
        addOutput(prefix + proj.name + '/', palette.FG);
      });
    }
  } else if (currentRepo) {
    let repoName = currentPath.split('/').pop();
    addOutput(currentPath, palette.SELECT);
    addOutput('├── README.md', palette.FG);
    addOutput('├── index.html', palette.FG);
    addOutput('├── package.json', palette.FG);
    addOutput('├── src/', palette.FG);
    addOutput('│   ├── components/', palette.FG);
    addOutput('│   ├── styles/', palette.FG);
    addOutput('│   └── utils/', palette.FG);
    addOutput('├── public/', palette.FG);
    addOutput('│   └── assets/', palette.FG);
    addOutput('└── .gitignore', palette.FG);
    addOutput('');
    addOutput('Use "open <filename>" to view files on GitHub', palette.SELECT);
  }
  addOutput('');
}

function handleCd(target) {
  if (target === '~' || target === '') {
    currentPath = '~';
    currentRepo = null;
    addOutput('');
  } else if (target === '..' || target === '../') {
    if (currentPath.includes('/')) {
      let parts = currentPath.split('/');
      parts.pop();
      currentPath = parts.join('/') || '~';
      if (!currentPath.includes('projects/')) {
        currentRepo = null;
      }
    }
    addOutput('');
  } else if (target === 'projects' && currentPath === '~') {
    currentPath = '~/projects';
    currentRepo = null;
    addOutput('');
  } else if (currentPath === '~/projects') {
    // Check if repositories are loaded
    if (!githubReposLoaded) {
      addOutput('Still loading repositories from GitHub...', palette.SELECT);
      addOutput('Please wait a moment and try again.');
      addOutput('');
      return;
    }
    
    // Normalize target for matching (remove trailing slash, convert to lowercase)
    let normalizedTarget = target.toLowerCase().replace(/\/$/, '');
    
    // Find matching project with flexible matching
    let project = portfolioData.projects.find(p => {
      let repoName = p.name.toLowerCase();
      // Direct match
      if (repoName === normalizedTarget) return true;
      // Match with spaces replaced by hyphens
      if (repoName.replace(/\s+/g, '-') === normalizedTarget) return true;
      // Match with hyphens replaced by underscores
      if (repoName.replace(/-/g, '_') === normalizedTarget) return true;
      // Partial match (starts with)
      if (repoName.startsWith(normalizedTarget) && normalizedTarget.length > 3) return true;
      return false;
    });
    
    if (project) {
      currentPath = `~/projects/${project.name}`;
      currentRepo = project.repo;
      addOutput(`Entered repository: ${project.name}`, palette.SELECT);
      addOutput(`GitHub: ${project.link}`);
      addOutput('Use "ls" to see files, "open <file>" to view on GitHub');
      addOutput('');
    } else {
      addOutput(`cd: ${target}: No such directory`, '#ff4444');
      addOutput(`Try "ls" to see available repositories`);
      addOutput('');
    }
  } else {
    addOutput(`cd: ${target}: No such directory`, '#ff4444');
    addOutput('');
  }
}

function handleOpen(filename) {
  if (!currentRepo) {
    addOutput('Not in a repository. Use "cd projects/<repo-name>" first', '#ff4444');
    addOutput('');
    return;
  }
  
  if (!filename || filename === '') {
    addOutput('Usage: open <filename>', '#ff4444');
    addOutput('');
    return;
  }
  
  // Construct GitHub URL
  let githubUrl = `https://github.com/${currentRepo}/blob/main/${filename}`;
  
  addOutput(`Opening ${filename} on GitHub...`, palette.SELECT);
  addOutput(githubUrl, palette.FG);
  addOutput('');
  
  window.open(githubUrl, '_blank');
}
