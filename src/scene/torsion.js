import * as THREE from 'three';
import { G, torsionInertia, torsionOmega0, torsionT0 } from '../physics.js';
import {
  COLORS,
  createArcArrow,
  createDashedLine,
  createForceArrow,
  createLabel,
  createMaterial,
} from './common.js';

export const torsionDefaults = Object.freeze({ M: 0.2, L: 0.4, m: 0.05, r: 0.15, k: 0.06, thetaMax: 0.6 });

export function createTorsionPendulum(xStage = -1.9) {
  const params = { ...torsionDefaults };
  const defaults = { ...torsionDefaults };
  const group = new THREE.Group();
  group.position.x = xStage;
  const scale = 4;
  const ceilingY = 2.45;
  const rotorY = 0.62;
  let time = 0;
  const rodLength = () => scale * params.L;
  const inertia = () => torsionInertia(params);
  const omega0 = () => torsionOmega0(params.k, inertia());

  const beam = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.16, 0.3), createMaterial('#475569'));
  beam.position.y = ceilingY;
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 1.15), createMaterial('#475569'));
  base.position.y = -2.05;
  const posts = [-1.12, 1.12].map((x) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.13, 4.5, 0.13), createMaterial('#64748b'));
    post.position.set(x, 0.2, 0);
    return post;
  });
  group.add(beam, base, ...posts);

  const rotor = new THREE.Group();
  rotor.position.y = rotorY;
  group.add(rotor);
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, ceilingY - rotorY, 12), createMaterial('#334155'));
  wire.position.set(0, (ceilingY + rotorY) / 2, 0);
  group.add(wire);

  const discY = rotorY - 0.24;
  const disc = new THREE.Mesh(
    new THREE.TorusGeometry(1.38, 0.012, 8, 128),
    new THREE.MeshBasicMaterial({ color: COLORS.equilibrium }),
  );
  disc.rotation.x = Math.PI / 2;
  disc.position.y = discY;
  group.add(disc);
  for (let degree = 0; degree < 360; degree += 10) {
    const angle = degree * Math.PI / 180;
    const inner = degree % 30 === 0 ? 1.23 : 1.29;
    const mark = createDashedLine([
      new THREE.Vector3(Math.cos(angle) * inner, discY, -Math.sin(angle) * inner),
      new THREE.Vector3(Math.cos(angle) * 1.36, discY, -Math.sin(angle) * 1.36),
    ], { color: degree === 0 ? COLORS.restoring : COLORS.equilibrium, dash: 2, gap: 0 });
    group.add(mark);
  }
  const axisLine = createDashedLine([
    new THREE.Vector3(0, ceilingY, 0),
    new THREE.Vector3(0, -0.5, 0),
  ]);
  group.add(axisLine);
  const deltaLabel = createLabel('Δ');
  deltaLabel.position.set(0.15, 2.02, 0.12);
  group.add(deltaLabel);

  const rod = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.075, 0.1),
    createMaterial('#f59e0b', { metalness: 0.47 }),
  );
  rotor.add(rod);
  const endMasses = [new THREE.Mesh(new THREE.SphereGeometry(1, 20, 16), createMaterial('#0f766e'))];
  const secondMass = endMasses[0].clone();
  rotor.add(...endMasses, secondMass);
  const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.13, 16), createMaterial('#334155'));
  rotor.add(spindle);
  const index = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 12), createMaterial(COLORS.restoring));
  index.position.set(rodLength() / 2, 0.035, 0);
  rotor.add(index);

  const weightArrow = createForceArrow(COLORS.weight);
  const tensionArrow = createForceArrow(COLORS.tension);
  group.add(weightArrow, tensionArrow);
  const gravityLabel = createLabel('w', { color: COLORS.weight });
  const tensionLabel = createLabel('T', { color: COLORS.tension });
  const thetaArc = createArcArrow({ radius: 1.05, axis: 'y', color: COLORS.restoring });
  const gammaArc = createArcArrow({ radius: 0.42, axis: 'y', color: COLORS.restoring });
  group.add(gravityLabel, tensionLabel, thetaArc, gammaArc);
  const thetaLabel = createLabel('θ');
  const gammaLabel = createLabel('Γ', { color: COLORS.restoring });
  group.add(thetaLabel, gammaLabel);
  group.userData = {
    arrows: { w: weightArrow, T: tensionArrow, Gamma: gammaArc },
    rotor,
    rod,
    masses: [endMasses[0], secondMass],
    equilibrium: axisLine,
    gammaArc,
  };

  function stats() {
    const I = inertia();
    const frequency = torsionOmega0(params.k, I);
    const theta = params.thetaMax * Math.cos(frequency * time);
    const angularVelocity = -frequency * params.thetaMax * Math.sin(frequency * time);
    const angularAcceleration = -(frequency ** 2) * theta;
    const torque = -params.k * theta;
    const potentialEnergy = 0.5 * params.k * theta ** 2;
    const kineticEnergy = 0.5 * I * angularVelocity ** 2;
    return {
      Irod: params.M * params.L ** 2 / 12,
      I,
      frequency,
      period: torsionT0(params.k, I),
      theta,
      angularVelocity,
      angularAcceleration,
      torque,
      potentialEnergy,
      kineticEnergy,
      energy: potentialEnergy + kineticEnergy,
      weight: (params.M + 2 * params.m) * G,
      rows: [
        ['I<sub>rod</sub>', params.M * params.L ** 2 / 12, 'kg·m²'],
        ['I<sub>Δ</sub>', I, 'kg·m²'],
        ['k', params.k, 'N·m/rad'],
        ['ω₀', frequency, 'rad/s'],
        ['T₀', torsionT0(params.k, I), 's'],
        ['θ', theta, 'rad'],
        ['θ̇', angularVelocity, 'rad/s'],
        ['θ̈', angularAcceleration, 'rad/s²'],
        ['Γ = −kθ', torque, 'N·m'],
        ['Eₖ', kineticEnergy, 'J'],
        ['Eₚ', potentialEnergy, 'J'],
        ['E', potentialEnergy + kineticEnergy, 'J'],
      ],
    };
  }

  function reset() {
    time = 0;
  }

  function update(dt, flags) {
    if (flags.play) time += dt;
    const values = stats();
    const span = rodLength();
    rotor.rotation.y = values.theta;
    rod.scale.x = span;
    for (const [indexNumber, mass] of endMasses.entries()) {
      const direction = indexNumber === 0 ? -1 : 1;
      const radius = 0.06 + Math.cbrt(params.m) * 0.055;
      mass.scale.setScalar(radius);
      mass.position.set(direction * params.r * scale, 0, 0);
    }
    secondMass.position.copy(endMasses[0].position).multiplyScalar(-1);
    secondMass.scale.copy(endMasses[0].scale);
    index.position.set(span * 0.5, 0.045, 0);

    const forceScale = 0.12 * values.weight;
    const centre = new THREE.Vector3(0, rotorY, 0.28);
    weightArrow.set(centre.clone().add(new THREE.Vector3(0.14, 0, 0)), new THREE.Vector3(0, -1, 0), forceScale);
    tensionArrow.set(centre.clone().add(new THREE.Vector3(-0.14, 0, 0)), new THREE.Vector3(0, 1, 0), forceScale);
    gravityLabel.position.copy(centre).add(new THREE.Vector3(0.17, -forceScale - 0.12, 0));
    tensionLabel.position.copy(centre).add(new THREE.Vector3(-0.18, forceScale + 0.12, 0));

    const sign = Math.sign(values.torque);
    const gammaExtent = Math.min(2 * Math.PI / 3, 2 * Math.PI / 3 * Math.abs(values.torque) / (params.k * params.thetaMax));
    gammaArc.set(new THREE.Vector3(0, rotorY + 0.45, 0), 0, sign * gammaExtent, 0.42, Math.abs(values.theta) >= 0.01);
    thetaArc.set(new THREE.Vector3(0, discY - 0.03, 0), 0, values.theta, 1.05);
    thetaLabel.position.set(0.85 * Math.cos(values.theta / 2), discY - 0.03, -0.85 * Math.sin(values.theta / 2));
    gammaLabel.position.set(0.45, rotorY + 0.72, 0.1);

    const detail = flags.detail;
    [axisLine, disc].forEach((item) => { item.visible = true; });
    [deltaLabel, thetaArc, thetaLabel].forEach((item) => { item.visible = detail; });
    gammaArc.visible = flags.showForces && Math.abs(values.theta) >= 0.01;
    gammaLabel.visible = detail && gammaArc.visible;
    [weightArrow, tensionArrow, gravityLabel, tensionLabel].forEach((item) => { item.visible &&= flags.showForces && (item.isSprite ? detail : true); });
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
    theoryHTML: '<p>I<sub>Δ</sub> = ML²/12 + 2mr²</p><p>Γ = −kθ, &nbsp; ω₀ = √(k/I<sub>Δ</sub>)</p><p>T₀ = 2π√(I<sub>Δ</sub>/k)</p>',
  };
}
