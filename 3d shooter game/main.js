let scene, camera, renderer, clock;

function init(){
  // Create scene
  scene = new THREE.Scene();
  
  // Create camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 5);
  
  // Renderer setup with shadows enabled
  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  
  // Basic lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(5, 10, 7.5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  
  clock = new THREE.Clock();
  
  // Build the game environment
  createRoom();
  createObstacles();
  initPlayer();
  initEnemies();
  initControls();
  
  animate();
}

function animate(){
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  
  updatePlayer(delta);
  updateEnemies(delta);
  updateControls(delta);
  updateProjectiles(delta);
  
  renderer.render(scene, camera);
}

window.addEventListener('resize', function(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
