/**
 * Kalim Ullah - Interactive Developer CLI Terminal
 * Complete command engine for power users
 */

class PortfolioTerminal {
  constructor(containerId = 'dev-terminal') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.inputElement = this.container.querySelector('.terminal-input');
    this.outputElement = this.container.querySelector('.terminal-output');
    this.commandHistory = [];
    this.historyIndex = -1;
    this.isMatrixRunning = false;
    this.matrixInterval = null;

    this.commands = {
      help: () => this.cmdHelp(),
      about: () => this.cmdAbout(),
      skills: () => this.cmdSkills(),
      projects: () => this.cmdProjects(),
      experience: () => this.cmdExperience(),
      education: () => this.cmdEducation(),
      transcript: () => this.cmdTranscript(),
      stats: () => this.cmdStats(),
      pdf: () => this.cmdPdf(),
      hire: () => this.cmdHire(),
      contact: () => this.cmdHire(),
      'sudo hire': () => this.cmdHire(),
      sudo: (args) => (args && args.includes('hire')) ? this.cmdHire() : "Access granted: You are authorized to contact Kalim for senior software engineering roles.",
      matrix: () => this.cmdMatrix(),
      clear: () => this.cmdClear(),
      cls: () => this.cmdClear(),
      whoami: () => "guest_developer@flutterflow-app [Inspecting Kalim's Flutter & Backend Portfolio]",
      uptime: () => "19+ years computing curiosity · 5+ years professional freelancing",
      theme: (args) => this.cmdTheme(args),
      echo: (args) => args.join(' '),
      ping: () => "PONG! Latency: 12ms (FlutterFlow Live Engine & CanvasKit WebGL Active)",
      date: () => new Date().toUTCString()
    };

    this.init();
  }

  init() {
    this.printWelcome();
    this.bindEvents();
  }

  printWelcome() {
    const welcome = `
<div style="margin-bottom:0.75rem;padding:0.75rem;background:rgba(99,102,241,0.08);border-left:3px solid var(--accent-primary);border-radius:var(--radius-xs);">
  <strong style="color:var(--text-primary);font-size:0.9375rem;">KALIM ULLAH</strong> <span style="color:var(--accent-cyan);">// FLUTTER • FLUTTERFLOW • FIREBASE • SUPABASE</span><br>
  <span style="color:var(--text-muted);font-size:0.8125rem;">Terminal Kernel v2.4.0 • Type <strong style="color:var(--accent-cyan);">'help'</strong> for commands (e.g. 'skills', 'projects', 'experience', 'education', 'sudo hire').</span>
</div>`;
    this.appendOutput(welcome);
  }

  bindEvents() {
    if (!this.inputElement) return;

    this.inputElement.addEventListener('keydown', (e) => {
      if (window.soundEngine) window.soundEngine.playTone(360 + Math.random() * 60, 'sine', 0.03, 0.02);

      if (e.key === 'Enter') {
        const fullInput = this.inputElement.value.trim();
        if (fullInput) {
          this.commandHistory.push(fullInput);
          this.historyIndex = this.commandHistory.length;
        }
        this.executeCommand(fullInput);
        this.inputElement.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.inputElement.value = this.commandHistory[this.historyIndex] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIndex < this.commandHistory.length - 1) {
          this.historyIndex++;
          this.inputElement.value = this.commandHistory[this.historyIndex] || '';
        } else {
          this.historyIndex = this.commandHistory.length;
          this.inputElement.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.autocomplete(this.inputElement.value);
      }
    });

    if (this.container) {
      this.container.addEventListener('click', () => {
        if (this.inputElement) this.inputElement.focus();
      });
    }
  }

  autocomplete(current) {
    if (!current) return;
    const available = Object.keys(this.commands);
    const match = available.find(cmd => cmd.startsWith(current.toLowerCase()));
    if (match && this.inputElement) {
      this.inputElement.value = match;
    }
  }

  executeCommand(input) {
    if (this.isMatrixRunning) {
      this.stopMatrix();
      return;
    }

    if (!input) {
      this.appendOutput(`<div class="terminal-line"><span class="terminal-prompt">kalim@dev:~$</span></div>`);
      return;
    }

    this.appendOutput(`<div class="terminal-line"><span class="terminal-prompt">kalim@dev:~$</span> <span style="color:var(--accent-cyan);font-weight:600;">${this.escapeHtml(input)}</span></div>`);

    const parts = input.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (input.toLowerCase() === 'sudo hire') {
      const res = this.commands['sudo hire']();
      this.appendOutput(res);
    } else if (this.commands[cmd]) {
      const res = this.commands[cmd](args);
      if (res) this.appendOutput(res);
    } else {
      this.appendOutput(`<div style="color:#f43f5e;margin:0.25rem 0;">Command not found: '${this.escapeHtml(cmd)}'. Type <strong style="color:var(--accent-cyan);">'help'</strong> for a list of valid commands.</div>`);
    }

    this.scrollToBottom();
  }

  appendOutput(html) {
    if (!this.outputElement) return;
    const div = document.createElement('div');
    div.className = 'terminal-output-block';
    div.innerHTML = html;
    this.outputElement.appendChild(div);
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (!this.outputElement) return;
    const body = this.container.querySelector('.terminal-body');
    if (body) body.scrollTop = body.scrollHeight;
  }

  cmdHelp() {
    return `
<div style="margin:0.5rem 0;line-height:1.7;">
  <div style="color:var(--accent-cyan);font-weight:700;margin-bottom:0.25rem;">SYSTEM COMMANDS:</div>
  <div>• <strong style="color:var(--accent-cyan);">skills</strong>       : Technical stack (Flutter, FlutterFlow, Firebase, Supabase, AI, REST APIs, Payments)</div>
  <div>• <strong style="color:var(--accent-cyan);">projects</strong>     : Production applications (UniChatAi, Kinetix, Flavordash, Pulse Chat)</div>
  <div>• <strong style="color:var(--accent-cyan);">experience</strong>   : Professional trajectory (Upwork, Fiverr, Internship)</div>
  <div>• <strong style="color:var(--accent-cyan);">education</strong>    : 17-year schooling timeline (BSSE, FSc, Start to Matric)</div>
  <div>• <strong style="color:var(--accent-cyan);">transcript</strong>   : University of Sargodha 138-credit semester breakdown (S-VIII: 3.26 GPA)</div>
  <div>• <strong style="color:var(--accent-cyan);">pdf</strong>          : Official 29-page verified education archive (21.3 MB)</div>
  <div>• <strong style="color:var(--accent-cyan);">stats</strong>        : Summary metrics, credit hours, and experience timeline</div>
  <div>• <strong style="color:var(--accent-cyan);">hire / sudo</strong>   : Verified Upwork client recruitment portal</div>
  <div>• <strong style="color:var(--accent-cyan);">theme &lt;opt&gt;</strong>  : Switch theme (obsidian, cyberpunk, aurora, slate)</div>
  <div>• <strong style="color:var(--accent-cyan);">matrix</strong>       : Launch cyber matrix digital rain animation</div>
  <div>• <strong style="color:var(--accent-cyan);">clear / cls</strong>  : Clear console window</div>
</div>`;
  }

  cmdAbout() {
    const p = window.PORTFOLIO_DATA ? window.PORTFOLIO_DATA.profile : {};
    return `
<div style="margin:0.5rem 0;">
  <strong style="color:var(--text-primary);">${p.name || 'Kalim Ullah'}</strong> — ${p.title || 'Senior Flutter & FlutterFlow Developer'}<br>
  <span style="color:var(--text-secondary);">Degree: ${p.degree || 'BS Software Engineering'} (${p.university || 'University of Sargodha'})</span><br>
  <span style="color:var(--accent-emerald);font-weight:600;">Motto: ${p.motto || 'Plan. Build. Test. Deliver.'}</span><br>
  <span style="color:var(--text-muted);">${p.bio || ''}</span>
</div>`;
  }

    cmdSkills() {
    if (!window.PORTFOLIO_DATA || !window.PORTFOLIO_DATA.skills) return 'Skills data not loaded.';
    let out = '<div style="color:var(--accent-cyan);font-weight:700;margin:0.5rem 0 0.25rem 0;">CORE DISCIPLINES & TECHNICAL EXPERTISE:</div>';
    
    window.PORTFOLIO_DATA.skills.categories.forEach(cat => {
      out += `<div style="margin-top:0.6rem;color:var(--accent-primary);font-weight:700;">[${cat.title}]</div>`;
      cat.skills.forEach(s => {
        out += `<div style="padding-left:0.5rem;font-size:0.8125rem;line-height:1.6;">
          <strong style="color:var(--text-primary);">• ${s.name}</strong>: <span style="color:var(--text-secondary);">${s.desc}</span>
        </div>`;
      });
    });
    return out;
  }

  cmdProjects() {
    if (!window.PORTFOLIO_DATA || !window.PORTFOLIO_DATA.projects) return 'Projects data not loaded.';
    let out = '<div style="color:var(--accent-cyan);font-weight:700;margin:0.5rem 0 0.25rem 0;">FLAGSHIP PRODUCTION APPS (Plan. Build. Test. Deliver.):</div>';
    
    window.PORTFOLIO_DATA.projects.forEach(p => {
      out += `
<div style="margin-top:0.75rem;padding:0.6rem;background:var(--bg-secondary);border-radius:var(--radius-xs);border-left:2px solid var(--accent-cyan);">
  <div><strong style="color:var(--text-primary);">${p.title}</strong> <span style="font-size:0.75rem;color:var(--accent-primary);">(${p.categoryLabel})</span></div>
  <div style="color:var(--text-muted);font-size:0.8125rem;">${p.tagline}</div>
  <div style="color:var(--text-secondary);font-size:0.75rem;margin-top:0.25rem;">Stack: ${p.tech.join(' • ')}</div>
</div>`;
    });
    return out;
  }

  cmdExperience() {
    return `
<div style="margin:0.5rem 0;">
  <div style="color:var(--accent-cyan);font-weight:700;margin-bottom:0.4rem;">WORK EXPERIENCE:</div>
  <div style="padding-left:0.5rem;border-left:2px solid var(--accent-primary);margin-bottom:0.4rem;">
    <strong style="color:var(--text-primary);">Upwork (FlutterFlow)</strong> — <span style="color:var(--accent-emerald);font-family:var(--font-mono);">Mar 2024 - Present</span><br>
    <span style="color:var(--text-secondary);font-size:0.8125rem;">Ongoing · 5th Year Freelancing · End-to-end Flutter & FlutterFlow builds</span>
  </div>
  <div style="padding-left:0.5rem;border-left:2px solid var(--accent-primary);margin-bottom:0.4rem;">
    <strong style="color:var(--text-primary);">Fiverr (Flutter)</strong> — <span style="color:var(--accent-emerald);font-family:var(--font-mono);">Mar 2022 - Jul 2024</span><br>
    <span style="color:var(--text-secondary);font-size:0.8125rem;">2 Years 5 Months · Cross-platform mobile & web applications</span>
  </div>
  <div style="padding-left:0.5rem;border-left:2px solid var(--accent-primary);">
    <strong style="color:var(--text-primary);">Internship (Flutter)</strong> — <span style="color:var(--accent-emerald);font-family:var(--font-mono);">Nov 2021 - Feb 2022</span><br>
    <span style="color:var(--text-secondary);font-size:0.8125rem;">Qodit Software House · Sole developer on production dry-cleaning app</span>
  </div>
</div>`;
  }

  cmdEducation() {
    return `
<div style="margin:0.5rem 0;">
  <div style="color:var(--accent-cyan);font-weight:700;margin-bottom:0.4rem;">EDUCATION HISTORY:</div>
  <div style="padding-left:0.5rem;border-left:2px solid var(--accent-emerald);margin-bottom:0.4rem;">
    <strong style="color:var(--text-primary);">BSSE (BS Software Engineering)</strong> — <span style="color:var(--accent-emerald);font-family:var(--font-mono);">2017 - 2021</span><br>
    <span style="color:var(--text-secondary);font-size:0.8125rem;">University of Sargodha · 138 Credit Hours · 45 Courses · CGPA 2.82</span>
  </div>
  <div style="padding-left:0.5rem;border-left:2px solid var(--accent-emerald);margin-bottom:0.4rem;">
    <strong style="color:var(--text-primary);">FSc (Pre-Engineering)</strong> — <span style="color:var(--accent-emerald);font-family:var(--font-mono);">2015 - 2017</span><br>
    <span style="color:var(--text-secondary);font-size:0.8125rem;">Govt. College (Boys) Taunsa · Grade A (843/1100 · 76.6%)</span>
  </div>
  <div style="padding-left:0.5rem;border-left:2px solid var(--accent-emerald);">
    <strong style="color:var(--text-primary);">Start to Matric</strong> — <span style="color:var(--accent-emerald);font-family:var(--font-mono);">2004 - 2015</span><br>
    <span style="color:var(--text-secondary);font-size:0.8125rem;">Sun Light Public School & TF Grammar School · Class 8 Distinction (90%) to Nursery</span>
  </div>
</div>`;
  }

  cmdTranscript() {
    if (!window.PORTFOLIO_DATA || !window.PORTFOLIO_DATA.academicJourney) return 'Transcript data not loaded.';
    const bsse = window.PORTFOLIO_DATA.academicJourney.find(j => j.id === 'bsse');
    if (!bsse) return 'BSSE record not found.';

    let out = `
<div style="color:var(--accent-cyan);font-weight:700;margin:0.5rem 0 0.25rem 0;">UNIVERSITY OF SARGODHA OFFICIAL TRANSCRIPT SUMMARY:</div>
<div style="color:var(--text-muted);font-size:0.8125rem;">Roll No: ${bsse.stats.rollNo} | Reg No: ${bsse.stats.regNo} | Total: ${bsse.stats.marks} | CGPA: ${bsse.stats.cgpa}</div>`;

    bsse.semesters.forEach(sem => {
      out += `<div style="margin-top:0.4rem;font-weight:600;color:var(--accent-primary);">-- ${sem.semester} (GPA: ${sem.gpa}, ${sem.credits} Cr) --</div>`;
      sem.courses.forEach(c => {
        out += `<div style="font-size:0.8125rem;color:var(--text-secondary);padding-left:0.5rem;">
          [${c.code}] ${c.title} : <strong>${c.marks}%</strong> (Grade ${c.grade})
        </div>`;
      });
    });

    out += '<div style="margin-top:0.5rem;color:var(--accent-emerald);font-size:0.8125rem;">Tip: Type "pdf" or click "138-Credit Transcript" button above to view full PDF!</div>';
    return out;
  }

  cmdPdf() {
    return `
<div style="margin:0.5rem 0;padding:0.75rem;background:var(--bg-secondary);border-radius:var(--radius-xs);border-left:3px solid var(--accent-cyan);">
  <strong style="color:var(--text-primary);">OFFICIAL 29-PAGE EDUCATION ARCHIVE (2004–2021):</strong><br>
  <span style="color:var(--text-muted);font-size:0.8125rem;">Education_history.pdf · 29 pages · 21.3 MB · Verified scans</span><br>
  <div style="margin-top:0.5rem;">
    <a href="https://drive.google.com/uc?export=download&id=1mf3oFRedM2f-2dRumHRiOdLOo0BrfhiS" target="_blank" style="color:var(--accent-cyan);font-weight:700;text-decoration:underline;">Click Here to Download PDF ↗</a>
  </div>
</div>`;
  }

  cmdStats() {
    const prof = window.PORTFOLIO_DATA ? window.PORTFOLIO_DATA.profile : {};
    return `
<div style="margin:0.5rem 0;">
  <div style="color:var(--accent-cyan);font-weight:700;margin-bottom:0.25rem;">QUANTITATIVE PROFILE TELEMETRY:</div>
  <div>• BSSE Credit Hours Completed : <strong style="color:var(--accent-primary);">138 Hours (45 Courses)</strong></div>
  <div>• Cumulative GPA              : <strong style="color:var(--accent-emerald);">${prof.cgpa || '2.82'} / 4.00 (68.75%)</strong></div>
  <div>• Documented Schooling         : <strong style="color:var(--accent-amber);">17 Years on Record (2004–2021)</strong></div>
  <div>• Freelancing Experience       : <strong style="color:var(--accent-emerald);">5+ Years (Upwork ongoing + Fiverr)</strong></div>
  <div>• Upwork Direct Portal         : <a href="https://www.upwork.com/freelancers/kalimullahdev" target="_blank" style="color:var(--accent-cyan);">upwork.com/freelancers/kalimullahdev</a></div>
</div>`;
  }

  cmdHire() {
    return `
<div style="margin:0.75rem 0;padding:1rem;background:rgba(99,102,241,0.12);border-radius:var(--radius-sm);border:1px solid var(--accent-primary);">
  <div style="font-weight:700;color:var(--accent-cyan);font-size:1.05rem;">Verified Upwork Client Portal</div>
  <p style="color:var(--text-secondary);font-size:0.875rem;margin:0.4rem 0;">Kalim handles all contracts, milestone payments, and enterprise deliverables securely through Upwork.</p>
  <div style="margin-top:0.75rem;">
    <a href="https://www.upwork.com/freelancers/kalimullahdev" target="_blank" style="display:inline-block;padding:0.4rem 0.8rem;background:var(--accent-primary);color:#ffffff;border-radius:var(--radius-xs);text-decoration:none;font-weight:600;font-size:0.8125rem;">
      Open Upwork Profile ↗
    </a>
  </div>
</div>`;
  }

  cmdTheme(args) {
    if (!args || args.length === 0) return 'Usage: theme <obsidian | cyberpunk | aurora | slate>';
    const choice = args[0].toLowerCase();
    const valid = ['obsidian', 'cyberpunk', 'aurora', 'slate'];
    if (!valid.includes(choice)) {
      return `Invalid theme '${choice}'. Choose from: ${valid.join(', ')}`;
    }
    document.documentElement.setAttribute('data-theme', choice);
    return `[THEME ACTIVE] Switched UI palette to '${choice}'.`;
  }

  cmdMatrix() {
    if (this.isMatrixRunning) return '';
    this.isMatrixRunning = true;

    // Create matrix overlay element
    this.matrixOverlay = document.createElement('div');
    this.matrixOverlay.className = 'matrix-overlay';
    this.matrixOverlay.innerHTML = `
      <canvas class="matrix-canvas"></canvas>
      <div class="matrix-hud">
        <div class="matrix-hud-top">
          <div class="matrix-badge">
            <span class="matrix-pulse"></span>
            <span>CIPHER: LIVE [DART/FLUTTER KERNEL]</span>
          </div>
          <div class="matrix-palette-group">
            <button class="matrix-theme-btn active" data-color="emerald">Emerald</button>
            <button class="matrix-theme-btn" data-color="neon">Cyber Neon</button>
            <button class="matrix-theme-btn" data-color="cyan">Quantum</button>
            <button class="matrix-theme-btn" data-color="amber">Amber</button>
          </div>
        </div>
        <div class="matrix-hud-bottom">
          <div class="matrix-status-text">⚡ 60 FPS Digital Rain • Press ESC or tap to exit</div>
          <button class="matrix-exit-btn" id="matrix-exit-btn">
            <span>Exit Matrix</span>
            <kbd>ESC</kbd>
          </button>
        </div>
      </div>
    `;

    this.container.appendChild(this.matrixOverlay);

    // Audio cue
    if (window.soundEngine) {
      window.soundEngine.playTone(520, 'triangle', 0.1, 0.05);
      setTimeout(() => window.soundEngine && window.soundEngine.playTone(680, 'sine', 0.15, 0.05), 100);
    }

    const canvas = this.matrixOverlay.querySelector('.matrix-canvas');
    const ctx = canvas.getContext('2d');

    let animationId = null;
    let currentColor = 'emerald';

    const colorPalettes = {
      emerald: {
        head: '#ffffff',
        body: '#10b981',
        dim: '#047857',
        bg: 'rgba(3, 6, 12, 0.08)',
        glow: 'rgba(16, 185, 129, 0.6)'
      },
      neon: {
        head: '#ffffff',
        body: '#f43f5e',
        dim: '#9d174d',
        bg: 'rgba(5, 3, 10, 0.08)',
        glow: 'rgba(244, 63, 94, 0.6)'
      },
      cyan: {
        head: '#ffffff',
        body: '#06b6d4',
        dim: '#0e7490',
        bg: 'rgba(2, 6, 12, 0.08)',
        glow: 'rgba(6, 182, 212, 0.6)'
      },
      amber: {
        head: '#ffffff',
        body: '#f59e0b',
        dim: '#b45309',
        bg: 'rgba(8, 5, 2, 0.08)',
        glow: 'rgba(245, 158, 11, 0.6)'
      }
    };

    const katakana = 'ｦｱｳｴｵｶｷｹｻｽｾﾀﾂﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789FLUTTERDARTFIREBASESUPABASEBLOCAPI';
    const characters = katakana.split('');

    const fontSize = 14;
    let columns = 0;
    let drops = [];

    const resize = () => {
      if (!this.matrixOverlay || !canvas) return;
      canvas.width = this.matrixOverlay.clientWidth;
      canvas.height = this.matrixOverlay.clientHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -canvas.height / fontSize);
      }
      ctx.fillStyle = '#03060c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const palette = colorPalettes[currentColor] || colorPalettes.emerald;

      // Semi-transparent fade background for trails
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px JetBrains Mono, monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Draw character
        if (y > 0 && y < canvas.height + fontSize) {
          // Leading head character is bright white
          ctx.fillStyle = palette.head;
          ctx.shadowBlur = 8;
          ctx.shadowColor = palette.glow;
          ctx.fillText(text, x, y);

          // Follower character
          if (drops[i] > 1) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = Math.random() > 0.3 ? palette.body : palette.dim;
            const prevText = characters[Math.floor(Math.random() * characters.length)];
            ctx.fillText(prevText, x, y - fontSize);
          }
        }

        // Reset drops when off-screen with randomized delay
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    // Theme palette switch buttons
    const themeBtns = this.matrixOverlay.querySelectorAll('.matrix-theme-btn');
    themeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentColor = btn.dataset.color;
        if (window.soundEngine) window.soundEngine.click();
      });
    });

    // Exit handlers
    const exitBtn = this.matrixOverlay.querySelector('#matrix-exit-btn');
    if (exitBtn) {
      exitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.stopMatrix();
      });
    }

    const onKeyExit = (e) => {
      if (this.isMatrixRunning && (e.key === 'Escape' || e.key === 'q' || e.key === 'Q')) {
        this.stopMatrix();
      }
    };

    window.addEventListener('keydown', onKeyExit);

    // Save cleanup references
    this.matrixCleanup = () => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyExit);
      if (this.matrixOverlay && this.matrixOverlay.parentNode) {
        this.matrixOverlay.parentNode.removeChild(this.matrixOverlay);
      }
      this.matrixOverlay = null;
    };

    return `<div class="terminal-line output-success">[MATRIX STREAM INITIALIZED] Authentic Digital Rain Active. Press ESC or click Exit to disconnect.</div>`;
  }

  stopMatrix() {
    if (!this.isMatrixRunning) return;
    this.isMatrixRunning = false;
    if (this.matrixCleanup) {
      this.matrixCleanup();
      this.matrixCleanup = null;
    }
    if (window.soundEngine) window.soundEngine.playTone(320, 'sine', 0.08, 0.03);
    this.appendOutput('<div class="terminal-line output-info">[Matrix stream disconnected. Returned to CLI prompt.]</div>');
    if (this.inputElement) this.inputElement.focus();
  }

  cmdClear() {
    if (this.outputElement) this.outputElement.innerHTML = '';
    return '';
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

window.PortfolioTerminal = PortfolioTerminal;

document.addEventListener('DOMContentLoaded', () => {
  window.portfolioTerminal = new PortfolioTerminal('dev-terminal');
});
