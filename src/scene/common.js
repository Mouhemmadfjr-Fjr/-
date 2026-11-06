import * as THREE from 'three';

const UP = new THREE.Vector3(0, 1, 0);

export const COLORS = Object.freeze({
  weight: '#d97706',
  tension: '#0284c7',
  restoring: '#db2777',
  reaction: '#16a34a',
  equilibrium: '#64748b',
  path: '#94a3b8',
});

export function createMaterial(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.48,
    metalness: 0.2,
    ...options,
  });
}

export function createForceArrow(color, radius = 0.035) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.3,
    metalness: 0.2,
    depthTest: false,
  });
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 0.76, 12),
    material,
  );
  shaft.position.y = 0.38;
  const head = new THREE.Mesh(
    new THREE.ConeGeometry(radius * 2.8, 0.24, 12),
    material,
  );
  head.position.y = 0.88;
  group.add(shaft, head);
  group.renderOrder = 20;
  group.traverse((part) => {
    part.renderOrder = 20;
    if (part.material) part.material.depthTest = false;
  });

  const direction = new THREE.Vector3();
  group.set = (origin, vector, length) => {
    if (!Number.isFinite(length) || length < 0.03 || vector.lengthSq() === 0) {
      group.visible = false;
      return;
    }

    direction.copy(vector).normalize();
    group.position.copy(origin);
    group.quaternion.setFromUnitVectors(UP, direction);
    group.scale.set(1, length, 1);
    group.visible = true;
  };
  group.visible = false;
  return group;
}

export function createLabel(text, { color = '#0f172a', size = 0.48 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 144;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create a canvas context for a scene label.');
  context.font = '700 64px Cairo, Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.lineWidth = 9;
  context.strokeStyle = '#fff';
  context.strokeText(text, 256, 72);
  context.fillStyle = color;
  context.fillText(text, 256, 72);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  }));
  sprite.scale.set(size * 3.2, size * 0.9, 1);
  sprite.renderOrder = 25;
  return sprite;
}

export function createDimensionLine(a, b, { label = '', offset = [0.2, 0, 0] } = {}) {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({ color: '#334155', depthTest: false });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(10 * 3), 3));
  const line = new THREE.LineSegments(geometry, material);
  line.renderOrder = 15;
  group.add(line);
  const caption = label ? createLabel(label, { size: 0.36 }) : null;
  if (caption) group.add(caption);

  group.set = (start, end) => {
    const first = start.clone().add(new THREE.Vector3(...offset));
    const second = end.clone().add(new THREE.Vector3(...offset));
    const direction = second.clone().sub(first);
    const tick = new THREE.Vector3(-direction.y, direction.x, 0);
    if (tick.lengthSq() < 1e-10) tick.set(1, 0, 0);
    tick.setLength(0.06);
    const positions = [
      ...first.toArray(), ...second.toArray(),
      ...first.clone().sub(tick).toArray(), ...first.clone().add(tick).toArray(),
      ...second.clone().sub(tick).toArray(), ...second.clone().add(tick).toArray(),
      ...start.toArray(), ...first.toArray(),
      ...end.toArray(), ...second.toArray(),
    ];
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeBoundingSphere();
    if (caption) caption.position.copy(first).add(second).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.18, 0.06));
    group.visible = direction.length() > 0.003;
  };
  group.set(a, b);
  return group;
}

export function createArcArrow({ radius = 0.5, from = 0, to = Math.PI / 2, axis = 'z', color = COLORS.restoring } = {}) {
  const group = new THREE.Group();
  const pointsCount = 49;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(pointsCount * 3), 3));
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, depthTest: false }));
  line.renderOrder = 16;
  const head = new THREE.Mesh(
    new THREE.ConeGeometry(0.075, 0.2, 12),
    new THREE.MeshBasicMaterial({ color, depthTest: false }),
  );
  head.renderOrder = 17;
  group.add(line, head);
  const normal = axis === 'y' ? new THREE.Vector3(0, 1, 0) : axis === 'x' ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
  const pointAt = (angle, distance) => {
    if (axis === 'y') return new THREE.Vector3(Math.cos(angle) * distance, 0, -Math.sin(angle) * distance);
    if (axis === 'x') return new THREE.Vector3(0, Math.cos(angle) * distance, Math.sin(angle) * distance);
    return new THREE.Vector3(Math.cos(angle) * distance, Math.sin(angle) * distance, 0);
  };

  group.set = (origin, start, end, size = radius, visible = true) => {
    const span = end - start;
    group.visible = visible && Math.abs(span) > 0.01;
    if (!group.visible) return;
    group.position.copy(origin);
    const positions = geometry.getAttribute('position');
    for (let index = 0; index < pointsCount; index += 1) {
      const angle = start + span * index / (pointsCount - 1);
      positions.setXYZ(index, ...pointAt(angle, size).toArray());
    }
    positions.needsUpdate = true;
    geometry.computeBoundingSphere();
    const angle = end;
    const tip = pointAt(angle, size);
    const tangent = pointAt(angle + Math.sign(span) * Math.PI / 2, 1);
    head.position.copy(tip);
    head.quaternion.setFromUnitVectors(UP, tangent);
    group.userData.axis = normal;
  };
  group.set(new THREE.Vector3(), from, to, radius);
  return group;
}

export function createDashedLine(points, { color = COLORS.equilibrium, dash = 0.12, gap = 0.08 } = {}) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, new THREE.LineDashedMaterial({
    color,
    dashSize: dash,
    gapSize: gap,
    depthTest: false,
  }));
  line.computeLineDistances();
  line.renderOrder = 8;
  line.setPoints = (nextPoints) => {
    geometry.deleteAttribute('position');
    geometry.setFromPoints(nextPoints);
    line.computeLineDistances();
  };
  return line;
}

export function createRodBetween(a, b, radius, material, radialSegments = 12) {
  const geometry = new THREE.CylinderGeometry(radius, radius, 1, radialSegments);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.set = (start, end) => {
    const delta = end.clone().sub(start);
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, delta.clone().normalize());
    mesh.scale.set(1, delta.length(), 1);
  };
  mesh.userData.set(a, b);
  return mesh;
}

export function createHelix(length, { turns = 14, radius = 0.16, wireRadius = 0.014 } = {}) {
  const segments = turns * 24;
  const points = [];
  for (let index = 0; index <= segments; index += 1) {
    const progress = index / segments;
    const angle = progress * turns * Math.PI * 2;
    points.push(new THREE.Vector3(radius * Math.cos(angle), -length * progress, radius * Math.sin(angle)));
  }
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, segments, wireRadius, 8, false),
    createMaterial('#0284c7', { metalness: 0.55 }),
  );
}
