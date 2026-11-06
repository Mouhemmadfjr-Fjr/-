import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createCompoundPendulum } from './scene/compound.js';
import { createSimplePendulum } from './scene/simple.js';
import { createSpringPendulum } from './scene/spring.js';
import { createTorsionPendulum } from './scene/torsion.js';
import { createUI } from './ui.js';
import './style.css';

const pendulums = {
  spring: createSpringPendulum(-5.7),
  torsion: createTorsionPendulum(-1.9),
  simple: createSimplePendulum(1.9),
  compound: createCompoundPendulum(5.7),
};

const stage = {
  all: { x: 0, y: 0.5 },
  spring: { x: -5.7, y: 0.7 },
  torsion: { x: -1.9, y: 0.6 },
  simple: { x: 1.9, y: 0.5 },
  compound: { x: 5.7, y: 0.45 },
};

let activeMode = 'spring';
let sceneWrap;
let scene;
let renderer;
let camera;
let orbitControls;

function frontView(mode) {
  if (!orbitControls) return;
  const target = stage[mode] ?? stage.spring;
  orbitControls.target.set(target.x, target.y, 0);
  if (mode === 'torsion') {
    camera.position.set(target.x, target.y + 9 * Math.sin(Math.PI * 35 / 180), 9 * Math.cos(Math.PI * 35 / 180));
  } else if (mode === 'all') {
    camera.position.set(0, 6.1, 18);
  } else {
    camera.position.set(target.x, target.y, 9);
  }
  orbitControls.update();
}

const ui = createUI(pendulums, {
  setMode(mode) {
    activeMode = mode;
    Object.entries(pendulums).forEach(([key, pendulum]) => {
      pendulum.group.visible = mode === 'all' || mode === key;
    });
    frontView(mode);
  },
  frontView,
  reset() {
    frontView(activeMode);
  },
  refresh() {
    ui?.refresh();
  },
});

sceneWrap = document.querySelector('#scene-wrap');
if (!sceneWrap) throw new Error('The scene container #scene-wrap is missing.');
scene = new THREE.Scene();
scene.background = new THREE.Color('#f6f0e8');
renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(sceneWrap.clientWidth, sceneWrap.clientHeight);
sceneWrap.append(renderer.domElement);

camera = new THREE.PerspectiveCamera(42, sceneWrap.clientWidth / sceneWrap.clientHeight, 0.1, 100);
camera.position.set(0, 5.5, 17);
orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.enablePan = false;
orbitControls.target.set(0, 0.6, 0);
scene.add(new THREE.HemisphereLight('#ffffff', '#64748b', 2));
const keyLight = new THREE.DirectionalLight('#ffffff', 2.2);
keyLight.position.set(4, 8, 8);
scene.add(keyLight);
Object.values(pendulums).forEach(({ group }) => scene.add(group));

window.__lab = { pendulums, state: ui.state, scene, camera, renderer };

const clock = new THREE.Clock();
let refreshElapsed = 0;
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const flags = {
    play: ui.state.play,
    showForces: ui.state.showForces,
    showLabels: true,
    detail: activeMode !== 'all',
  };
  Object.values(pendulums).forEach((pendulum) => pendulum.update(dt, flags));
  refreshElapsed += dt;
  if (refreshElapsed >= 1 / 30) {
    refreshElapsed = 0;
    ui.refresh();
  }
  orbitControls.update();
  renderer.render(scene, camera);
}

function resize() {
  const width = sceneWrap.clientWidth;
  const height = sceneWrap.clientHeight;
  if (width < 1 || height < 1) return;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

window.addEventListener('resize', resize);
new ResizeObserver(resize).observe(sceneWrap);
frontView(activeMode);
animate();
