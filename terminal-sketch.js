// Terminal Portfolio - keeping the Macrodata Refinement visual style
// for CRT Shader
let shaderLayer, crtShader;
let g; //p5 graphics instance
let useShader;

// Background and Foreground colours (from original)
const mobilePalette = {
  BG: '#010A13',
  FG: '#ABFFE9',
  SELECT: '#EEFFFF',
  LEVELS: {
    WO: '#05C3A8',
    FC: '#1EEFFF',
    DR: '#DF81D5',
    MA: '#F9ECBB',
  }
};

const shaderPalette = {
  BG: '#111111',
  FG: '#99f',
  SELECT: '#fff',
  LEVELS: {
    WO: '#17AC97',
    FC: '#4ABCC5',
    DR: '#B962B0',
    MA: '#D4BB5E',
  }
};

let palette = mobilePalette;
let smaller;
let buffer = 100;

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

// Portfolio data
const portfolioData = {
  name: 'Guest User',
  role: 'Developer',
  email: 'your.email@example.com',
  github: 'https://github.com/luciancj',
  projects: [
    {
      name: 'Macrodata Refinement',
      desc: 'Severance-inspired interactive game',
      link: 'https://github.com/Lumon-Industries/Macrodata-Refinement'
    }
  ]
};

function preload() {
  crtShader = loadShader('shaders/crt.vert.glsl', 'shaders/crt.frag.glsl');
  lumon = loadImage('images/lumon.png');
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
}

function draw() {
  g.colorMode(RGB);
  g.background(palette.BG);
  g.textFont('Courier');
  
  // Draw header (like the game's top bar)
  drawTop();
  
  // Draw terminal content
  drawTerminal();
  
  // Draw bins and footer together (like the game's bottom section)
  drawBottom();
  
  // Draw custom cursor
  drawCursor(mouseX, mouseY);
  
  // Draw Lumon logo
  g.imageMode(CORNER);
  if (!useShader) g.tint(mobilePalette.FG);
  g.image(lumon, g.width - lumon.width, 0);

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

function drawTop() {
  g.rectMode(CORNER);
  g.stroke(palette.FG);
  let w = g.width * 0.9;
  g.strokeWeight(2);
  let wx = (g.width - w) * 0.5;
  g.noFill();
  g.rect(wx, 25, w, 50);
  g.noStroke();
  
  g.fill(palette.BG);
  g.stroke(palette.FG);
  g.strokeWeight(4);
  g.textSize(32);
  g.textFont('Arial');
  g.textAlign(LEFT, CENTER);
  
  // Show name on left
  g.fill(palette.FG);
  g.stroke(palette.BG);
  g.text(portfolioData.name, wx + 20, 50);
  
  
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

  // Draw output (only lines that fit in the terminal area)
  let startIndex = Math.max(0, terminalOutput.length - Math.floor((maxY - y - lineHeight * 2) / lineHeight));
  for (let i = startIndex; i < terminalOutput.length; i++) {
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
  
  g.fill(palette.SELECT);
  g.text('> ', x, y);
  
  g.fill(palette.FG);
  g.text(currentInput, x + 20, y);

  // Blinking cursor
  if (millis() - lastBlinkTime > 500) {
    cursorBlink = !cursorBlink;
    lastBlinkTime = millis();
  }
  if (cursorBlink) {
    g.fill(palette.SELECT);
    g.rect(x + 20 + g.textWidth(currentInput), y + 2, 10, 18);
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
}

function executeCommand(cmd) {
  cmd = cmd.trim().toLowerCase();
  
  addOutput('> ' + cmd, palette.SELECT);
  
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
    addOutput('  clear     - Clear terminal');
    addOutput('  github    - Open GitHub profile');
    addOutput('');
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
    addOutput('My Projects:', palette.SELECT);
    addOutput('');
    portfolioData.projects.forEach((proj, i) => {
      addOutput(`${i + 1}. ${proj.name}`, palette.SELECT);
      addOutput(`   ${proj.desc}`);
      addOutput(`   ${proj.link}`, palette.FG);
      addOutput('');
    });
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
    addOutput(`Command not found: ${cmd}`, '#ff4444');
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
    // Cursor gets stretched near edges
    scaleX = 1.0 + abs(normX) * 0.3;
    scaleY = 1.0 + abs(normY) * 0.3;
  }
  
  g.push();
  // this offset makes the box draw from point of cursor 
  g.translate(distortedX + 10, distortedY + 10);
  g.scale(1.2 * scaleX, 1.2 * scaleY);
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
    g.textFont('Arial');
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
