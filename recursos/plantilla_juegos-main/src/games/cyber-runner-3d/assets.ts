import * as THREE from 'three';

// 1. Futuristic Cyber Hovercraft (Player)
export function createCyberHovercraft(): THREE.Group {
  const group = new THREE.Group();

  // Main Hull with beveled aerodynamic contour
  const hullGeo = new THREE.BoxGeometry(1.25, 0.32, 2.3);
  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.2,
  });
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 0.25;
  hull.castShadow = true;
  group.add(hull);

  // Cockpit Canopy (Translucent Cyan Crystal with inner illumination)
  const canopyGeo = new THREE.CylinderGeometry(0.28, 0.45, 1.1, 16);
  canopyGeo.rotateX(Math.PI / 2);
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 0.7,
    roughness: 0.1,
    metalness: 0.9,
  });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, 0.48, -0.1);
  group.add(canopy);

  // Left & Right Swept-Back Cyber Wings with glowing edges
  const wingGeo = new THREE.BoxGeometry(0.8, 0.08, 1.5);
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x7c3aed,
    metalness: 0.7,
    roughness: 0.25,
  });
  const leftWing = new THREE.Mesh(wingGeo, wingMat);
  leftWing.position.set(-0.95, 0.28, 0.25);
  leftWing.rotation.z = 0.14;
  leftWing.castShadow = true;
  group.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeo, wingMat);
  rightWing.position.set(0.95, 0.28, 0.25);
  rightWing.rotation.z = -0.14;
  rightWing.castShadow = true;
  group.add(rightWing);

  // Wingtip Neon Light strips
  const tipGeo = new THREE.BoxGeometry(0.06, 0.08, 1.3);
  const tipMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const leftTip = new THREE.Mesh(tipGeo, tipMat);
  leftTip.position.set(-1.35, 0.24, 0.25);
  group.add(leftTip);

  const rightTip = new THREE.Mesh(tipGeo, tipMat);
  rightTip.position.set(1.35, 0.24, 0.25);
  group.add(rightTip);

  // Twin Thrusters Tubes
  const thrusterGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.75, 16);
  thrusterGeo.rotateX(Math.PI / 2);
  const thrusterMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.95,
    roughness: 0.15,
  });
  const leftThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
  leftThruster.position.set(-0.42, 0.3, 1.15);
  group.add(leftThruster);

  const rightThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
  rightThruster.position.set(0.42, 0.3, 1.15);
  group.add(rightThruster);

  // Twin Plasma Exhaust Flames
  const flameGeo = new THREE.ConeGeometry(0.18, 0.9, 12);
  flameGeo.rotateX(-Math.PI / 2);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const leftFlame = new THREE.Mesh(flameGeo, flameMat);
  leftFlame.position.set(-0.42, 0.3, 1.85);
  group.add(leftFlame);

  const rightFlame = new THREE.Mesh(flameGeo, flameMat);
  rightFlame.position.set(0.42, 0.3, 1.85);
  group.add(rightFlame);

  // Ground Hover Glow Shadow
  const shadowGeo = new THREE.PlaneGeometry(1.8, 2.6);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.35,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.y = 0.03;
  group.add(shadow);

  return group;
}

// 2. Plasma Spire Barrier (Dimensional Low Hurdle with Pulsating Energy Core)
export function createBarrierMesh(): THREE.Group {
  const group = new THREE.Group();

  // Heavy Base Plates (Left & Right)
  const baseGeo = new THREE.BoxGeometry(0.35, 0.85, 0.6);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.9,
    roughness: 0.3,
  });

  const leftPylon = new THREE.Mesh(baseGeo, baseMat);
  leftPylon.position.set(-0.85, 0.42, 0);
  leftPylon.castShadow = true;
  group.add(leftPylon);

  const rightPylon = new THREE.Mesh(baseGeo, baseMat);
  rightPylon.position.set(0.85, 0.42, 0);
  rightPylon.castShadow = true;
  group.add(rightPylon);

  // Pulsating Plasma Energy Beam (Between Pylons)
  const plasmaGeo = new THREE.BoxGeometry(1.4, 0.55, 0.2);
  const plasmaMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 0.85,
    roughness: 0.1,
  });
  const plasma = new THREE.Mesh(plasmaGeo, plasmaMat);
  plasma.position.set(0, 0.45, 0);
  group.add(plasma);

  // Hazard Diagonal Warning Stripes on Crossbar
  const barGeo = new THREE.BoxGeometry(1.5, 0.15, 0.35);
  const barMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.5,
    roughness: 0.4,
  });
  const topBar = new THREE.Mesh(barGeo, barMat);
  topBar.position.set(0, 0.78, 0);
  group.add(topBar);

  // Ground Warning Glow
  const glowGeo = new THREE.PlaneGeometry(1.8, 0.8);
  glowGeo.rotateX(-Math.PI / 2);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.4,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.set(0, 0.02, 0);
  group.add(glow);

  return group;
}

// 3. High Overhead Laser Grid (Requires Sliding / Ducking)
export function createHighLaserMesh(): THREE.Group {
  const group = new THREE.Group();

  // Tall Industrial Trusses (Left & Right)
  const trussGeo = new THREE.BoxGeometry(0.25, 2.4, 0.45);
  const trussMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.2,
  });

  const leftTruss = new THREE.Mesh(trussGeo, trussMat);
  leftTruss.position.set(-1.0, 1.2, 0);
  leftTruss.castShadow = true;
  group.add(leftTruss);

  const rightTruss = new THREE.Mesh(trussGeo, trussMat);
  rightTruss.position.set(1.0, 1.2, 0);
  rightTruss.castShadow = true;
  group.add(rightTruss);

  // Overhead Bridge Gantry
  const gantryGeo = new THREE.BoxGeometry(2.3, 0.35, 0.5);
  const gantry = new THREE.Mesh(gantryGeo, trussMat);
  gantry.position.set(0, 2.2, 0);
  group.add(gantry);

  // Dual Red Warning Beacon Domes on Gantry top
  const beaconGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const leftBeacon = new THREE.Mesh(beaconGeo, beaconMat);
  leftBeacon.position.set(-0.85, 2.42, 0);
  group.add(leftBeacon);

  const rightBeacon = new THREE.Mesh(beaconGeo, beaconMat);
  rightBeacon.position.set(0.85, 2.42, 0);
  group.add(rightBeacon);

  // Suspended High Voltage Laser Beam (Y = 1.35)
  const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.0, 12);
  beamGeo.rotateZ(Math.PI / 2);
  const beamMat = new THREE.MeshStandardMaterial({
    color: 0xec4899,
    emissive: 0xec4899,
    emissiveIntensity: 1.2,
    roughness: 0.1,
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.set(0, 1.35, 0);
  group.add(beam);

  // Electrical Arc Emitter Nodes
  const nodeGeo = new THREE.BoxGeometry(0.2, 0.25, 0.3);
  const nodeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 });
  const leftNode = new THREE.Mesh(nodeGeo, nodeMat);
  leftNode.position.set(-0.88, 1.35, 0);
  group.add(leftNode);

  const rightNode = new THREE.Mesh(nodeGeo, nodeMat);
  rightNode.position.set(0.88, 1.35, 0);
  group.add(rightNode);

  return group;
}

// 4. Cyber Patrol Recon Drone (Patrolling & Scanning)
export function createCyberDroneMesh(): THREE.Group {
  const drone = new THREE.Group();

  // Angular Stealth Core
  const coreGeo = new THREE.OctahedronGeometry(0.5, 0);
  coreGeo.scale(1.2, 0.7, 1.4);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.95,
    roughness: 0.15,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.castShadow = true;
  drone.add(core);

  // Twin Hover Turbines (Left & Right)
  const turbineGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 16);
  const turbineMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
    roughness: 0.2,
  });

  const leftTurbine = new THREE.Mesh(turbineGeo, turbineMat);
  leftTurbine.position.set(-0.85, 0, 0);
  leftTurbine.rotation.z = 0.2;
  drone.add(leftTurbine);

  const rightTurbine = new THREE.Mesh(turbineGeo, turbineMat);
  rightTurbine.position.set(0.85, 0, 0);
  rightTurbine.rotation.z = -0.2;
  drone.add(rightTurbine);

  // Turbine Glowing Plasma Blades
  const ringGeo = new THREE.RingGeometry(0.15, 0.32, 16);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide });
  const leftRing = new THREE.Mesh(ringGeo, ringMat);
  leftRing.position.set(-0.85, 0.05, 0);
  drone.add(leftRing);

  const rightRing = new THREE.Mesh(ringGeo, ringMat);
  rightRing.position.set(0.85, 0.05, 0);
  drone.add(rightRing);

  // Scanning Threat Eye
  const eyeGeo = new THREE.SphereGeometry(0.2, 12, 12);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const eye = new THREE.Mesh(eyeGeo, eyeMat);
  eye.position.set(0, -0.15, 0.45);
  drone.add(eye);

  // Ground Laser Scanner Spot
  const spotGeo = new THREE.PlaneGeometry(1.6, 1.6);
  spotGeo.rotateX(-Math.PI / 2);
  const spotMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.35,
  });
  const spot = new THREE.Mesh(spotGeo, spotMat);
  spot.position.set(0, -1.18, 0);
  drone.add(spot);

  return drone;
}

// 5. Heavy Double Gate (Spanning 2 lanes with Industrial Bulkheads)
export function createDoubleGateMesh(): THREE.Group {
  const group = new THREE.Group();

  // Heavy Armored Barricade
  const gateGeo = new THREE.BoxGeometry(4.2, 1.1, 0.55);
  const gateMat = new THREE.MeshStandardMaterial({
    color: 0x1e1b4b,
    metalness: 0.85,
    roughness: 0.25,
  });
  const gate = new THREE.Mesh(gateGeo, gateMat);
  gate.position.y = 0.55;
  gate.castShadow = true;
  group.add(gate);

  // Caution Hazard Stripe Accents (Yellow & Black)
  const stripeGeo = new THREE.BoxGeometry(4.0, 0.25, 0.6);
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xb45309,
    emissiveIntensity: 0.5,
    metalness: 0.6,
  });
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.position.set(0, 0.55, 0);
  group.add(stripe);

  // Warning Emergency Sirens on Left & Right Top
  const sirenGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.35, 12);
  const sirenMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const leftSiren = new THREE.Mesh(sirenGeo, sirenMat);
  leftSiren.position.set(-1.8, 1.25, 0);
  group.add(leftSiren);

  const rightSiren = new THREE.Mesh(sirenGeo, sirenMat);
  rightSiren.position.set(1.8, 1.25, 0);
  group.add(rightSiren);

  return group;
}

// 6. Turbo Warp Speed Ring (Golden Portal with depth & chevron guide)
export function createSpeedRingMesh(): THREE.Group {
  const ringGroup = new THREE.Group();

  // Outer Octagonal Beveled Frame
  const frameGeo = new THREE.TorusGeometry(1.2, 0.12, 12, 24);
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.95,
    metalness: 0.9,
    roughness: 0.15,
  });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  ringGroup.add(frame);

  // Inner Swirling Energy Horizon
  const horizonGeo = new THREE.RingGeometry(0.3, 1.1, 24);
  const horizonMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
  });
  const horizon = new THREE.Mesh(horizonGeo, horizonMat);
  ringGroup.add(horizon);

  // Directional Forward Warp Chevron
  const chevronGeo = new THREE.ConeGeometry(0.35, 0.65, 4);
  chevronGeo.rotateX(-Math.PI / 2);
  const chevronMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const chevron = new THREE.Mesh(chevronGeo, chevronMat);
  chevron.position.set(0, 0, 0);
  ringGroup.add(chevron);

  return ringGroup;
}

// 7. Highway Overhead Gantry (Creates environmental depth)
export function createHighwayGantryMesh(): THREE.Group {
  const gantry = new THREE.Group();

  const legGeo = new THREE.BoxGeometry(0.35, 6.0, 0.45);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9, roughness: 0.3 });

  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(-4.6, 3.0, 0);
  gantry.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.position.set(4.6, 3.0, 0);
  gantry.add(rightLeg);

  const topGeo = new THREE.BoxGeometry(9.6, 0.5, 0.55);
  const top = new THREE.Mesh(topGeo, legMat);
  top.position.set(0, 5.8, 0);
  gantry.add(top);

  // Glowing Holographic Arch Sign
  const signGeo = new THREE.PlaneGeometry(6.0, 0.8);
  const signMat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(0, 5.0, 0);
  gantry.add(sign);

  return gantry;
}

// 8. Glowing Collectible Marble with specular reflection
export function createMarbleMesh(colorHex = 0xf59e0b): THREE.Mesh {
  const geo = new THREE.SphereGeometry(0.38, 16, 16);
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.7,
    metalness: 0.9,
    roughness: 0.1,
  });
  return new THREE.Mesh(geo, mat);
}
