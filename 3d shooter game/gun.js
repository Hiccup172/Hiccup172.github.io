function createGun(type){
  let gun;
  const material = new THREE.MeshStandardMaterial({ color: 0x555555 });
  
  if(type === "pistol"){
    // Pistol: small rectangular box
    const geometry = new THREE.BoxGeometry(0.3, 0.1, 0.8);
    gun = new THREE.Mesh(geometry, material);
  } else if (type === "shotgun"){
    // Shotgun: slightly larger box
    const geometry = new THREE.BoxGeometry(0.4, 0.15, 1);
    gun = new THREE.Mesh(geometry, material);
  } else if (type === "auto"){
    // Auto rifle: similar dimensions to pistol for demo purposes
    const geometry = new THREE.BoxGeometry(0.35, 0.1, 1);
    gun = new THREE.Mesh(geometry, material);
  } else {
    // Default to pistol if type is unrecognized
    const geometry = new THREE.BoxGeometry(0.3, 0.1, 0.8);
    gun = new THREE.Mesh(geometry, material);
  }
  
  gun.castShadow = true;
  gun.receiveShadow = true;
  return gun;
}
