/**
 * Kalim Ullah - Main Application Controller
 * High-performance UI engine for FlutterFlow, Firebase & Supabase portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
  // Restore scroll position across iframe/webview resize reloads
  const savedScroll = sessionStorage.getItem('portfolio_scroll_pos');
  if (savedScroll && !window.location.hash) {
    requestAnimationFrame(() => {
      window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
    });
  }

  // Continuously record scroll position for seamless state recovery
  let scrollSaveTimer = null;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollSaveTimer);
    scrollSaveTimer = setTimeout(() => {
      sessionStorage.setItem('portfolio_scroll_pos', window.scrollY.toString());
    }, 80);
  }, { passive: true });

  initRoleRotator();
  init3DTilt();
  initNavScrollSpy();
  initProjects();
  initWorkExperience();
  initTimeline();
  initSkills();
  initCodeTabs();
  initThemeMenu();
  initModals();
  initLocalTime();
  initAudioToggle();
});

/* 1. Kinetic Zero-Layout-Shift Role Rotator */
function initRoleRotator() {
  const target = document.getElementById('role-rotator');
  if (!target) return;

  const roles = [
    "Flutter & FlutterFlow",
    "Firebase & Supabase",
    "Generative AI & LLMs",
    "REST APIs & Payments"
  ];
  let roleIdx = 0;

  // Set initial text
  target.textContent = roles[0];
  target.style.opacity = '1';
  target.style.transform = 'translateY(0)';
  target.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

  setInterval(() => {
    // Fade out and translate up slightly
    target.style.opacity = '0';
    target.style.transform = 'translateY(-8px)';

    setTimeout(() => {
      roleIdx = (roleIdx + 1) % roles.length;
      target.textContent = roles[roleIdx];
      target.style.transform = 'translateY(8px)';

      // Trigger reflow then fade in
      void target.offsetWidth;
      target.style.opacity = '1';
      target.style.transform = 'translateY(0)';
    }, 400);
  }, 3200);
}

/* 2. Interactive 3D Physics Tilt */
function init3DTilt() {
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

/* 3. Smart Navigation Controller (Scroll Direction Hide/Reveal, Progress Bar, Mobile Drawer, ScrollSpy) */
function initNavScrollSpy() {
  const header = document.getElementById('site-header');
  const progressBar = document.getElementById('nav-scroll-progress');
  const desktopLinks = document.querySelectorAll('.site-header .nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-menu-drawer .mobile-nav-link');
  const allNavLinks = [...desktopLinks, ...mobileLinks];
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-menu-drawer');

  // Collect sections
  const sections = Array.from(desktopLinks)
    .map(link => {
      const targetId = link.getAttribute('href')?.replace('#', '');
      return targetId ? document.getElementById(targetId) : null;
    })
    .filter(Boolean);

  // 3.1 Mobile Drawer Toggle
  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileBtn.classList.toggle('active', isOpen);
      mobileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (window.soundEngine) window.soundEngine.toggle();
    });

    // Close mobile drawer on outside click
    document.addEventListener('click', (e) => {
      if (!mobileDrawer.contains(e.target) && !mobileBtn.contains(e.target) && mobileDrawer.classList.contains('open')) {
        mobileDrawer.classList.remove('open');
        mobileBtn.classList.remove('active');
        mobileBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        mobileDrawer.classList.remove('open');
        mobileBtn.classList.remove('active');
        mobileBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 3.2 Precision Smooth Scrolling with Zero-Flicker Settle Lock
  let isClickScrolling = false;
  let clickedSectionId = null;
  let scrollSettleTimer = null;

  const setActiveLink = (id) => {
    if (!id) return;
    allNavLinks.forEach(link => {
      const match = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', match);
    });
  };

  const handleAnchorClick = (e, link) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const target = document.getElementById(targetId);
      if (target) {
        isClickScrolling = true;
        clickedSectionId = targetId;
        clearTimeout(scrollSettleTimer);
        setActiveLink(targetId);

        const headerOffset = 75;
        const targetPos = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, targetPos),
          behavior: 'smooth'
        });

        // Fallback safety timeout in case scroll events don't trigger (e.g. already at position)
        scrollSettleTimer = setTimeout(() => {
          isClickScrolling = false;
          clickedSectionId = null;
        }, 1200);

        // Close mobile drawer if open
        if (mobileDrawer && mobileDrawer.classList.contains('open')) {
          mobileDrawer.classList.remove('open');
          if (mobileBtn) {
            mobileBtn.classList.remove('active');
            mobileBtn.setAttribute('aria-expanded', 'false');
          }
        }
      }
    }
    if (window.soundEngine) window.soundEngine.click();
  };

  // Scroll End Event listener (supported in modern browsers)
  window.addEventListener('scrollend', () => {
    isClickScrolling = false;
    clickedSectionId = null;
    clearTimeout(scrollSettleTimer);
  });

  // Attach smooth scrolling to all links
  document.querySelectorAll('.site-header a[href^="#"], .mobile-menu-drawer a[href^="#"], .footer-link[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => handleAnchorClick(e, link));
  });

  // 3.3 Permanent Visibility & Elevation on Scroll & Progress Bar
  let ticking = false;

  const onScroll = () => {
    const currentScrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    // Progress Bar
    if (progressBar && maxScroll > 0) {
      const pct = Math.min(100, Math.max(0, (currentScrollY / maxScroll) * 100));
      progressBar.style.width = `${pct}%`;
    }

    if (header) {
      // Scrolled elevation styling
      if (currentScrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // If currently animating from a user click, strictly lock to the clicked section and reset settle debounce
    if (isClickScrolling && clickedSectionId) {
      setActiveLink(clickedSectionId);
      clearTimeout(scrollSettleTimer);
      scrollSettleTimer = setTimeout(() => {
        isClickScrolling = false;
        clickedSectionId = null;
      }, 150);
      ticking = false;
      return;
    }

    // ScrollSpy Active Section Detection for manual scrolling
    const distanceToBottom = document.documentElement.scrollHeight - (window.innerHeight + currentScrollY);
    let activeId = '';

    if (distanceToBottom < 350) {
      activeId = 'education';
    } else {
      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (!sec) continue;
        const rect = sec.getBoundingClientRect();
        // Section is active if top is in upper 45% of viewport and bottom is still visible
        if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= 80) {
          activeId = sec.getAttribute('id');
          break;
        }
      }
    }

    if (activeId) {
      setActiveLink(activeId);
    }

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // Initial trigger to sync state
  onScroll();
}

/* 4. Projects Showcase Render & Category Filters */
function initProjects() {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  const data = window.PORTFOLIO_DATA.projects;
  renderProjects(data);

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.project-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      if (filter === 'all') {
        renderProjects(data);
      } else {
        const filtered = data.filter(p => p.category === filter);
        renderProjects(filtered);
      }
      if (window.soundEngine) window.soundEngine.click();
    });
  });
}

function renderProjects(items) {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.innerHTML = '<div style="grid-column: span 2; padding: 3rem; text-align: center; color: var(--text-muted);">No projects found in this category.</div>';
    return;
  }

  items.forEach(p => {
    const card = document.createElement('div');
    card.className = 'glass-card project-card tilt-card';
    card.innerHTML = `
      <div>
        <div class="project-card-image-box">
          <img src="${p.image}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'">
          <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(7,8,14,0.95) 0%, rgba(7,8,14,0.35) 60%, transparent 100%);display:flex;align-items:flex-end;padding:1.25rem;">
            <div>
              <span style="font-size:0.6875rem;font-family:var(--font-mono);color:var(--accent-cyan);font-weight:700;letter-spacing:0.05em;">${p.categoryLabel}</span>
              <h4 style="font-size:1.25rem;font-weight:700;color:#ffffff;margin-top:0.25rem;">${p.title}</h4>
            </div>
          </div>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">
          <span style="font-size:0.75rem;padding:0.25rem 0.65rem;background:var(--accent-primary-light);color:var(--accent-primary);border-radius:var(--radius-full);font-weight:700;">${p.categoryLabel}</span>
          <span style="font-size:0.75rem;color:var(--accent-emerald);font-family:var(--font-mono);font-weight:600;">● Production Ready</span>
        </div>

        <h3 style="font-size:1.3rem;font-weight:700;margin-bottom:0.4rem;">${p.title}</h3>
        <p class="bento-desc" style="font-size:0.875rem;line-height:1.5;">${p.tagline}</p>

        <div class="project-metrics-strip">
          ${p.metrics.map(m => `
            <div class="project-metric">
              <div class="metric-val">${m.value}</div>
              <div class="metric-lbl">${m.label}</div>
            </div>
          `).join('')}
        </div>

        <div class="project-tech-tags">
          ${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
        </div>
      </div>

      <div class="project-footer-actions" style="margin-top:1.25rem;display:flex;flex-direction:column;gap:0.5rem;">
        <button class="btn btn-primary" style="width:100%;justify-content:center;padding:0.65rem 1.25rem;font-size:0.875rem;" onclick="openCaseStudyModal('${p.id}')">
          <span>Case Study & Architecture Deep Dive</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
          <a href="${p.screensPdfs?.dark || p.screensPdfUrl || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="justify-content:center;padding:0.55rem 0.9rem;font-size:0.75rem;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            <span>🌙 Dark Screens</span>
          </a>
          <a href="${p.screensPdfs?.light || p.screensPdfUrl || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="justify-content:center;padding:0.55rem 0.9rem;font-size:0.75rem;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            <span>☀️ Light Screens</span>
          </a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  init3DTilt();
}

/* 5. Work Experience Render */
function initWorkExperience() {
  const container = document.getElementById('experience-track');
  if (!container) return;

  const data = window.PORTFOLIO_DATA.workExperience;
  if (!data || data.length === 0) return;

  container.innerHTML = '<div class="timeline-line"></div>';

  const getWorkIcon = (id) => {
    switch (id) {
      case 'upwork':
        return '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>';
      case 'fiverr':
        return '<svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>';
      case 'qodit':
        return '<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>';
      case 'resocoder':
        return '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>';
      default:
        return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>';
    }
  };

  data.forEach(item => {
    const el = document.createElement('div');
    el.className = 'timeline-item';
    el.innerHTML = `
      <div class="timeline-node" title="${item.role}">
        ${getWorkIcon(item.id)}
      </div>
      <div class="glass-card timeline-card tilt-card">
        <div class="timeline-card-header">
          <div>
            <span class="timeline-period-badge" style="background:rgba(99,102,241,0.15);color:var(--accent-primary);border-color:rgba(99,102,241,0.3);font-weight:700;">${item.period}</span>
            <h3 style="font-size:1.35rem;font-weight:700;margin-top:0.35rem;">${item.role}</h3>
            <div class="timeline-institution">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              <span>${item.company}</span>
              ${item.location ? `<span style="color:var(--text-muted);margin-left:0.5rem;">• ${item.location}</span>` : ''}
            </div>
          </div>
          <span class="timeline-status-badge" style="background:rgba(16,185,129,0.15);color:var(--accent-emerald);border-color:rgba(16,185,129,0.3);font-weight:700;">${item.badge}</span>
        </div>

        <p class="bento-desc">${item.summary}</p>

        ${item.highlights ? `
          <ul style="list-style:none;margin:1rem 0;display:flex;flex-direction:column;gap:0.4rem;font-size:0.875rem;color:var(--text-secondary);">
            ${item.highlights.map(h => `
              <li style="display:flex;align-items:flex-start;gap:0.5rem;">
                <span style="color:var(--accent-emerald);">✔</span>
                <span>${h}</span>
              </li>
            `).join('')}
          </ul>
        ` : ''}

        ${item.companyUrl ? `
          <div class="timeline-actions">
            <a href="${item.companyUrl}" target="_blank" class="btn btn-primary" style="padding:0.5rem 1rem;font-size:0.8125rem;">
              <span>View Verified Upwork Profile ↗</span>
            </a>
          </div>
        ` : ''}
      </div>
    `;
    container.appendChild(el);
  });

  init3DTilt();
}

/* 6. Academic Journey Render & Timeline Filters */
function initTimeline() {
  const container = document.getElementById('timeline-track');
  if (!container) return;

  const data = window.PORTFOLIO_DATA.academicJourney;
  renderTimelineItems(data);

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.timeline-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      if (filter === 'all') {
        renderTimelineItems(data);
      } else {
        const filtered = data.filter(d => d.category === filter);
        renderTimelineItems(filtered);
      }
      if (window.soundEngine) window.soundEngine.click();
    });
  });
}

function renderTimelineItems(items) {
  const container = document.getElementById('timeline-track');
  if (!container) return;

  container.innerHTML = '<div class="timeline-line"></div>';

  if (!items || items.length === 0) {
    container.innerHTML += '<div style="padding:2rem;text-align:center;color:var(--text-muted);">No records found in this category.</div>';
    return;
  }

  const getEduIcon = (id) => {
    switch (id) {
      case 'bsse':
        return '<svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>';
      case 'fsc':
        return '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>';
      case 'matric':
      case 'class9':
        return '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>';
      case 'class8':
      case 'class1':
      case 'prep_nursery':
        return '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
      default:
        return '<svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>';
    }
  };

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'timeline-item';
    el.innerHTML = `
      <div class="timeline-node" title="${item.title}">
        ${getEduIcon(item.id)}
      </div>
      <div class="glass-card timeline-card tilt-card">
        <div class="timeline-card-header">
          <div>
            <span class="timeline-period-badge">${item.period}</span>
            <h3 style="font-size:1.35rem;font-weight:700;margin-top:0.25rem;">${item.title}</h3>
            <div class="timeline-institution">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${item.institution}</span>
            </div>
          </div>
          <span class="timeline-status-badge">${item.badge}</span>
        </div>

        <p class="bento-desc">${item.summary}</p>

        ${item.stats ? `
          <div class="timeline-stats-row">
            ${Object.entries(item.stats).map(([k, v]) => `
              <div class="stat-pill">
                <span class="stat-pill-label">${k}:</span>
                <span class="stat-pill-val">${v}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${item.highlights ? `
          <ul style="list-style:none;margin:1rem 0;display:flex;flex-direction:column;gap:0.4rem;font-size:0.875rem;color:var(--text-secondary);">
            ${item.highlights.map(h => `
              <li style="display:flex;align-items:flex-start;gap:0.5rem;">
                <span style="color:var(--accent-emerald);">✔</span>
                <span>${h}</span>
              </li>
            `).join('')}
          </ul>
        ` : ''}

        ${item.subjects ? `
          <div style="margin-top:1rem;">
            <span style="font-size:0.75rem;color:var(--text-muted);font-family:var(--font-mono);">SUBJECT SCORES:</span>
            <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.4rem;">
              ${item.subjects.map(s => `
                <span class="tech-tag" style="background:var(--bg-secondary);">${s.name}: ${s.marks} ${s.percent ? `(${s.percent})` : ''}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${item.id === 'bsse' ? `
          <div class="timeline-actions">
            <button class="btn btn-primary" onclick="openTranscriptModal()" style="font-size:0.8125rem;padding:0.5rem 1rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <span>View 138-Credit Official Transcript</span>
            </button>
            <button class="btn btn-secondary" onclick="toggleSemesterAccordion()" id="btn-accordion-toggle" style="font-size:0.8125rem;padding:0.5rem 1rem;">
              <span>Expand 8 Semesters</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="accordion-arrow"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          </div>

          <div id="semester-accordion-content" style="display:none;margin-top:1.5rem;">
            <div class="semester-grid">
              ${item.semesters.map(sem => `
                <div class="semester-card">
                  <div class="semester-card-header">
                    <span class="semester-title">${sem.semester}</span>
                    <span class="semester-gpa">GPA ${sem.gpa} (${sem.credits} Cr)</span>
                  </div>
                  <div style="display:flex;flex-direction:column;gap:0.3rem;">
                    ${sem.courses.map(c => `
                      <div class="course-item">
                        <span class="course-name" title="${c.title}">${c.title}</span>
                        <span class="course-grade">${c.marks}% (${c.grade})</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    container.appendChild(el);
  });

  init3DTilt();
}

/* 7. Skills & Capabilities Rendering */
function initSkills() {
  const container = document.getElementById('skills-grid');
  if (!container) return;

  const cats = window.PORTFOLIO_DATA.skills.categories;
  container.innerHTML = '';

  cats.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'glass-card skill-card tilt-card';
    card.innerHTML = `
      <div class="skill-card-header">
        <div class="skill-card-icon">${cat.icon || '⚡'}</div>
        <div>
          <h3 class="skill-card-title">${cat.title}</h3>
          <p class="skill-card-desc">${cat.description}</p>
        </div>
      </div>

      <div class="skill-items-list">
        ${cat.skills.map(s => `
          <div class="skill-item-row" style="padding-bottom:0.75rem;border-bottom:1px solid rgba(255,255,255,0.03);">
            <div class="skill-item-name" style="font-size:0.9375rem;font-weight:600;color:var(--text-primary);display:flex;align-items:center;gap:0.4rem;">
              <span style="color:var(--accent-cyan);font-weight:700;">▸</span>
              <span>${s.name}</span>
            </div>

            ${s.desc ? `<div class="skill-item-details" style="font-size:0.8125rem;color:var(--text-muted);margin:0.2rem 0 0.4rem 1.1rem;line-height:1.4;">${s.desc}</div>` : ''}

            ${s.tags && s.tags.length ? `
              <div class="skill-item-tags" style="margin-left:1.1rem;display:flex;gap:0.35rem;flex-wrap:wrap;">
                ${s.tags.map(t => `<span class="skill-mini-tag">#${t}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(card);
  });

  init3DTilt();
}

/* 8. Interactive Code Sandbox Tabs */
function initCodeTabs() {
  const tabs = document.querySelectorAll('.code-tab');
  const codeContent = document.getElementById('code-tab-content');
  if (!tabs.length || !codeContent) return;

  const snippets = window.PORTFOLIO_DATA.codeSnippets || [];

  function loadCode(lang) {
    const snip = snippets.find(s => s.id === lang) || snippets[0];
    if (snip) {
      codeContent.textContent = snip.code;
    }
  }

  loadCode('flutter');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const lang = tab.dataset.lang;
      loadCode(lang);
      if (window.soundEngine) window.soundEngine.click();
    });
  });
}

/* 9. Theme Customizer Menu */
function initThemeMenu() {
  const btn = document.getElementById('theme-menu-btn');
  const dropdown = document.getElementById('theme-dropdown');
  if (!btn || !dropdown) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
    if (window.soundEngine) window.soundEngine.click();
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== btn) {
      dropdown.classList.remove('open');
    }
  });

  const optBtns = dropdown.querySelectorAll('.theme-opt-btn');
  optBtns.forEach(opt => {
    opt.addEventListener('click', () => {
      const theme = opt.dataset.theme;
      document.documentElement.setAttribute('data-theme', theme);
      optBtns.forEach(b => b.classList.remove('active'));
      opt.classList.add('active');
      dropdown.classList.remove('open');
      if (window.soundEngine) window.soundEngine.click();
      if (window.showToast) window.showToast(`Theme switched to ${theme.toUpperCase()}`);
    });
  });
}

/* 10. Modals Engine */
function updateModalScrollSlider(modal) {
  if (!modal) return;
  const body = modal.querySelector('.modal-scroll-body');
  const track = modal.querySelector('.modal-scroll-track');
  const thumb = modal.querySelector('.modal-scroll-thumb');
  if (!body || !track || !thumb) return;

  const scrollHeight = body.scrollHeight;
  const clientHeight = body.clientHeight;
  const scrollTop = body.scrollTop;

  if (scrollHeight <= clientHeight + 5) {
    track.style.display = 'none';
    return;
  }

  track.style.display = 'block';
  const trackHeight = track.clientHeight;
  
  // Proportional thumb height clamped between 48px and 75% of track
  const thumbHeight = Math.max(48, Math.min(trackHeight * 0.75, (clientHeight / scrollHeight) * trackHeight));
  thumb.style.height = `${thumbHeight}px`;

  const maxScroll = scrollHeight - clientHeight;
  const maxThumbTravel = trackHeight - thumbHeight;
  const thumbPos = maxScroll > 0 ? (scrollTop / maxScroll) * maxThumbTravel : 0;
  thumb.style.transform = `translateY(${thumbPos}px)`;
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('open');
  const openModals = document.querySelectorAll('.modal-overlay.open');
  if (openModals.length === 0) {
    document.body.style.overflow = '';
  }
  if (window.soundEngine) window.soundEngine.modalClose();
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (window.soundEngine) window.soundEngine.modalOpen();

  const body = modal.querySelector('.modal-scroll-body');
  if (body) body.scrollTop = 0;

  requestAnimationFrame(() => {
    updateModalScrollSlider(modal);
    setTimeout(() => updateModalScrollSlider(modal), 80);
  });
}

function initModals() {
  const overlays = document.querySelectorAll('.modal-overlay');

  overlays.forEach(ov => {
    ov.addEventListener('click', (e) => {
      if (e.target === ov) {
        closeModal(ov);
      }
    });

    const closeBtn = ov.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeModal(ov);
      });
    }

    // Connect custom DOM scroll slider
    const body = ov.querySelector('.modal-scroll-body');
    const track = ov.querySelector('.modal-scroll-track');
    const thumb = ov.querySelector('.modal-scroll-thumb');
    
    if (body && track && thumb) {
      body.addEventListener('scroll', () => {
        updateModalScrollSlider(ov);
      }, { passive: true });

      // Drag handling on thumb
      let isDragging = false;
      let startY = 0;
      let startScrollTop = 0;

      thumb.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
        startY = e.clientY;
        startScrollTop = body.scrollTop;
        document.body.style.userSelect = 'none';
        thumb.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaY = e.clientY - startY;
        const trackHeight = track.clientHeight;
        const thumbHeight = thumb.clientHeight;
        const maxThumbTravel = trackHeight - thumbHeight;
        const maxScroll = body.scrollHeight - body.clientHeight;
        if (maxThumbTravel > 0) {
          body.scrollTop = startScrollTop + (deltaY / maxThumbTravel) * maxScroll;
        }
      });

      window.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          document.body.style.userSelect = '';
          thumb.style.cursor = 'grab';
        }
      });

      // Track click to jump
      track.addEventListener('click', (e) => {
        if (e.target === thumb) return;
        const rect = track.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const trackHeight = track.clientHeight;
        const maxScroll = body.scrollHeight - body.clientHeight;
        body.scrollTo({
          top: (clickY / trackHeight) * maxScroll,
          behavior: 'smooth'
        });
      });
    }
  });

  window.addEventListener('resize', () => {
    overlays.forEach(ov => {
      if (ov.classList.contains('open')) {
        updateModalScrollSlider(ov);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      overlays.forEach(ov => {
        if (ov.classList.contains('open')) {
          closeModal(ov);
        }
      });
    }
  });
}

window.toggleSemesterAccordion = function() {
  const content = document.getElementById('semester-accordion-content');
  const btn = document.getElementById('btn-accordion-toggle');
  const arrow = document.getElementById('accordion-arrow');

  if (!content) return;

  if (content.style.display === 'none' || !content.style.display) {
    content.style.display = 'block';
    if (btn) btn.querySelector('span').textContent = 'Collapse Semesters';
    if (arrow) arrow.style.transform = 'rotate(180deg)';
    if (window.soundEngine) window.soundEngine.click();
  } else {
    content.style.display = 'none';
    if (btn) btn.querySelector('span').textContent = 'Expand 8 Semesters';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (window.soundEngine) window.soundEngine.click();
  }
};

window.openTranscriptModal = function() {
  const modal = document.getElementById('transcript-modal');
  const content = document.getElementById('transcript-content');
  if (!modal || !content) return;

  const bsse = window.PORTFOLIO_DATA.academicJourney.find(j => j.id === 'bsse');
  if (!bsse) return;

  content.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--glass-border);">
      <div>
        <span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--accent-cyan);text-transform:uppercase;letter-spacing:0.05em;">University of Sargodha · Official Record</span>
        <h3 style="font-size:1.5rem;font-weight:700;margin-top:0.25rem;">BS Software Engineering Transcript</h3>
      </div>
      <span class="timeline-status-badge">CGPA 2.82 (68.75%)</span>
    </div>

    <div class="timeline-stats-row" style="margin-bottom:1.5rem;">
      <div class="stat-pill"><span class="stat-pill-label">Roll No:</span><span class="stat-pill-val">${bsse.stats.rollNo}</span></div>
      <div class="stat-pill"><span class="stat-pill-label">Reg No:</span><span class="stat-pill-val">${bsse.stats.regNo}</span></div>
      <div class="stat-pill"><span class="stat-pill-label">Total Marks:</span><span class="stat-pill-val">${bsse.stats.marks}</span></div>
      <div class="stat-pill"><span class="stat-pill-label">Credit Hours:</span><span class="stat-pill-val">138 Cr (45 Courses)</span></div>
      <div class="stat-pill"><span class="stat-pill-label">Notification:</span><span class="stat-pill-val">${bsse.stats.notificationDate}</span></div>
    </div>

    <div class="semester-grid" style="grid-template-columns: 1fr;">
      ${bsse.semesters.map(sem => `
        <div class="semester-card">
          <div class="semester-card-header">
            <span class="semester-title">${sem.semester}</span>
            <span class="semester-gpa">GPA ${sem.gpa} (${sem.credits} Credit Hours)</span>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:0.8125rem;">
            <thead>
              <tr style="color:var(--text-muted);border-bottom:1px solid rgba(255,255,255,0.05);text-align:left;">
                <th style="padding:0.4rem 0;">Course</th>
                <th style="padding:0.4rem;text-align:center;">Marks</th>
                <th style="padding:0.4rem;text-align:center;">Grade</th>
                <th style="padding:0.4rem;text-align:right;">GPA</th>
              </tr>
            </thead>
            <tbody>
              ${sem.courses.map(c => `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.02);">
                  <td style="padding:0.4rem 0;color:var(--text-primary);"><span style="color:var(--text-muted);font-family:var(--font-mono);">${c.code}</span> ${c.title}</td>
                  <td style="padding:0.4rem;text-align:center;color:var(--text-secondary);font-family:var(--font-mono);">${c.marks}%</td>
                  <td style="padding:0.4rem;text-align:center;font-weight:700;color:${c.grade.startsWith('A') ? 'var(--accent-emerald)' : 'var(--text-primary)'};">${c.grade}</td>
                  <td style="padding:0.4rem;text-align:right;color:var(--accent-cyan);font-family:var(--font-mono);">${c.gpa}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}
    </div>

    <div style="margin-top:1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
      <a href="${window.PORTFOLIO_DATA.profile.pdfDownloadUrl}" target="_blank" class="btn btn-secondary" style="font-size:0.875rem;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>Download Complete 29-Page Archive PDF (21.3 MB)</span>
      </a>
      <button class="btn btn-primary" onclick="closeModal(document.getElementById('transcript-modal'))">
        <span>Close Record</span>
      </button>
    </div>
  `;

  openModal(modal);
};

window.openCertificateModal = function(id) {
  const item = window.PORTFOLIO_DATA.academicJourney.find(j => j.id === id);
  if (!item) return;

  const modal = document.getElementById('certificate-modal');
  const content = document.getElementById('certificate-content');
  if (!modal || !content) return;

  content.innerHTML = `
    <div style="text-align:center;padding:1rem 0;">
      <span class="timeline-period-badge">${item.period}</span>
      <h3 style="font-size:1.5rem;font-weight:700;margin:0.5rem 0;">${item.title}</h3>
      <p style="color:var(--text-muted);font-size:0.875rem;">${item.institution}</p>
      
      <div style="margin:1.5rem 0;padding:1.5rem;background:var(--bg-primary);border-radius:var(--radius-md);border:1px solid var(--glass-border);">
        <p style="color:var(--text-secondary);font-size:0.9375rem;line-height:1.6;">${item.summary}</p>
      </div>

      <div style="display:flex;justify-content:center;gap:1rem;">
        <a href="${window.PORTFOLIO_DATA.profile.pdfDownloadUrl}" target="_blank" class="btn btn-secondary">
          <span>View in 29-Page PDF ↗</span>
        </a>
        <button class="btn btn-primary" onclick="closeModal(document.getElementById('certificate-modal'))">
          <span>Dismiss</span>
        </button>
      </div>
    </div>
  `;

  openModal(modal);
};

window.openCaseStudyModal = function(id) {
  const p = window.PORTFOLIO_DATA.projects.find(x => x.id === id);
  if (!p) return;

  const ov = document.getElementById('case-study-modal');
  const content = document.getElementById('case-study-content');
  if (!ov || !content) return;

  content.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--glass-border);flex-wrap:wrap;gap:0.75rem;">
      <div>
        <span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--accent-cyan);text-transform:uppercase;letter-spacing:0.05em;">${p.categoryLabel}</span>
        <h3 style="font-size:1.6rem;font-weight:700;margin-top:0.25rem;">${p.title}</h3>
      </div>
      <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;">
        <a href="${p.screensPdfs?.dark || p.screensPdfUrl || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size:0.75rem;padding:0.45rem 1rem;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          <span>🌙 Dark Screens</span>
        </a>
        <a href="${p.screensPdfs?.light || p.screensPdfUrl || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size:0.75rem;padding:0.45rem 1rem;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          <span>☀️ Light Screens</span>
        </a>
        <span class="timeline-status-badge">Production Architecture</span>
      </div>
    </div>

    <div style="margin: 0 auto 1.75rem auto; width: 100%; max-width: 580px; border-radius: var(--radius-md); overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.08); aspect-ratio: 2304 / 1856; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45); background: var(--bg-primary);">
      <img src="${p.image}" alt="${p.title}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
    </div>

    <div class="project-metrics-strip" style="margin-bottom:1.5rem;">
      ${p.metrics.map(m => `
        <div class="project-metric">
          <div class="metric-val">${m.value}</div>
          <div class="metric-lbl">${m.label}</div>
        </div>
      `).join('')}
    </div>

    <div style="display:flex;flex-direction:column;gap:1.25rem;margin-bottom:1.5rem;">
      <div style="padding:1.25rem;background:var(--bg-primary);border-radius:var(--radius-md);border-left:3px solid var(--accent-primary);">
        <h4 style="font-size:0.9375rem;color:var(--accent-cyan);margin-bottom:0.4rem;">Architectural Challenge</h4>
        <p style="font-size:0.875rem;color:var(--text-secondary);line-height:1.5;">${p.caseStudy?.challenge || p.description}</p>
      </div>

      <div style="padding:1.25rem;background:var(--bg-primary);border-radius:var(--radius-md);border-left:3px solid var(--accent-emerald);">
        <h4 style="font-size:0.9375rem;color:var(--accent-emerald);margin-bottom:0.4rem;">Engineering Solution</h4>
        <p style="font-size:0.875rem;color:var(--text-secondary);line-height:1.5;">${p.caseStudy?.solution || p.description}</p>
      </div>

      ${p.caseStudy?.features ? `
        <div>
          <h4 style="font-size:0.9375rem;margin-bottom:0.75rem;">Core Features & Architecture Deliverables:</h4>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:0.5rem;font-size:0.875rem;color:var(--text-secondary);">
            ${p.caseStudy.features.map(f => `
              <li style="display:flex;align-items:flex-start;gap:0.5rem;">
                <span style="color:var(--accent-cyan);">▸</span>
                <span>${f}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:1.25rem;border-top:1px solid var(--glass-border);flex-wrap:wrap;gap:1rem;">
      <div style="display:flex;gap:0.4rem;flex-wrap:wrap;align-items:center;">
        ${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
      </div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
        <a href="${p.screensPdfs?.dark || p.screensPdfUrl || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size:0.8125rem;padding:0.55rem 1.1rem;">
          <span>🌙 Dark Theme Screens ↗</span>
        </a>
        <a href="${p.screensPdfs?.light || p.screensPdfUrl || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size:0.8125rem;padding:0.55rem 1.1rem;">
          <span>☀️ Light Theme Screens ↗</span>
        </a>
        <a href="https://www.upwork.com/freelancers/kalimullahdev" target="_blank" class="btn btn-primary" style="font-size:0.8125rem;">
          <span>Hire Kalim for Similar Builds ↗</span>
        </a>
      </div>
    </div>
  `;

  openModal(ov);
};

/* 11. Audio Toggle */
function initAudioToggle() {
  const btn = document.getElementById('audio-toggle-btn');
  if (!btn) return;

  const updateBtnState = (active) => {
    btn.style.color = active ? 'var(--accent-primary)' : 'var(--text-muted)';
    btn.style.borderColor = active ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.08)';
    btn.style.background = active ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.04)';
    btn.setAttribute('title', active ? 'Audio Feedback: ON (Click to mute)' : 'Audio Feedback: MUTED (Click to enable)');
  };

  // Audio enabled by default
  if (window.soundEngine) {
    updateBtnState(window.soundEngine.enabled);
  }

  btn.addEventListener('click', () => {
    if (window.soundEngine) {
      const active = window.soundEngine.toggle();
      updateBtnState(active);
      if (window.showToast) window.showToast(active ? "Tactile audio feedback enabled" : "Audio muted");
    }
  });
}

/* 12. Live Local Time */
function initLocalTime() {
  const timeEl = document.getElementById('live-local-time');
  if (!timeEl) return;

  function update() {
    const options = { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const timeStr = new Intl.DateTimeFormat('en-US', options).format(new Date());
    timeEl.textContent = `PKT (UTC+5): ${timeStr}`;
  }
  update();
  setInterval(update, 1000);
}

/* 13. Toast Notification Engine */
window.showToast = function(message, duration = 2800) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span style="color:var(--accent-cyan);font-weight:700;">⚡</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, duration);
};
