let player;

function initPlayer(){
  const playerGroup = new THREE.Group();
  
  // Create the cylinder body
  const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 32);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
  const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  playerGroup.add(bodyMesh);
  
  // Top rounded cap
  const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16);
  const capMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
  const topCap = new THREE.Mesh(sphereGeometry, capMaterial);
  topCap.position.y = 0.9;
  topCap.castShadow = true;
  topCap.receiveShadow = true;
  playerGroup.add(topCap);
  
  // Bottom rounded cap
  const bottomCap = new THREE.Mesh(sphereGeometry, capMaterial);
  bottomCap.position.y = -0.9;
  bottomCap.castShadow = true;
  bottomCap.receiveShadow = true;
  playerGroup.add(bottomCap);
  
  // Set initial player position
  playerGroup.position.set(0, 1, 0);
  scene.add(playerGroup);
  player = playerGroup;
}

// A placeholder for any per-frame player update logic
function updatePlayer(delta){
  // For example, collision detection or other updates can be added here
}
