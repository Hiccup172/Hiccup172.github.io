let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let mouseX = 0, mouseY = 0;

function initControls(){
  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);
  document.addEventListener('mousemove', onMouseMove, false);
  document.addEventListener('click', onMouseClick, false);
}

function onKeyDown(event){
  switch(event.keyCode){
    case 87: // W
      moveForward = true;
      break;
    case 83: // S
      moveBackward = true;
      break;
    case 65: // A
      moveLeft = true;
      break;
    case 68: // D
      moveRight = true;
      break;
  }
}

function onKeyUp(event){
  switch(event.keyCode){
    case 87:
      moveForward = false;
      break;
    case 83:
      moveBackward = false;
      break;
    case 65:
      moveLeft = false;
      break;
    case 68:
      moveRight = false;
      break;
  }
}

function onMouseMove(event){
  // Use movementX to rotate the player (first-person view)
  let movementX = event.movementX || 0;
  player.rotation.y -= movementX * 0.002;
}

function updateControls(delta){
  const speed = 5;
  let direction = new THREE.Vector3();
  if(moveForward) direction.z -= 1;
  if(moveBackward) direction.z += 1;
  if(moveLeft) direction.x -= 1;
  if(moveRight) direction.x += 1;
  direction.normalize();
  
  // Move relative to player's rotation
  let angle = player.rotation.y;
  let dx = direction.x * Math.cos(angle) - direction.z * Math.sin(angle);
  let dz = direction.x * Math.sin(angle) + direction.z * Math.cos(angle);
  player.position.x += dx * speed * delta;
  player.position.z += dz * speed * delta;
  
  // Update camera to follow the player (slightly above)
  camera.position.set(player.position.x, player.position.y + 0.6, player.position.z);
  camera.rotation.y = player.rotation.y;
}

function onMouseClick(){
  // Player shoots when clicking
  shootPlayerProjectile();
}
