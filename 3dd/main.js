// Retrieve the container element
const container = document.getElementById('container');

// Create the Three.js scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 80;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Add lighting to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(50, 50, 50);
scene.add(pointLight);

// Create the container sphere (radius 30) and store its reference for rotation
const containerRadius = 30;
const containerSphere = createContainerSphere(scene);

// Instantiate 100 balls
const balls = [];
for (let i = 0; i < 100; i++) {
  balls.push(new Ball(scene));
}

// Animation loop
let lastTime = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const currentTime = performance.now();
  const delta = (currentTime - lastTime) / 1000; // delta time in seconds
  lastTime = currentTime;

  // Slowly rotate the container sphere
  containerSphere.rotation.y += 0.005;
  containerSphere.rotation.x += 0.003;

  // Update each ball with gravity and collision handling
  balls.forEach(ball => ball.update(delta, containerRadius));

  renderer.render(scene, camera);
}
animate();

// Handle window resize events
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
