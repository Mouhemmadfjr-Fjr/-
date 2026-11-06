import * as THREE from 'three';
import {
  G,
  SMALL_ANGLE,
  compoundProps,
  compoundReaction,
  largeAmplitudePeriod,
  stepPendulumRK4,
} from '../physics.js';
import {
  COLORS,
  createArcArrow,
  createDashedLine,
  createDimensionLine,
  createForceArrow,
  createLabel,
  createMaterial,
} from './common.js';

export const compoundDefaults = Object.freeze({ M: 0.5, l: 0.8, f: 0.1, mp: 0, thetaMax: 0.2 });

export function createCompoundPendulum(xStage = 5.7) {
  const params = { ...compoundDefaults };
  const defaults = { ...compoundDefaults };
  const group = new THREE.Group();
  group.position.x = xStage;
  const scale = 2.2;
  const pivotPoint = new THREE.Vector3(0, 2.15, 0);
  let time = 0;
  let numericalState = { theta: params.thetaMax, omega: 0 };
  const properties = () => compoundProps(params);

  const beam = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.15, 0.32), createMaterial('#475569'));
  beam.position.copy(pivotPoint);
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.18, 1.0), createMaterial('#475569'));
  base.position.y = -2.05;
  const posts = [-0.73, 0.73].map((x) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.13, 4.12, 0.13), createMaterial('#64748b'));
    post.position.set(x, 0.02, 0);
    return post;
  });
  group.add(beam, base, ...posts);

  const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.46, 18), createMaterial('#334155'));
  axis.rotation.x = Math.PI / 2;
  axis.position.copy(pivotPoint);
  group.add(axis);

  const rotor = new THREE.Group();
  rotor.position.copy(pivotPoint);
  group.add(rotor);
  const rod = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, scale * params.l, 0.05),
    createMaterial('#8b5cf6', { metalness: 0.18, roughness: 0.33 }),
  );
  rod.position.y = -scale * params.l / 2;
  rotor.add(rod);
  const endpointMass = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), createMaterial('#f59e0b'));
  rotor.add(endpointMass);
  const centre = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 16), createMaterial('#ef4444'));
  rotor.add(centre);
  const centreLabel = createLabel('c', { color: '#b91c1c', size: 0.34 });
  group.add(centreLabel);

  const equilibrium = createDashedLine([
    pivotPoint.clone().add(new THREE.Vector3(0, -0.08, 0.06)),
    pivotPoint.clone().add(new THREE.Vector3(0, -2.9, 0.06)),
  ]);
  group.add(equilibrium);
  const originLabel = createLabel('O');
  originLabel.position.copy(pivotPoint).add(new THREE.Vector3(-0.2, 0.14, 0.12));
  const deltaLabel = createLabel('Δ');
  deltaLabel.position.copy(pivotPoint).add(new THREE.Vector3(0.34, 0.04, 0.26));
  group.add(originLabel, deltaLabel);

  const distanceLine = createDimensionLine(pivotPoint, pivotPoint, { label: 'd', offset: [0.42, 0, 0.12] });
  const leverArm = createDashedLine([
    pivotPoint.clone(),
    pivotPoint.clone(),
  ], { color: COLORS.equilibrium, dash: 0.09, gap: 0.06 });
  const leverLabel = createLabel('d sin θ', { size: 0.3 });
  group.add(distanceLine, leverArm, leverLabel);
  const angleArc = createArcArrow({ radius: 0.52, color: COLORS.restoring });
  const thetaLabel = createLabel('θ');
  group.add(angleArc, thetaLabel);

  const weightArrow = createForceArrow(COLORS.weight);
  const reactionArrow = createForceArrow(COLORS.reaction);
  group.add(weightArrow, reactionArrow);
  const weightLabel = createLabel('w', { color: COLORS.weight });
  const reactionLabel = createLabel('R', { color: COLORS.reaction });
  group.add(weightLabel, reactionLabel);
  group.userData = {
    arrows: { w: weightArrow, R: reactionArrow },
    rotor,
    rod,
    endpointMass,
    centre,
    pivot: pivotPoint.clone(),
  };

  function getState() {
    if (params.thetaMax <= SMALL_ANGLE) {
      const { omega0 } = properties();
      return {
        theta: params.thetaMax * Math.cos(omega0 * time),
        omega: -omega0 * params.thetaMax * Math.sin(omega0 * time),
      };
    }
    return numericalState;
  }

  function stats() {
    const props = properties();
    const state = getState();
    const omega0Sq = props.omega0 ** 2;
    const alpha = params.thetaMax <= SMALL_ANGLE ? -omega0Sq * state.theta : -omega0Sq * Math.sin(state.theta);
    const reaction = compoundReaction({
      m: props.m,
      d: props.d,
      theta: state.theta,
      omega: state.omega,
      alpha,
    });
    const torque = -props.m * G * props.d * Math.sin(state.theta);
    return {
      ...props,
      theta: state.theta,
      omega: state.omega,
      alpha,
      torque,
      reaction,
      reactionMagnitude: Math.hypot(reaction.Rx, reaction.Ry),
      centrePosition: new THREE.Vector3(
        props.d * scale * Math.sin(state.theta),
        pivotPoint.y - props.d * scale * Math.cos(state.theta),
        0,
      ),
      rows: [
        ['m', props.m, 'kg'],
        ['d', props.d, 'm'],
        ['I<sub>Δ</sub>', props.I, 'kg·m²'],
        ['ω₀', props.omega0, 'rad/s'],
        ['T₀', props.T0, 's'],
        ['L<sub>eq</sub>', props.Leq, 'm'],
        ['θ', state.theta, 'rad'],
        ['θ̇', state.omega, 'rad/s'],
        ['Γ<sub>w</sub>', torque, 'N·m'],
        ['|R|', Math.hypot(reaction.Rx, reaction.Ry), 'N'],
        ...(params.thetaMax > SMALL_ANGLE ? [['T′', largeAmplitudePeriod(props.T0, params.thetaMax), 's']] : []),
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
        const props = properties();
        numericalState = stepPendulumRK4(numericalState, props.omega0 ** 2, dt);
      }
    }

    const values = stats();
    const rodLength = scale * params.l;
    const endRadius = params.mp > 0 ? 0.055 + Math.cbrt(params.mp) * 0.09 : 0;
    rod.scale.y = params.l / compoundDefaults.l;
    rod.position.y = -rodLength / 2;
    endpointMass.visible = params.mp > 0;
    endpointMass.scale.setScalar(endRadius);
    endpointMass.position.set(0, -rodLength, 0);

    const centrePosition = new THREE.Vector3(
      values.d * scale * Math.sin(values.theta),
      -values.d * scale * Math.cos(values.theta),
      0.11,
    );
    centre.position.set(0, -values.d * scale, 0.08);
    centreLabel.position.set(centrePosition.x + 0.15, pivotPoint.y + centrePosition.y + 0.18, 0.13);
    const worldCentre = pivotPoint.clone().add(centrePosition);
    distanceLine.set(pivotPoint.clone().add(new THREE.Vector3(0, 0, 0.12)), worldCentre);

    const verticalProjection = new THREE.Vector3(pivotPoint.x, worldCentre.y, 0.16);
    leverArm.setPoints([verticalProjection, new THREE.Vector3(worldCentre.x, worldCentre.y, 0.16)]);
    leverLabel.position.copy(verticalProjection).lerp(worldCentre, 0.5).add(new THREE.Vector3(0, 0.06, 0.08));
    angleArc.set(pivotPoint.clone().add(new THREE.Vector3(0, 0, 0.12)), -Math.PI / 2, -Math.PI / 2 + values.theta, 0.52);
    thetaLabel.position.set(
      pivotPoint.x + 0.46 * Math.sin(values.theta / 2),
      pivotPoint.y - 0.43 * Math.cos(values.theta / 2),
      0.15,
    );

    const forceScale = 0.7;
    const weightOrigin = worldCentre.clone().add(new THREE.Vector3(0.28, 0, 0.15));
    weightArrow.set(weightOrigin, new THREE.Vector3(0, -1, 0), forceScale);
    const reactionOrigin = pivotPoint.clone().add(new THREE.Vector3(0.15, 0, 0.2));
    reactionArrow.set(
      reactionOrigin,
      new THREE.Vector3(values.reaction.Rx, values.reaction.Ry, 0),
      forceScale * values.reactionMagnitude / (values.m * G),
    );
    weightLabel.position.copy(weightOrigin).add(new THREE.Vector3(0.1, -0.48, 0));
    reactionLabel.position.copy(reactionOrigin).add(new THREE.Vector3(0.17, 0.23, 0));

    const detail = flags.detail;
    [equilibrium, centre].forEach((item) => { item.visible = true; });
    [originLabel, deltaLabel, centreLabel, distanceLine, leverArm, leverLabel, angleArc, thetaLabel]
      .forEach((item) => { item.visible = detail; });
    [weightArrow, reactionArrow].forEach((item) => { item.visible &&= flags.showForces; });
    [weightLabel, reactionLabel].forEach((item) => { item.visible = detail && flags.showForces; });
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
    theoryHTML: '<p>ω₀² = mgd/I<sub>Δ</sub></p><p>Γ<sub>w</sub> = −mgd sinθ</p><p>θ<sub>max</sub> ≤ 0.24 rad: &nbsp; T₀ = 2π√(I<sub>Δ</sub>/(mgd))</p>',
  };
}
