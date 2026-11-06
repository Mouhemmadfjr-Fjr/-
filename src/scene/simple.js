import * as THREE from 'three';
import {
  G,
  SMALL_ANGLE,
  largeAmplitudePeriod,
  simpleOmega0,
  simpleT0,
  stepPendulumRK4,
} from '../physics.js';
import {
  COLORS,
  createArcArrow,
  createDashedLine,
  createForceArrow,
  createLabel,
  createMaterial,
  createRodBetween,
} from './common.js';

export const simpleDefaults = Object.freeze({ L: 1, m: 0.1, g: G, thetaMax: 0.2 });

export function createSimplePendulum(xStage = 1.9) {
  const params = { ...simpleDefaults };
  const defaults = { ...simpleDefaults };
  const group = new THREE.Group();
  group.position.x = xStage;
  const scale = 1.5;
  const pivotPoint = new THREE.Vector3(0, 2.15, 0);
  let time = 0;
  let numericalState = { theta: params.thetaMax, omega: 0 };

  const beam = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.15, 0.3), createMaterial('#475569'));
  beam.position.copy(pivotPoint);
  const anchor = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 14), createMaterial('#334155'));
  anchor.position.copy(pivotPoint);
  group.add(beam, anchor);
  const bob = new THREE.Mesh(new THREE.SphereGeometry(0.12, 28, 22), createMaterial('#f59e0b', { metalness: 0.35 }));
  group.add(bob);
  const stringMaterial = createMaterial('#334155', { roughness: 0.68, metalness: 0.04 });
  const string = createRodBetween(pivotPoint, pivotPoint.clone().add(new THREE.Vector3(0, -1.5, 0)), 0.013, stringMaterial, 8);
  group.add(string);

  const vertical = createDashedLine([
    pivotPoint.clone().add(new THREE.Vector3(0, -0.08, 0.05)),
    pivotPoint.clone().add(new THREE.Vector3(0, -3.2, 0.05)),
  ]);
  group.add(vertical);
  const path = createDashedLine([
    pivotPoint.clone().add(new THREE.Vector3(0, -scale, 0)),
    pivotPoint.clone().add(new THREE.Vector3(0, -scale, 0)),
  ], { color: COLORS.path, dash: 0.1, gap: 0.1 });
  group.add(path);
  const angleArc = createArcArrow({ radius: 0.56, axis: 'z', color: COLORS.restoring });
  const thetaLabel = createLabel('θ');
  thetaLabel.position.copy(pivotPoint).add(new THREE.Vector3(0.45, -0.28, 0.1));
  const originLabel = createLabel('O');
  originLabel.position.copy(pivotPoint).add(new THREE.Vector3(-0.2, 0.15, 0.1));
  const lengthLabel = createLabel('L', { size: 0.34 });
  group.add(angleArc, thetaLabel, originLabel, lengthLabel);

  const weightArrow = createForceArrow(COLORS.weight);
  const tensionArrow = createForceArrow(COLORS.tension);
  const tangentArrow = createForceArrow(COLORS.restoring, 0.018);
  const normalArrow = createForceArrow(COLORS.equilibrium, 0.018);
  group.add(weightArrow, tensionArrow, tangentArrow, normalArrow);
  const forceLabels = [
    createLabel('w', { color: COLORS.weight }),
    createLabel('T', { color: COLORS.tension }),
    createLabel('wₜ', { color: COLORS.restoring, size: 0.35 }),
    createLabel('wₙ', { color: COLORS.equilibrium, size: 0.35 }),
  ];
  forceLabels.forEach((label) => group.add(label));
  group.userData = {
    arrows: { w: weightArrow, T: tensionArrow, wt: tangentArrow, wn: normalArrow },
    bob,
    string,
    pivot: pivotPoint.clone(),
  };

  function getState() {
    if (params.thetaMax <= SMALL_ANGLE) {
      const omega0 = simpleOmega0(params.L, params.g);
      return {
        theta: params.thetaMax * Math.cos(omega0 * time),
        omega: -omega0 * params.thetaMax * Math.sin(omega0 * time),
      };
    }
    return numericalState;
  }

  function stats() {
    const omega0 = simpleOmega0(params.L, params.g);
    const period0 = simpleT0(params.L, params.g);
    const state = getState();
    const tension = params.m * (params.g * Math.cos(state.theta) + params.L * state.omega ** 2);
    const tangentWeight = -params.m * params.g * Math.sin(state.theta);
    const normalWeight = params.m * params.g * Math.cos(state.theta);
    return {
      theta: state.theta,
      omega: state.omega,
      omega0,
      T0: period0,
      Tprime: params.thetaMax > SMALL_ANGLE ? largeAmplitudePeriod(period0, params.thetaMax) : null,
      tension,
      tangentWeight,
      normalWeight,
      bobPosition: new THREE.Vector3(
        scale * params.L * Math.sin(state.theta),
        pivotPoint.y - scale * params.L * Math.cos(state.theta),
        0,
      ),
      stringLength: scale * params.L,
      rows: [
        ['L', params.L, 'm'],
        ['g', params.g, 'm/s²'],
        ['m', params.m, 'kg'],
        ['ω₀', omega0, 'rad/s'],
        ['T₀', period0, 's'],
        ...(params.thetaMax > SMALL_ANGLE ? [['T′', largeAmplitudePeriod(period0, params.thetaMax), 's']] : []),
        ['θ', state.theta, 'rad'],
        ['θ̇', state.omega, 'rad/s'],
        ['T', tension, 'N'],
        ['wₜ', tangentWeight, 'N'],
      ],
    };
  }

  function reset() {
    time = 0;
    numericalState = { theta: params.thetaMax, omega: 0 };
  }

  function update(dt, flags) {
    if (flags.play) {
      time += dt;
      if (params.thetaMax > SMALL_ANGLE) {
        numericalState = stepPendulumRK4(numericalState, params.g / params.L, dt);
      }
    }

    const values = stats();
    const length = params.L * scale;
    const bobPosition = pivotPoint.clone().add(new THREE.Vector3(
      length * Math.sin(values.theta),
      -length * Math.cos(values.theta),
      0,
    ));
    bob.position.copy(bobPosition);
    string.userData.set(pivotPoint, bobPosition);

    const pathPoints = [];
    for (let index = 0; index <= 64; index += 1) {
      const angle = -params.thetaMax + 2 * params.thetaMax * index / 64;
      pathPoints.push(pivotPoint.clone().add(new THREE.Vector3(
        length * Math.sin(angle),
        -length * Math.cos(angle),
        0.015,
      )));
    }
    path.setPoints(pathPoints);
    angleArc.set(pivotPoint.clone().add(new THREE.Vector3(0, 0, 0.1)), -Math.PI / 2, -Math.PI / 2 + values.theta, 0.56);
    thetaLabel.position.set(
      pivotPoint.x + 0.47 * Math.sin(values.theta / 2),
      pivotPoint.y - 0.42 * Math.cos(values.theta / 2),
      0.16,
    );
    lengthLabel.position.copy(pivotPoint).add(bobPosition).multiplyScalar(0.5).add(new THREE.Vector3(-0.16, 0, 0.16));

    const radial = bobPosition.clone().sub(pivotPoint).normalize();
    const towardPivot = pivotPoint.clone().sub(bobPosition).normalize();
    const tangent = new THREE.Vector3(Math.cos(values.theta), Math.sin(values.theta), 0);
    const forceScale = 0.7;
    weightArrow.set(bobPosition.clone().add(new THREE.Vector3(0.24, 0, 0.22)), new THREE.Vector3(0, -1, 0), forceScale);
    tensionArrow.set(bobPosition.clone().add(new THREE.Vector3(-0.24, 0, 0.22)), towardPivot, forceScale * Math.abs(values.tension / (params.m * params.g)));
    tangentArrow.set(bobPosition.clone().add(new THREE.Vector3(-0.44, 0, 0.22)), tangent.clone().multiplyScalar(Math.sign(values.tangentWeight)), forceScale * Math.abs(values.tangentWeight / (params.m * params.g)));
    normalArrow.set(bobPosition.clone().add(new THREE.Vector3(0.44, 0, 0.22)), radial.clone().multiplyScalar(Math.sign(values.normalWeight)), forceScale * Math.abs(values.normalWeight / (params.m * params.g)));
    forceLabels[0].position.copy(bobPosition).add(new THREE.Vector3(0.25, -0.48, 0.2));
    forceLabels[1].position.copy(bobPosition).add(towardPivot.multiplyScalar(0.5)).add(new THREE.Vector3(-0.34, 0.18, 0.2));
    forceLabels[2].position.copy(bobPosition).add(new THREE.Vector3(-0.42, -0.16, 0.2));
    forceLabels[3].position.copy(bobPosition).add(radial.multiplyScalar(0.48)).add(new THREE.Vector3(0.12, 0.14, 0.2));

    const detail = flags.detail;
    [vertical, path].forEach((item) => { item.visible = true; });
    [angleArc, thetaLabel, originLabel, lengthLabel].forEach((item) => { item.visible = detail; });
    forceLabels.forEach((item) => { item.visible = detail && flags.showForces; });
    [weightArrow, tensionArrow, tangentArrow, normalArrow]
      .forEach((item) => { item.visible &&= flags.showForces; });
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
    theoryHTML: '<p>θ̈ = −(g/L) sinθ</p><p>θ<sub>max</sub> ≤ 0.24 rad: &nbsp; ω₀ = √(g/L)</p><p>θ<sub>max</sub> &gt; 0.24 rad: &nbsp; T′ ≈ T₀(1 + θ<sub>max</sub>²/16)</p>',
  };
}
