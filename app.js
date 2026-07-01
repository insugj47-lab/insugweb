document.addEventListener('DOMContentLoaded', () => {
  // Lucide 아이콘 초기화
  if (window.lucide && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }

  const pageLoader = document.getElementById('page-loader');
  if (pageLoader) {
    const hideLoader = () => {
      pageLoader.classList.add('hidden');
    };

    window.addEventListener('load', () => {
      setTimeout(hideLoader, 800);
    });

    setTimeout(() => {
      if (!pageLoader.classList.contains('hidden')) {
        hideLoader();
      }
    }, 5000);
  }

  /* ==========================================
     SCROLL PROGRESS & BACK TO TOP
     ========================================== */
  const scrollProgressBar = document.querySelector('.scroll-progress-bar');
  const scrollTopBtn = document.getElementById('scroll-top-btn');

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }

    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('visible', scrollTop > 500);
    }
  }

  const mainHeader = document.querySelector('.main-header');

  function updateHeaderState() {
    if (mainHeader) {
      mainHeader.classList.toggle('scrolled', window.scrollY > 20);
    }
  }

  updateScrollProgress();
  updateHeaderState();
  window.addEventListener('scroll', () => {
    updateScrollProgress();
    updateHeaderState();
  }, { passive: true });
  window.addEventListener('load', () => {
    updateScrollProgress();
    updateHeaderState();
  });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================
     MOBILE MENU & AMBIENT MUSIC
     ========================================== */
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const mobileMenuPanel = document.getElementById('mobile-menu-panel');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const musicToggleBtn = document.getElementById('music-toggle');

  function openMobileMenu() {
    if (mobileMenuPanel) {
      mobileMenuPanel.classList.remove('hidden');
      mobileMenuPanel.classList.add('is-open');
      mobileMenuPanel.setAttribute('aria-hidden', 'false');
    }
    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.remove('hidden');
    }
    if (mobileMenuToggle) {
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
    }
    document.body.classList.add('mobile-menu-open');
  }

  function closeMobileMenu() {
    if (mobileMenuPanel) {
      mobileMenuPanel.classList.remove('is-open');
      mobileMenuPanel.classList.add('hidden');
      mobileMenuPanel.setAttribute('aria-hidden', 'true');
    }
    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.add('hidden');
    }
    if (mobileMenuToggle) {
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }
    document.body.classList.remove('mobile-menu-open');
  }

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      const isOpen = mobileMenuPanel?.classList.contains('is-open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
  }

  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
  }

  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeMobileMenu();
    }
  });

  let audioContext = null;
  let masterGain = null;
  let musicTimer = null;
  let musicEnabled = false;
  let musicNoteIndex = 0;
  const musicNotes = [261.63, 329.63, 392, 329.63, 293.66, 261.63];

  function updateMusicButtonUI() {
    if (!musicToggleBtn) return;
    if (musicEnabled) {
      musicToggleBtn.classList.add('active');
      musicToggleBtn.setAttribute('title', '배경 음악 끄기');
      musicToggleBtn.setAttribute('aria-label', '배경 음악 끄기');
    } else {
      musicToggleBtn.classList.remove('active');
      musicToggleBtn.setAttribute('title', '배경 음악 켜기');
      musicToggleBtn.setAttribute('aria-label', '배경 음악 켜기');
    }
  }

  function stopAmbientMusic() {
    if (musicTimer) {
      clearTimeout(musicTimer);
      musicTimer = null;
    }
    musicEnabled = false;
    updateMusicButtonUI();
  }

  function playAmbientNote(freq, duration = 1.4) {
    if (!audioContext) {
      audioContext = new AudioContext();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.03;
      masterGain.connect(audioContext.destination);
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 1.002;

    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.018, audioContext.currentTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(masterGain);

    osc1.start();
    osc2.start();
    osc1.stop(audioContext.currentTime + duration + 0.2);
    osc2.stop(audioContext.currentTime + duration + 0.2);
  }

  function startAmbientMusic() {
    if (musicEnabled) return;

    musicEnabled = true;
    updateMusicButtonUI();

    const scheduleNextNote = () => {
      if (!musicEnabled) return;
      playAmbientNote(musicNotes[musicNoteIndex % musicNotes.length], 1.3);
      musicNoteIndex = (musicNoteIndex + 1) % musicNotes.length;
      musicTimer = setTimeout(scheduleNextNote, 1400);
    };

    scheduleNextNote();
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
      if (musicEnabled) {
        stopAmbientMusic();
      } else {
        startAmbientMusic();
      }
    });
  }

  /* ==========================================
     REVEAL ANIMATIONS
     ========================================== */
  document.querySelectorAll('.section-container, .card, .hero-content').forEach((element) => {
    element.classList.add('reveal-on-scroll');
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal-on-scroll').forEach((element) => {
    revealObserver.observe(element);
  });

  /* ==========================================
     THEME TOGGLE (DARK / LIGHT)
     ========================================== */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const body = document.body;

  // 로컬 스토리지에서 이전 테마 로드
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    body.classList.add('light-theme');
  }

  themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
  });

  /* ==========================================
     MOUSE TRACKING FOR INTERACTIVE PARTICLES
     ========================================== */
  const mouse = {
    x: undefined,
    y: undefined,
    radius: 120 // 상호작용 반경
  };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = undefined;
    mouse.y = undefined;
  });

  /* ==========================================
     DYNAMIC CANVAS PARTICLES (CHERRY BLOSSOM & FRUIT)
     ========================================== */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  const particleToggleBtn = document.getElementById('particle-toggle');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // 파티클 종류 모드: 'cherry' (벚꽃) 또는 'fruit' (과일&땅콩)
  let particleMode = localStorage.getItem('particleMode') || 'cherry';
  const particles = [];
  const maxParticles = 55; // 파티클 밀도 약간 상승

  const fruitEmojis = ['🍉', '🥜', '🍊', '🍋', '🍇', '🍒', '🍈'];
  const cherryColor = 'rgba(255, 183, 197, 0.7)';
  const cherryDarkColor = 'rgba(244, 143, 177, 0.82)';

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height - height; // 화면 위쪽에서 시작
      this.size = Math.random() * 12 + 8;
      
      if (particleMode === 'cherry') {
        this.speedX = Math.random() * 1.5 - 0.5;
        this.speedY = Math.random() * 1.5 + 1.0;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
        this.opacity = Math.random() * 0.4 + 0.4;
      } else {
        // 과일 모드는 둥둥 떠다니는 느낌
        this.emoji = fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
        this.speedX = Math.random() * 1.0 - 0.5;
        this.speedY = Math.random() * 0.8 + 0.4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 1 - 0.5;
        this.opacity = Math.random() * 0.3 + 0.4;
      }
    }

    update() {
      // 마우스 상호작용 (반발 효과)
      if (mouse.x !== undefined && mouse.y !== undefined) {
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          // 마우스 반대 방향 벡터 계산
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          
          // 거리가 가까울수록 강한 밀쳐냄
          let maxForce = 5;
          let force = (mouse.radius - distance) / mouse.radius;
          let directionX = forceDirectionX * force * maxForce;
          let directionY = forceDirectionY * force * maxForce;
          
          // 파티클 위치 부드럽게 밀어내기
          this.x += directionX;
          this.y += directionY;
        }
      }

      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;

      // 화면 아래로 벗어나면 리셋
      if (this.y > height + 20 || this.x > width + 20 || this.x < -20) {
        this.reset();
        this.y = -20; // 상단 바로 위에서 재진입
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;

      if (particleMode === 'cherry') {
        ctx.fillStyle = Math.random() > 0.5 ? cherryColor : cherryDarkColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size / 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.font = `${this.size * 1.8}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, 0, 0);
      }
      ctx.restore();
    }
  }

  // 초기 파티클 생성
  for (let i = 0; i < maxParticles; i++) {
    const p = new Particle();
    p.y = Math.random() * height;
    particles.push(p);
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    if (body.classList.contains('light-theme')) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(0, 0, width, height);
    }

    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();

  particleToggleBtn.addEventListener('click', () => {
    particleMode = particleMode === 'cherry' ? 'fruit' : 'cherry';
    localStorage.setItem('particleMode', particleMode);
    
    particles.forEach((p) => p.reset());
    
    particleToggleBtn.classList.add('pulse');
    setTimeout(() => particleToggleBtn.classList.remove('pulse'), 500);
  });

  /* ==========================================
     3D TILT EFFECT & GLOW FOR CARDS
     ========================================== */
  const cards = document.querySelectorAll('.card');

  cards.forEach((card) => {
    const glow = card.querySelector('.card-glow');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (glow) {
        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);
      }

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = -(y - centerY) / 12;
      const rotateY = (x - centerX) / 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  /* ==========================================
     IN-GAME QUICK PLAYER MODAL with FULLSCREEN
     ========================================== */
  const modal = document.getElementById('game-modal');
  const modalIframe = document.getElementById('game-iframe');
  const modalTitle = document.getElementById('modal-game-title');
  const modalLoader = document.querySelector('.iframe-loader');
  const modalCloseBtn = document.getElementById('modal-close');
  const modalRefreshBtn = document.getElementById('modal-refresh');
  const modalFullscreenBtn = document.getElementById('modal-fullscreen');
  const playButtons = document.querySelectorAll('.btn-play-now');

  let activeGameUrl = '';

  playButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const gameUrl = btn.getAttribute('data-game-url');
      const gameTitle = btn.closest('.card').querySelector('h3').textContent;

      activeGameUrl = gameUrl;
      modalTitle.innerHTML = `<i data-lucide="gamepad-2"></i> ${gameTitle} (insugj47)`;
      lucide.createIcons();

      modalLoader.classList.remove('hidden');
      modalIframe.src = gameUrl;
      modal.classList.remove('hidden');
      body.style.overflow = 'hidden';
    });
  });

  modalIframe.addEventListener('load', () => {
    modalLoader.classList.add('hidden');
  });

  // 모달 닫기
  function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('fullscreen-modal'); // 전체화면 해제
    
    // 전체화면 아이콘 리셋
    const icon = modalFullscreenBtn.querySelector('i');
    icon.setAttribute('data-lucide', 'maximize');
    modalFullscreenBtn.setAttribute('title', '전체화면');
    lucide.createIcons();

    modalIframe.src = '';
    body.style.overflow = '';
  }

  modalCloseBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  modalRefreshBtn.addEventListener('click', () => {
    if (activeGameUrl) {
      modalLoader.classList.remove('hidden');
      modalIframe.src = activeGameUrl;
    }
  });

  // 전체화면 토글
  modalFullscreenBtn.addEventListener('click', () => {
    modal.classList.toggle('fullscreen-modal');
    const isFullscreen = modal.classList.contains('fullscreen-modal');
    const icon = modalFullscreenBtn.querySelector('i');

    if (isFullscreen) {
      icon.setAttribute('data-lucide', 'minimize');
      modalFullscreenBtn.setAttribute('title', '창 화면으로 복귀');
    } else {
      icon.setAttribute('data-lucide', 'maximize');
      modalFullscreenBtn.setAttribute('title', '전체화면');
    }
    lucide.createIcons();
  });

  /* ==========================================
     GUESTBOOK SYSTEM (LOCALSTORAGE) with CONFETTI
     ========================================== */
  const guestbookForm = document.getElementById('guestbook-form');
  const nicknameInput = document.getElementById('nickname');
  const emojiSelect = document.getElementById('emoji-select');
  const messageInput = document.getElementById('message');
  const messagesList = document.getElementById('guestbook-messages');
  const messageCountSpan = document.getElementById('message-count');
  const clearGuestbookBtn = document.getElementById('clear-guestbook');

  let guestbookData = JSON.parse(localStorage.getItem('insug_guestbook')) || [];

  function saveGuestbook() {
    localStorage.setItem('insug_guestbook', JSON.stringify(guestbookData));
  }

  // 이모지별 테두리 클래스 반환
  function getGlowClass(emoji) {
    switch (emoji) {
      case '🥜': return 'msg-peanut';
      case '🍉': return 'msg-watermelon';
      case '🌸': return 'msg-cherry';
      case '🎮': return 'msg-game';
      case '🔥': return 'msg-fire';
      default: return '';
    }
  }

  function renderGuestbook() {
    messagesList.innerHTML = '';
    messageCountSpan.textContent = guestbookData.length;

    if (guestbookData.length === 0) {
      messagesList.innerHTML = `
        <div class="no-messages text-muted">
          <i data-lucide="info" class="empty-icon"></i>
          <p>아직 남겨진 메시지가 없습니다. 첫 번째 발자취를 남겨보세요!</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    guestbookData.forEach((item) => {
      const card = document.createElement('div');
      // 이모지 타입별 테두리 글로우 클래스 동적 주입
      const glowClass = getGlowClass(item.emoji);
      card.className = `message-card glass ${glowClass}`;

      const date = new Date(item.timestamp);
      const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

      card.innerHTML = `
        <div class="msg-header">
          <div class="msg-user">
            <span class="msg-emoji">${escapeHTML(item.emoji)}</span>
            <span>${escapeHTML(item.nickname)}</span>
          </div>
          <span class="msg-date">${formattedDate}</span>
        </div>
        <div class="msg-content">${escapeHTML(item.message)}</div>
      `;
      messagesList.appendChild(card);
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      (tag) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // 꽃가루(Confetti) 이펙트 기능 구현
  function triggerConfetti() {
    const colors = ['#f85078', '#feb47b', '#00f2fe', '#7f00ff', '#ffeb3b', '#4caf50'];
    const confettiCount = 80;

    for (let i = 0; i < confettiCount; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      
      // 랜덤 물리 속성 설정
      const size = Math.random() * 8 + 6;
      piece.style.width = `${size}px`;
      piece.style.height = `${size}px`;
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = `${Math.random() * 100}vw`;
      
      // 애니메이션 랜덤 딜레이 및 재생 속도
      const delay = Math.random() * 0.5;
      const duration = Math.random() * 2.0 + 1.5;
      piece.style.animationDelay = `${delay}s`;
      piece.style.animationDuration = `${duration}s`;
      
      // 모양 다양화 (반은 둥글게, 반은 네모낳게)
      if (Math.random() > 0.5) {
        piece.style.borderRadius = '0';
      }

      document.body.appendChild(piece);

      // 애니메이션 끝나면 요소 제거
      setTimeout(() => {
        piece.remove();
      }, (delay + duration) * 1000);
    }
  }

  // 방명록 등록
  guestbookForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nickname = nicknameInput.value.trim();
    const emoji = emojiSelect.value;
    const message = messageInput.value.trim();

    if (!nickname || !message) return;

    const newPost = {
      nickname,
      emoji,
      message,
      timestamp: Date.now()
    };

    guestbookData.unshift(newPost);
    saveGuestbook();
    renderGuestbook();

    // 꽃가루 이펙트 발사
    triggerConfetti();

    // 폼 초기화
    guestbookForm.reset();
  });

  // 방명록 비우기
  clearGuestbookBtn.addEventListener('click', () => {
    if (guestbookData.length === 0) return;
    if (confirm('방명록을 모두 비우시겠습니까? (이 작업은 되돌릴 수 없습니다)')) {
      guestbookData = [];
      saveGuestbook();
      renderGuestbook();
    }
  });

  renderGuestbook();

  /* ==========================================
     ACTIVE NAVIGATION ON SCROLL
     ========================================== */
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop - 150) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
});
