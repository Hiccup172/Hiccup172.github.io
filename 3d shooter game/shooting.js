// Global array for all projectiles
let projectiles = [];

function shootProjectile(shooter){
  // Create a small black sphere as the projectile
  const geometry = new THREE.SphereGeometry(0.1, 8, 8);
  const material = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const projectile = new THREE.Mesh(geometry, material);
  projectile.position.copy(shooter.position);
  
  // Compute direction from shooter to player
  let direction = new THREE.Vector3();
  direction.subVectors(player.position, shooter.position).normalize();
  projectile.userData.velocity = direction.multiplyScalar(10);
  
  scene.add(projectile);
  projectiles.push(projectile);
}

function shootPlayerProjectile(){
  // Create a yellow sphere projectile for the player
  const geometry = new THREE.SphereGeometry(0.1, 8, 8);
  const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  const projectile = new THREE.Mesh(geometry, material);
  projectile.position.copy(player.position);
  
  // The projectile goes in the direction the camera is facing
  let direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  projectile.userData.velocity = direction.multiplyScalar(15);
  
  scene.add(projectile);
  projectiles.push(projectile);
}

function updateProjectiles(delta){
  // Move each projectile and remove if it goes out of bounds
  for (let i = projectiles.length - 1; i >= 0; i--){
    let proj = projectiles[i];
    proj.position.add(proj.userData.velocity.clone().multiplyScalar(delta));
    if (proj.position.distanceTo(player.position) > 50) {
      scene.remove(proj);
      projectiles.splice(i, 1);
    }
  }
}
