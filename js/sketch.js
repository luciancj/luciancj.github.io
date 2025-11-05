// Terminal Portfolio - Main Sketch
// Keeping the Macrodata Refinement visual style with CRT Shader

// Global variables
let shaderLayer, crtShader;
let g; // p5 graphics instance
let useShader;
let palette;
let smaller;
let buffer = 120;
let lumon;

// State objects
let terminal;
let commandExecutor;
let crtEffects;
let bins = [];

// Calculate responsive canvas size
function calculateCanvasSize() {
  if (windowWidth <= 1024) {
    return { width: windowWidth, height: windowHeight };
  }
  
  const maxWidth = windowWidth * 0.75;
  const maxHeight = windowHeight * 0.75;
  const aspectRatio = 4/3;
  
  const widthBasedHeight = maxWidth / aspectRatio;
  const heightBasedWidth = maxHeight * aspectRatio;
  
  return widthBasedHeight <= maxHeight
    ? { width: maxWidth, height: widthBasedHeight }
    : { width: heightBasedWidth, height: maxHeight };
}

function preload() {
  crtShader = loadShader('shaders/crt.vert.glsl', 'shaders/crt.frag.glsl');
  lumon = loadImage(LOGO_PATH);
}

function setup() {
  const { width: canvasWidth, height: canvasHeight } = calculateCanvasSize();
  createCanvas(canvasWidth, canvasHeight);
  pixelDensity(1);
  
  // Initialize graphics buffers
  g = createGraphics(width, height);
  g.pixelDensity(1);
  
  shaderLayer = createGraphics(width, height, WEBGL);
  shaderLayer.pixelDensity(1);
  crtShader.setUniform('u_resolution', [g.width, g.height]);
  
  smaller = min(g.width, g.height);
  
  // Determine if we should use shaders
  useShader = !isTouchScreenDevice();
  palette = useShader ? shaderPalette : mobilePalette;
  
  // Initialize state objects
  terminal = new TerminalState();
  commandExecutor = new CommandExecutor(terminal, portfolioData);
  crtEffects = new CRTEffects();
  
  // Initialize bins
  let levelH = buffer * 1.7;
  let binWidth = g.width / 5;
  for (let i = 0; i < 5; i++) {
    bins.push(new Bin(binWidth, i, 100, {
      WO: floor(random(0, 25)),
      FC: floor(random(0, 25)),
      DR: floor(random(0, 25)),
      MA: floor(random(0, 25))
    }));
  }
  
  // Setup terminal welcome message
  terminal.addOutput('LUMON INDUSTRIES');
  terminal.addOutput('Macrodata Refinement Terminal v1.0');
  terminal.addOutput('');
  terminal.addOutput('Welcome to the terminal.');
  terminal.addOutput('Type "help" for available commands');
  terminal.addOutput('');
  
  // Fetch GitHub repositories
  fetchGitHubRepos(portfolioData).then(loaded => {
    commandExecutor.githubReposLoaded = loaded;
  });
}

function draw() {
  g.colorMode(RGB);
  g.background(palette.BG);
  g.textFont('IBM Plex Mono');
  
  // CRT power-on effect
  if (!crtEffects.powerOnComplete) {
    drawTop();
    drawTerminal();
    drawBottom();
    crtEffects.drawOscilloscopeEffects(g, palette, deltaTime);
    
    let progress = crtEffects.powerOnProgress / crtEffects.POWER_ON_DURATION;
    if (progress < 0.9) {
      let blurAmount = 15 * (1 - progress / 0.9);
      g.drawingContext.filter = `blur(${blurAmount}px)`;
      let tempCanvas = g.get();
      g.background(palette.BG);
      g.image(tempCanvas, 0, 0);
      g.drawingContext.filter = 'none';
    }
    
    crtEffects.drawPowerOnEffect(g, palette);
    crtEffects.powerOnProgress++;
    if (crtEffects.powerOnProgress >= crtEffects.POWER_ON_DURATION) {
      crtEffects.powerOnComplete = true;
    }
    
    applyShader();
    return;
  }
  
  // Draw main content
  drawTop();
  drawTerminal();
  drawBottom();
  crtEffects.drawOscilloscopeEffects(g, palette, deltaTime);
  drawCursor(mouseX, mouseY);
  
  applyShader();
}

function applyShader() {
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
  let boxHeight = 70;
  g.rect(wx, 25, w, boxHeight);
  g.noStroke();
  
  g.fill(palette.BG);
  g.stroke(palette.FG);
  g.strokeWeight(4);
  g.textSize(32);
  g.textFont('IBM Plex Mono');
  g.textAlign(LEFT, CENTER);
  
  g.fill(palette.FG);
  g.stroke(palette.BG);
  g.text(portfolioData.name, wx + 20, 25 + boxHeight / 2);
  
  g.push();
  g.imageMode(CORNER);
  g.tint(palette.FG);
  let logoX = wx + w - lumon.width - 25;
  let logoY = 25 + (boxHeight - lumon.height) / 2;
  g.image(lumon, logoX, logoY);
  g.pop();
  
  g.fill(palette.BG);
  g.stroke(palette.FG);
}

function drawBottom() {
  for (let bin of bins) {
    bin.show();
  }
  
  g.rectMode(CORNER);
  g.fill(palette.FG);
  g.rect(0, g.height - 20, g.width, 20);
  g.fill(palette.BG);
  g.textFont('IBM Plex Mono');
  g.textAlign(CENTER, CENTER);
  g.textSize(14);
  g.text('Type "help" for commands', g.width * 0.5, g.height - 10);
}

function drawTerminal() {
  g.fill(palette.FG);
  g.noStroke();
  g.textFont('IBM Plex Mono');
  g.textSize(16);
  g.textAlign(LEFT, TOP);

  let y = buffer;
  let x = 30;
  let lineHeight = 24;
  let maxY = g.height - buffer;

  let maxVisibleLines = Math.floor((maxY - y - lineHeight * 2) / lineHeight);
  let maxScroll = Math.max(0, terminal.output.length - maxVisibleLines);
  terminal.scrollOffset = constrain(terminal.scrollOffset, 0, maxScroll);
  
  let startIndex = terminal.scrollOffset;
  let endIndex = Math.min(terminal.output.length, startIndex + maxVisibleLines);
  
  for (let i = startIndex; i < endIndex; i++) {
    if (y + lineHeight > maxY - lineHeight * 2) break;
    let line = terminal.output[i];
    g.fill(line.color);
    g.text(line.text, x, y);
    y += lineHeight;
  }

  if (y > maxY - lineHeight * 2) {
    y = maxY - lineHeight * 2;
  }
  
  g.fill(palette.SELECT);
  let prompt = terminal.currentPath + ' > ';
  g.text(prompt, x, y);
  
  g.fill(palette.FG);
  let promptWidth = g.textWidth(prompt);
  g.text(terminal.currentInput, x + promptWidth, y);

  if (millis() - terminal.lastBlinkTime > 500) {
    terminal.cursorBlink = !terminal.cursorBlink;
    terminal.lastBlinkTime = millis();
  }
  if (terminal.cursorBlink) {
    g.fill(palette.SELECT);
    g.rect(x + promptWidth + g.textWidth(terminal.currentInput), y + 2, 10, 18);
  }
}

function drawCursor(xPos, yPos) {
  if (xPos == 0 && yPos == 0) return;
  
  let clampedX = constrain(xPos, 0, g.width);
  let clampedY = constrain(yPos, 0, g.height);
  
  let distortedX = clampedX;
  let distortedY = clampedY;
  let scaleX = 1.0;
  let scaleY = 1.0;
  
  if (useShader) {
    let uvX = clampedX / g.width;
    let uvY = clampedY / g.height;
    let normX = uvX * 2.0 - 1.0;
    let normY = uvY * 2.0 - 1.0;
    
    const curvature = 4.5;
    let offsetX = abs(normY) / curvature;
    let offsetY = abs(normX) / curvature;
    
    let distortX = normX + normX * offsetX * offsetX;
    let distortY = normY + normY * offsetY * offsetY;
    
    distortedX = (distortX * 0.5 + 0.5) * g.width;
    distortedY = (distortY * 0.5 + 0.5) * g.height;
    
    scaleX = 1.0 + abs(normX) * 0.8;
    scaleY = 1.0 + abs(normY) * 0.8;
  }
  
  g.push();
  g.translate(distortedX + 10, distortedY + 10);
  g.scale(0.8 * scaleX, 0.8 * scaleY);
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

// Event handlers
function keyPressed() {
  const handlers = {
    [ENTER]: () => {
      if (terminal.currentInput.trim()) {
        terminal.addToHistory(terminal.currentInput);
        commandExecutor.execute(terminal.currentInput);
      }
      terminal.currentInput = '';
    },
    [BACKSPACE]: () => {
      terminal.currentInput = terminal.currentInput.slice(0, -1);
    },
    [UP_ARROW]: () => {
      terminal.currentInput = terminal.getPreviousCommand();
    },
    [DOWN_ARROW]: () => {
      terminal.currentInput = terminal.getNextCommand();
    }
  };
  
  if (handlers[keyCode]) {
    handlers[keyCode]();
    return false;
  }
  return true;
}

function keyTyped() {
  if (key.length === 1 && key !== '\n' && key !== '\r') {
    terminal.currentInput += key;
  }
  return false;
}

function mouseWheel(event) {
  terminal.scrollOffset += event.delta > 0 ? 1 : -1;
  return false;
}

function windowResized() {
  const { width: canvasWidth, height: canvasHeight } = calculateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
  g.resizeCanvas(width, height);
  shaderLayer.resizeCanvas(width, height);
  crtShader.setUniform('u_resolution', [g.width, g.height]);
  smaller = min(g.width, g.height);
  
  const binWidth = g.width / 5;
  bins.forEach((bin, i) => bin.resize(binWidth));
}
