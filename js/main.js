/**
 * AVIMUKT ENGINEERS PVT LTD — DEEP-TECH AEROSPACE DIGITAL SUITE
 * Interactive 3D Hero Hardware Canvas & "Photon to Regulated Load" Simulator Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();
  initMobileMenu();
  initHeroHardwareCanvas();
  initHeroCardTilt();
  initSimulatorEngine();
  initRfqHandler();
});

/* ==========================================================================
   1. Live Telemetry Clock & HUD Status
   ========================================================================== */
function initLiveClock() {
  const clockEl = document.getElementById('utc-clock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const utcStr = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    clockEl.textContent = utcStr;
  }
  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. Mobile Drawer Navigation
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.querySelector('[data-nav-toggle]');
  const drawer = document.querySelector('[data-mobile-drawer]');
  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });

  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   3. Interactive 3D Hero Hardware Canvas (Photon Flux -> Perovskite Layer)
   ========================================================================== */
function initHeroHardwareCanvas() {
  const canvas = document.getElementById('hero-cell-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let width, height;

  function resize() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight || 240;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  resize();
  window.addEventListener('resize', resize);

  // Particles: Photons (Gold) & Electrons (Cyan)
  const photons = [];
  const electrons = [];
  const particleCount = 28;

  for (let i = 0; i < particleCount; i++) {
    photons.push({
      x: Math.random() * (width * 0.6) + (width * 0.2),
      y: Math.random() * 40,
      speed: 1.5 + Math.random() * 2,
      length: 8 + Math.random() * 12,
      opacity: 0.4 + Math.random() * 0.6
    });
  }

  let angle = 0;

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw 3D Isometric Perovskite Cell Stack in Center
    const centerX = width * 0.5;
    const centerY = height * 0.58;
    const cellW = Math.min(width * 0.55, 180);
    const cellH = cellW * 0.45;
    const depth = 14;

    // Bottom Substrate (Slate)
    ctx.fillStyle = "rgba(30, 41, 59, 0.8)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    drawIsoBlock(ctx, centerX, centerY + depth, cellW, cellH, depth, "#0F172A", "rgba(56, 189, 248, 0.2)");

    // Active Perovskite Layer (Iridescent Obsidian Blue)
    drawIsoBlock(ctx, centerX, centerY, cellW, cellH, 6, "#1E3A8A", "#F5A623");

    // Gold Contact Edge Tabs
    drawTab(ctx, centerX - cellW * 0.5 - 6, centerY - 2, 10, 16, "#F5A623");
    drawTab(ctx, centerX + cellW * 0.5 + 6, centerY - 2, 10, 16, "#64748B");

    // 2. Animate Incoming Photons (Golden light rays)
    ctx.lineWidth = 1.5;
    photons.forEach(p => {
      ctx.strokeStyle = `rgba(245, 166, 35, ${p.opacity})`;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 4, p.y + p.length);
      ctx.stroke();

      p.y += p.speed;
      p.x -= p.speed * 0.25;

      if (p.y > centerY - 10) {
        // Impact at cell surface: spawn electron pulse
        if (Math.random() > 0.6 && electrons.length < 24) {
          electrons.push({
            x: p.x,
            y: centerY - Math.random() * 8,
            targetX: (Math.random() > 0.5 ? centerX - cellW * 0.5 : centerX + cellW * 0.5),
            progress: 0,
            speed: 0.04 + Math.random() * 0.03
          });
        }
        p.y = 0;
        p.x = Math.random() * (width * 0.6) + (width * 0.2);
      }
    });

    // 3. Animate Electrons flowing towards contact tabs (Cyan glowing pulses)
    for (let i = electrons.length - 1; i >= 0; i--) {
      const e = electrons[i];
      e.progress += e.speed;
      const curX = e.x + (e.targetX - e.x) * e.progress;
      const curY = e.y + Math.sin(e.progress * Math.PI) * 4;

      ctx.fillStyle = "#00F0FF";
      ctx.shadowColor = "#00F0FF";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(curX, curY, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (e.progress >= 1) {
        electrons.splice(i, 1);
      }
    }

    // Layer Label
    ctx.font = "600 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#FFC453";
    ctx.textAlign = "center";
    ctx.fillText("PEROVSKITE ACTIVE LAYER (UNENCAPSULATED)", centerX, height - 12);

    angle += 0.02;
    animationFrameId = requestAnimationFrame(draw);
  }

  function drawIsoBlock(c, cx, cy, w, h, d, faceColor, edgeColor) {
    // Top face
    c.fillStyle = faceColor;
    c.strokeStyle = edgeColor;
    c.beginPath();
    c.moveTo(cx, cy - h * 0.5);
    c.lineTo(cx + w * 0.5, cy);
    c.lineTo(cx, cy + h * 0.5);
    c.lineTo(cx - w * 0.5, cy);
    c.closePath();
    c.fill();
    c.stroke();

    // Front Left face
    c.fillStyle = "rgba(10, 15, 26, 0.9)";
    c.beginPath();
    c.moveTo(cx - w * 0.5, cy);
    c.lineTo(cx, cy + h * 0.5);
    c.lineTo(cx, cy + h * 0.5 + d);
    c.lineTo(cx - w * 0.5, cy + d);
    c.closePath();
    c.fill();
    c.stroke();

    // Front Right face
    c.fillStyle = "rgba(15, 23, 42, 0.95)";
    c.beginPath();
    c.moveTo(cx + w * 0.5, cy);
    c.lineTo(cx, cy + h * 0.5);
    c.lineTo(cx, cy + h * 0.5 + d);
    c.lineTo(cx + w * 0.5, cy + d);
    c.closePath();
    c.fill();
    c.stroke();
  }

  function drawTab(c, x, y, w, h, color) {
    c.fillStyle = color;
    c.shadowColor = color;
    c.shadowBlur = 6;
    c.fillRect(x - w * 0.5, y - h * 0.5, w, h);
    c.shadowBlur = 0;
  }

  draw();
}

/* ==========================================================================
   4. Hero Card 3D Magnetic Tilt
   ========================================================================== */
function initHeroCardTilt() {
  const card = document.querySelector('[data-tilt-stage]');
  if (!card) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (-y / rect.height) * 8;
    const rotateY = (x / rect.width) * 8;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
  });
}

/* ==========================================================================
   5. THE SIGNATURE "HOW IT WORKS" INTERACTIVE SIMULATOR (PART 3)
   ========================================================================== */
function initSimulatorEngine() {
  const container = document.getElementById('interactive-simulator');
  if (!container) return;

  const state = {
    activePhase: 1,
    irradiance: 1000,
    arrayConfig: 'series-parallel',
    activeCapability: 2,
    targetLoad: 'balloon',
    faultActive: false
  };

  const stepButtons = container.querySelectorAll('.sim-step-btn');
  const irradianceSlider = document.getElementById('sim-irradiance');
  const irradianceVal = document.getElementById('sim-irradiance-val');
  const arrayToggles = container.querySelectorAll('[data-array-mode]');
  const capItems = container.querySelectorAll('.sim-cap-item');
  const loadToggles = container.querySelectorAll('[data-load-target]');
  const faultBtn = document.getElementById('sim-fault-btn');
  
  const readoutVoltage = document.getElementById('readout-voltage');
  const readoutCurrent = document.getElementById('readout-current');
  const readoutPower = document.getElementById('readout-power');
  const readoutEfficiency = document.getElementById('readout-efficiency');
  const simStageDesc = document.getElementById('sim-stage-desc');
  const svgCanvas = document.getElementById('sim-svg-canvas');

  stepButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.getAttribute('data-step'), 10);
      setPhase(step);
    });
  });

  function setPhase(phase) {
    state.activePhase = phase;
    stepButtons.forEach(b => {
      const isAct = parseInt(b.getAttribute('data-step'), 10) === phase;
      b.classList.toggle('is-active', isAct);
    });
    renderSimulation();
  }

  if (irradianceSlider) {
    irradianceSlider.addEventListener('input', (e) => {
      state.irradiance = parseInt(e.target.value, 10);
      if (irradianceVal) irradianceVal.textContent = `${state.irradiance} W/m²`;
      renderSimulation();
    });
  }

  arrayToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      arrayToggles.forEach(t => t.classList.remove('is-active'));
      toggle.classList.add('is-active');
      state.arrayConfig = toggle.getAttribute('data-array-mode');
      renderSimulation();
    });
  });

  capItems.forEach(item => {
    item.addEventListener('click', () => {
      capItems.forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');
      state.activeCapability = parseInt(item.getAttribute('data-cap'), 10);
      renderSimulation();
    });
  });

  loadToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      loadToggles.forEach(t => t.classList.remove('is-active'));
      toggle.classList.add('is-active');
      state.targetLoad = toggle.getAttribute('data-load-target');
      renderSimulation();
    });
  });

  if (faultBtn) {
    faultBtn.addEventListener('click', () => {
      state.faultActive = !state.faultActive;
      faultBtn.classList.toggle('is-active', state.faultActive);
      faultBtn.innerHTML = state.faultActive ? 
        `<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M12 9v4M12 17h.01M5 19h14a2 2 0 001.8-2.8L13.8 4.2a2 2 0 00-3.6 0L3.2 16.2A2 2 0 005 19z" stroke="currentColor" stroke-width="2"/></svg> Fault Clamped (Reset)` :
        `<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2"/></svg> Inject Overvoltage Surge`;
      renderSimulation();
    });
  }

  function renderSimulation() {
    const sunRatio = state.irradiance / 1000;
    const rawVoc = 1.15;
    const rawIsc = 0.85 * sunRatio;

    let totalVoltage = rawVoc;
    let totalCurrent = rawIsc;

    if (state.activePhase === 1) {
      totalVoltage = rawVoc;
      totalCurrent = rawIsc;
    } else if (state.activePhase >= 2) {
      switch (state.arrayConfig) {
        case 'series':
          totalVoltage = rawVoc * 4;
          totalCurrent = rawIsc;
          break;
        case 'parallel':
          totalVoltage = rawVoc;
          totalCurrent = rawIsc * 4;
          break;
        case 'series-parallel':
        default:
          totalVoltage = rawVoc * 2;
          totalCurrent = rawIsc * 2;
          break;
      }
    }

    let regulatedVoltage = totalVoltage;
    let regulatedCurrent = totalCurrent;
    let efficiency = 95.2;
    let statusText = "NOMINAL CHARGING";

    if (state.activePhase >= 3) {
      if (state.targetLoad === 'balloon') {
        regulatedVoltage = 12.0;
        regulatedCurrent = (totalVoltage * totalCurrent * (efficiency / 100)) / regulatedVoltage;
      } else if (state.targetLoad === 'soldier') {
        regulatedVoltage = 5.0;
        regulatedCurrent = (totalVoltage * totalCurrent * (efficiency / 100)) / regulatedVoltage;
      } else {
        regulatedVoltage = 24.0;
        regulatedCurrent = (totalVoltage * totalCurrent * (efficiency / 100)) / regulatedVoltage;
      }
    }

    if (state.faultActive) {
      regulatedVoltage = 0.0;
      regulatedCurrent = 0.0;
      statusText = "PROTECTION ACTIVE (STAGE 5 CLAMPED)";
      efficiency = 0.0;
    }

    const totalPower = (state.activePhase >= 3) ? 
      (regulatedVoltage * regulatedCurrent) : 
      (totalVoltage * totalCurrent);

    if (readoutVoltage) readoutVoltage.textContent = (state.faultActive ? '0.00 V' : `${totalVoltage.toFixed(2)} V`);
    if (readoutCurrent) readoutCurrent.textContent = (state.faultActive ? '0.00 A' : `${totalCurrent.toFixed(2)} A`);
    if (readoutPower) readoutPower.textContent = (state.faultActive ? '0.00 W' : `${totalPower.toFixed(2)} W`);
    if (readoutEfficiency) readoutEfficiency.textContent = `${efficiency.toFixed(1)}%`;

    updateStageDescription(statusText);
    renderSvgGraphics(totalVoltage, totalCurrent, totalPower);
  }

  function updateStageDescription(status) {
    if (!simStageDesc) return;
    
    let desc = "";
    switch(state.activePhase) {
      case 1:
        desc = `<strong>Phase 1 — Single Perovskite Cell:</strong> Incident photons strike the unencapsulated perovskite active crystal layer at ${state.irradiance} W/m². Photon absorption excites electron-hole pairs, producing a continuous direct current across the two gold contact tabs (V<sub>OC</sub>: 1.15V, I<sub>SC</sub>: ${(0.85 * (state.irradiance/1000)).toFixed(2)}A).`;
        break;
      case 2:
        desc = `<strong>Phase 2 — Array Interconnection:</strong> Individual cells are linked in <em>${state.arrayConfig.toUpperCase()}</em> topology. Like conventional panels, stringing cells scales voltage and current up to the specific payload requirement before reaching the controller.`;
        break;
      case 3:
        desc = `<strong>Phase 3 — 8-Capability Charge Controller:</strong> Raw, variable solar power enters <em>Stage 1 (Solar Input Interface)</em> and is conditioned by <em>Stage 2 (Controlled Charging)</em> tuned specifically to perovskite I-V curves. Real-time telemetry: <strong>${status}</strong>.`;
        break;
      case 4:
        desc = `<strong>Phase 4 — Regulated Load Delivery:</strong> Regulated output feeds the <em>${state.targetLoad.toUpperCase()}</em> platform at ${(state.targetLoad === 'balloon' ? '12.0V bus' : state.targetLoad === 'soldier' ? '5.0V USB' : '24.0V rig')}. The complete loop from photon capture to mission power is closed.`;
        break;
    }
    simStageDesc.innerHTML = desc;
  }

  function renderSvgGraphics(v, i, p) {
    if (!svgCanvas) return;

    const isPhase1 = state.activePhase === 1;

    const photonRays = Array.from({length: 6}, (_, idx) => {
      const x = 70 + idx * 30;
      return `<line x1="${x}" y1="20" x2="${x + 20}" y2="90" stroke="#F5A623" stroke-width="2" stroke-dasharray="4 4" class="flowing-line" opacity="0.85"/>
              <polygon points="${x+20},90 ${x+14},80 ${x+26},82" fill="#F5A623"/>`;
    }).join('');

    let svgContent = `
      <defs>
        <linearGradient id="cellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1E3A8A"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
        <linearGradient id="controllerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1E293B"/>
          <stop offset="100%" stop-color="#0B1322"/>
        </linearGradient>
        <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
    `;

    if (isPhase1) {
      svgContent += `
        <g transform="translate(60, 90)">
          ${photonRays}
          <rect x="0" y="0" width="180" height="150" rx="8" fill="url(#cellGrad)" stroke="${state.faultActive ? '#EF4444' : '#F5A623'}" stroke-width="2" />
          <text x="90" y="65" text-anchor="middle" fill="#FFFFFF" font-family="Space Grotesk, sans-serif" font-size="13" font-weight="700">PEROVSKITE</text>
          <text x="90" y="85" text-anchor="middle" fill="#F5A623" font-family="JetBrains Mono, monospace" font-size="11">ACTIVE LAYER</text>
          <text x="90" y="110" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="10">Unencapsulated</text>

          <rect x="-15" y="40" width="15" height="24" rx="2" fill="#F5A623" filter="url(#glowGold)"/>
          <text x="-7" y="56" text-anchor="middle" fill="#000" font-family="JetBrains Mono" font-size="10" font-weight="700">+</text>
          
          <rect x="-15" y="90" width="15" height="24" rx="2" fill="#64748B"/>
          <text x="-7" y="106" text-anchor="middle" fill="#FFF" font-family="JetBrains Mono" font-size="10" font-weight="700">-</text>

          <path d="M 180 75 L 340 75" fill="none" stroke="#F5A623" stroke-width="3" class="flowing-line"/>
          <circle cx="260" cy="75" r="4" fill="#00E5FF" filter="url(#glowCyan)"/>
        </g>
      `;
    } else {
      svgContent += `
        <g transform="translate(40, 80)">
          <g transform="translate(0, 0)">
            <rect x="0" y="0" width="80" height="65" rx="4" fill="url(#cellGrad)" stroke="#F5A623" stroke-width="1.5"/>
            <text x="40" y="38" text-anchor="middle" fill="#FFF" font-family="JetBrains Mono" font-size="9">CELL 1</text>
          </g>
          <g transform="translate(90, 0)">
            <rect x="0" y="0" width="80" height="65" rx="4" fill="url(#cellGrad)" stroke="#F5A623" stroke-width="1.5"/>
            <text x="40" y="38" text-anchor="middle" fill="#FFF" font-family="JetBrains Mono" font-size="9">CELL 2</text>
          </g>
          <g transform="translate(0, 75)">
            <rect x="0" y="0" width="80" height="65" rx="4" fill="url(#cellGrad)" stroke="#F5A623" stroke-width="1.5"/>
            <text x="40" y="38" text-anchor="middle" fill="#FFF" font-family="JetBrains Mono" font-size="9">CELL 3</text>
          </g>
          <g transform="translate(90, 75)">
            <rect x="0" y="0" width="80" height="65" rx="4" fill="url(#cellGrad)" stroke="#F5A623" stroke-width="1.5"/>
            <text x="40" y="38" text-anchor="middle" fill="#FFF" font-family="JetBrains Mono" font-size="9">CELL 4</text>
          </g>

          <path d="M 80 32 L 90 32 M 80 107 L 90 107 M 170 70 L 250 70" fill="none" stroke="#F5A623" stroke-width="2.5" class="flowing-line"/>
          <text x="85" y="160" text-anchor="middle" fill="#F5A623" font-family="JetBrains Mono" font-size="10">${state.arrayConfig.toUpperCase()} ARRAY</text>
        </g>
      `;
    }

    svgContent += `
      <g transform="translate(300, 50)">
        <rect x="0" y="0" width="340" height="230" rx="10" fill="url(#controllerGrad)" stroke="${state.faultActive ? '#EF4444' : '#00E5FF'}" stroke-width="1.8"/>
        
        <text x="170" y="24" text-anchor="middle" fill="#00E5FF" font-family="Space Grotesk, sans-serif" font-size="12" font-weight="700" letter-spacing="1">
          PEROVSKITE CHARGE CONTROLLER
        </text>

        <rect x="15" y="40" width="95" height="40" rx="4" fill="${state.activeCapability === 1 ? 'rgba(245,166,35,0.3)' : 'rgba(255,255,255,0.05)'}" stroke="#F5A623" stroke-width="1"/>
        <text x="62" y="64" text-anchor="middle" fill="#FFF" font-family="JetBrains Mono" font-size="8.5">1. Input Stage</text>

        <rect x="120" y="40" width="100" height="40" rx="4" fill="${state.activeCapability === 2 ? 'rgba(0,229,255,0.3)' : 'rgba(0,229,255,0.1)'}" stroke="#00E5FF" stroke-width="${state.activeCapability === 2 ? '2' : '1'}"/>
        <text x="170" y="64" text-anchor="middle" fill="#00E5FF" font-family="JetBrains Mono" font-size="8.5" font-weight="700">2. Control Stage</text>

        <rect x="230" y="40" width="95" height="40" rx="4" fill="${state.activeCapability === 8 ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)'}" stroke="#10B981" stroke-width="1"/>
        <text x="277" y="64" text-anchor="middle" fill="#FFF" font-family="JetBrains Mono" font-size="8.5">8. Output Stage</text>

        <rect x="15" y="95" width="145" height="35" rx="4" fill="${state.activeCapability === 3 ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.03)'}" stroke="rgba(255,255,255,0.15)"/>
        <text x="87" y="117" text-anchor="middle" fill="#CBD5E1" font-family="JetBrains Mono" font-size="8">3. V/I Monitoring</text>

        <rect x="180" y="95" width="145" height="35" rx="4" fill="${state.activeCapability === 4 ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.03)'}" stroke="rgba(255,255,255,0.15)"/>
        <text x="252" y="117" text-anchor="middle" fill="#CBD5E1" font-family="JetBrains Mono" font-size="8">4. Parameters Setup</text>

        <rect x="15" y="140" width="145" height="35" rx="4" fill="${state.faultActive ? 'rgba(239,68,68,0.4)' : state.activeCapability === 5 ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.03)'}" stroke="${state.faultActive ? '#EF4444' : 'rgba(255,255,255,0.15)'}"/>
        <text x="87" y="162" text-anchor="middle" fill="${state.faultActive ? '#EF4444' : '#CBD5E1'}" font-family="JetBrains Mono" font-size="8" font-weight="${state.faultActive ? '700' : '400'}">5. Fault Protection</text>

        <rect x="180" y="140" width="145" height="35" rx="4" fill="${state.activeCapability === 6 ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.03)'}" stroke="rgba(255,255,255,0.15)"/>
        <text x="252" y="162" text-anchor="middle" fill="#CBD5E1" font-family="JetBrains Mono" font-size="8">6. Data Logger</text>

        <rect x="15" y="185" width="310" height="32" rx="4" fill="${state.activeCapability === 7 ? 'rgba(0,229,255,0.2)' : 'rgba(255,255,255,0.03)'}" stroke="rgba(0,229,255,0.3)"/>
        <text x="170" y="206" text-anchor="middle" fill="#00E5FF" font-family="JetBrains Mono" font-size="8.5">7. Digital Telemetry & Comms Interface</text>

        <path d="M 110 60 L 120 60 M 220 60 L 230 60" fill="none" stroke="${state.faultActive ? '#EF4444' : '#00E5FF'}" stroke-width="2" class="${state.faultActive ? '' : 'flowing-line'}"/>
      </g>
    `;

    const loadName = state.targetLoad === 'balloon' ? 'STRATOSPHERIC PAYLOAD' : state.targetLoad === 'soldier' ? 'SOLDIER FIELD GEAR' : 'AVIONICS TEST RIG';
    const loadVolt = state.targetLoad === 'balloon' ? '12.0 V Li-Ion' : state.targetLoad === 'soldier' ? '5.0 V Tactical USB' : '24.0 V Lab Bus';

    svgContent += `
      <g transform="translate(680, 80)">
        <path d="M -40 85 L 30 85" fill="none" stroke="${state.faultActive ? '#64748B' : '#10B981'}" stroke-width="3" class="${state.faultActive ? '' : 'flowing-line'}"/>
        
        <rect x="30" y="10" width="160" height="150" rx="8" fill="url(#controllerGrad)" stroke="${state.faultActive ? '#64748B' : '#10B981'}" stroke-width="2"/>
        
        <circle cx="110" cy="50" r="22" fill="rgba(16,185,129,0.15)" stroke="#10B981" stroke-width="1.5"/>
        <text x="110" y="55" text-anchor="middle" fill="#10B981" font-family="Space Grotesk" font-size="14" font-weight="700">⚡</text>

        <text x="110" y="95" text-anchor="middle" fill="#FFFFFF" font-family="Space Grotesk, sans-serif" font-size="11" font-weight="700">${loadName}</text>
        <text x="110" y="115" text-anchor="middle" fill="#10B981" font-family="JetBrains Mono, monospace" font-size="10">${loadVolt}</text>
        <text x="110" y="135" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="9">${state.faultActive ? '0.0 W (ISOLATED)' : (p.toFixed(2) + ' W ACTIVE')}</text>
      </g>
    `;

    svgCanvas.innerHTML = svgContent;
  }

  renderSimulation();
}

/* ==========================================================================
   6. RFQ Intake & Technical Discussion Dispatcher
   ========================================================================== */
function initRfqHandler() {
  const form = document.getElementById('rfq-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]').value;
    const org = form.querySelector('[name="organization"]').value;
    const email = form.querySelector('[name="email"]').value;
    const domain = form.querySelector('[name="domain"]').value;
    const details = form.querySelector('[name="requirements"]').value;

    const subject = encodeURIComponent(`[Technical RFQ] ${domain} Requirement - ${org}`);
    const body = encodeURIComponent(
      `Technical Inquiry for Avimukt Engineers Pvt Ltd:\n\n` +
      `Contact Name: ${name}\n` +
      `Organization: ${org}\n` +
      `Email: ${email}\n` +
      `Domain: ${domain}\n\n` +
      `Platform & Power Requirements:\n${details}\n\n` +
      `-- Sent via avimuktengineers.in Technical Portal`
    );

    window.location.href = `mailto:sales@avimuktengineers.in?subject=${subject}&body=${body}`;
  });
}
