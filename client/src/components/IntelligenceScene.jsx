import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { MeshReflectorMaterial } from "@react-three/drei";
import { useLocation } from "react-router-dom";
import * as THREE from "three";
import { usePreferences } from "../context/PreferencesContext";

function ReactorChamber({ mode }) {
  const group = useRef();
  const keyLight = useRef();
  const { mouse } = useThree();

  const { preferences } = usePreferences();
  const intensity = preferences?.bgIntensity ?? 1;
  const motion = preferences?.motionSensitivity ?? 1;

  const sceneConfig = useMemo(() => {
    switch (mode) {
      case "analyze":
        return { speed: 0.8, fov: 45, lightIntensity: 6, color: "#22d3ee" };
      case "portfolio":
        return { speed: 0.6, fov: 55, lightIntensity: 5, color: "#a78bfa" };
      case "activity":
        return { speed: 0.5, fov: 48, lightIntensity: 5, color: "#f59e0b" };
      case "config":
        return { speed: 0.45, fov: 52, lightIntensity: 4, color: "#10b981" };
      default:
        return { speed: 0.65, fov: 50, lightIntensity: 7, color: "white" };
    }
  }, [mode]);

useFrame((state) => {
  const t = state.clock.getElapsedTime();

  // Smooth FOV transition
  state.camera.fov += (sceneConfig.fov - state.camera.fov) * 0.05;
  state.camera.updateProjectionMatrix();

  // 🎥 Camera Cinematic Motion (Motion Sensitivity Applied)
  state.camera.position.x =
  Math.sin(t * sceneConfig.speed * (0.5 + intensity)) * (6 + intensity * 6)

  state.camera.position.y =
    2 + mouse.y * 4 * motion;

  state.camera.position.z =
    12 + Math.cos(t * sceneConfig.speed * intensity) * 4;

  state.camera.lookAt(0, 0, -20);

  // 💡 Dynamic Light Intensity Scaling
  if (keyLight.current) {
  const targetLight = sceneConfig.lightIntensity * (0.5 + intensity * 1.5);

    keyLight.current.intensity +=
      (targetLight - keyLight.current.intensity) * 0.05;

    keyLight.current.color.set(sceneConfig.color);
  }

  // 🔄 Reactor Rotation Speed Scales With Intensity
  if (group.current) {
    group.current.rotation.y +=
      0.05 * sceneConfig.speed * intensity;
  }
});

console.log("Intensity:", intensity);

  return (
    <group ref={group}>
      <ambientLight intensity={0.2} />

      <pointLight
        ref={keyLight}
        intensity={4}
        color="#38bdf8"
        position={[3, 3, 5]}
      />

      <pointLight
        intensity={1.5}
        color="#ffffff"
        position={[0, 3, 6]}
      />

      {/* Curved Shell */}
      <mesh position={[0, 0, -20]}>
        <cylinderGeometry args={[40, 40, 30, 64, 1, true]} />
        <meshStandardMaterial
          color="#0b1220"
          metalness={0.7}
          roughness={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Structural Arcs */}
      {[-12, -6, 0, 6, 12].map((z, i) => (
        <mesh key={i} position={[0, 0, z - 20]}>
          <torusGeometry args={[10, 0.3, 32, 200]} />
          <meshPhysicalMaterial
            color="#cfd8e6"
            metalness={1}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.02}
            reflectivity={1}
          />
        </mesh>
      ))}

      {/* Energy Rings */}
      {[0, 0.8, 1.6].map((offset, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2 + offset, 0.12, 32, 200]} />
          <meshPhysicalMaterial
            color="#d9dde2"
            metalness={1}
            roughness={0.04}
            clearcoat={1}
            clearcoatRoughness={0.02}
            envMapIntensity={2}
          />
        </mesh>
      ))}

      {/* Reflective Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, -20]}>
        <planeGeometry args={[200, 200]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={1 * intensity}
          roughness={0.1 / intensity}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0b1220"
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}

function IntelligenceScene() {
  const location = useLocation();
  const { preferences } = usePreferences();
  const intensity = preferences?.bgIntensity ?? 1;

  const mode = useMemo(() => {
    if (location.pathname.includes("analyze")) return "analyze";
    if (location.pathname.includes("portfolio")) return "portfolio";
    if (location.pathname.includes("activity")) return "activity";
    if (location.pathname.includes("config")) return "config";
    return "dashboard";
  }, [location.pathname]);

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 1, 9], fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={["#04060b"]} />
        <fog
          attach="fog"
          args={["#04060b", 20, 100 + intensity * 120]}
        />

        <ReactorChamber mode={mode} />

        <EffectComposer>
          <Bloom
            intensity={0.4 + intensity * 1.2}
            luminanceThreshold={0.15}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default React.memo(IntelligenceScene);