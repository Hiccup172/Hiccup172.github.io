// Function to create a transparent, wireframe sphere container
function createContainerSphere(scene) {
  const geometry = new THREE.SphereGeometry(30, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.01

  });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
  return sphere;
}
