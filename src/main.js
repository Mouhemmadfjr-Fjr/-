import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css';

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark"><i class="fa-solid fa-atom"></i></div>
        <div>
          <h1>مختبر النواسات الأربعة</h1>
          <p>محاكاة فيزيائية واقعية وتفاعلية</p>
        </div>
      </div>
      <nav class="topnav">
        <button class="nav-tab active" data-mode="all">الكل</button>
        <button class="nav-tab" data-mode="spring">النواس المرن</button>
        <button class="nav-tab" data-mode="torsion">نواس الفتل</button>
        <button class="nav-tab" data-mode="simple">النواس البسيط</button>
        <button class="nav-tab" data-mode="compound">النواس المركب</button>
      </nav>
    </header>

    <section class="hero">
      <h2>النواسات الأربعة: حركة حقيقية، تحكم كامل، وضوح علمي</h2>
      <p>
        هذا المحاكاة يعرض جميع الأنواع في نفس المشهد مع تأثيرات فيزيائية قابلة للتعديل، وتحكم مباشر في الكتلة، الثابت، الطول، والسعة، مع أشرطة الطاقة والقوى لتوضيح الحركة في كل لحظة.
      </p>
    </section>

    <div class="layout">
      <section class="scene-panel" id="simulator">
        <div class="scene-header">
          <h3>الرسوم الحركية التفاعلية</h3>
          <span class="pill"><i class="fa-solid fa-cube"></i> 3D View</span>
        </div>
        <div id="scene-wrap"></div>

        <div class="scene-key" aria-label="دليل الرموز والإشارات">
          <div class="scene-key-title"><i class="fa-solid fa-compass-drafting"></i> دليل الرموز والإشارات</div>
          <div class="scene-key-items">
            <span class="key-item"><b class="key-symbol symbol-motion">x / θ</b><span>الإزاحة أو زاوية الانحراف</span></span>
            <span class="key-item"><b class="key-symbol symbol-gravity">↓ mg</b><span>قوة الثقل نحو الأسفل</span></span>
            <span class="key-item"><b class="key-symbol symbol-tension">↑ T</b><span>شد الخيط / النابض نحو نقطة التعليق</span></span>
            <span class="key-item"><b class="key-symbol symbol-restoring">↶ Fᵣ / τ</b><span>قوة أو عزم الإرجاع نحو وضع التوازن</span></span>
            <span class="key-item"><b class="key-symbol symbol-equilibrium">┆ O</b><span>موضع التوازن أو محور الدوران</span></span>
          </div>
        </div>

        <div class="toolbar">
          <button class="tool-btn" id="toggle-play">إيقاف مؤقت</button>
          <button class="tool-btn secondary" id="reset-scene">إعادة الضبط</button>
          <button class="tool-btn accent" id="toggle-forces">إخفاء القوى</button>
          <button class="tool-btn accent" id="toggle-energy">إخفاء الطاقة</button>
        </div>

        <div class="controls">
          <div class="control-group">
            <div class="control-grid" id="controls-grid"></div>
          </div>
        </div>
      </section>

      <aside class="side-stack">
        <div class="panel" id="metrics">
          <h3>القيم اللحظية</h3>
          <div class="stat-grid" id="stat-grid"></div>
        </div>

        <div class="panel" id="theory">
          <h3>ملخص فيزيائي</h3>
          <div class="info-box" id="info-box"></div>
        </div>
      </aside>
    </div>
  </div>
`;

const params = {
  springMass: 2.2,
  springK: 22,
  springXmax: 0.6,
  torsionI: 0.55,
  torsionK: 0.82,
  torsionTheta: 0.7,
  simpleL: 2.2,
  simpleG: 9.8,
  simpleTheta: 0.42,
  compoundI: 1.2,
  compoundM: 2.4,
  compoundD: 0.3,
  compoundTheta: 0.42,
};

const state = {
  play: true,
  time: 0,
  activeMode: 'all',
  showForces: true,
  showEnergy: true,
  autoRotate: false,
};

const sceneWrap = document.getElementById('scene-wrap');
const controlsGrid = document.getElementById('controls-grid');
const statGrid = document.getElementById('stat-grid');
const infoBox = document.getElementById('info-box');

const controlDefinitions = [
  { id: 'springMass', label: 'الكتلة', min: 0.5, max: 5, step: 0.1 },
  { id: 'springK', label: 'ثابت النابض', min: 6, max: 42, step: 1 },
  { id: 'springXmax', label: 'السعة', min: 0.15, max: 1.2, step: 0.05 },
  { id: 'torsionI', label: 'عزم العطالة', min: 0.05, max: 1.8, step: 0.05 },
  { id: 'torsionK', label: 'ثابت الفتل', min: 0.2, max: 2.4, step: 0.05 },
  { id: 'torsionTheta', label: 'السعة الزاوية', min: 0.18, max: 1.1, step: 0.05 },
  { id: 'simpleL', label: 'طول الخيط', min: 0.8, max: 4.5, step: 0.1 },
  { id: 'simpleG', label: 'التسارع', min: 4, max: 14, step: 0.2 },
  { id: 'simpleTheta', label: 'السعة', min: 0.12, max: 0.9, step: 0.04 },
  { id: 'compoundI', label: 'عزم العطالة', min: 0.2, max: 3, step: 0.1 },
  { id: 'compoundM', label: 'الكتلة', min: 0.6, max: 5, step: 0.1 },
  { id: 'compoundD', label: 'بعد المركز', min: 0.08, max: 0.8, step: 0.02 },
  { id: 'compoundTheta', label: 'السعة الزاوية للمركب', min: 0.1, max: 0.9, step: 0.02 },
];

function makeMaterial(color, emissive = 0x000000, roughness = 0.45) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: 0.12,
    roughness,
    metalness: 0.25,
  });
}

function makeArrow(color, length = 1.6, radius = 0.06) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.18, metalness: 0.3, roughness: 0.25 });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length * 0.7, 14), material);
  shaft.position.y = length * 0.35;
  const cone = new THREE.Mesh(new THREE.ConeGeometry(radius * 2.8, length * 0.3, 14), material);
  cone.position.y = length * 0.85;
  group.add(shaft, cone);
  return group;
}


function makeLabel(text, color = '#172033') {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 160;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = 'bold 76px Arial';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(255,255,255,0.96)';
  ctx.strokeText(text, 256, 80);
  ctx.fillStyle = color; ctx.fillText(text, 256, 80);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(1.35, 0.42, 1);
  sprite.renderOrder = 10;
  return sprite;
}

function addEquilibriumMarker(parent, y = 0) {
  const points = [new THREE.Vector3(0, y - 2.4, 0.04), new THREE.Vector3(0, y + 0.25, 0.04)];
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineDashedMaterial({ color: 0x64748b, dashSize: 0.12, gapSize: 0.08 }));
  line.computeLineDistances();
  parent.add(line);
  return line;
}

function createHelicalSpring(length, radius = 0.24, turns = 9) {
  const points = [];
  const segments = turns * 24;
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments, angle = t * turns * Math.PI * 2;
    points.push(new THREE.Vector3(radius * Math.cos(angle), -length * t, radius * Math.sin(angle)));
  }
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.Mesh(new THREE.TubeGeometry(curve, segments, 0.035, 8, false), makeMaterial(0x7c3aed, 0x4c1d95, 0.38));
}

function createSpringPendulum() {
  const group = new THREE.Group();
  group.position.set(-5.2, 0, 0);
  const support = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 1.2), makeMaterial(0x4b5563, 0x000000, 0.7));
  support.position.y = 2.05;
  group.add(support);
  const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.28, 18), makeMaterial(0x334155));
  hook.position.set(0, 1.82, 0);
  group.add(hook);

  const pivot = new THREE.Group();
  pivot.position.set(0, 1.68, 0);
  group.add(pivot);
  const spring = createHelicalSpring(1.05);
  pivot.add(spring);

  const mass = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), makeMaterial(0x0ea5e9, 0x075985, 0.35));
  mass.position.set(0, -1.5, 0);
  mass.castShadow = true;
  pivot.add(mass);

  const forceGroup = new THREE.Group();
  const weight = makeArrow(0xf59e0b, 1.1, 0.045);
  weight.rotation.z = Math.PI;
  weight.position.set(0.72, -1.15, 0.15);
  forceGroup.add(weight);
  const restoring = makeArrow(0x0284c7, 0.9, 0.045);
  restoring.position.set(-0.72, -0.45, 0.15);
  forceGroup.add(restoring);
  pivot.add(forceGroup);

  addEquilibriumMarker(group, 0.05);
  group.userData = { type: 'spring', spring, mass, forceGroup, pivot, springLength: 1.05 };
  return group;
}
function createTorsionPendulum() {
  const group = new THREE.Group();
  group.position.set(-1.7, 0, 0);

  const stand = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 2.6), makeMaterial(0x475569, 0x000000, 0.74));
  stand.position.y = -2.5;
  group.add(stand);

  const support = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.42, 20), makeMaterial(0x1f2937));
  support.position.y = 1.8;
  group.add(support);

  const rotor = new THREE.Group();
  rotor.position.set(0, 1.9, 0);
  group.add(rotor);

  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.2, 16), makeMaterial(0xf59e0b, 0x92400e, 0.45));
  rod.position.y = 0.2;
  rotor.add(rod);

  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.2, 36), makeMaterial(0x0f172a, 0x1e293b, 0.3));
  disc.position.y = 1.9;
  rotor.add(disc);

  const arrow = makeArrow(0xd97706, 2.1, 0.06);
  arrow.position.set(1.2, 1.3, 0);
  arrow.rotation.z = Math.PI * 0.5;
  group.add(arrow);

  addEquilibriumMarker(group, 1.9);
  group.userData = { type: 'torsion', rotor, rod, disc, forceArrow: arrow };
  return group;
}

function createSimplePendulum() {
  const group = new THREE.Group();
  group.position.set(1.8, 0, 0);

  const base = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.18, 2.3), makeMaterial(0x4b5563, 0x111827, 0.7));
  base.position.y = -2.5;
  group.add(base);

  const anchor = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.42, 20), makeMaterial(0x374151));
  anchor.position.y = 1.7;
  group.add(anchor);

  const pivot = new THREE.Group();
  pivot.position.set(0, 1.7, 0);
  group.add(pivot);

  const string = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.5, 12), makeMaterial(0xcbd5e1, 0x334155, 0.7));
  string.position.y = -1.1;
  pivot.add(string);

  const bob = new THREE.Mesh(new THREE.SphereGeometry(0.45, 22, 22), makeMaterial(0xfbbf24, 0x78350f, 0.25));
  bob.position.y = -2.1;
  pivot.add(bob);

  const weightArrow = makeArrow(0xb45309, 1.2, 0.05);
  weightArrow.position.set(0.5, -1.4, 0);
  weightArrow.rotation.z = Math.PI;
  pivot.add(weightArrow);

  const tensionArrow = makeArrow(0x0284c7, 1.5, 0.05);
  tensionArrow.position.set(-0.5, -0.2, 0);
  pivot.add(tensionArrow);
  addEquilibriumMarker(group, 1.7);

  group.userData = { type: 'simple', pivot, string, bob, weightArrow, tensionArrow };
  return group;
}

function createCompoundPendulum() {
  const group = new THREE.Group();
  group.position.set(5.1, 0, 0);

  const base = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.18, 2.3), makeMaterial(0x475569, 0x000000, 0.7));
  base.position.y = -2.5;
  group.add(base);

  const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.48, 18), makeMaterial(0x374151));
  pivot.position.y = 1.9;
  group.add(pivot);

  const arm = new THREE.Group();
  arm.position.set(0, 1.9, 0);
  group.add(arm);

  const rod = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.4, 0.2), makeMaterial(0xfef3c7, 0xd97706, 0.25));
  rod.position.y = -1.2;
  arm.add(rod);

  const mass = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 20), makeMaterial(0x8b5cf6, 0x4c1d95, 0.2));
  mass.position.y = -2.8;
  arm.add(mass);

  const weightArrow = makeArrow(0xd97706, 2.0, 0.06);
  weightArrow.position.set(0, -1.8, 0.8);
  arm.add(weightArrow);

  group.userData = { type: 'compound', arm, rod, mass, weightArrow };
  return group;
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf6f0e8);
scene.fog = new THREE.Fog(0xf6f0e8, 16, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(sceneWrap.clientWidth, sceneWrap.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneWrap.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(42, sceneWrap.clientWidth / sceneWrap.clientHeight, 0.1, 100);
camera.position.set(0, 0.8, 18);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.enablePan = false;
orbitControls.enableZoom = true;
orbitControls.target.set(0, 0.2, 0);

const pendulums = {
  spring: createSpringPendulum(),
  torsion: createTorsionPendulum(),
  simple: createSimplePendulum(),
  compound: createCompoundPendulum(),
};

Object.values(pendulums).forEach((pendulum) => scene.add(pendulum));

function setMode(mode) {
  state.activeMode = mode;
  document.querySelectorAll('.nav-tab').forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === mode);
  });
  updateSceneVisibility();
  updateInfo();
}

function updateSceneVisibility() {
  Object.entries(pendulums).forEach(([key, item]) => {
    const visible = state.activeMode === 'all' || state.activeMode === key;
    item.visible = visible;
    item.traverse((node) => {
      if (node.isMesh && node.material && node.material.transparent !== undefined) {
        node.material.transparent = true;
        node.material.opacity = visible ? 1 : 0.14;
      }
    });
  });
}

function buildControls() {
  controlDefinitions.forEach((item) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'control';

    const labelRow = document.createElement('div');
    labelRow.className = 'label-row';
    labelRow.innerHTML = `<span>${item.label}</span><span class="value" id="${item.id}-value">${params[item.id].toFixed(2)}</span>`;

    const input = document.createElement('input');
    input.type = 'range';
    input.min = item.min;
    input.max = item.max;
    input.step = item.step;
    input.value = params[item.id];
    input.addEventListener('input', () => {
      params[item.id] = Number(input.value);
      document.getElementById(`${item.id}-value`).textContent = Number(params[item.id]).toFixed(2);
      updateStats();
    });

    wrapper.appendChild(labelRow);
    wrapper.appendChild(input);
    controlsGrid.appendChild(wrapper);
  });
}

function updateStats() {
  const springW = Math.sqrt(params.springK / params.springMass);
  const springX = params.springXmax * Math.cos(springW * state.time);
  const torsionW = Math.sqrt(params.torsionK / params.torsionI);
  const torsionTheta = params.torsionTheta * Math.cos(torsionW * state.time);
  const simpleW = Math.sqrt(params.simpleG / params.simpleL);
  const simpleTheta = params.simpleTheta * Math.cos(simpleW * state.time);
  const compoundW = Math.sqrt((params.compoundM * 9.81 * params.compoundD) / params.compoundI);
  const compoundTheta = params.compoundTheta * Math.cos(compoundW * state.time);

  const stats = [
    { label: 'T0', value: (2 * Math.PI * Math.sqrt(params.springMass / params.springK)).toFixed(2) + ' s' },
    { label: 'ω0', value: (Math.sqrt(params.springK / params.springMass)).toFixed(2) + ' rad/s' },
    { label: 'x', value: springX.toFixed(2) + ' m' },
    { label: 'θ', value: torsionTheta.toFixed(2) + ' rad' },
    { label: 'β', value: simpleTheta.toFixed(2) + ' rad' },
    { label: 'φ', value: compoundTheta.toFixed(2) + ' rad' },
    { label: 'v spring', value: (-params.springXmax * springW * Math.sin(springW * state.time)).toFixed(2) + ' m/s' },
    { label: 'a spring', value: (-springW * springW * springX).toFixed(2) + ' m/s²' },
    { label: 'E spring', value: (0.5 * params.springK * springX * springX + 0.5 * params.springMass * Math.pow(params.springXmax * springW * Math.sin(springW * state.time), 2)).toFixed(2) + ' J' },
  ];

  statGrid.innerHTML = stats.map((stat) => `
    <div class="stat-box">
      <span class="key">${stat.label}</span>
      <span class="value">${stat.value}</span>
    </div>
  `).join('');

  const springData = pendulums.spring.userData;
  const springDisplacement = springX * 0.75;
  const springLength = Math.max(0.55, 1.05 + springDisplacement);
  if (Math.abs(springLength - springData.springLength) > 0.015) {
    const oldSpring = springData.spring;
    springData.pivot.remove(oldSpring);
    oldSpring.geometry.dispose();
    oldSpring.material.dispose();
    springData.spring = createHelicalSpring(springLength);
    springData.pivot.add(springData.spring);
    springData.springLength = springLength;
  }
  springData.mass.position.y = -springLength - 0.45;
  springData.forceGroup.visible = state.showForces;

  const torsionData = pendulums.torsion.userData;
  torsionData.rotor.rotation.y = torsionTheta;
  torsionData.forceArrow.visible = state.showForces;

  const simpleData = pendulums.simple.userData;
  const simpleLength = Math.min(2.9, params.simpleL * 0.9);
  simpleData.pivot.rotation.z = simpleTheta;
  simpleData.string.scale.y = simpleLength / 2.5;
  simpleData.bob.position.y = -simpleLength;
  simpleData.weightArrow.visible = state.showForces;
  simpleData.tensionArrow.visible = state.showForces;

  const compoundData = pendulums.compound.userData;
  compoundData.arm.rotation.z = compoundTheta;
  compoundData.mass.position.y = -2.8;
  compoundData.weightArrow.visible = state.showForces;

  updateInfo();
}

function updateInfo() {
  const map = {
    all: 'عرض شامل لجميع النواسات في نفس المشهد مع مقارنة مباشرة في الحركة وفي الخصائص الفيزيائية.',
    spring: 'النواس المرن: الحركة انتقالية متناسقة، والطاقة الكامنة المرنة تتبدل مع الطاقة الحركية أثناء التذبذب.',
    torsion: 'نواس الفتل: الحركة دورانية مع عزم ارتداد يحافظ على التذبذب حول الوضع المتوسط.',
    simple: 'النواس البسيط: يعتمد الدور على الطول والتسارع، ويكون مستقلاً عن الكتلة في الزوايا الصغيرة.',
    compound: 'النواس المركب: يعتمد على عزم العطالة ومركز الكتلة، ويجمع بين الجسيم الصلب والاهتزاز الدوراني.',
  };

  infoBox.innerHTML = map[state.activeMode];
}

function animate() {
  requestAnimationFrame(animate);

  if (state.play) {
    state.time += 0.016;
  }

  if (state.autoRotate) {
    scene.rotation.y += 0.0026;
  }

  if (Math.floor(state.time * 30) !== animate.lastStatsFrame) {
    animate.lastStatsFrame = Math.floor(state.time * 30);
    updateStats();
  }

  orbitControls.update();
  renderer.render(scene, camera);
}

const hemi = new THREE.HemisphereLight(0xffffff, 0x8b6b4f, 1.35);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xffffff, 1.3);
key.position.set(7, 9, 8);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
scene.add(key);

const floor = new THREE.Mesh(
  new THREE.CylinderGeometry(11.5, 12.5, 0.8, 64),
  new THREE.MeshStandardMaterial({ color: 0xe7dfd2, roughness: 0.95, metalness: 0.08 })
);
floor.position.y = -3.2;
floor.receiveShadow = true;
scene.add(floor);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(7.5, 0.09, 20, 100),
  new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.35 })
);
ring.rotation.x = Math.PI / 2;
ring.position.y = -2.7;
scene.add(ring);

const navButtons = document.querySelectorAll('.nav-tab');
navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setMode(button.dataset.mode);
  });
});

const playBtn = document.getElementById('toggle-play');
playBtn.addEventListener('click', () => {
  state.play = !state.play;
  playBtn.textContent = state.play ? 'إيقاف مؤقت' : 'متابعة';
});

document.getElementById('reset-scene').addEventListener('click', () => {
  state.time = 0;
  scene.rotation.set(0, 0, 0);
  state.play = true;
  playBtn.textContent = 'إيقاف مؤقت';
});

document.getElementById('toggle-forces').addEventListener('click', () => {
  state.showForces = !state.showForces;
  document.getElementById('toggle-forces').textContent = state.showForces ? 'إخفاء القوى' : 'إظهار القوى';
  updateStats();
});

document.getElementById('toggle-energy').addEventListener('click', () => {
  state.showEnergy = !state.showEnergy;
  document.getElementById('toggle-energy').textContent = state.showEnergy ? 'إخفاء الطاقة' : 'إظهار الطاقة';
  document.getElementById('metrics').classList.toggle('energy-hidden', !state.showEnergy);
});

buildControls();
setMode('all');
updateStats();
animate();

window.addEventListener('resize', () => {
  const width = sceneWrap.clientWidth || 800;
  const height = sceneWrap.clientHeight || 540;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});
