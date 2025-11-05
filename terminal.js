// Terminal Configuration
const config = {
    user: 'Lucian Cojocaru',
    role: 'Full Stack Developer',
    location: 'Romania',
    email: 'lucian@example.com',
    github: 'https://github.com/luciancj',
    linkedin: 'https://linkedin.com/in/luciancojocaru'
};

// Projects Data
const projects = [
    {
        name: 'Macrodata Refinement',
        description: 'A Severance-inspired interactive data refinement game built with p5.js',
        tech: ['JavaScript', 'p5.js', 'WebGL'],
        link: 'https://github.com/Lumon-Industries/Macrodata-Refinement'
    },
    {
        name: 'Portfolio Terminal',
        description: 'This retro terminal-style portfolio website',
        tech: ['HTML', 'CSS', 'JavaScript'],
        link: 'https://github.com/luciancj/luciancj.github.io'
    }
    // Add more projects here
];

// Skills Data
const skills = {
    'Languages': ['JavaScript', 'Python', 'Java', 'C++', 'HTML/CSS'],
    'Frameworks': ['React', 'Node.js', 'Express', 'p5.js'],
    'Tools': ['Git', 'Docker', 'VS Code', 'Linux'],
    'Databases': ['MongoDB', 'PostgreSQL', 'MySQL']
};

// Terminal State
let commandHistory = [];
let historyIndex = -1;
const output = document.getElementById('terminal-output');
const input = document.getElementById('terminal-input');

// ASCII Art
const asciiArt = `
    ██╗     ██╗   ██╗ ██████╗██╗ █████╗ ███╗   ██╗
    ██║     ██║   ██║██╔════╝██║██╔══██╗████╗  ██║
    ██║     ██║   ██║██║     ██║███████║██╔██╗ ██║
    ██║     ██║   ██║██║     ██║██╔══██║██║╚██╗██║
    ███████╗╚██████╔╝╚██████╗██║██║  ██║██║ ╚████║
    ╚══════╝ ╚═════╝  ╚═════╝╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
`;

// Commands
const commands = {
    help: {
        description: 'List all available commands',
        execute: () => {
            let helpText = '<div class="output-line info">Available commands:</div>';
            helpText += '<div class="command-list">';
            Object.keys(commands).forEach(cmd => {
                helpText += `<div class="command-name">${cmd}</div>`;
                helpText += `<div class="command-desc">${commands[cmd].description}</div>`;
            });
            helpText += '</div>';
            return helpText;
        }
    },
    
    about: {
        description: 'Learn more about me',
        execute: () => {
            return `
                <div class="output-line info">About Me</div>
                <div class="output-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                <div class="output-line">Name: ${config.user}</div>
                <div class="output-line">Role: ${config.role}</div>
                <div class="output-line">Location: ${config.location}</div>
                <div class="output-line">Email: ${config.email}</div>
                <div class="output-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                <div class="output-line">I'm a passionate developer who loves creating</div>
                <div class="output-line">interactive experiences and elegant solutions.</div>
                <div class="output-line">Currently exploring web technologies and creative coding.</div>
            `;
        }
    },
    
    projects: {
        description: 'View my projects',
        execute: () => {
            let projectText = '<div class="output-line info">Projects</div>';
            projectText += '<div class="output-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>';
            
            projects.forEach((project, index) => {
                projectText += `
                    <div class="project-item">
                        <div class="project-title">${index + 1}. ${project.name}</div>
                        <div class="output-line">${project.description}</div>
                        <div class="output-line">Tech: ${project.tech.join(', ')}</div>
                        <div class="output-line">Link: <a href="${project.link}" target="_blank" class="project-link">${project.link}</a></div>
                    </div>
                `;
            });
            
            return projectText;
        }
    },
    
    skills: {
        description: 'View my technical skills',
        execute: () => {
            let skillText = '<div class="output-line info">Technical Skills</div>';
            skillText += '<div class="output-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>';
            
            Object.keys(skills).forEach(category => {
                skillText += `<div class="output-line success">${category}:</div>`;
                skillText += `<div class="output-line">  ${skills[category].join(' • ')}</div>`;
                skillText += '<br>';
            });
            
            return skillText;
        }
    },
    
    contact: {
        description: 'Get in touch with me',
        execute: () => {
            return `
                <div class="output-line info">Contact Information</div>
                <div class="output-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                <div class="output-line">📧 Email: <a href="mailto:${config.email}" class="project-link">${config.email}</a></div>
                <div class="output-line">💼 GitHub: <a href="${config.github}" target="_blank" class="project-link">${config.github}</a></div>
                <div class="output-line">🔗 LinkedIn: <a href="${config.linkedin}" target="_blank" class="project-link">${config.linkedin}</a></div>
                <div class="output-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                <div class="output-line">Feel free to reach out for collaborations or opportunities!</div>
            `;
        }
    },
    
    clear: {
        description: 'Clear the terminal',
        execute: () => {
            output.innerHTML = '';
            return '';
        }
    },
    
    banner: {
        description: 'Display welcome banner',
        execute: () => {
            return `
                <div class="ascii-art">${asciiArt}</div>
                <div class="output-line success">Welcome to my portfolio!</div>
                <div class="output-line">Type 'help' to see available commands.</div>
            `;
        }
    },
    
    whoami: {
        description: 'Display current user info',
        execute: () => {
            return `<div class="output-line">${config.user} - ${config.role}</div>`;
        }
    },
    
    date: {
        description: 'Display current date and time',
        execute: () => {
            return `<div class="output-line">${new Date().toString()}</div>`;
        }
    },
    
    echo: {
        description: 'Echo back the input text',
        execute: (args) => {
            return `<div class="output-line">${args.join(' ')}</div>`;
        }
    },
    
    github: {
        description: 'Open GitHub profile',
        execute: () => {
            window.open(config.github, '_blank');
            return `<div class="output-line success">Opening GitHub profile...</div>`;
        }
    },
    
    linkedin: {
        description: 'Open LinkedIn profile',
        execute: () => {
            window.open(config.linkedin, '_blank');
            return `<div class="output-line success">Opening LinkedIn profile...</div>`;
        }
    }
};

// Initialize Terminal
function init() {
    input.focus();
    printOutput(commands.banner.execute());
    
    // Refocus input when clicking anywhere
    document.addEventListener('click', () => {
        input.focus();
    });
}

// Print output to terminal
function printOutput(text) {
    if (text) {
        output.innerHTML += text;
        // Scroll to bottom
        const terminalBody = document.querySelector('.terminal-body');
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }
}

// Print command
function printCommand(cmd) {
    printOutput(`<div class="output-line command">visitor@lucian:~$ ${cmd}</div>`);
}

// Execute command
function executeCommand(commandLine) {
    const args = commandLine.trim().split(' ');
    const command = args[0].toLowerCase();
    const params = args.slice(1);
    
    printCommand(commandLine);
    
    if (command === '') {
        return;
    }
    
    if (commands[command]) {
        const result = commands[command].execute(params);
        printOutput(result);
    } else {
        printOutput(`<div class="output-line error">Command not found: ${command}</div>`);
        printOutput(`<div class="output-line">Type 'help' to see available commands.</div>`);
    }
}

// Handle keyboard input
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const command = input.value;
        if (command.trim() !== '') {
            commandHistory.push(command);
            historyIndex = commandHistory.length;
            executeCommand(command);
        }
        input.value = '';
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            input.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            input.value = '';
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        const partial = input.value.toLowerCase();
        const matches = Object.keys(commands).filter(cmd => cmd.startsWith(partial));
        if (matches.length === 1) {
            input.value = matches[0];
        } else if (matches.length > 1) {
            printCommand(input.value);
            printOutput(`<div class="output-line">${matches.join('  ')}</div>`);
        }
    }
});

// Handle paste
input.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    input.value += text;
});

// Prevent zoom on mobile
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// Initialize on load
window.addEventListener('load', init);
