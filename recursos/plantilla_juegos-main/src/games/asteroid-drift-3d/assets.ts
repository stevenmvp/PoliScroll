import * as THREE from 'three';

export function createProceduralSpaceship(): THREE.Group {
  const ship = new THREE.Group();

  // 1. Central Fuselage
  const fuseGeo = new THREE.ConeGeometry(0.7, 2.8, 8);
  fuseGeo.rotateX(-Math.PI / 2);
  const fuseMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.25,
  });
  const fuselage = new THREE.Mesh(fuseGeo, fuseMat);
  ship.add(fuselage);

  // 2. Cockpit Canopy (Neon Cyan Glass)
  const canopyGeo = new THREE.SphereGeometry(0.35, 12, 12);
  canopyGeo.scale(1, 0.6, 1.8);
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 0.6,
    metalness: 0.8,
    roughness: 0.1,
  });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, 0.35, 0.2);
  ship.add(canopy);

  // 3 & 4. Swept Delta Wings
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(2.2, -1.0);
  wingShape.lineTo(2.0, -1.4);
  wingShape.lineTo(0, -0.6);
  wingShape.closePath();

  const wingExtrude = new THREE.ExtrudeGeometry(wingShape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
  wingExtrude.rotateX(Math.PI / 2);
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    metalness: 0.7,
    roughness: 0.3,
  });

  const rightWing = new THREE.Mesh(wingExtrude, wingMat);
  rightWing.position.set(0.3, 0, 0.2);
  ship.add(rightWing);

  const leftWing = new THREE.Mesh(wingExtrude, wingMat);
  leftWing.position.set(-0.3, 0, 0.2);
  leftWing.scale.x = -1;
  ship.add(leftWing);

  // 5 & 6. Wingtip Ion Cannons
  const cannonGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.9, 8);
  cannonGeo.rotateX(Math.PI / 2);
  const cannonMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 });

  const rightCannon = new THREE.Mesh(cannonGeo, cannonMat);
  rightCannon.position.set(2.1, -0.05, -0.2);
  ship.add(rightCannon);

  const leftCannon = new THREE.Mesh(cannonGeo, cannonMat);
  leftCannon.position.set(-2.1, -0.05, -0.2);
  ship.add(leftCannon);

  // 7. Ion Thruster Flame
  const flameGeo = new THREE.ConeGeometry(0.35, 1.2, 8);
  flameGeo.rotateX(Math.PI / 2);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const flame = new THREE.Mesh(flameGeo, flameMat);
  flame.position.set(0, 0, 1.8);
  ship.add(flame);

  return ship;
}

export function createAsteroidMesh(radius = 1.4): THREE.Mesh {
  const geo = new THREE.DodecahedronGeometry(radius, 1);
  // Jitter vertices for rocky roughness
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const factor = 1 + (Math.sin(vx * 5) * Math.cos(vy * 5) * 0.2);
    pos.setXYZ(i, vx * factor, vy * factor, vz * factor);
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true,
  });
  return new THREE.Mesh(geo, mat);
}

export function createCosmicOrbMesh(): THREE.Mesh {
  const geo = new THREE.SphereGeometry(0.4, 16, 16);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.8,
    metalness: 0.8,
    roughness: 0.2,
  });
  return new THREE.Mesh(geo, mat);
}
