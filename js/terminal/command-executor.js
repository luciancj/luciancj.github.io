// Terminal command execution
class CommandExecutor {
  constructor(terminal, portfolioData) {
    this.terminal = terminal;
    this.portfolioData = portfolioData;
    this.githubReposLoaded = false;
  }

  // Helper methods
  output(lines, color) {
    this.terminal.addOutput('');
    lines.forEach(line => this.terminal.addOutput(line, color));
    this.terminal.addOutput('');
  }

  outputSection(title, lines, titleColor = palette.SELECT) {
    this.terminal.addOutput('');
    if (title) this.terminal.addOutput(title, titleColor);
    lines.forEach(line => this.terminal.addOutput(line));
    this.terminal.addOutput('');
  }

  formatList(items, formatter = item => `• ${item}`) {
    return items.map(formatter);
  }

  openLink(url, message) {
    this.output([message, ''], palette.SELECT);
    window.open(url, '_blank');
  }

  execute(cmd) {
    let originalCmd = cmd.trim();
    cmd = originalCmd.toLowerCase();
    
    this.terminal.addOutput('> ' + originalCmd, palette.SELECT);
    
    if (cmd === '') {
      return;
    }

    // Route to appropriate command handler
    const commandMap = {
      'help': () => this.showHelp(),
      'about': () => this.showAbout(),
      'education': () => this.showEducation(),
      'experience': () => this.showExperience(),
      'skills': () => this.showSkills(),
      'certifications': () => this.showCertifications(),
      'certs': () => this.showCertifications(),
      'focus': () => this.showFocus(),
      'languages': () => this.showLanguages(),
      'projects': () => this.showProjects(),
      'contact': () => this.showContact(),
      'pwd': () => this.showPwd(),
      'ls': () => this.handleLs(),
      'tree': () => this.handleTree(),
      'clear': () => this.terminal.clearOutput(),
      'github': () => this.openGithub(),
      'linkedin': () => this.openLinkedin()
    };

    // Handle commands with arguments
    if (cmd.startsWith('cd ')) {
      let target = originalCmd.substring(3).trim();
      this.handleCd(target);
    } else if (cmd.startsWith('open ')) {
      let filename = originalCmd.substring(5).trim();
      this.handleOpen(filename);
    } else if (commandMap[cmd]) {
      commandMap[cmd]();
    } else {
      this.terminal.addOutput(`Command not found: ${originalCmd}`, '#ff4444');
      this.terminal.addOutput('Type "help" for available commands');
      this.terminal.addOutput('');
    }
  }

  showHelp() {
    const commands = [
      ['help', 'Show this help message'],
      ['about', 'About me'],
      ['education', 'Education details'],
      ['experience', 'Work experience'],
      ['skills', 'Technical skills'],
      ['certifications', 'Certifications & courses'],
      ['focus', 'Current focus areas'],
      ['languages', 'Spoken languages'],
      ['projects', 'View my GitHub projects'],
      ['contact', 'Contact information'],
      ['ls', 'List files/directories'],
      ['tree', 'Show directory tree'],
      ['cd <dir>', 'Change directory'],
      ['pwd', 'Print working directory'],
      ['open <file>', 'Open file on GitHub'],
      ['clear', 'Clear terminal'],
      ['github', 'Open GitHub profile'],
      ['linkedin', 'Open LinkedIn profile']
    ];
    
    this.outputSection('Available commands:', commands.map(([cmd, desc]) => 
      `  ${cmd.padEnd(14)} - ${desc}`
    ));
  }

  showAbout() {
    const { name, role, location, specialization } = this.portfolioData;
    this.outputSection(name, [
      role,
      '',
      `Location: ${location}`,
      `Specialization: ${specialization}`,
      '',
      'I am a Computer Science Engineering student passionate about',
      'GPU programming, high-performance computing, and building',
      'elegant solutions to complex problems.'
    ]);
  }

  showEducation() {
    const { education, degree, period } = this.portfolioData;
    this.outputSection('Education:', [
      '', education, `${degree} (${period})`, '',
      'Relevant Coursework:',
      ...this.formatList(['Algorithms & Data Structures', 'Database Systems', 
                          'Hardware Security', 'High-Performance Computing'])
    ]);
  }

  showExperience() {
    const { title, company, location, type, period, responsibilities } = this.portfolioData.experience;
    this.outputSection('Professional Experience:', [
      '', title, `${company} | ${location}`, `${type} | ${period}`, '',
      ...this.formatList(responsibilities)
    ]);
  }

  showSkills() {
    const categories = [
      ['Programming Languages:', 'programming'],
      ['GPU & High-Performance Computing:', 'gpu_hpc'],
      ['Cloud & DevOps:', 'cloud_devops'],
      ['Networking:', 'networking'],
      ['Databases:', 'databases'],
      ['Tools:', 'tools']
    ];
    
    this.terminal.addOutput('');
    this.terminal.addOutput('Technical Skills:', palette.SELECT);
    categories.forEach(([title, key]) => {
      this.terminal.addOutput('');
      this.terminal.addOutput(title, palette.SELECT);
      this.terminal.addOutput(`  ${this.portfolioData.skills[key]}`);
    });
    this.terminal.addOutput('');
  }

  showCertifications() {
    this.terminal.addOutput('');
    this.terminal.addOutput('Certifications & Online Courses:', palette.SELECT);
    this.terminal.addOutput('');
    
    this.portfolioData.certifications.forEach((cert, i, arr) => {
      this.terminal.addOutput(`${i + 1}. ${cert.name}`, palette.SELECT);
      
      const details = [cert.issuer, '—', cert.year];
      if (cert.level) details.push(`(${cert.level})`);
      if (cert.expires) details.push(`(expires ${cert.expires})`);
      this.terminal.addOutput(`   ${details.join(' ')}`);
      
      if (cert.url) this.terminal.addOutput(`   ${cert.url}`, palette.FG);
      if (i < arr.length - 1) this.terminal.addOutput('');
    });
    this.terminal.addOutput('');
  }

  showFocus() {
    this.outputSection('Current Focus Areas:', this.formatList(this.portfolioData.currentFocus));
  }

  showLanguages() {
    const { languages, nationality, drivingLicenses } = this.portfolioData;
    this.outputSection('Languages & Additional Info:', [
      `Mother Tongue: ${languages.motherTongue}`,
      `Other Languages: ${languages.other}`,
      '', `Nationality: ${nationality}`, `Driving Licenses: ${drivingLicenses}`
    ]);
  }

  showProjects() {
    if (!this.githubReposLoaded) return this.output(['Loading projects from GitHub...']);
    if (this.portfolioData.projects.length === 0) return this.output(['No projects found']);
    
    this.terminal.addOutput('');
    this.terminal.addOutput(`My Projects (${this.portfolioData.projects.length} total):`, palette.SELECT);
    this.terminal.addOutput('');
    
    this.portfolioData.projects.forEach((proj, i) => {
      const badges = [proj.language && `[${proj.language}]`, proj.stars > 0 && `⭐${proj.stars}`]
        .filter(Boolean).join(' ');
      this.terminal.addOutput(`${i + 1}. ${proj.name} ${badges}`, palette.SELECT);
      this.terminal.addOutput(`   ${proj.desc}`);
      if (proj.updated) this.terminal.addOutput(`   Last updated: ${proj.updated}`, palette.FG);
      this.terminal.addOutput(`   ${proj.link}`, palette.FG);
      this.terminal.addOutput('');
    });
  }

  showContact() {
    const { email, phone, github, linkedin, location } = this.portfolioData;
    this.outputSection('Contact Information:', 
      [['Email:', email], ['Phone:', phone], ['GitHub:', github], 
       ['LinkedIn:', linkedin], ['Location:', location]]
        .map(([label, value]) => `${label.padEnd(10)} ${value}`)
    );
  }

  showPwd() {
    this.output([this.terminal.currentPath]);
  }

  openGithub() {
    this.openLink(this.portfolioData.github, 'Opening GitHub profile...');
  }

  openLinkedin() {
    this.openLink(this.portfolioData.linkedin, 'Opening LinkedIn profile...');
  }

  // File system commands
  handleLs() {
    const path = this.terminal.currentPath;
    this.terminal.addOutput('');
    
    if (path === '~') {
      this.terminal.addOutput('projects/', palette.SELECT);
    } else if (path === '~/projects') {
      if (!this.githubReposLoaded) {
        this.terminal.addOutput('Loading repositories from GitHub...', palette.SELECT);
      } else if (this.portfolioData.projects.length === 0) {
        this.terminal.addOutput('(empty)');
      } else {
        this.terminal.addOutput(`Total: ${this.portfolioData.projects.length} repositories`, palette.SELECT);
        this.terminal.addOutput('');
        this.portfolioData.projects.forEach(proj => {
          const badges = [proj.language && `[${proj.language}]`, proj.stars > 0 && `⭐${proj.stars}`]
            .filter(Boolean).join(' ');
          this.terminal.addOutput(`${proj.name}/${badges ? ' ' + badges : ''}`, palette.FG);
        });
      }
    } else if (this.terminal.currentRepo) {
      this.output(['Fetching files from GitHub...', 'Use "open <filename>" to view files on GitHub', 
                   '', 'Common files:', '  README.md', '  index.html', '  package.json', '  .gitignore'], palette.SELECT);
      return;
    }
    this.terminal.addOutput('');
  }

  handleTree() {
    const drawTree = (items, indent = '') => {
      items.forEach((item, i) => {
        const isLast = i === items.length - 1;
        const prefix = indent + (isLast ? '└── ' : '├── ');
        this.terminal.addOutput(prefix + item + '/', palette.FG);
      });
    };

    this.terminal.addOutput('');
    const path = this.terminal.currentPath;
    
    if (path === '~') {
      this.terminal.addOutput('~', palette.SELECT);
      this.terminal.addOutput('└── projects/', palette.FG);
      if (this.portfolioData.projects.length > 0) {
        drawTree(this.portfolioData.projects.map(p => p.name), '    ');
      }
    } else if (path === '~/projects') {
      this.terminal.addOutput('~/projects', palette.SELECT);
      if (this.portfolioData.projects.length === 0) {
        this.terminal.addOutput('(empty)');
      } else {
        drawTree(this.portfolioData.projects.map(p => p.name));
      }
    } else if (this.terminal.currentRepo) {
      const structure = ['README.md', 'index.html', 'package.json', 'src/', 
                        '│   ├── components/', '│   ├── styles/', '│   └── utils/',
                        'public/', '│   └── assets/', '.gitignore'];
      this.terminal.addOutput(path, palette.SELECT);
      structure.forEach((item, i) => {
        const prefix = i < structure.length - 1 && !item.startsWith('│') ? '├── ' : 
                      item.startsWith('│') ? '' : '└── ';
        this.terminal.addOutput(prefix + item, palette.FG);
      });
      this.terminal.addOutput('');
      this.terminal.addOutput('Use "open <filename>" to view files on GitHub', palette.SELECT);
    }
    this.terminal.addOutput('');
  }

  handleCd(target) {
    const setPath = (path, repo = null) => {
      this.terminal.currentPath = path;
      this.terminal.currentRepo = repo;
      this.terminal.addOutput('');
    };

    if (target === '~' || target === '') return setPath('~');
    
    if (target === '..' || target === '../') {
      if (this.terminal.currentPath.includes('/')) {
        const parts = this.terminal.currentPath.split('/');
        parts.pop();
        const newPath = parts.join('/') || '~';
        return setPath(newPath, newPath.includes('projects/') ? this.terminal.currentRepo : null);
      }
      return setPath('~');
    }
    
    if (target === 'projects' && this.terminal.currentPath === '~') {
      return setPath('~/projects');
    }
    
    if (this.terminal.currentPath === '~/projects') {
      if (!this.githubReposLoaded) {
        return this.output(['Still loading repositories from GitHub...', 
                           'Please wait a moment and try again.'], palette.SELECT);
      }
      
      const normalizedTarget = target.toLowerCase().replace(/\/$/, '');
      const project = this.portfolioData.projects.find(p => {
        const name = p.name.toLowerCase();
        return name === normalizedTarget || 
               name.replace(/\s+/g, '-') === normalizedTarget ||
               name.replace(/-/g, '_') === normalizedTarget ||
               (name.startsWith(normalizedTarget) && normalizedTarget.length > 3);
      });
      
      if (project) {
        this.terminal.currentPath = `~/projects/${project.name}`;
        this.terminal.currentRepo = project.repo;
        return this.output([`Entered repository: ${project.name}`, `GitHub: ${project.link}`,
                           'Use "ls" to see files, "open <file>" to view on GitHub'], palette.SELECT);
      }
      return this.output([`cd: ${target}: No such directory`, 
                         'Try "ls" to see available repositories'], '#ff4444');
    }
    
    this.output([`cd: ${target}: No such directory`], '#ff4444');
  }

  handleOpen(filename) {
    if (!this.terminal.currentRepo) {
      return this.output(['Not in a repository. Use "cd projects/<repo-name>" first'], '#ff4444');
    }
    if (!filename) {
      return this.output(['Usage: open <filename>'], '#ff4444');
    }
    
    const url = `https://github.com/${this.terminal.currentRepo}/blob/main/${filename}`;
    this.output([`Opening ${filename} on GitHub...`, url], palette.SELECT);
    window.open(url, '_blank');
  }
}
