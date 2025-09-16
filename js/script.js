/**
 * Terminal Portfolio JavaScript
 * Author: Matthias Abddisa
 * Version: 2.0
 * Description: Advanced terminal interface for portfolio website
 */

class AdvancedTerminalPortfolio {
    constructor() {
        this.commandInput = document.getElementById('commandInput');
        this.output = document.getElementById('output');
        this.terminalBody = document.getElementById('terminalBody');
        this.autocompleteSuggestions = document.getElementById('autocompleteSuggestions');
        this.commandHistory = [];
        this.historyIndex = -1;
        this.suggestionIndex = -1;

        // Command registry - maps command names to their handler functions
        this.commands = {
            help: this.showHelp.bind(this),
            about: this.showAbout.bind(this),
            skills: this.showSkills.bind(this),
            experience: this.showExperience.bind(this),
            projects: this.showProjects.bind(this),
            contact: this.showContact.bind(this),
            clear: this.clearTerminal.bind(this),
            whoami: this.whoami.bind(this),
            ls: this.listItems.bind(this),
            cat: this.catCommand.bind(this),
            sudo: this.sudoCommand.bind(this),
            matrix: this.toggleMatrix.bind(this),
            welcome: this.showWelcome.bind(this),
            neofetch: this.neofetch.bind(this),
            status: this.showStatus.bind(this),
            portfolio: this.showPortfolio.bind(this)
        };

        this.matrixEnabled = false;
        this.init();
    }

    /**
     * Initialize the terminal interface
     */
    init() {
        this.commandInput.focus();
        this.commandInput.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.commandInput.addEventListener('input', this.handleInput.bind(this));
        this.commandInput.addEventListener('blur', () => {
            setTimeout(() => this.commandInput.focus(), 100);
        });
        
        this.createEnhancedEffects();
        
        // Focus input when clicking anywhere
        document.addEventListener('click', () => this.commandInput.focus());
        
        // Show initial loading animation
        this.showLoadingAnimation();
    }

    /**
     * Display initial loading animation
     */
    showLoadingAnimation() {
        setTimeout(() => {
            this.addOutput('Loading portfolio modules...', 'info');
            this.addOutput('<div class="loading">Initializing <div class="loading-dots"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div></div>');
            
            setTimeout(() => {
                this.addOutput('✅ All systems operational!', 'success');
            }, 2000);
        }, 1000);
    }

    /**
     * Handle input field changes for autocomplete
     */
    handleInput(event) {
        const value = event.target.value;
        this.showAutocomplete(value);
    }

    /**
     * Show autocomplete suggestions
     */
    showAutocomplete(input) {
        if (!input.trim()) {
            this.autocompleteSuggestions.style.display = 'none';
            return;
        }

        const matches = Object.keys(this.commands).filter(cmd => 
            cmd.toLowerCase().startsWith(input.toLowerCase())
        );

        if (matches.length > 0) {
            this.autocompleteSuggestions.innerHTML = matches
                .map((cmd, index) => 
                    `<div class="suggestion-item ${index === this.suggestionIndex ? 'highlighted' : ''}" data-command="${cmd}">
                        ${cmd}
                        <span style="color: var(--text-dim); margin-left: 1rem;">${this.getCommandDescription(cmd)}</span>
                    </div>`
                ).join('');
            
            this.autocompleteSuggestions.style.display = 'block';
            
            // Add click handlers for suggestions
            this.autocompleteSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.commandInput.value = item.dataset.command;
                    this.autocompleteSuggestions.style.display = 'none';
                    this.commandInput.focus();
                });
            });
        } else {
            this.autocompleteSuggestions.style.display = 'none';
        }
    }

    /**
     * Get description for command autocomplete
     */
    getCommandDescription(cmd) {
        const descriptions = {
            help: 'Show all commands',
            about: 'About Matthias',
            skills: 'Technical skills',
            experience: 'Work history',
            projects: 'Featured projects',
            contact: 'Contact info',
            whoami: 'Current user',
            ls: 'List files',
            clear: 'Clear screen',
            matrix: 'Toggle effects',
            neofetch: 'System info',
            status: 'System status',
            portfolio: 'Quick overview'
        };
        return descriptions[cmd] || 'Command';
    }

    /**
     * Handle keyboard input
     */
    handleKeyDown(event) {
        switch(event.key) {
            case 'Enter':
                this.autocompleteSuggestions.style.display = 'none';
                this.executeCommand();
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (this.autocompleteSuggestions.style.display === 'block') {
                    this.navigateSuggestions(-1);
                } else {
                    this.navigateHistory(-1);
                }
                break;
            case 'ArrowDown':
                event.preventDefault();
                if (this.autocompleteSuggestions.style.display === 'block') {
                    this.navigateSuggestions(1);
                } else {
                    this.navigateHistory(1);
                }
                break;
            case 'Tab':
                event.preventDefault();
                this.autoComplete();
                break;
            case 'Escape':
                this.autocompleteSuggestions.style.display = 'none';
                break;
        }
    }

    /**
     * Navigate autocomplete suggestions
     */
    navigateSuggestions(direction) {
        const items = this.autocompleteSuggestions.querySelectorAll('.suggestion-item');
        if (items.length === 0) return;

        items[this.suggestionIndex]?.classList.remove('highlighted');
        
        this.suggestionIndex += direction;
        if (this.suggestionIndex < 0) this.suggestionIndex = items.length - 1;
        if (this.suggestionIndex >= items.length) this.suggestionIndex = 0;

        items[this.suggestionIndex].classList.add('highlighted');
        this.commandInput.value = items[this.suggestionIndex].dataset.command;
    }

    /**
     * Execute the entered command
     */
    executeCommand() {
        const command = this.commandInput.value.trim();
        if (!command) return;

        this.addOutput(`<span class="prompt">matthias@portfolio:~$ </span><span class="user-input">${command}</span>`);
        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;

        const [cmd, ...args] = command.toLowerCase().split(' ');

        // Add loading effect for longer operations
        if (['skills', 'projects', 'experience'].includes(cmd)) {
            this.addOutput('<div class="loading">Loading data <div class="loading-dots"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div></div>');
            setTimeout(() => {
                this.output.removeChild(this.output.lastChild);
                this.executeCommandActual(cmd, args);
            }, 1000);
        } else {
            this.executeCommandActual(cmd, args);
        }

        this.commandInput.value = '';
        this.scrollToBottom();
    }

    /**
     * Execute command after loading animation
     */
    executeCommandActual(cmd, args) {
        if (this.commands[cmd]) {
            this.commands[cmd](args);
        } else {
            this.addOutput(`⚠️ Command not found: <span class="error">${cmd}</span>`, 'error');
            this.addOutput(`💡 Type <span class="user-input">help</span> for available commands.`, 'info');
        }
    }

    /**
     * Add output line to terminal
     */
    addOutput(content, className = '') {
        const line = document.createElement('div');
        line.className = `output-line ${className}`;
        line.innerHTML = content;
        this.output.appendChild(line);
    }

    /**
     * Scroll terminal to bottom
     */
    scrollToBottom() {
        setTimeout(() => {
            this.terminalBody.scrollTop = this.terminalBody.scrollHeight;
        }, 100);
    }

    /**
     * Display help command with all available commands
     */
    showHelp() {
        this.addOutput(`
            <div class="section-content">
                <div class="info">🎯 COMMAND INTERFACE - Available Commands</div>
                <div class="info">═══════════════════════════════════════════════</div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 1rem 0;">
                    <div>
                        <div class="cyan">📋 NAVIGATION</div>
                        <div style="margin-left: 1rem;">
                            <div><span class="user-input">about</span> ........ Learn about Matthias</div>
                            <div><span class="user-input">skills</span> ....... View technical skills</div>
                            <div><span class="user-input">experience</span> ... Work experience history</div>
                            <div><span class="user-input">projects</span> ..... Featured projects showcase</div>
                            <div><span class="user-input">contact</span> ...... Contact information</div>
                            <div><span class="user-input">portfolio</span> .... Quick overview</div>
                        </div>
                    </div>
                    
                    <div>
                        <div class="warning">⚡ SYSTEM</div>
                        <div style="margin-left: 1rem;">
                            <div><span class="user-input">whoami</span> ....... Current user info</div>
                            <div><span class="user-input">neofetch</span> ..... System information</div>
                            <div><span class="user-input">status</span> ....... System status</div>
                            <div><span class="user-input">ls</span> ........... List sections</div>
                            <div><span class="user-input">clear</span> ........ Clear terminal</div>
                            <div><span class="user-input">matrix</span> ....... Toggle effects</div>
                        </div>
                    </div>
                </div>
                
                <div class="success">🔥 PRO TIPS:</div>
                <div style="margin-left: 1rem;">
                    <div>• Use <span class="user-input">↑/↓</span> arrow keys for command history</div>
                    <div>• Press <span class="user-input">Tab</span> for auto-completion</div>
                    <div>• Type partial commands to see suggestions</div>
                    <div>• All commands are case-insensitive</div>
                </div>
            </div>
        `);
    }

    /**
     * Display about section
     */
    showAbout() {
        this.addOutput(`
            <div class="section-content">
                <div class="info">🚀 ABOUT MATTHIAS ABDDISA</div>
                <div class="info">══════════════════════════════════════</div>
                
                <div style="margin: 1rem 0;">
                    <div class="success">💼 PROFESSIONAL PROFILE</div>
                    <div style="margin-left: 1rem; padding: 1rem; background: rgba(0, 255, 65, 0.05); border-left: 3px solid var(--primary-green); border-radius: 5px;">
                        <div>🎯 <strong>Current Role:</strong> IT Director at A2Z Digital Media</div>
                        <div>🔧 <strong>Specialization:</strong> System Administration, Cybersecurity & Full-Stack Development</div>
                        <div>📍 <strong>Location:</strong> Addis Ababa, Ethiopia</div>
                        <div>🎓 <strong>Education:</strong> B.Sc. Computer Science - Debre Tabor University (2018-2022)</div>
                    </div>
                </div>

                <div style="margin: 1rem 0;">
                    <div class="cyan">⚡ CORE COMPETENCIES</div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 0.5rem 0;">
                        <div style="padding: 0.8rem; background: rgba(0, 255, 255, 0.05); border-radius: 8px;">
                            <div class="success">🖥️ System Administration</div>
                            <div style="font-size: 0.9rem; color: var(--text-dim);">Linux/Windows servers, network optimization, infrastructure management</div>
                        </div>
                        <div style="padding: 0.8rem; background: rgba(255, 0, 128, 0.05); border-radius: 8px;">
                            <div class="warning">🛡️ Cybersecurity</div>
                            <div style="font-size: 0.9rem; color: var(--text-dim);">WAZUH, Elasticsearch, threat detection, incident response</div>
                        </div>
                        <div style="padding: 0.8rem; background: rgba(0, 255, 65, 0.05); border-radius: 8px;">
                            <div class="info">🌐 Full-Stack Development</div>
                            <div style="font-size: 0.9rem; color: var(--text-dim);">React, Node.js, PHP, MySQL, responsive design</div>
                        </div>
                    </div>
                </div>

                <div style="margin: 1rem 0;">
                    <div class="warning">🎯 MISSION STATEMENT</div>
                    <div style="padding: 1rem; background: rgba(255, 136, 0, 0.05); border-radius: 8px; font-style: italic;">
                        "Dedicated to driving technological innovation through robust system administration, 
                        cutting-edge cybersecurity implementation, and scalable web development solutions. 
                        Passionate about continuous learning and staying ahead of emerging tech trends."
                    </div>
                </div>

                <div class="success">🔥 Ready to collaborate on your next big project!</div>
            </div>
        `);
    }

    /**
     * Display skills section with progress bars
     */
    showSkills() {
        this.addOutput(`
            <div class="section-content">
                <div class="info">💪 TECHNICAL SKILLS MATRIX</div>
                <div class="info">════════════════════════════════════</div>
                
                <div class="skill-bar">
                    <div class="skill-name">🎨 Frontend Development (HTML5, CSS3, JavaScript, React, Bootstrap)</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%; animation-delay: 0.2s;">
                            <span class="progress-text">90%</span>
                        </div>
                    </div>
                </div>

                <div class="skill-bar">
                    <div class="skill-name">⚙️ Backend Development (PHP, Node.js, MySQL, API Design)</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%; animation-delay: 0.4s;">
                            <span class="progress-text">85%</span>
                        </div>
                    </div>
                </div>

                <div class="skill-bar">
                    <div class="skill-name">🖥️ System Administration (Linux, Windows Server, Network Management)</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%; animation-delay: 0.6s;">
                            <span class="progress-text">92%</span>
                        </div>
                    </div>
                </div>

                <div class="skill-bar">
                    <div class="skill-name">🛡️ Cybersecurity (WAZUH, Elasticsearch, Kibana, Threat Detection)</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%; animation-delay: 0.8s;">
                            <span class="progress-text">87%</span>
                        </div>
                    </div>
                </div>

                <div class="skill-bar">
                    <div class="skill-name">🐳 DevOps & Containerization (Docker, CI/CD, Automation)</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%; animation-delay: 1.0s;">
                            <span class="progress-text">80%</span>
                        </div>
                    </div>
                </div>

                <div class="skill-bar">
                    <div class="skill-name">📝 CMS Development (WordPress, Custom Themes, Plugin Development)</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%; animation-delay: 1.2s;">
                            <span class="progress-text">88%</span>
                        </div>
                    </div>
                </div>

                <div style="margin: 2rem 0;">
                    <div class="cyan">🔧 ADDITIONAL EXPERTISE</div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1rem 0;">
                        <div>
                            <div class="success">📊 Management & Strategy</div>
                            <div style="margin-left: 1rem; font-size: 0.9rem;">
                                <div>• IT Strategy & Planning</div>
                                <div>• Project Management</div>
                                <div>• Team Leadership</div>
                                <div>• Vendor Management</div>
                            </div>
                        </div>
                        <div>
                            <div class="info">☁️ Cloud & Modern Tech</div>
                            <div style="margin-left: 1rem; font-size: 0.9rem;">
                                <div>• Cloud Technologies</div>
                                <div>• Data Analytics</div>
                                <div>• API Development</div>
                                <div>• Performance Optimization</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="warning">⚡ Skill levels based on real-world project experience and continuous learning!</div>
            </div>
        `);
        
        // Animate progress bars after adding content
        setTimeout(() => {
            const progressBars = document.querySelectorAll('.progress-fill');
            const widths = ['90%', '85%', '92%', '87%', '80%', '88%'];
            progressBars.forEach((bar, index) => {
                setTimeout(() => {
                    bar.style.width = widths[index];
                }, index * 200);
            });
        }, 100);
    }

    /**
     * Display experience section
     */
    showExperience() {
        this.addOutput(`
            <div class="section-content">
                <div class="info">💼 PROFESSIONAL EXPERIENCE</div>
                <div class="info">═══════════════════════════════════════</div>
                
                <div style="margin: 1.5rem 0;">
                    <div class="success">┌─🚀 IT Director @ A2Z Digital Media</div>
                    <div class="info">│  📅 Nov 2023 - Present  |  📍 Addis Ababa, Ethiopia</div>
                    <div style="margin-left: 1rem; padding: 1rem; background: rgba(0, 255, 65, 0.03); border-left: 2px solid var(--primary-green);">
                        <div>🎯 <strong>Key Achievements:</strong></div>
                        <div>• Led cross-functional IT teams driving innovation initiatives</div>
                        <div>• Architected high-availability systems achieving 99.9% uptime</div>
                        <div>• Developed strategic IT roadmaps aligned with business objectives</div>
                        <div>• Established comprehensive cybersecurity frameworks</div>
                        <div>• Optimized IT operations resulting in 25% cost reduction</div>
                        <div class="success">💰 Impact: Saved $50K+ annually through infrastructure optimization</div>
                    </div>
                    <div class="info">└─</div>
                </div>
                
                <div style="margin: 1.5rem 0;">
                    <div class="cyan">┌─⚙️ IT Associate @ AVIET LTD</div>
                    <div class="info">│  📅 Nov 2023 - Present  |  📍 Ethiopia</div>
                    <div style="margin-left: 1rem; padding: 1rem; background: rgba(0, 255, 255, 0.03); border-left: 2px solid var(--cyan);">
                        <div>🔧 <strong>Technical Contributions:</strong></div>
                        <div>• Advanced technical support for 200+ user enterprise environment</div>
                        <div>• Deployed and configured enterprise-grade server infrastructure</div>
                        <div>• Implemented robust security protocols and firewall configurations</div>
                        <div>• Optimized LAN/WAN performance across multiple locations</div>
                        <div>• Developed comprehensive IT documentation improving efficiency by 30%</div>
                        <div class="cyan">📈 Impact: Reduced system downtime by 60% through proactive monitoring</div>
                    </div>
                    <div class="info">└─</div>
                </div>
                
                <div style="margin: 1.5rem 0;">
                    <div class="warning">┌─💻 Web Developer (Internship)</div>
                    <div class="info">│  📅 Jul 2021 - Sep 2021  |  📍 Debre Markos, Ethiopia</div>
                    <div style="margin-left: 1rem; padding: 1rem; background: rgba(255, 136, 0, 0.03); border-left: 2px solid var(--orange);">
                        <div>🌐 <strong>Development Experience:</strong></div>
                        <div>• Built responsive web applications using modern HTML5, CSS3, JavaScript</div>
                        <div>• Developed robust backend systems with PHP and MySQL integration</div>
                        <div>• Implemented dynamic features with real-time validation and processing</div>
                        <div>• Conducted comprehensive testing ensuring cross-browser compatibility</div>
                        <div>• Collaborated effectively with design teams for optimal UX</div>
                        <div class="warning">🏆 Achievement: Delivered 3 client projects ahead of schedule</div>
                    </div>
                    <div class="info">└─</div>
                </div>

                <div style="margin: 1.5rem 0;">
                    <div class="success">📊 CAREER HIGHLIGHTS</div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1rem 0;">
                        <div style="text-align: center; padding: 1rem; background: rgba(0, 255, 65, 0.1); border-radius: 10px;">
                            <div class="success" style="font-size: 1.5rem;">3+</div>
                            <div>Years Experience</div>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: rgba(0, 255, 255, 0.1); border-radius: 10px;">
                            <div class="info" style="font-size: 1.5rem;">200+</div>
                            <div>Users Supported</div>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: rgba(255, 136, 0, 0.1); border-radius: 10px;">
                            <div class="warning" style="font-size: 1.5rem;">99.9%</div>
                            <div>System Uptime</div>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: rgba(255, 0, 128, 0.1); border-radius: 10px;">
                            <div style="color: var(--neon-pink); font-size: 1.5rem;">25%</div>
                            <div>Cost Reduction</div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    /**
     * Display projects section
     */
    showProjects() {
        this.addOutput(`
            <div class="section-content">
                <div class="info">🚀 FEATURED PROJECTS SHOWCASE</div>
                <div class="info">═══════════════════════════════════════</div>
                
                <div class="project-card">
                    <div class="project-title">🛡️ Enterprise Cybersecurity Enhancement Platform</div>
                    <div style="margin: 1rem 0; line-height: 1.6;">
                        <div>Architected and deployed a comprehensive threat detection ecosystem using cutting-edge security tools. 
                        The system achieved 95% threat detection accuracy and reduced incident response time by 60%.</div>
                        
                        <div style="margin: 1rem 0;">
                            <div class="success">🎯 <strong>Key Achievements:</strong></div>
                            <div style="margin-left: 1rem;">
                                • Real-time threat monitoring across 50+ endpoints</div>
                                • Automated incident response workflows</div>
                                • Custom threat intelligence integration</div>
                                • 24/7 security operations center dashboard</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin: 1rem 0;">
                        <span class="tech-tag">WAZUH</span>
                        <span class="tech-tag">Elasticsearch</span>
                        <span class="tech-tag">Kibana</span>
                        <span class="tech-tag">Debian Linux</span>
                        <span class="tech-tag">Python</span>
                        <span class="tech-tag">Docker</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                        <span style="color: var(--text-dim);">Security Enhancement • Enterprise Level</span>
                        <div style="color: var(--success);">
                            <div>95% Detection Rate</div>
                            <div>60% Faster Response</div>
                        </div>
                    </div>
                </div>

                <div class="project-card">
                    <div class="project-title">🌐 Full-Stack Web Application Ecosystem</div>
                    <div style="margin: 1rem 0; line-height: 1.6;">
                        <div>Developed and deployed 5+ production-ready web applications serving 1000+ active users. 
                        Modern tech stack implementation ensuring 99.8% uptime and optimal performance.</div>
                        
                        <div style="margin: 1rem 0;">
                            <div class="info">🔧 <strong>Technical Highlights:</strong></div>
                            <div style="margin-left: 1rem;">
                                • Responsive design with mobile-first approach</div>
                                • RESTful API architecture with JWT authentication</div>
                                • Real-time features using WebSocket connections</div>
                                • Automated testing and deployment pipelines</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin: 1rem 0;">
                        <span class="tech-tag">React</span>
                        <span class="tech-tag">Node.js</span>
                        <span class="tech-tag">PHP</span>
                        <span class="tech-tag">MySQL</span>
                        <span class="tech-tag">WordPress</span>
                        <span class="tech-tag">Bootstrap</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                        <span style="color: var(--text-dim);">Web Development • Production Ready</span>
                        <div style="color: var(--info);">
                            <div>1000+ Active Users</div>
                            <div>99.8% Uptime</div>
                        </div>
                    </div>
                </div>

                <div class="project-card">
                    <div class="project-title">🎧 Advanced Helpdesk Support System</div>
                    <div style="margin: 1rem 0; line-height: 1.6;">
                        <div>Designed intelligent ticketing system with automated priority algorithms and smart escalation protocols. 
                        Achieved 30% reduction in resolution time and 4.8/5.0 user satisfaction.</div>
                        
                        <div style="margin: 1rem 0;">
                            <div class="warning">⚡ <strong>Smart Features:</strong></div>
                            <div style="margin-left: 1rem;">
                                • AI-powered ticket routing and categorization</div>
                                • Real-time performance analytics dashboard</div>
                                • Integrated knowledge base with smart suggestions</div>
                                • Mobile-responsive interface for field support</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin: 1rem 0;">
                        <span class="tech-tag">Python</span>
                        <span class="tech-tag">Machine Learning</span>
                        <span class="tech-tag">Dashboard</span>
                        <span class="tech-tag">Mobile UI</span>
                        <span class="tech-tag">Analytics</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                        <span style="color: var(--text-dim);">Support Optimization • AI-Enhanced</span>
                        <div style="color: var(--warning);">
                            <div>30% Faster Resolution</div>
                            <div>4.8/5 Satisfaction</div>
                        </div>
                    </div>
                </div>

                <div style="margin: 2rem 0;">
                    <div class="success">🌟 LIVE PROJECTS & PORTFOLIO</div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1rem 0;">
                        <div style="padding: 1rem; background: rgba(0, 255, 65, 0.05); border-radius: 8px;">
                            <div class="success">🌐 A2Z Digital Media</div>
                            <div style="font-size: 0.9rem; margin: 0.5rem 0;">Corporate website with advanced features</div>
                            <a href="https://a2zdigitalmedia.com" style="color: var(--cyan);">→ a2zdigitalmedia.com</a>
                        </div>
                        <div style="padding: 1rem; background: rgba(0, 255, 255, 0.05); border-radius: 8px;">
                            <div class="info">🚚 Adva Logistics</div>
                            <div style="font-size: 0.9rem; margin: 0.5rem 0;">Logistics management platform</div>
                            <a href="https://advalogistics.com" style="color: var(--cyan);">→ advalogistics.com</a>
                        </div>
                        <div style="padding: 1rem; background: rgba(255, 0, 128, 0.05); border-radius: 8px;">
                            <div style="color: var(--neon-pink);">✈️ Rightway Travel</div>
                            <div style="font-size: 0.9rem; margin: 0.5rem 0;">Travel consultation platform</div>
                            <a href="https://rightwaytravelconsultancy.com" style="color: var(--cyan);">→ rightwaytravelconsultancy.com</a>
                        </div>
                        <div style="padding: 1rem; background: rgba(255, 136, 0, 0.05); border-radius: 8px;">
                            <div class="warning">🎯 Project Mono</div>
                            <div style="font-size: 0.9rem; margin: 0.5rem 0;">Portfolio and project showcase</div>
                            <a href="https://projectmono.net" style="color: var(--cyan);">→ projectmono.net</a>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    /**
     * Display contact information
     */
    showContact() {
        this.addOutput(`
            <div class="section-content">
                <div class="info">📞 CONTACT & CONNECT</div>
                <div class="info">═══════════════════════════</div>
                
                <div style="text-align: center; margin: 2rem 0; padding: 1.5rem; background: rgba(0, 255, 65, 0.05); border-radius: 15px;">
                    <div class="success" style="font-size: 1.2rem; margin-bottom: 1rem;">🤝 Let's Build Something Amazing Together!</div>
                    <div style="line-height: 1.6;">Ready to discuss your next project, explore collaboration opportunities, or need expert IT consultation? 
                    I'm always excited to connect with like-minded professionals and innovative organizations.</div>
                </div>

                <div class="contact-grid">
                    <div style="padding: 1.5rem; background: rgba(0, 255, 65, 0.05); border: 1px solid var(--primary-green); border-radius: 10px;">
                        <div class="success">📧 EMAIL</div>
                        <div style="margin: 0.8rem 0; font-size: 1.1rem;">matthiasabddisa@gmail.com</div>
                        <div style="font-size: 0.9rem; color: var(--text-dim);">Professional inquiries • Project discussions</div>
                        <div style="margin-top: 0.5rem;">⚡ Response time: Within 24 hours</div>
                    </div>

                    <div style="padding: 1.5rem; background: rgba(0, 255, 255, 0.05); border: 1px solid var(--cyan); border-radius: 10px;">
                        <div class="info">📱 PHONE & WHATSAPP</div>
                        <div style="margin: 0.8rem 0; font-size: 1.1rem;">+251 936 747 134</div>
                        <div style="font-size: 0.9rem; color: var(--text-dim);">Direct calls • WhatsApp messages</div>
                        <div style="margin-top: 0.5rem;">🕒 Available: 9 AM - 6 PM (EAT)</div>
                    </div>

                    <div style="padding: 1.5rem; background: rgba(0, 128, 255, 0.05); border: 1px solid var(--electric-blue); border-radius: 10px;">
                        <div style="color: var(--electric-blue);">💼 LINKEDIN</div>
                        <div style="margin: 0.8rem 0; font-size: 1.1rem;">matthias-abddisa-9163881a3</div>
                        <div style="font-size: 0.9rem; color: var(--text-dim);">Professional networking • Career opportunities</div>
                        <div style="margin-top: 0.5rem;">🌐 linkedin.com/in/matthias-abddisa-9163881a3</div>
                    </div>

                    <div style="padding: 1.5rem; background: rgba(100, 100, 100, 0.05); border: 1px solid #646464; border-radius: 10px;">
                        <div style="color: #646464;">⚡ GITHUB</div>
                        <div style="margin: 0.8rem 0; font-size: 1.1rem;">Matthias-Ab</div>
                        <div style="font-size: 0.9rem; color: var(--text-dim);">Code repositories • Open source projects</div>
                        <div style="margin-top: 0.5rem;">💻 github.com/Matthias-Ab</div>
                    </div>

                    <div style="padding: 1.5rem; background: rgba(255, 136, 0, 0.05); border: 1px solid var(--orange); border-radius: 10px;">
                        <div class="warning">📍 LOCATION</div>
                        <div style="margin: 0.8rem 0; font-size: 1.1rem;">Addis Ababa, Ethiopia</div>
                        <div style="font-size: 0.9rem; color: var(--text-dim);">Open to remote work • Available for travel</div>
                        <div style="margin-top: 0.5rem;">🌍 Global collaboration welcome</div>
                    </div>

                    <div style="padding: 1.5rem; background: rgba(255, 0, 128, 0.05); border: 1px solid var(--neon-pink); border-radius: 10px;">
                        <div style="color: var(--neon-pink);">⏰ AVAILABILITY</div>
                        <div style="margin: 0.8rem 0; font-size: 1.1rem;">Ready for New Projects</div>
                        <div style="font-size: 0.9rem; color: var(--text-dim);">Immediate availability • Flexible scheduling</div>
                        <div style="margin-top: 0.5rem;">🚀 Let's start your project today!</div>
                    </div>
                </div>

                <div style="margin: 2rem 0; text-align: center; padding: 1.5rem; background: rgba(0, 255, 255, 0.03); border-radius: 10px;">
                    <div class="cyan">🎯 SPECIALIZING IN:</div>
                    <div style="margin: 1rem 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem;">
                        <span class="tech-tag">IT Consultation</span>
                        <span class="tech-tag">System Optimization</span>
                        <span class="tech-tag">Cybersecurity Audits</span>
                        <span class="tech-tag">Web Development</span>
                        <span class="tech-tag">Infrastructure Setup</span>
                        <span class="tech-tag">Team Training</span>
                    </div>
                    <div class="success">💡 Free initial consultation available!</div>
                </div>
            </div>
        `);
    }

    /**
     * Display system information like neofetch
     */
    neofetch() {
        this.addOutput(`
            <div class="section-content">
                <div style="display: flex; align-items: center; margin: 1rem 0;">
                    <div style="margin-right: 2rem;">
                        <div class="info" style="font-size: 0.8rem; line-height: 1;">
        ⠀⠀⠀⠀⠀⣀⣤⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⣀⠀⠀⠀⠀⠀
        ⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀
        ⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⠀⠀
        ⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⠛⠛⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀
        ⢠⣿⣿⣿⣿⣿⣿⣿⡿⠋⠀⠀⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⡄
        ⢸⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⡇
        ⢸⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⡇
        ⠸⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⠇
        ⠀⢻⣿⣿⣿⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⡟⠀
        ⠀⠀⢻⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⣿⣿⣿⡟⠀⠀
        ⠀⠀⠀⠙⢿⣿⣿⣿⣿⣷⣦⣄⣀⣀⣠⣴⣾⣿⣿⣿⣿⣿⣿⡿⠋⠀⠀⠀
        ⠀⠀⠀⠀⠀⠉⠛⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⠉⠀⠀⠀⠀⠀⠀
                        </div>
                    </div>
                    <div style="flex: 1;">
                        <div><span class="success">matthias</span><span class="info">@</span><span class="cyan">portfolio</span></div>
                        <div style="border-bottom: 1px solid var(--terminal-border); margin: 0.5rem 0;"></div>
                        <div><span class="info">OS:</span> Professional IT Environment</div>
                        <div><span class="info">Host:</span> Matthias Abddisa's Portfolio</div>
                        <div><span class="info">Kernel:</span> Full-Stack Developer</div>
                        <div><span class="info">Uptime:</span> 3+ years in IT</div>
                        <div><span class="info">Packages:</span> 15+ Technologies</div>
                        <div><span class="info">Shell:</span> Advanced Terminal Interface</div>
                        <div><span class="info">Resolution:</span> 99.9% System Uptime</div>
                        <div><span class="info">DE:</span> IT Director Environment</div>
                        <div><span class="info">WM:</span> Cybersecurity Manager</div>
                        <div><span class="info">Terminal:</span> Professional Portfolio</div>
                        <div><span class="info">CPU:</span> Intel Brain i9-Innovation</div>
                        <div><span class="info">GPU:</span> NVIDIA Problem-Solver RTX</div>
                        <div><span class="info">Memory:</span> Unlimited Learning Capacity</div>
                    </div>
                </div>
            </div>
        `);
    }

    /**
     * Display system status
     */
    showStatus() {
        this.addOutput(`
            <div class="section-content">
                <div class="info">⚡ SYSTEM STATUS REPORT</div>
                <div class="info">═════════════════════════</div>
                
                <div style="margin: 1rem 0;">
                    <div class="success">🟢 All Systems Operational</div>
                    <div style="margin-left: 1rem;">
                        <div>🔧 Skills Module: <span class="success">ACTIVE</span></div>
                        <div>💼 Experience Database: <span class="success">ONLINE</span></div>
                        <div>🚀 Project Showcase: <span class="success">RUNNING</span></div>
                        <div>📞 Contact Interface: <span class="success">READY</span></div>
                        <div>🛡️ Security Systems: <span class="success">PROTECTED</span></div>
                    </div>
                </div>

                <div style="margin: 1.5rem 0;">
                    <div class="cyan">📊 Performance Metrics</div>
                    <div style="margin-left: 1rem;">
                        <div>Response Time: <span class="success">&lt; 24 hours</span></div>
                        <div>Availability: <span class="success">24/7</span></div>
                        <div>Project Completion Rate: <span class="success">100%</span></div>
                        <div>Client Satisfaction: <span class="success">4.8/5.0</span></div>
                        <div>Learning Mode: <span class="warning">CONTINUOUS</span></div>
                    </div>
                </div>

                <div style="margin: 1.5rem 0;">
                    <div class="warning">🔄 Current Activities</div>
                    <div style="margin-left: 1rem;">
                        <div>• Exploring new cybersecurity technologies</div>
                        <div>• Optimizing system architectures</div>
                        <div>• Learning advanced cloud technologies</div>
                        <div>• Available for new project collaborations</div>
                    </div>
                </div>
            </div>
        `);
    }

    /**
     * Display quick portfolio overview
     */
    showPortfolio() {
        this.addOutput(`
            <div class="section-content">
                <div class="info">🎯 QUICK PORTFOLIO OVERVIEW</div>
                <div class="info">═══════════════════════════════</div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
                    <div style="padding: 1rem; background: rgba(0, 255, 65, 0.1); border-radius: 8px; text-align: center;">
                        <div class="success" style="font-size: 1.5rem;">3+</div>
                        <div>Years Experience</div>
                    </div>
                    <div style="padding: 1rem; background: rgba(0, 255, 255, 0.1); border-radius: 8px; text-align: center;">
                        <div class="info" style="font-size: 1.5rem;">15+</div>
                        <div>Technologies</div>
                    </div>
                    <div style="padding: 1rem; background: rgba(255, 136, 0, 0.1); border-radius: 8px; text-align: center;">
                        <div class="warning" style="font-size: 1.5rem;">5+</div>
                        <div>Live Projects</div>
                    </div>
                    <div style="padding: 1rem; background: rgba(255, 0, 128, 0.1); border-radius: 8px; text-align: center;">
                        <div style="color: var(--neon-pink); font-size: 1.5rem;">100%</div>
                        <div>Success Rate</div>
                    </div>
                </div>

                <div style="margin: 1.5rem 0;">
                    <div class="success">🚀 Core Expertise</div>
                    <div style="margin: 0.5rem 0;">
                        <span class="tech-tag">System Administration</span>
                        <span class="tech-tag">Cybersecurity</span>
                        <span class="tech-tag">Full-Stack Development</span>
                        <span class="tech-tag">IT Leadership</span>
                    </div>
                </div>

                <div style="margin: 1.5rem 0;">
                    <div class="info">💼 Current Positions</div>
                    <div>• IT Director at A2Z Digital Media</div>
                    <div>• IT Associate at AVIET LTD</div>
                </div>

                <div class="cyan">🎯 Ready for your next big project!</div>
            </div>
        `);
    }

    /**
     * Clear terminal output
     */
    clearTerminal() {
        this.output.innerHTML = '';
        this.addOutput('Terminal cleared. Welcome back! 🚀', 'success');
    }

    /**
     * Display current user information
     */
    whoami() {
        this.addOutput(`
            <div class="info">👤 Current User: Matthias Abddisa</div>
            <div class="success">🎯 Role: IT Director & Full-Stack Developer</div>
            <div class="warning">⚡ Experience: 3+ Years</div>
            <div class="cyan">🚀 Status: Ready for Innovation</div>
        `, 'section-content');
    }

    /**
     * List available sections
     */
    listItems() {
        this.addOutput(`
            <div class="info">📁 Available sections:</div>
            <div style="margin-left: 1rem;">
                <div><span class="success">about/</span>         Personal & professional info</div>
                <div><span class="success">skills/</span>        Technical competencies matrix</div>
                <div><span class="success">experience/</span>    Career journey & achievements</div>
                <div><span class="success">projects/</span>      Featured work showcase</div>
                <div><span class="success">contact/</span>       Connect & collaborate</div>
                <div><span class="success">portfolio/</span>     Quick overview</div>
            </div>
        `, 'section-content');
    }

    /**
     * Cat command implementation
     */
    catCommand(args) {
        if (args.length === 0) {
            this.addOutput('Usage: cat [section]', 'error');
            return;
        }
        
        const section = args[0];
        if (this.commands[section]) {
            this.commands[section]();
        } else {
            this.addOutput(`cat: ${section}: No such file or directory`, 'error');
        }
    }

    /**
     * Sudo command (Easter egg)
     */
    sudoCommand(args) {
        if (args.length === 0) {
            this.addOutput('sudo: command not specified', 'error');
            return;
        }
        
        this.addOutput('🔒 Nice try! But this is a portfolio, not a production system 😉', 'warning');
        this.addOutput('🛡️ For real cybersecurity demonstrations, check out my projects!', 'info');
    }

    /**
     * Toggle matrix background effect
     */
    toggleMatrix() {
        this.matrixEnabled = !this.matrixEnabled;
        const matrixBg = document.getElementById('matrixBg');
        
        if (this.matrixEnabled) {
            matrixBg.style.opacity = '0.15';
            this.addOutput('🔴 Matrix mode: ENABLED - Welcome to the real world', 'success');
        } else {
            matrixBg.style.opacity = '0.05';
            this.addOutput('🔵 Matrix mode: DISABLED - Back to reality', 'warning');
        }
    }

    /**
     * Show welcome message
     */
    showWelcome() {
        this.addOutput(`
            <div class="info">╔══════════════════════════════════════════════════════════════════════════════════╗</div>
            <div class="info">║                          ⚡ MATTHIAS TERMINAL PORTFOLIO ⚡                        ║</div>
            <div class="info">║                              Advanced IT Professional                             ║</div>
            <div class="info">╚══════════════════════════════════════════════════════════════════════════════════╝</div>
            <div class="success">🚀 System initialized with quantum processing...</div>
            <div>👤 User: <span class="info">Matthias Abddisa</span></div>
            <div>💼 Role: <span class="warning">IT Director & Full-Stack Developer</span></div>
            <div>📍 Location: <span class="info">Addis Ababa, Ethiopia</span></div>
            <div>⚡ Status: <span class="success">Online • Ready for Innovation</span></div>
            <div>───────────────────────────────────────────────────────────────────</div>
            <div>Type <span class="user-input">'help'</span> to explore my digital realm...</div>
        `, 'section-content');
    }

    /**
     * Create enhanced visual effects
     */
    createEnhancedEffects() {
        this.createMatrixEffect();
        this.createFloatingCode();
        this.startTerminalEffects();
    }

    /**
     * Create matrix digital rain effect
     */
    createMatrixEffect() {
        const matrixBg = document.getElementById('matrixBg');
        const chars = '01ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';
        
        for (let i = 0; i < 50; i++) {
            const column = document.createElement('div');
            column.className = 'matrix-column';
            column.style.left = Math.random() * 100 + '%';
            column.style.animationDuration = (Math.random() * 3 + 2) + 's';
            column.style.animationDelay = Math.random() * 2 + 's';
            
            let text = '';
            for (let j = 0; j < 20; j++) {
                text += chars.charAt(Math.floor(Math.random() * chars.length)) + '<br>';
            }
            column.innerHTML = text;
            
            matrixBg.appendChild(column);
        }
    }

    /**
     * Create floating code snippets
     */
    createFloatingCode() {
        const codeFloats = document.getElementById('codeFloats');
        const codeSnippets = [
            'function optimizeSystem() {', 'if (threat.detected) {', 'const security = new Shield();',
            'docker run -d --name app', 'sudo systemctl start', '#!/bin/bash', 'SELECT * FROM projects',
            'npm install --production', 'git commit -m "feat:"', '<div className="portfolio">',
            'axios.get("/api/data")', 'useEffect(() => {', 'const [state, setState]',
            'php artisan migrate', 'mysql -u root -p', 'ssh user@server.com'
        ];
        
        setInterval(() => {
            if (codeFloats.children.length < 10) {
                const float = document.createElement('div');
                float.className = 'code-float';
                float.style.left = Math.random() * 100 + '%';
                float.textContent = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
                codeFloats.appendChild(float);
                
                setTimeout(() => {
                    if (codeFloats.contains(float)) {
                        codeFloats.removeChild(float);
                    }
                }, 15000);
            }
        }, 3000);
    }

    /**
     * Start additional terminal effects
     */
    startTerminalEffects() {
        // Add subtle screen flicker effect
        setInterval(() => {
            if (Math.random() < 0.02) { // 2% chance every interval
                document.body.style.filter = 'brightness(1.1)';
                setTimeout(() => {
                    document.body.style.filter = 'brightness(1)';
                }, 50);
            }
        }, 100);
    }

    /**
     * Navigate command history
     */
    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        this.historyIndex += direction;
        
        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length;
            this.commandInput.value = '';
            return;
        }
        
        this.commandInput.value = this.commandHistory[this.historyIndex];
    }

    /**
     * Auto-complete command input
     */
    autoComplete() {
        const input = this.commandInput.value.toLowerCase();
        const matches = Object.keys(this.commands).filter(cmd => cmd.startsWith(input));
        
        if (matches.length === 1) {
            this.commandInput.value = matches[0];
        } else if (matches.length > 1) {
            this.addOutput(`💡 Available commands: ${matches.join(', ')}`, 'info');
        }
    }
}

// Initialize terminal when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedTerminalPortfolio();
});