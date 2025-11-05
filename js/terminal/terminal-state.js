// Terminal state management
class TerminalState {
  constructor() {
    this.output = [];
    this.currentInput = '';
    this.commandHistory = [];
    this.historyIndex = -1;
    this.cursorBlink = true;
    this.lastBlinkTime = 0;
    this.scrollOffset = 0;
    this.currentPath = '~';
    this.currentRepo = null;
  }

  addOutput(text, color = null) {
    this.output.push({
      text: text,
      color: color || palette.FG
    });
    
    // Keep only last 100 lines
    if (this.output.length > 100) {
      this.output.shift();
    }
    
    // Auto-scroll to bottom when new content is added
    this.scrollOffset = this.output.length;
  }

  clearOutput() {
    this.output = [];
  }

  addToHistory(command) {
    this.commandHistory.push(command);
    this.historyIndex = this.commandHistory.length;
  }

  getPreviousCommand() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      return this.commandHistory[this.historyIndex];
    }
    return this.currentInput;
  }

  getNextCommand() {
    if (this.historyIndex < this.commandHistory.length - 1) {
      this.historyIndex++;
      return this.commandHistory[this.historyIndex];
    } else {
      this.historyIndex = this.commandHistory.length;
      return '';
    }
  }
}
