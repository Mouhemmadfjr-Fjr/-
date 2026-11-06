import * as THREE from 'three';
import { G, springState, springX0 } from '../physics.js';
import {
  COLORS,
  createDashedLine,
  createDimensionLine,
  createForceArrow,
  createHelix,
  createLabel,
  createMaterial,
} from './common.js';

export const springDefaults = Object.freeze({ m: 0.5, k: 20, Xmax: 0.08 });

export function createSpringPendulum(xStage = -5.7) {
  const params = { ...springDefaults };
  const defaults = { ...springDefaults };
  const group = new THREE.Group();
  group.position.x = xStage;
  const top = 2.45;
  const naturalLength = 0.3;
  const scale = 3;
  const bodyRadius = () => 0.12 + ((params.m - 0.1) / 0.9) * 0.08;
  let time = 0;
  let helixLength = 0;

  const beam = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.15, 0.52), createMaterial('#475569'));
  beam.position.set(0, top, 0);
  group.add(beam);
  const hanger = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.3), createMaterial('#64748b'));
  hanger.position.set(0, top - 0.13, 0);
  group.add(hanger);

  const initialX0 = springX0(params.m, params.k);
  const equilibriumY = top - scale * (naturalLength + initialX0) - bodyRadius();
  const equilibrium = createDashedLine([
    new THREE.Vector3(-0.96, equilibriumY, 0.08),
    new THREE.Vector3(0.96, equilibriumY, 0.08),
  ]);
  group.add(equilibrium);
  const originLabel = createLabel('O');
  originLabel.position.set(0.76, equilibriumY + 0.13, 0.12);
  group.add(originLabel);

  const mass = new THREE.Mesh(
    new THREE.SphereGeometry(1, 28, 22),
    createMaterial('#0ea5e9', { metalness: 0.56, roughness: 0.23 }),
  );
  group.add(mass);
  const springPosition = new THREE.Vector3();
  let spring = createHelix(0.8);
  group.add(spring);

  const naturalEndY = top - scale * naturalLength;
  const restTick = createDashedLine([
    new THREE.Vector3(-0.23, naturalEndY, 0.04),
    new THREE.Vector3(0.23, naturalEndY, 0.04),
  ], { color: COLORS.path, dash: 0.08, gap: 0.06 });
  group.add(restTick);
  const restDimension = createDimensionLine(
    new THREE.Vector3(0, naturalEndY, 0.08),
    new THREE.Vector3(0, equilibriumY + bodyRadius(), 0.08),
    { label: 'x₀', offset: [1.15, 0, 0] },
  );
  group.add(restDimension);
  const displacementDimension = createDimensionLine(
    new THREE.Vector3(0, equilibriumY, 0.1),
    new THREE.Vector3(0, equilibriumY, 0.1),
    { label: 'x', offset: [1.15, 0, 0] },
  );
  group.add(displacementDimension);

  const ruler = new THREE.Group();
  const rulerX = -0.78;
  group.add(ruler);
  const amplitudeMarks = new THREE.Group();
  group.add(amplitudeMarks);
  let rulerPositionKey = '';

  function rebuildRuler(currentEquilibriumY) {
    for (const child of ruler.children) {
      child.geometry?.dispose();
      child.material?.dispose();
      if (child.isSprite) child.material.map?.dispose();
    }
    ruler.clear();
    const extent = params.Xmax + 0.03;
    ruler.add(createDashedLine([
      new THREE.Vector3(rulerX, currentEquilibriumY - scale * extent, 0.1),
      new THREE.Vector3(rulerX, currentEquilibriumY + scale * extent, 0.1),
    ], { color: '#94a3b8', dash: 0.08, gap: 0.06 }));
    for (let centimetre = -Math.ceil(extent * 100); centimetre <= Math.floor(extent * 100); centimetre += 1) {
      const y = currentEquilibriumY + centimetre / 100 * scale;
      const major = centimetre % 5 === 0;
      ruler.add(createDashedLine([
        new THREE.Vector3(rulerX, y, 0.11),
        new THREE.Vector3(rulerX + (major ? 0.16 : 0.08), y, 0.11),
      ], { color: '#475569', dash: 2, gap: 0 }));
      if (major) {
        const label = createLabel(`${centimetre}`, { size: 0.24 });
        label.position.set(rulerX - 0.21, y, 0.16);
        ruler.add(label);
      }
    }

    for (const child of amplitudeMarks.children) {
      child.geometry?.dispose();
      child.material?.dispose();
      if (child.isSprite) child.material.map?.dispose();
    }
    amplitudeMarks.clear();
    for (const sign of [-1, 1]) {
      const y = currentEquilibriumY + sign * scale * params.Xmax;
      amplitudeMarks.add(createDashedLine([
        new THREE.Vector3(rulerX - 0.07, y, 0.12),
        new THREE.Vector3(rulerX + 0.3, y, 0.12),
      ], { color: COLORS.restoring, dash: 0.07, gap: 0.04 }));
      const label = createLabel('Xₘₐₓ', { color: COLORS.restoring, size: 0.31 });
      label.position.set(rulerX + 0.38, y, 0.15);
      amplitudeMarks.add(label);
    }
    rulerPositionKey = `${currentEquilibriumY}:${params.Xmax}`;
  }

  const weightArrow = createForceArrow(COLORS.weight);
  const springArrow = createForceArrow(COLORS.tension);
  const restoringArrow = createForceArrow(COLORS.restoring);
  group.add(weightArrow, springArrow, restoringArrow);
  const forceLabels = [
    createLabel('w', { size: 0.29 }),
    createLabel('Fₛ', { color: COLORS.tension, size: 0.29 }),
    createLabel('F', { color: COLORS.restoring, size: 0.29 }),
  ];
  forceLabels.forEach((label) => group.add(label));
  group.userData = {
    arrows: { w: weightArrow, Fs: springArrow, F: restoringArrow },
    body: mass,
    equilibrium,
    get spring() { return spring; },
  };

  function equilibriumPosition() {
    return top - scale * (naturalLength + springX0(params.m, params.k)) - bodyRadius();
  }

  function stats() {
    const state = springState({ ...params, t: time });
    return {
      ...state,
      velocity: state.v,
      acceleration: state.a,
      springForce: state.Fs,
      restoringForce: state.F,
      weight: params.m * G,
      equilibriumY: equilibriumPosition(),
      centreY: equilibriumPosition() - scale * state.x,
      springLength: scale * (naturalLength + state.x0 + state.x),
      rows: [
        ['m', params.m, 'kg'],
        ['k', params.k, 'N/m'],
        ['x₀', state.x0, 'm'],
        ['ω₀', state.omega0, 'rad/s'],
        ['T₀', state.T0, 's'],
        ['x', state.x, 'm'],
        ['v', state.v, 'm/s'],
        ['a', state.a, 'm/s²'],
        ['F = −kx', state.F, 'N'],
        ['Fₛ', state.Fs, 'N'],
        ['Eₖ', state.Ek, 'J'],
        ['Eₚ', state.Ep, 'J'],
        ['E', state.E, 'J'],
      ],
    };
  }

  function reset() {
    time = 0;
  }

  function update(dt, flags) {
    if (flags.play) time += dt;
    const values = stats();
    const y = equilibriumPosition() - scale * values.x;
    const radius = bodyRadius();
    mass.scale.setScalar(radius);
    mass.position.set(0, y, 0);

    const nextHelixLength = top - (y + radius);
    if (Math.abs(nextHelixLength - helixLength) > 0.002) {
      group.remove(spring);
      spring.geometry.dispose();
      spring.material.dispose();
      spring = createHelix(nextHelixLength);
      group.add(spring);
      helixLength = nextHelixLength;
    }
    spring.position.set(0, top, 0);

    const currentEquilibriumY = equilibriumPosition();
    group.userData.equilibriumY = currentEquilibriumY;
    equilibrium.setPoints([
      new THREE.Vector3(-0.96, currentEquilibriumY, 0.08),
      new THREE.Vector3(0.96, currentEquilibriumY, 0.08),
    ]);
    originLabel.position.y = currentEquilibriumY + 0.13;
    restDimension.set(
      new THREE.Vector3(0, top - scale * naturalLength, 0.08),
      new THREE.Vector3(0, currentEquilibriumY + radius, 0.08),
    );
    displacementDimension.set(
      new THREE.Vector3(0, currentEquilibriumY, 0.1),
      new THREE.Vector3(0, y, 0.1),
    );
    const nextRulerPositionKey = `${currentEquilibriumY}:${params.Xmax}`;
    if (nextRulerPositionKey !== rulerPositionKey) rebuildRuler(currentEquilibriumY);

    const centre = new THREE.Vector3(0, y, 0.35);
    weightArrow.set(centre.clone().add(new THREE.Vector3(0.78, 0, 0)), new THREE.Vector3(0, -1, 0), 0.12 * values.weight);
    const springSign = Math.sign(values.springForce) || 1;
    const weightLength = 0.12 * values.weight;
    const springLength = 0.12 * Math.abs(values.springForce);
    const restoringLength = 0.12 * Math.abs(values.restoringForce);
    springArrow.set(centre.clone().add(new THREE.Vector3(-0.3, 0, 0)), new THREE.Vector3(0, springSign, 0), springLength);
    restoringArrow.set(centre.clone().add(new THREE.Vector3(0.3, 0, 0)), new THREE.Vector3(0, Math.sign(values.x), 0), restoringLength);
    forceLabels[0].position.copy(centre).add(new THREE.Vector3(1.18, -weightLength - 0.16, 0));
    forceLabels[1].position.copy(centre).add(new THREE.Vector3(-0.72, springSign * (springLength + 0.16), 0));
    forceLabels[2].position.copy(centre).add(new THREE.Vector3(0.3, Math.sign(values.x || 1) * (restoringLength + 0.16), 0));

    const detail = flags.detail;
    [originLabel, restTick, restDimension, displacementDimension, ruler, amplitudeMarks]
      .forEach((item) => { item.visible = detail; });
    forceLabels.forEach((label) => { label.visible = detail && flags.showForces; });
    forceLabels[1].visible &&= springArrow.visible;
    forceLabels[2].visible &&= restoringArrow.visible;
    [weightArrow, springArrow, restoringArrow].forEach((arrow) => { arrow.visible &&= flags.showForces; });
    displacementDimension.visible &&= Math.abs(values.x) >= 0.003;
    restDimension.set(
      new THREE.Vector3(0, top - scale * naturalLength, 0.08),
      new THREE.Vector3(0, currentEquilibriumY + radius, 0.08),
    );
  }

  update(0, { play: false, detail: true, showForces: true });

  return {
    group,
    params,
    defaults,
    reset,
    update,
    stats,
    get time() { return time; },
    theoryHTML: '<p>x₀ = mg/k</p><p>x(t) = X<sub>max</sub> cos(ω₀t), &nbsp; ω₀ = √(k/m)</p><p>F = −kx, &nbsp; E = ½kX<sub>max</sub>²</p>',
  };
}
