let enemies = [];

function initEnemies(){
  // Spawn a few enemies at different positions
  for (let i = 0; i < 3; i++){
    let enemy = createEnemy(new THREE.Vector3((i - 1) * 3, 1, -5));
    enemies.push(enemy);
    scene.add(enemy);
  }
}

function createEnemy(position){
  const enemyGroup = new THREE.Group();
  
  // Create the red cylinder body
  const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 32);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  enemyGroup.add(bodyMesh);
  
  // Top rounded cap
  const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16);
  const capMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const topCap = new THREE.Mesh(sphereGeometry, capMaterial);
  topCap.position.y = 0.9;
  topCap.castShadow = true;
  topCap.receiveShadow = true;
  enemyGroup.add(topCap);
  
  // Bottom rounded cap
  const bottomCap = new THREE.Mesh(sphereGeometry, capMaterial);
  bottomCap.position.y = -0.9;
  bottomCap.castShadow = true;
  bottomCap.receiveShadow = true;
  enemyGroup.add(bottomCap);
  
  enemyGroup.position.copy(position);
  
  // Attach a pistol (using the gun module) to the enemy
  let pistol = createGun("pistol");
  pistol.position.set(0.5, 0, 0);
  enemyGroup.add(pistol);
  
  return enemyGroup;
}

function updateEnemies(delta){
  enemies.forEach(enemy => {
    // Basic detection: if player is within 10 units, face the player and shoot
    let distance = enemy.position.distanceTo(player.position);
    if(distance < 10){
      enemy.lookAt(player.position);
      // Shoot at a simple interval (1 second cooldown)
      if(!enemy.userData.lastShot || performance.now() - enemy.userData.lastShot > 1000){
        shootProjectile(enemy);
        enemy.userData.lastShot = performance.now();
      }
    }
  });
}
