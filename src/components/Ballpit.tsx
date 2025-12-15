import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface BallpitProps {
  count?: number;
  colors?: number[];
  minSize?: number;
  maxSize?: number;
  gravity?: number;
  friction?: number;
  wallBounce?: number;
  followCursor?: boolean;
  className?: string;
}

const Ballpit = ({
  count = 50,
  colors = [0x22c55e, 0x16a34a, 0x15803d, 0x166534, 0x4ade80, 0x86efac],
  minSize = 0.5,
  maxSize = 1.5,
  gravity = 0.5,
  friction = 0.99,
  wallBounce = 0.8,
  followCursor = true,
  className = '',
}: BallpitProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const ballsRef = useRef<THREE.Mesh[]>([]);
  const velocitiesRef = useRef<THREE.Vector3[]>([]);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const frameRef = useRef<number>(0);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebGLSupported(false);
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 20;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Environment for reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;
    scene.environment = environment;

    // Create balls
    const balls: THREE.Mesh[] = [];
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      const radius = minSize + Math.random() * (maxSize - minSize);
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        metalness: 0.1,
        roughness: 0.2,
        envMapIntensity: 0.8,
      });

      const ball = new THREE.Mesh(geometry, material);
      
      // Random position
      ball.position.x = (Math.random() - 0.5) * 30;
      ball.position.y = (Math.random() - 0.5) * 20;
      ball.position.z = (Math.random() - 0.5) * 10;
      
      // Store radius in userData
      ball.userData.radius = radius;

      balls.push(ball);
      scene.add(ball);

      // Random initial velocity
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.1
      ));
    }

    ballsRef.current = balls;
    velocitiesRef.current = velocities;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Mouse move handler
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / height) * 2 + 1;
    };

    if (followCursor) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    // Boundaries
    const bounds = {
      x: 18,
      y: 12,
      z: 8
    };

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      balls.forEach((ball, i) => {
        const velocity = velocities[i];
        const radius = ball.userData.radius;

        // Apply gravity (subtle)
        velocity.y -= gravity * 0.01;

        // Apply friction
        velocity.multiplyScalar(friction);

        // Cursor interaction
        if (followCursor) {
          const mouseWorld = new THREE.Vector3(
            mouseRef.current.x * bounds.x,
            mouseRef.current.y * bounds.y,
            5
          );
          
          const direction = mouseWorld.clone().sub(ball.position);
          const distance = direction.length();
          
          if (distance < 8) {
            direction.normalize();
            const force = (1 - distance / 8) * 0.05;
            velocity.add(direction.multiplyScalar(force));
          }
        }

        // Update position
        ball.position.add(velocity);

        // Wall bouncing
        if (ball.position.x < -bounds.x + radius) {
          ball.position.x = -bounds.x + radius;
          velocity.x *= -wallBounce;
        }
        if (ball.position.x > bounds.x - radius) {
          ball.position.x = bounds.x - radius;
          velocity.x *= -wallBounce;
        }
        if (ball.position.y < -bounds.y + radius) {
          ball.position.y = -bounds.y + radius;
          velocity.y *= -wallBounce;
        }
        if (ball.position.y > bounds.y - radius) {
          ball.position.y = bounds.y - radius;
          velocity.y *= -wallBounce;
        }
        if (ball.position.z < -bounds.z + radius) {
          ball.position.z = -bounds.z + radius;
          velocity.z *= -wallBounce;
        }
        if (ball.position.z > bounds.z - radius) {
          ball.position.z = bounds.z - radius;
          velocity.z *= -wallBounce;
        }

        // Ball rotation for visual interest
        ball.rotation.x += velocity.x * 0.1;
        ball.rotation.y += velocity.y * 0.1;
      });

      // Ball-to-ball collisions (simplified)
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const ball1 = balls[i];
          const ball2 = balls[j];
          const r1 = ball1.userData.radius;
          const r2 = ball2.userData.radius;
          
          const diff = ball2.position.clone().sub(ball1.position);
          const dist = diff.length();
          const minDist = r1 + r2;
          
          if (dist < minDist && dist > 0) {
            const normal = diff.normalize();
            const overlap = minDist - dist;
            
            // Separate balls
            ball1.position.sub(normal.clone().multiplyScalar(overlap * 0.5));
            ball2.position.add(normal.clone().multiplyScalar(overlap * 0.5));
            
            // Exchange velocities along collision normal
            const v1n = normal.clone().multiplyScalar(velocities[i].dot(normal));
            const v2n = normal.clone().multiplyScalar(velocities[j].dot(normal));
            
            velocities[i].sub(v1n).add(v2n.multiplyScalar(0.9));
            velocities[j].sub(v2n).add(v1n.multiplyScalar(0.9));
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      if (followCursor) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      
      balls.forEach(ball => {
        ball.geometry.dispose();
        (ball.material as THREE.MeshStandardMaterial).dispose();
        scene.remove(ball);
      });
      
      renderer.dispose();
      pmremGenerator.dispose();
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [count, colors, minSize, maxSize, gravity, friction, wallBounce, followCursor]);

  if (!webGLSupported) {
    return (
      <div 
        className={`absolute inset-0 ${className}`}
        style={{ 
          background: 'radial-gradient(ellipse at center, #166534 0%, #15803d 30%, #0f172a 100%)',
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-30"
              style={{
                width: `${30 + Math.random() * 60}px`,
                height: `${30 + Math.random() * 60}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `hsl(${140 + Math.random() * 20}, 70%, ${40 + Math.random() * 20}%)`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
};

export default Ballpit;
