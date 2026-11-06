export const G = 10;
export const SMALL_ANGLE = 0.24;

export function springOmega0(m, k) {
  return Math.sqrt(k / m);
}

export function springT0(m, k) {
  return 2 * Math.PI * Math.sqrt(m / k);
}

export function springX0(m, k) {
  return m * G / k;
}

export function rodInertiaCenter(M, L) {
  return M * L ** 2 / 12;
}

export function torsionInertia({ M, L, m, r }) {
  return rodInertiaCenter(M, L) + 2 * m * r ** 2;
}

export function torsionOmega0(k, I) {
  return Math.sqrt(k / I);
}

export function torsionT0(k, I) {
  return 2 * Math.PI * Math.sqrt(I / k);
}

export function simpleOmega0(L, g = G) {
  return Math.sqrt(g / L);
}

export function simpleT0(L, g = G) {
  return 2 * Math.PI * Math.sqrt(L / g);
}

export function compoundProps({ M, l, f, mp = 0 }) {
  const yRod = l / 2 - f * l;
  const yEnd = l - f * l;
  const m = M + mp;
  const d = (M * yRod + mp * yEnd) / m;
  const I = rodInertiaCenter(M, l) + M * yRod ** 2 + mp * yEnd ** 2;
  const omega0 = Math.sqrt(m * G * d / I);
  const T0 = 2 * Math.PI * Math.sqrt(I / (m * G * d));
  const Leq = I / (m * d);

  return { m, d, I, omega0, T0, Leq };
}

export function largeAmplitudePeriod(T0, thetaMax) {
  return T0 * (1 + thetaMax ** 2 / 16);
}

export function stepPendulumRK4({ theta, omega }, omega0Sq, dt) {
  const acceleration = (angle) => -omega0Sq * Math.sin(angle);
  const k1Theta = omega;
  const k1Omega = acceleration(theta);
  const k2Theta = omega + k1Omega * dt / 2;
  const k2Omega = acceleration(theta + k1Theta * dt / 2);
  const k3Theta = omega + k2Omega * dt / 2;
  const k3Omega = acceleration(theta + k2Theta * dt / 2);
  const k4Theta = omega + k3Omega * dt;
  const k4Omega = acceleration(theta + k3Theta * dt);

  return {
    theta: theta + dt * (k1Theta + 2 * k2Theta + 2 * k3Theta + k4Theta) / 6,
    omega: omega + dt * (k1Omega + 2 * k2Omega + 2 * k3Omega + k4Omega) / 6,
  };
}

export function compoundReaction({ m, d, theta, omega, alpha }) {
  const accelerationX = d * (alpha * Math.cos(theta) - omega ** 2 * Math.sin(theta));
  const accelerationY = d * (alpha * Math.sin(theta) + omega ** 2 * Math.cos(theta));
  return {
    Rx: m * accelerationX,
    Ry: m * accelerationY + m * G,
  };
}
