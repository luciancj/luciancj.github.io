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
};

const shaderPalette = {
  BG: '#111111',
  FG: '#99f',
  SELECT: '#fff',
};

let palette = mobilePalette;
let smaller;
let buffer = 100;

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
  name: 'Lucian Cojocaru',
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
  frameRate(30);

  // create a downscaled graphics buffer to draw to
  g = createGraphics(windowWidth, windowHeight);

  // We don't want to use shader on mobile
  useShader = !isTouchScreenDevice();

  // The shader boosts colour values so we reset the palette if using shader
  if (useShader) {
    palette = shaderPalette;
  }

  // force pixel density to 1 to improve perf on retina screens
  pixelDensity(1);

  // p5 graphics element to draw our shader output to
  shaderLayer = createGraphics(g.width, g.height, WEBGL);
  shaderLayer.noStroke();
  crtShader.setUniform('u_resolution', [g.width, g.height]);

  smaller = min(g.width, g.height);

  // Welcome message
  addOutput('='.repeat(60), palette.FG);
  addOutput('WELCOME TO LUCIAN COJOCARU TERMINAL v1.0', palette.SELECT);
  addOutput('='.repeat(60), palette.FG);
  addOutput('');
  addOutput('Type "help" for available commands', palette.FG);
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
  
  // Draw footer (like the game's bottom bar)
  drawBottom();
  
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
  
  // Show "Terminal" on right
  g.textAlign(RIGHT, CENTER);
  g.text('Terminal', wx + w - 20, 50);
  
  g.fill(palette.BG);
  g.stroke(palette.FG);
}

function drawBottom() {
  g.rectMode(CORNER);
  g.fill(palette.FG);
  g.rect(0, g.height - 20, g.width, 20);
  g.fill(palette.BG);
  g.textFont('Courier');
  g.textAlign(CENTER, CENTER);
  g.textSize(14);
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
}
