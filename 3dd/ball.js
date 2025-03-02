// Ball class: creates a ball with random position and velocity,
// and updates its motion with gravity, friction (via a bounce factor),
// and bounces off the inner surface of the container sphere.
class Ball {
    constructor(scene) {
      this.radius = 1;
      const geometry = new THREE.SphereGeometry(this.radius, 16, 16);
      const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
      this.mesh = new THREE.Mesh(geometry, material);
  
      // Place the ball randomly inside the container (accounting for its radius)
      const containerRadius = 30 - this.radius;
      this.mesh.position.set(
        (Math.random() * 2 - 1) * containerRadius,
        (Math.random() * 2 - 1) * containerRadius,
        (Math.random() * 2 - 1) * containerRadius
      );
  
      // Random velocity vector
      this.velocity = new THREE.Vector3(
        (Math.random() * 2 - 1) * 0.5,
        (Math.random() * 2 - 1) * 0.5,
        (Math.random() * 2 - 1) * 0.5
      );
  
      scene.add(this.mesh);
    }
  
    update(delta, containerRadius) {
      // Gravity effect (acting downward along the y-axis)
      const GRAVITY = 9.81;
      this.velocity.y -= GRAVITY * delta;
  
      // Update position based on current velocity
      this.mesh.position.add(this.velocity.clone().multiplyScalar(delta));
  
      // Check for collision with the inner surface of the container sphere
      if (this.mesh.position.length() + this.radius > containerRadius) {
        // Compute collision normal (pointing outward from the sphere's center)
        const normal = this.mesh.position.clone().normalize();
        // Reflect the velocity using the reflection formula: R = V - 2*(V·N)*N
        const dot = this.velocity.dot(normal);
        this.velocity.sub(normal.multiplyScalar(2 * dot));
        
        // Apply a bounce factor to simulate friction/energy loss on impact
        const bounceFactor = 1; // lose 20% energy on bounce
        this.velocity.multiplyScalar(bounceFactor);
        
        // Reposition the ball inside the container
        this.mesh.position.setLength(containerRadius - this.radius);
      }
    }
  }
  