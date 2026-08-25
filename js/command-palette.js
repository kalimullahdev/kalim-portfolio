/**
 * Global Command Palette (Cmd+K / Ctrl+K)
 */

class CommandPalette {
  constructor() {
    this.overlay = document.getElementById('cmd-palette-modal');
    this.input = document.getElementById('cmd-search-input');
    this.resultsList = document.getElementById('cmd-results-list');
    this.isOpen = false;
    this.selectedIndex = 0;

    this.actions = [
      { id: 'hero', title: 'Home / Hero Stage', category: 'Navigation', shortcut: 'H', action: () => this.navigate('#hero') },
      { id: 'about', title: 'About & Bento Overview', category: 'Navigation', shortcut: 'A', action: () => this.navigate('#about') },
      { id: 'projects', title: 'Featured Production Projects', category: 'Navigation', shortcut: 'P', action: () => this.navigate('#projects') },
      { id: 'experience', title: 'Work Experience & Trajectory', category: 'Navigation', shortcut: 'W', action: () => this.navigate('#experience') },
      { id: 'skills', title: 'Technical Arsenal & Skills', category: 'Navigation', shortcut: 'S', action: () => this.navigate('#skills') },
      { id: 'terminal', title: 'Developer CLI Terminal', category: 'Tools', shortcut: 'T', action: () => this.navigate('#terminal') },
      { id: 'testimonials', title: 'Client Feedback & Reviews', category: 'Navigation', shortcut: 'R', action: () => this.navigate('#testimonials') },
      { id: 'education', title: '17 Years of Schooling & Transcripts', category: 'Navigation', shortcut: 'E', action: () => this.navigate('#education') },
      { id: 'hire', title: 'Hire Kalim on Upwork ↗', category: 'Action', shortcut: 'U', action: () => window.open('https://www.upwork.com/freelancers/kalimullahdev', '_blank') },
      { id: 'proj-unichat', title: 'Project Case Study: UniChatAi (Multi-LLM)', category: 'Case Study', action: () => window.openCaseStudyModal && window.openCaseStudyModal('unichatai') },
      { id: 'proj-kinetix', title: 'Project Case Study: Kinetix E-Commerce (25 Screens)', category: 'Case Study', action: () => window.openCaseStudyModal && window.openCaseStudyModal('kinetix') },
      { id: 'proj-flavordash', title: 'Project Case Study: Flavordash (32 Screens Food Delivery)', category: 'Case Study', action: () => window.openCaseStudyModal && window.openCaseStudyModal('flavordash') },
      { id: 'proj-pulsechat', title: 'Project Case Study: Pulse Chat (17 Screens Messaging)', category: 'Case Study', action: () => window.openCaseStudyModal && window.openCaseStudyModal('pulsechat') },
      { id: 'theme-obsidian', title: 'Switch Theme: Obsidian Indigo', category: 'Theme', action: () => this.setTheme('obsidian') },
      { id: 'theme-cyberpunk', title: 'Switch Theme: Cyberpunk Neon', category: 'Theme', action: () => this.setTheme('cyberpunk') },
      { id: 'theme-aurora', title: 'Switch Theme: Aurora Emerald', category: 'Theme', action: () => this.setTheme('aurora') },
      { id: 'theme-slate', title: 'Switch Theme: Royal Slate', category: 'Theme', action: () => this.setTheme('slate') },
      { id: 'sound-toggle', title: 'Toggle Audio UI Feedback', category: 'Preferences', action: () => this.toggleSound() }
    ];

    this.filteredActions = [...this.actions];
    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    const triggerBtn = document.getElementById('cmd-palette-trigger');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => this.open());
    }

    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.close();
      });
    }

    if (this.input) {
      this.input.addEventListener('input', (e) => {
        this.filter(e.target.value);
      });

      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.selectedIndex = (this.selectedIndex + 1) % this.filteredActions.length;
          this.renderResults();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.selectedIndex = (this.selectedIndex - 1 + this.filteredActions.length) % this.filteredActions.length;
          this.renderResults();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.executeSelected();
        }
      });
    }
  }

  open() {
    this.isOpen = true;
    if (this.overlay) this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (this.input) {
      this.input.value = '';
      this.input.focus();
    }
    this.filter('');
    if (window.soundEngine) window.soundEngine.modalOpen();
  }

  close() {
    this.isOpen = false;
    if (this.overlay) this.overlay.classList.remove('open');
    const openModals = document.querySelectorAll('.modal-overlay.open');
    if (openModals.length === 0) {
      document.body.style.overflow = '';
    }
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  filter(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.filteredActions = [...this.actions];
    } else {
      this.filteredActions = this.actions.filter(a => 
        a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
      );
    }
    this.selectedIndex = 0;
    this.renderResults();
  }

  renderResults() {
    if (!this.resultsList) return;
    this.resultsList.innerHTML = '';

    if (this.filteredActions.length === 0) {
      this.resultsList.innerHTML = `<li style="padding:1rem;text-align:center;color:var(--text-muted);">No matching commands found.</li>`;
      return;
    }

    this.filteredActions.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = `cmd-item ${idx === this.selectedIndex ? 'selected' : ''}`;
      li.innerHTML = `
        <div class="cmd-item-left">
          <span style="font-size:0.75rem;padding:0.2rem 0.5rem;border-radius:var(--radius-xs);background:var(--bg-primary);color:var(--accent-cyan);">${item.category}</span>
          <span style="font-weight:500;">${item.title}</span>
        </div>
        ${item.shortcut ? `<span class="cmd-shortcut-key">${item.shortcut}</span>` : ''}
      `;

      li.addEventListener('click', () => {
        this.selectedIndex = idx;
        this.executeSelected();
      });

      this.resultsList.appendChild(li);
    });
  }

  executeSelected() {
    if (this.filteredActions[this.selectedIndex]) {
      const action = this.filteredActions[this.selectedIndex];
      this.close();
      action.action();
      if (window.soundEngine) window.soundEngine.click();
    }
  }

  navigate(hash) {
    const target = document.querySelector(hash);
    if (target) {
      const headerOffset = 75;
      const targetPos = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, targetPos),
        behavior: 'smooth'
      });
    }
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (window.showToast) window.showToast(`Theme set to ${theme}`);
  }

  toggleSound() {
    if (window.soundEngine) {
      const state = window.soundEngine.toggle();
      if (window.showToast) window.showToast(`Audio feedback ${state ? 'Enabled' : 'Muted'}`);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.commandPalette = new CommandPalette();
});
