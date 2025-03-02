function createRoom(){
  // Floor
  const floorGeometry = new THREE.PlaneGeometry(20, 20);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  
  // Walls (back, front, left, right)
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
  const wallGeometry = new THREE.PlaneGeometry(20, 4);
  
  const wallBack = new THREE.Mesh(wallGeometry, wallMaterial);
  wallBack.position.set(0, 2, 10);
  wallBack.receiveShadow = true;
  scene.add(wallBack);
  
  const wallFront = new THREE.Mesh(wallGeometry, wallMaterial);
  wallFront.position.set(0, 2, -10);
  wallFront.rotation.y = Math.PI;
  wallFront.receiveShadow = true;
  scene.add(wallFront);
  
  const wallRight = new THREE.Mesh(wallGeometry, wallMaterial);
  wallRight.position.set(10, 2, 0);
  wallRight.rotation.y = -Math.PI / 2;
  wallRight.receiveShadow = true;
  scene.add(wallRight);
  
  const wallLeft = new THREE.Mesh(wallGeometry, wallMaterial);
  wallLeft.position.set(-10, 2, 0);
  wallLeft.rotation.y = Math.PI / 2;
  wallLeft.receiveShadow = true;
  scene.add(wallLeft);
  
  // Ceiling
  const ceiling = new THREE.Mesh(floorGeometry, floorMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 4;
  ceiling.receiveShadow = true;
  scene.add(ceiling);
  
  // Add a grid helper for visual reference
  const gridHelper = new THREE.GridHelper(20, 20, 0x000000, 0x000000);
  scene.add(gridHelper);
}

function createObstacles(){
  // Create a few box obstacles inside the room
  const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  
  for (let i = 0; i < 5; i++){
    let box = new THREE.Mesh(boxGeometry, obstacleMaterial);
    box.position.set((Math.random() - 0.5) * 10, 0.5, (Math.random() - 0.5) * 10);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);
  }
}
