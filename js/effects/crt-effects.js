// CRT Effects and Visual Effects
class CRTEffects {
  constructor() {
    // Constants
    this.POWER_ON_DURATION = 240; // ~4s at 60fps
    this.PHASE_TIMING = {
      horizontal: 0.25,
      verticalStart: 0.15,
      verticalDuration: 0.4,
      settleStart: 0.55,
      settleDuration: 0.45
    };
    
    // Power-on effect
    this.powerOnProgress = 0;
    this.powerOnComplete = false;
    
    // Oscilloscope effects
    this.scanlineY = 0;
    this.scanlineSpeed = 2;
    this.flickerAmount = 0;
    
    // VHS Effects
    this.vhsJitter = {
      active: false,
      size: 0,
      period: 0,
      current: 0,
      startTime: 0
    };
    this.vhsTapeWrinkle = {
      active: false,
      position: 1.2,
      size: 0.05
    };
    this.vhsTime = 0;
  }

  drawPowerOnEffect(g, palette) {
    const progress = this.powerOnProgress / this.POWER_ON_DURATION;
    const { width, height } = g;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Calculate phase progress
    const phases = this.PHASE_TIMING;
    const horizontalPhase = min(progress / phases.horizontal, 1);
    const verticalPhase = max(min((progress - phases.verticalStart) / phases.verticalDuration, 1), 0);
    const settlePhase = max(min((progress - phases.settleStart) / phases.settleDuration, 1), 0);
    
    // Calculate scales with easing
    const horizontalEase = 1 - pow(1 - horizontalPhase, 2);
    const horizontalOvershoot = horizontalPhase < 1 ? sin(horizontalPhase * PI) * 0.05 : 0;
    let widthScale = horizontalEase * (1 + horizontalOvershoot);
    
    const verticalEase = 1 - pow(1 - verticalPhase, 3);
    const verticalOvershoot = (verticalPhase > 0.8 && verticalPhase < 1) 
      ? sin((verticalPhase - 0.8) / 0.2 * PI) * 0.2 : 0;
    let heightScale = verticalEase * (1 + verticalOvershoot);
    
    // Apply settling phase
    if (settlePhase > 0) {
      const settleAmount = settlePhase * 0.3;
      widthScale = lerp(widthScale, 0.98, settleAmount);
      heightScale = lerp(heightScale, 0.98, settleAmount);
    }
    
    const currentWidth = width * widthScale;
    const currentHeight = max(height * heightScale, 1);
    
    g.push();
    g.rectMode(CENTER);
    
    // Draw effects
    this.drawDarkenEffect(g, progress, centerX, centerY, currentWidth, currentHeight, width, height);
    this.drawGlowEffect(g, progress, centerX, centerY, currentWidth, currentHeight, palette);
    this.drawCenterLine(g, progress, centerX, centerY, currentWidth, palette);
    this.drawWarmupText(g, progress, centerX, centerY, palette);
    this.drawStaticNoise(g, progress, centerX, centerY, currentWidth, currentHeight, palette);
    
    g.pop();
  }

  drawDarkenEffect(g, progress, centerX, centerY, currentWidth, currentHeight, fullWidth, fullHeight) {
    const darkenAmount = progress < 0.9 ? 0.95 : 1 - ((progress - 0.9) / 0.1);
    if (darkenAmount <= 0.05) return;
    
    g.fill(0);
    g.noStroke();
    g.drawingContext.globalAlpha = darkenAmount * 0.9;
    
    if (currentHeight < fullHeight) {
      const gapHeight = (fullHeight - currentHeight) / 2;
      g.rect(centerX, centerY - currentHeight/2 - gapHeight/2, fullWidth, gapHeight);
      g.rect(centerX, centerY + currentHeight/2 + gapHeight/2, fullWidth, gapHeight);
    }
    
    if (currentWidth < fullWidth) {
      const gapWidth = (fullWidth - currentWidth) / 2;
      g.rect(centerX - currentWidth/2 - gapWidth/2, centerY, gapWidth, currentHeight);
      g.rect(centerX + currentWidth/2 + gapWidth/2, centerY, gapWidth, currentHeight);
    }
  }

  drawGlowEffect(g, progress, centerX, centerY, currentWidth, currentHeight, palette) {
    if (progress >= 0.9) return;
    
    const glowIntensity = 0.4 * (1 - progress / 0.9);
    for (let i = 0; i < 3; i++) {
      const glowSize = (i + 1) * 4;
      g.noFill();
      g.stroke(palette.FG);
      g.strokeWeight(2);
      g.drawingContext.globalAlpha = glowIntensity * (1 - i * 0.3);
      g.rect(centerX, centerY, currentWidth + glowSize * 2, currentHeight + glowSize * 2);
    }
  }

  drawCenterLine(g, progress, centerX, centerY, currentWidth, palette) {
    if (progress >= 0.15) return;
    
    g.stroke(palette.SELECT);
    g.strokeWeight(2);
    g.drawingContext.globalAlpha = 0.8 * (1 - progress / 0.15);
    g.line(centerX - currentWidth/2, centerY, centerX + currentWidth/2, centerY);
  }

  drawWarmupText(g, progress, centerX, centerY, palette) {
    if (progress >= 0.4) return;
    
    g.fill(palette.FG);
    g.noStroke();
    g.textFont('IBM Plex Mono');
    g.textSize(16);
    g.textAlign(CENTER, CENTER);
    const brightness = progress < 0.5 ? 0.3 + (progress / 0.5) * 0.7 : 1.0;
    g.drawingContext.globalAlpha = sin(progress / 0.4 * PI) * brightness * 0.8;
    g.text('WARMING UP...', centerX, centerY);
  }

  drawStaticNoise(g, progress, centerX, centerY, currentWidth, currentHeight, palette) {
    if (progress >= 0.8 || currentHeight <= 10) return;
    
    g.drawingContext.globalAlpha = 0.2 * (1 - progress / 0.8);
    for (let i = 0; i < 100; i++) {
      const x = centerX + random(-currentWidth/2, currentWidth/2);
      const y = centerY + random(-currentHeight/2, currentHeight/2);
      g.stroke(random() > 0.5 ? palette.FG : palette.BG);
      g.strokeWeight(1);
      g.point(x, y);
    }
  }

  drawOscilloscopeEffects(g, palette, deltaTime) {
    this.vhsTime += deltaTime / 1000;
    
    this.updateVHSJitter(deltaTime);
    this.updateTapeWrinkle(deltaTime);
    
    if (this.vhsJitter.current > 0.1) g.push();
    if (this.vhsJitter.current > 0.1) g.translate(this.vhsJitter.current, 0);
    
    this.drawTapeWrinkle(g, palette);
    this.drawHeadSwitchingNoise(g, palette);
    this.drawPopLines(g, palette);
    this.drawScreenFlicker(g, palette);
    this.drawEdgeGlow(g, palette);
    
    if (this.vhsJitter.current > 0.1) g.pop();
  }

  updateVHSJitter(deltaTime) {
    const jitter = this.vhsJitter;
    
    if (jitter.active) {
      const step = (deltaTime / 1000) * jitter.size / jitter.period;
      jitter.current += step;
      
      if (jitter.current >= jitter.size || jitter.current <= 0) {
        jitter.active = false;
        jitter.current = constrain(jitter.current, 0, jitter.size);
        jitter.startTime = this.vhsTime + random(2, 8);
      }
    } else if (this.vhsTime > jitter.startTime) {
      jitter.size = random(1, 8);
      jitter.period = random(0.1, 0.5);
      jitter.current = 0;
      jitter.active = true;
    }
  }

  updateTapeWrinkle(deltaTime) {
    const wrinkle = this.vhsTapeWrinkle;
    
    if (wrinkle.active) {
      wrinkle.position -= (deltaTime / 1000) * 0.3;
      if (wrinkle.position < -0.2) wrinkle.active = false;
    } else if (random() < 0.001 * (deltaTime / 16.67)) {
      wrinkle.position = 1.2;
      wrinkle.size = random(0.03, 0.08);
      wrinkle.active = true;
    }
  }

  drawTapeWrinkle(g, palette) {
    const wrinkle = this.vhsTapeWrinkle;
    if (!wrinkle.active || wrinkle.position <= 0 || wrinkle.position >= 1) return;
    
    const wrinkleY = wrinkle.position * g.height;
    const wrinkleHeight = wrinkle.size * g.height;
    
    g.push();
    g.strokeWeight(1);
    
    for (let y = wrinkleY - wrinkleHeight/2; y < wrinkleY + wrinkleHeight/2; y += 1) {
      if (random() > 0.7) {
        const displacement = sin((y / 10) + this.vhsTime * 3) * 4;
        g.stroke(random() > 0.5 ? palette.FG : palette.BG);
        g.drawingContext.globalAlpha = random(0.1, 0.3);
        const x = random(g.width);
        const w = random(5, 20);
        g.line(x + displacement, y, x + w + displacement, y);
      }
    }
    
    g.noStroke();
    g.fill(palette.FG);
    g.drawingContext.globalAlpha = 0.05;
    g.rect(0, wrinkleY - wrinkleHeight/2, g.width, wrinkleHeight);
    g.pop();
  }

  drawHeadSwitchingNoise(g, palette) {
    const headSwitchY = (sin(this.vhsTime * 0.5) * 0.3 + 0.7) * g.height;
    const thickness = 15;
    
    g.push();
    g.noStroke();
    
    g.fill(palette.FG);
    g.drawingContext.globalAlpha = 0.2;
    g.rect(this.vhsJitter.current * 1.5, headSwitchY, g.width, thickness);
    
    g.fill(palette.SELECT);
    g.drawingContext.globalAlpha = 0.15;
    const secondaryOffset = sin(this.vhsTime * 2) * 20;
    g.rect(secondaryOffset, headSwitchY - thickness, g.width, thickness * 0.6);
    
    g.drawingContext.globalAlpha = 0.4;
    for (let i = 0; i < 100; i++) {
      const x = random(g.width);
      const y = headSwitchY + random(-thickness, thickness);
      g.fill(random() > 0.5 ? palette.FG : palette.BG);
      g.rect(x, y, random(2, 6), 1);
    }
    g.pop();
  }

  drawPopLines(g, palette) {
    if (random() >= 0.01) return;
    
    const popY = random(g.height);
    const popWidth = random(g.width * 0.3, g.width);
    const popX = random(0, g.width - popWidth);
    
    g.push();
    g.stroke(palette.FG);
    g.strokeWeight(random(1, 3));
    g.drawingContext.globalAlpha = 0.8;
    g.line(popX, popY, popX + popWidth, popY);
    
    g.strokeWeight(1);
    g.drawingContext.globalAlpha = 0.3;
    g.line(popX, popY - 1, popX + popWidth, popY - 1);
    g.line(popX, popY + 1, popX + popWidth, popY + 1);
    g.pop();
  }

  drawScreenFlicker(g, palette) {
    if (frameCount % 120 === 0) {
      this.flickerAmount = random(0.02, 0.05);
    } else {
      this.flickerAmount *= 0.95;
    }
    
    if (this.flickerAmount <= 0.01) return;
    
    g.push();
    g.noStroke();
    g.fill(palette.FG);
    g.drawingContext.globalAlpha = this.flickerAmount;
    g.rect(0, 0, g.width, g.height);
    g.pop();
  }

  drawEdgeGlow(g, palette) {
    g.push();
    g.noFill();
    g.stroke(palette.FG);
    g.strokeWeight(1);
    g.drawingContext.globalAlpha = 0.1;
    g.rect(2, 2, g.width - 4, g.height - 4);
    g.rect(4, 4, g.width - 8, g.height - 8);
    g.pop();
  }
}
