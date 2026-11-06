const controlDefinitions = {
  spring: [
    { key: 'm', label: 'm', unit: 'kg', min: 0.1, max: 1, step: 0.05 },
    { key: 'k', label: 'k', unit: 'N/m', min: 10, max: 100, step: 1 },
    { key: 'Xmax', label: 'X_max', unit: 'm', min: 0.02, max: 0.15, step: 0.01 },
  ],
  torsion: [
    { key: 'M', label: 'M', unit: 'kg', min: 0.05, max: 0.5, step: 0.01 },
    { key: 'L', label: 'L', unit: 'm', min: 0.2, max: 0.6, step: 0.01 },
    { key: 'm', label: 'm', unit: 'kg', min: 0, max: 0.2, step: 0.01 },
    { key: 'r', label: 'r', unit: 'm', min: 0.02, max: 0.2, step: 0.01 },
    { key: 'k', label: 'k', unit: 'N·m/rad', min: 0.01, max: 0.1, step: 0.001 },
    { key: 'thetaMax', label: 'θ_max', unit: 'rad', min: 0.1, max: 1.2, step: 0.01 },
  ],
  simple: [
    { key: 'L', label: 'L', unit: 'm', min: 0.2, max: 2, step: 0.05 },
    { key: 'm', label: 'm', unit: 'kg', min: 0.05, max: 0.5, step: 0.01 },
    { key: 'g', label: 'g', unit: 'm/s²', min: 1.6, max: 15, step: 0.1 },
    { key: 'thetaMax', label: 'θ_max', unit: 'rad', min: 0.05, max: 1.05, step: 0.01 },
  ],
  compound: [
    { key: 'M', label: 'M', unit: 'kg', min: 0.1, max: 1, step: 0.01 },
    { key: 'l', label: 'ℓ', unit: 'm', min: 0.3, max: 1, step: 0.01 },
    { key: 'f', label: 'f', unit: '—', min: 0.05, max: 0.45, step: 0.01 },
    { key: 'mp', label: 'm′', unit: 'kg', min: 0, max: 0.5, step: 0.01 },
    { key: 'thetaMax', label: 'θ_max', unit: 'rad', min: 0.05, max: 1.05, step: 0.01 },
  ],
};

const modeTitles = {
  spring: 'النواس المرن',
  torsion: 'نواس الفتل',
  simple: 'النواس الثقلي البسيط',
  compound: 'النواس الثقلي المركب',
};

function formatNumber(value) {
  if (!Number.isFinite(value)) return '—';
  return Math.abs(value) < 0.0001 && value !== 0 ? value.toExponential(2) : value.toFixed(4);
}

export function createUI(pendulums, actions) {
  const app = document.querySelector('#app');
  if (!app) throw new Error('The application root element #app is missing.');

  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand">
          <div class="brand-mark" aria-hidden="true">θ</div>
          <div><h1>مختبر النواسات الأربعة</h1><p>محاكاة تفاعلية للنواسات</p></div>
        </div>
        <nav class="topnav" aria-label="اختيار النواس">
          <button class="nav-tab" data-mode="all" type="button">الكل</button>
          <button class="nav-tab" data-mode="spring" type="button">النواس المرن</button>
          <button class="nav-tab" data-mode="torsion" type="button">نواس الفتل</button>
          <button class="nav-tab" data-mode="simple" type="button">النواس البسيط</button>
          <button class="nav-tab" data-mode="compound" type="button">النواس المركب</button>
        </nav>
      </header>

      <section class="hero">
        <h2>رسوم تفاعلية للنواسات الأربعة</h2>
        <p>غيّر المعاملات لمتابعة أثرها في الحركة والقياسات الفيزيائية ووحدات SI.</p>
      </section>

      <div class="layout">
        <section class="scene-panel">
          <div class="scene-header"><h3>مشهد النواسات</h3><span class="pill">Three.js</span></div>
          <div id="scene-wrap" aria-label="المشهد ثلاثي الأبعاد"></div>
          <div class="scene-key" aria-label="دليل الرموز">
            <div class="scene-key-title">دليل الرموز والألوان</div>
            <div class="scene-key-items">
              <span class="key-item"><b class="key-symbol symbol-gravity">w</b><span>الثقل · برتقالي</span></span>
              <span class="key-item"><b class="key-symbol symbol-tension">Fₛ / T</b><span>توتر النابض أو الخيط · أزرق</span></span>
              <span class="key-item"><b class="key-symbol symbol-restoring">F / Γ</b><span>قوة أو عزم الإرجاع · وردي</span></span>
              <span class="key-item"><b class="key-symbol symbol-reaction">R</b><span>رد فعل المحور · أخضر</span></span>
              <span class="key-item"><b class="key-symbol symbol-equilibrium">O / c / d / Δ</b><span>التوازن، مركز العطالة، البعد، المحور</span></span>
              <span class="key-item"><b class="key-symbol symbol-path">┄</b><span>التوازن والمسار بنمطين مختلفين</span></span>
            </div>
          </div>
          <div class="toolbar">
            <button class="tool-btn" id="toggle-play" type="button">إيقاف مؤقت</button>
            <button class="tool-btn secondary" id="reset-scene" type="button">إعادة الضبط</button>
            <button class="tool-btn accent" id="toggle-forces" type="button">إخفاء القوى</button>
            <button class="tool-btn accent" id="toggle-energy" type="button">إخفاء الطاقة</button>
            <button class="tool-btn secondary" id="front-view" type="button">منظر أمامي</button>
          </div>
          <div class="controls" id="controls-grid"></div>
        </section>

        <aside class="side-stack" id="side-stack">
          <section class="panel" id="metrics"><h3>القيم اللحظية</h3><div id="stat-grid"></div></section>
          <section class="panel" id="theory"><h3>العلاقات النظرية</h3><div id="info-box"></div></section>
        </aside>
      </div>
    </div>`;

  const controlsRoot = app.querySelector('#controls-grid');
  const statGrid = app.querySelector('#stat-grid');
  const infoBox = app.querySelector('#info-box');
  const state = {
    activeMode: 'spring',
    play: true,
    showForces: true,
    showEnergy: true,
  };
  const controls = [];

  function makeControl(mode, definition) {
    const pendulum = pendulums[mode];
    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(definition.min);
    input.max = String(definition.max);
    input.step = String(definition.step);
    input.value = String(pendulum.params[definition.key]);
    input.setAttribute('aria-label', `${definition.label} (${definition.unit})`);
    const output = document.createElement('output');
    output.textContent = `${formatNumber(pendulum.params[definition.key])} ${definition.unit}`;
    input.addEventListener('input', () => {
      pendulum.params[definition.key] = Number(input.value);
      if (mode === 'torsion' && definition.key === 'L') {
        const radiusControl = controls.find((control) => control.mode === mode && control.key === 'r');
        const radiusDefinition = controlDefinitions.torsion.find((item) => item.key === 'r');
        const maximumRadius = Number((pendulum.params.L / 2).toFixed(2));
        radiusControl.input.max = String(maximumRadius);
        radiusDefinition.max = Math.max(radiusDefinition.min, maximumRadius);
        if (pendulum.params.r > maximumRadius) {
          pendulum.params.r = maximumRadius;
          radiusControl.input.value = String(maximumRadius);
          radiusControl.output.textContent = `${formatNumber(maximumRadius)} ${radiusDefinition.unit}`;
        }
      }
      output.textContent = `${formatNumber(pendulum.params[definition.key])} ${definition.unit}`;
      pendulum.reset();
      actions.refresh();
    });
    const wrapper = document.createElement('label');
    wrapper.className = 'control';
    wrapper.innerHTML = `<span class="label-row"><span>${definition.label} (${definition.unit})</span></span>`;
    wrapper.append(input, output);
    controls.push({ mode, key: definition.key, input, output });
    return wrapper;
  }

  Object.entries(controlDefinitions).forEach(([mode, definitions]) => {
    const group = document.createElement('details');
    group.className = 'control-group';
    group.dataset.mode = mode;
    group.open = mode === state.activeMode;
    const heading = document.createElement('summary');
    heading.textContent = modeTitles[mode];
    const grid = document.createElement('div');
    grid.className = 'control-grid';
    definitions.forEach((definition) => grid.append(makeControl(mode, definition)));
    group.append(heading, grid);
    controlsRoot.append(group);
  });

  function isEnergyRow(label) {
    return /^(E|Eₖ|Eₚ)$/.test(label);
  }

  function refreshValues() {
    const visibleModes = state.activeMode === 'all' ? Object.keys(pendulums) : [state.activeMode];
    statGrid.innerHTML = visibleModes.map((mode) => {
      const { rows } = pendulums[mode].stats();
      return `<section class="stat-group"><h4>${modeTitles[mode]}</h4><div class="stat-rows">${rows.map(([label, value, unit]) => `
        <div class="stat-box${isEnergyRow(label) ? ' energy-row' : ''}">
          <span class="key">${label}</span>
          <span class="value" dir="ltr">${formatNumber(value)} <small>${unit}</small></span>
        </div>`).join('')}</div></section>`;
    }).join('');
    app.querySelectorAll('.energy-row').forEach((row) => row.classList.toggle('energy-hidden', !state.showEnergy));

    infoBox.innerHTML = visibleModes.map((mode) => `
      <section class="theory-group"><h4>${modeTitles[mode]}</h4>${pendulums[mode].theoryHTML}
        ${['simple', 'compound'].includes(mode) && pendulums[mode].params.thetaMax > 0.24
    ? '<p class="large-angle-badge">سعة كبيرة: الحركة غير جيبية</p>'
    : ''}</section>`).join('');
  }

  function syncControls() {
    controls.forEach(({ mode, key, input, output }) => {
      const definition = controlDefinitions[mode].find((item) => item.key === key);
      const pendulum = pendulums[mode];
      input.value = String(pendulum.params[key]);
      output.textContent = `${formatNumber(pendulum.params[key])} ${definition.unit}`;
      if (mode === 'torsion' && key === 'r') input.max = String(Math.max(definition.min, pendulum.params.L / 2));
    });
  }

  function setMode(mode) {
    if (mode !== 'all' && !pendulums[mode]) throw new Error(`Unknown pendulum mode: ${mode}`);
    state.activeMode = mode;
    app.querySelectorAll('.nav-tab').forEach((button) => {
      button.classList.toggle('active', button.dataset.mode === mode);
    });
    app.querySelectorAll('.control-group').forEach((group) => {
      group.hidden = mode !== 'all' && group.dataset.mode !== mode;
      if (mode === 'all') group.open = false;
    });
    actions.setMode(mode);
    refreshValues();
  }

  app.querySelectorAll('.nav-tab').forEach((button) => {
    button.addEventListener('click', () => setMode(button.dataset.mode));
  });
  app.querySelector('#toggle-play').addEventListener('click', (event) => {
    state.play = !state.play;
    event.currentTarget.textContent = state.play ? 'إيقاف مؤقت' : 'متابعة';
  });
  app.querySelector('#reset-scene').addEventListener('click', () => {
    Object.values(pendulums).forEach((pendulum) => {
      Object.assign(pendulum.params, pendulum.defaults);
      pendulum.reset();
    });
    syncControls();
    state.play = true;
    app.querySelector('#toggle-play').textContent = 'إيقاف مؤقت';
    actions.reset();
    refreshValues();
  });
  app.querySelector('#toggle-forces').addEventListener('click', (event) => {
    state.showForces = !state.showForces;
    event.currentTarget.textContent = state.showForces ? 'إخفاء القوى' : 'إظهار القوى';
  });
  app.querySelector('#toggle-energy').addEventListener('click', (event) => {
    state.showEnergy = !state.showEnergy;
    event.currentTarget.textContent = state.showEnergy ? 'إخفاء الطاقة' : 'إظهار الطاقة';
    app.querySelectorAll('.energy-row').forEach((row) => row.classList.toggle('energy-hidden', !state.showEnergy));
  });
  app.querySelector('#front-view').addEventListener('click', () => actions.frontView(state.activeMode));

  setMode(state.activeMode);
  return {
    state,
    refresh: refreshValues,
    syncControls,
  };
}
