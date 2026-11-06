import assert from 'node:assert/strict';
import test from 'node:test';
import {
  G,
  SMALL_ANGLE,
  compoundCentreOffset,
  compoundProps,
  compoundReaction,
  largeAmplitudePeriod,
  rodInertiaCenter,
  simpleObservables,
  simpleT0,
  springState,
  springOmega0,
  springT0,
  springX0,
  stepPendulumRK4,
  torsionInertia,
  torsionOmega0,
  torsionState,
  torsionT0,
} from './physics.js';

function assertClose(actual, expected, tolerance = 1e-3) {
  assert.ok(Math.abs(actual - expected) / Math.abs(expected) <= tolerance, `${actual} is not within ${tolerance * 100}% of ${expected}`);
}

test('spring oscillator properties match the reference values', () => {
  assert.equal(G, 10);
  assert.equal(SMALL_ANGLE, 0.24);
  assertClose(springX0(0.5, 20), 0.25);
  assertClose(springOmega0(0.5, 20), 6.3246);
  assertClose(springT0(0.5, 20), 0.99346);
});

test('spring state keeps the visible displacement and signed forces consistent', () => {
  const initial = springState({ m: 0.5, k: 20, Xmax: 0.08, t: 0 });
  assertClose(initial.x, 0.08, 1e-12);
  assertClose(initial.x0, 0.25, 1e-12);
  assertClose(initial.Fs - 5, Math.abs(initial.F), 1e-12);

  const halfPeriod = springState({ m: 0.5, k: 20, Xmax: 0.08, t: springT0(0.5, 20) / 2 });
  assertClose(halfPeriod.x, -0.08, 1e-12);
  assert.ok(halfPeriod.F > 0);
  assertClose(Math.abs(halfPeriod.Fs - 5), Math.abs(halfPeriod.F), 1e-12);
  assertClose(halfPeriod.E, 0.5 * 20 * 0.08 ** 2, 1e-12);
});

test('torsion inertia includes the rod and symmetric point masses', () => {
  assertClose(rodInertiaCenter(0.2, 0.4), 2.6667e-3);
  const inertia = torsionInertia({ M: 0.2, L: 0.4, m: 0.05, r: 0.15 });
  assertClose(inertia, 4.9167e-3);
  assertClose(torsionOmega0(0.06, inertia), 3.4933);
  assertClose(torsionT0(0.06, inertia), 1.7986);
});

test('torsion state conserves energy and restores opposite the angle', () => {
  const inertia = torsionInertia({ M: 0.2, L: 0.4, m: 0.05, r: 0.15 });
  const period = torsionT0(0.06, inertia);
  const thetaMax = 0.6;
  const phases = [0, 0.25, 0.5, 0.75].map((fraction) => (
    torsionState({ M: 0.2, L: 0.4, m: 0.05, r: 0.15, k: 0.06, thetaMax, t: fraction * period })
  ));
  for (const phase of phases) {
    assert.ok(phase.theta === 0 || Math.sign(phase.torque) === -Math.sign(phase.theta));
    assertClose(phase.E, 0.5 * 0.06 * thetaMax ** 2, 1e-12);
  }
  assertClose(phases[0].T0, torsionState({
    M: 0.2, L: 0.4, m: 0.05, r: 0.15, k: 0.06, thetaMax: 1.2, t: 0,
  }).T0, 1e-12);
});

test('small-angle simple-pendulum periods use the configured gravity', () => {
  assert.equal(G, 10);
  assertClose(simpleT0(1.6), 2.5133);
  assertClose(simpleT0(1), 1.9869);
});

test('simple-pendulum tension and weight components match the reference force balance', () => {
  const atBottom = simpleObservables({ L: 0.4, m: 0.1, g: 10, theta: 0, omega: 5 });
  assertClose(atBottom.tension, 2, 1e-12);
  assert.equal(Math.abs(atBottom.tangentWeight), 0);
  assertClose(atBottom.normalWeight, 1, 1e-12);

  const displaced = simpleObservables({ L: 1.6, m: 0.1, g: 10, theta: Math.PI / 3, omega: 0 });
  assertClose(displaced.tension, 0.5, 1e-12);
  assert.ok(displaced.tangentWeight < 0);
  assertClose(displaced.normalWeight, 0.5, 1e-12);
});

test('large-angle period approximation and numerical RK4 period are distinct', () => {
  const length = 1.6;
  const amplitude = Math.PI / 3;
  const omega0 = Math.sqrt(G / length);
  assertClose(largeAmplitudePeriod(simpleT0(length), amplitude), 2.6855);

  const dt = 0.0005;
  let state = { theta: amplitude, omega: 0 };
  let elapsed = 0;
  let quarterPeriod;
  while (quarterPeriod === undefined) {
    const previousTheta = state.theta;
    state = stepPendulumRK4(state, omega0 ** 2, dt);
    elapsed += dt;
    if (previousTheta >= 0 && state.theta < 0) {
      quarterPeriod = elapsed - dt * state.theta / (state.theta - previousTheta);
    }
  }
  assertClose(4 * quarterPeriod, 2.6972, 0.005);
});

test('compound pendulum properties match both required configurations', () => {
  const withoutPointMass = compoundProps({ M: 0.5, l: 0.8, f: 0.1, mp: 0 });
  assertClose(withoutPointMass.d, 0.32);
  assertClose(withoutPointMass.I, 0.077867);
  assertClose(withoutPointMass.T0, 1.3861);
  assertClose(withoutPointMass.Leq, 0.48667);
  assertClose(simpleT0(withoutPointMass.Leq), withoutPointMass.T0);

  const withPointMass = compoundProps({ M: 0.5, l: 0.8, f: 0.1, mp: 0.2 });
  assertClose(withPointMass.m, 0.7);
  assertClose(withPointMass.d, 0.434286);
  assertClose(withPointMass.I, 0.181547);
  assertClose(withPointMass.T0, 1.53546);
  assertClose(withPointMass.Leq, 0.59719);
  assertClose(simpleT0(withPointMass.Leq), withPointMass.T0);
});

test('compound centre offset follows the rod angle and calculated distance', () => {
  const offset = compoundCentreOffset(0.32, Math.PI / 6, 2.2);
  assertClose(offset.x, 0.352, 1e-12);
  assertClose(offset.y, -0.32 * 2.2 * Math.cos(Math.PI / 6), 1e-12);
});

test('RK4 preserves the undamped pendulum energy over ten periods', () => {
  const amplitude = 0.9;
  const omega0Sq = 2.5;
  const period = 2 * Math.PI / Math.sqrt(omega0Sq);
  const dt = period / 1000;
  const totalSteps = 10_000;
  let state = { theta: amplitude, omega: 0 };
  const energy = ({ theta, omega }) => 0.5 * omega ** 2 + omega0Sq * (1 - Math.cos(theta));
  const initialEnergy = energy(state);

  for (let step = 0; step < totalSteps; step += 1) {
    state = stepPendulumRK4(state, omega0Sq, dt);
  }

  assert.ok(Math.abs(energy(state) - initialEnergy) / initialEnergy < 1e-4);
});

test('compound reaction is returned in world horizontal and vertical components', () => {
  const reaction = compoundReaction({ m: 0.7, d: 0.32, theta: 0, omega: 0, alpha: 0 });
  assert.equal(reaction.Rx, 0);
  assertClose(reaction.Ry, 7);
});
