/**
 * AVIMUKT ENGINEERS PVT LTD — AEROSPACE & DEEP-TECH HARDWARE SUITE
 * Signature "Photon to Regulated Load" Interactive Simulator Engine & Core Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();
  initMobileMenu();
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

  // Close on navigation click
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   3. THE SIGNATURE "HOW IT WORKS" INTERACTIVE SIMULATOR (PART 3)
   ========================================================================== */
function initSimulatorEngine() {
  const container = document.getElementById('interactive-simulator');
  if (!container) return;

  // State Management
  const state = {
    activePhase: 1, // 1: Single Cell, 2: Array Synthesis, 3: Charge Controller, 4: Regulated Load
    irradiance: 1000, // W/m^2 (Standard AM1.5)
    arrayConfig: 'series-parallel', // 'single', 'series', 'parallel', 'series-parallel'
    activeCapability: 2, // 1 through 8
    targetLoad: 'balloon', // 'balloon', 'soldier', 'avionics'
    faultActive: false,
    cellType: 'stratospheric-4in' // or 'conformal-2in'
  };

  // DOM Elements
  const stepButtons = container.querySelectorAll('.sim-step-btn');
  const irradianceSlider = container.getElementById ? container.getElementById('sim-irradiance') : document.getElementById('sim-irradiance');
  const irradianceVal = document.getElementById('sim-irradiance-val');
  const arrayToggles = container.querySelectorAll('[data-array-mode]');
  const capItems = container.querySelectorAll('.sim-cap-item');
  const loadToggles = container.querySelectorAll('[data-load-target]');
  const faultBtn = document.getElementById('sim-fault-btn');
  
  // HUD Readout Elements
  const readoutVoltage = document.getElementById('readout-voltage');
  const readoutCurrent = document.getElementById('readout-current');
  const readoutPower = document.getElementById('readout-power');
  const readoutEfficiency = document.getElementById('readout-efficiency');
  const simStageDesc = document.getElementById('sim-stage-desc');
  const svgCanvas = document.getElementById('sim-svg-canvas');

  // Step Switchers
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

  // Irradiance Slider
  if (irradianceSlider) {
    irradianceSlider.addEventListener('input', (e) => {
      state.irradiance = parseInt(e.target.value, 10);
      if (irradianceVal) irradianceVal.textContent = `${state.irradiance} W/m²`;
      renderSimulation();
    });
  }

  // Array Mode Switcher
  arrayToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      arrayToggles.forEach(t => t.classList.remove('is-active'));
      toggle.classList.add('is-active');
      state.arrayConfig = toggle.getAttribute('data-array-mode');
      renderSimulation();
    });
  });

  // Controller Capability Quick Select
  capItems.forEach(item => {
    item.addEventListener('click', () => {
      capItems.forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');
      state.activeCapability = parseInt(item.getAttribute('data-cap'), 10);
      renderSimulation();
    });
  });

  // Target Load Switcher
  loadToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      loadToggles.forEach(t => t.classList.remove('is-active'));
      toggle.classList.add('is-active');
      state.targetLoad = toggle.getAttribute('data-load-target');
      renderSimulation();
    });
  });

  // Fault Trigger
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

  // Core Math & SVG Renderer
  function renderSimulation() {
    // 1. Calculate Physical Numbers
    const sunRatio = state.irradiance / 1000;
    let rawVoc = 1.15; // Volts per cell open circuit
    let rawIsc = 0.85 * sunRatio; // Amps per cell

    let totalVoltage = rawVoc;
    let totalCurrent = rawIsc;

    if (state.activePhase === 1) {
      // Single cell
      totalVoltage = rawVoc;
      totalCurrent = rawIsc;
    } else if (state.activePhase >= 2) {
      // Array configuration
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
    let efficiency = 94.8; // High efficiency power electronics
    let statusText = "NOMINAL CHARGING";

    if (state.activePhase >= 3) {
      // Regulate to target load voltage
      if (state.targetLoad === 'balloon') {
        regulatedVoltage = 12.0; // Stratospheric battery bus
        regulatedCurrent = (totalVoltage * totalCurrent * (efficiency / 100)) / regulatedVoltage;
      } else if (state.targetLoad === 'soldier') {
        regulatedVoltage = 5.0; // USB / Wearable bus
        regulatedCurrent = (totalVoltage * totalCurrent * (efficiency / 100)) / regulatedVoltage;
      } else {
        regulatedVoltage = 24.0; // Avionics test bench
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

    // Update Telemetry Display
    if (readoutVoltage) readoutVoltage.textContent = (state.faultActive ? '0.00 V' : `${totalVoltage.toFixed(2)} V`);
    if (readoutCurrent) readoutCurrent.textContent = (state.faultActive ? '0.00 A' : `${totalCurrent.toFixed(2)} A`);
    if (readoutPower) readoutPower.textContent = (state.faultActive ? '0.00 W' : `${totalPower.toFixed(2)} W`);
    if (readoutEfficiency) readoutEfficiency.textContent = `${efficiency.toFixed(1)}%`;

    // Update Stage Explanatory Text
    updateStageDescription(statusText);

    // Draw Dynamic SVG Circuit
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
    const isPhase2 = state.activePhase === 2;
    const isPhase3 = state.activePhase === 3;
    const isPhase4 = state.activePhase === 4;

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

    // 1. Draw Solar Cell Stage (Left)
    if (isPhase1) {
      svgContent += `
        <!-- Single 4" Perovskite Cell -->
        <g transform="translate(60, 90)">
          ${photonRays}
          <rect x="0" y="0" width="180" height="150" rx="8" fill="url(#cellGrad)" stroke="${state.faultActive ? '#EF4444' : '#F5A623'}" stroke-width="2" />
          <text x="90" y="65" text-anchor="middle" fill="#FFFFFF" font-family="Space Grotesk, sans-serif" font-size="13" font-weight="700">PEROVSKITE</text>
          <text x="90" y="85" text-anchor="middle" fill="#F5A623" font-family="JetBrains Mono, monospace" font-size="11">ACTIVE LAYER</text>
          <text x="90" y="110" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="10">Unencapsulated</text>

          <!-- Contact Tabs -->
          <rect x="-15" y="40" width="15" height="24" rx="2" fill="#F5A623" filter="url(#glowGold)"/>
          <text x="-7" y="56" text-anchor="middle" fill="#000" font-family="JetBrains Mono" font-size="10" font-weight="700">+</text>
          
          <rect x="-15" y="90" width="15" height="24" rx="2" fill="#64748B"/>
          <text x="-7" y="106" text-anchor="middle" fill="#FFF" font-family="JetBrains Mono" font-size="10" font-weight="700">-</text>

          <!-- Flow out -->
          <path d="M 180 75 L 340 75" fill="none" stroke="#F5A623" stroke-width="3" class="flowing-line"/>
          <circle cx="260" cy="75" r="4" fill="#00E5FF" filter="url(#glowCyan)"/>
        </g>
      `;
    } else {
      // Array Stage (4 cells interconnected)
      svgContent += `
        <g transform="translate(40, 80)">
          <!-- 4 Cell Array Representation -->
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

          <!-- Interconnect bus -->
          <path d="M 80 32 L 90 32 M 80 107 L 90 107 M 170 70 L 250 70" fill="none" stroke="#F5A623" stroke-width="2.5" class="flowing-line"/>
          <text x="85" y="160" text-anchor="middle" fill="#F5A623" font-family="JetBrains Mono" font-size="10">${state.arrayConfig.toUpperCase()} ARRAY</text>
        </g>
      `;
    }

    // 2. Draw Controller Architecture (Center)
    svgContent += `
      <g transform="translate(300, 50)">
        <rect x="0" y="0" width="340" height="230" rx="10" fill="url(#controllerGrad)" stroke="${state.faultActive ? '#EF4444' : '#00E5FF'}" stroke-width="1.8"/>
        
        <text x="170" y="24" text-anchor="middle" fill="#00E5FF" font-family="Space Grotesk, sans-serif" font-size="12" font-weight="700" letter-spacing="1">
          PEROVSKITE CHARGE CONTROLLER
        </text>

        <!-- 8 Core Capabilities Schematic Blocks -->
        <!-- 1: Solar Input -->
        <rect x="15" y="40" width="95" height="40" rx="4" fill="${state.activeCapability === 1 ? 'rgba(245,166,35,0.3)' : 'rgba(255,255,255,0.05)'}" stroke="#F5A623" stroke-width="1"/>
        <text x="62" y="64" text-anchor="middle" fill="#FFF" font-family="JetBrains Mono" font-size="8.5">1. Input Stage</text>

        <!-- 2: Controlled Charging (Core) -->
        <rect x="120" y="40" width="100" height="40" rx="4" fill="${state.activeCapability === 2 ? 'rgba(0,229,255,0.3)' : 'rgba(0,229,255,0.1)'}" stroke="#00E5FF" stroke-width="${state.activeCapability === 2 ? '2' : '1'}"/>
        <text x="170" y="64" text-anchor="middle" fill="#00E5FF" font-family="JetBrains Mono" font-size="8.5" font-weight="700">2. Control Stage</text>

        <!-- 8: Output Integration -->
        <rect x="230" y="40" width="95" height="40" rx="4" fill="${state.activeCapability === 8 ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)'}" stroke="#10B981" stroke-width="1"/>
        <text x="277" y="64" text-anchor="middle" fill="#FFF" font-family="JetBrains Mono" font-size="8.5">8. Output Stage</text>

        <!-- Supporting Layers (Stages 3,4,5,6,7) -->
        <!-- 3: V/I Monitor -->
        <rect x="15" y="95" width="145" height="35" rx="4" fill="${state.activeCapability === 3 ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.03)'}" stroke="rgba(255,255,255,0.15)"/>
        <text x="87" y="117" text-anchor="middle" fill="#CBD5E1" font-family="JetBrains Mono" font-size="8">3. V/I Monitoring</text>

        <!-- 4: Programmable Parameters -->
        <rect x="180" y="95" width="145" height="35" rx="4" fill="${state.activeCapability === 4 ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.03)'}" stroke="rgba(255,255,255,0.15)"/>
        <text x="252" y="117" text-anchor="middle" fill="#CBD5E1" font-family="JetBrains Mono" font-size="8">4. Parameters Setup</text>

        <!-- 5: Protection & Fault Manager -->
        <rect x="15" y="140" width="145" height="35" rx="4" fill="${state.faultActive ? 'rgba(239,68,68,0.4)' : state.activeCapability === 5 ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.03)'}" stroke="${state.faultActive ? '#EF4444' : 'rgba(255,255,255,0.15)'}"/>
        <text x="87" y="162" text-anchor="middle" fill="${state.faultActive ? '#EF4444' : '#CBD5E1'}" font-family="JetBrains Mono" font-size="8" font-weight="${state.faultActive ? '700' : '400'}">5. Fault Protection</text>

        <!-- 6: Data Acquisition & Logging -->
        <rect x="180" y="140" width="145" height="35" rx="4" fill="${state.activeCapability === 6 ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.03)'}" stroke="rgba(255,255,255,0.15)"/>
        <text x="252" y="162" text-anchor="middle" fill="#CBD5E1" font-family="JetBrains Mono" font-size="8">6. Data Logger</text>

        <!-- 7: User Interface / Comms -->
        <rect x="15" y="185" width="310" height="32" rx="4" fill="${state.activeCapability === 7 ? 'rgba(0,229,255,0.2)' : 'rgba(255,255,255,0.03)'}" stroke="rgba(0,229,255,0.3)"/>
        <text x="170" y="206" text-anchor="middle" fill="#00E5FF" font-family="JetBrains Mono" font-size="8.5">7. Digital Telemetry & Comms Interface</text>

        <!-- Internal Signal Lines -->
        <path d="M 110 60 L 120 60 M 220 60 L 230 60" fill="none" stroke="${state.faultActive ? '#EF4444' : '#00E5FF'}" stroke-width="2" class="${state.faultActive ? '' : 'flowing-line'}"/>
      </g>
    `;

    // 3. Draw Output Destination Stage (Right)
    const loadName = state.targetLoad === 'balloon' ? 'STRATOSPHERIC PAYLOAD' : state.targetLoad === 'soldier' ? 'SOLDIER FIELD GEAR' : 'AVIONICS TEST RIG';
    const loadVolt = state.targetLoad === 'balloon' ? '12.0 V Li-Ion' : state.targetLoad === 'soldier' ? '5.0 V Tactical USB' : '24.0 V Lab Bus';

    svgContent += `
      <g transform="translate(680, 80)">
        <!-- Conduit from Controller to Load -->
        <path d="M -40 85 L 30 85" fill="none" stroke="${state.faultActive ? '#64748B' : '#10B981'}" stroke-width="3" class="${state.faultActive ? '' : 'flowing-line'}"/>
        
        <!-- Target Load Module -->
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

  // Initial Render
  renderSimulation();
}

/* ==========================================================================
   4. RFQ Intake & Technical Discussion Dispatcher
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
