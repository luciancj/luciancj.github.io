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
    g.textFont('IBM Plex Mono');
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
