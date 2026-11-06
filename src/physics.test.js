import assert from 'node:assert/strict';
import test from 'node:test';
import {
  G,
  SMALL_ANGLE,
  compoundProps,
  compoundReaction,
  largeAmplitudePeriod,
  rodInertiaCenter,
  simpleT0,
  springOmega0,
  springT0,
  springX0,
  stepPendulumRK4,
  torsionInertia,
  torsionOmega0,
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

test('torsion inertia includes the rod and symmetric point masses', () => {
  assertClose(rodInertiaCenter(0.2, 0.4), 2.6667e-3);
  const inertia = torsionInertia({ M: 0.2, L: 0.4, m: 0.05, r: 0.15 });
  assertClose(inertia, 4.9167e-3);
  assertClose(torsionOmega0(0.06, inertia), 3.4933);
  assertClose(torsionT0(0.06, inertia), 1.7986);
});

test('small-angle simple-pendulum periods use the configured gravity', () => {
  assert.equal(G, 10);
  assertClose(simpleT0(1.6), 2.5133);
  assertClose(simpleT0(1), 1.9869);
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
