"use client";

/**
 * Placeholder silhouette shown until the body GLB model is loaded.
 */
export function PlaceholderBody() {
  return (
    <group position={[0, -0.2, 0]}>
      {/* Head */}
      <mesh castShadow position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.2} roughness={0.45} />
      </mesh>

      {/* Torso */}
      <mesh castShadow position={[0, 0.75, 0]}>
        <capsuleGeometry args={[0.28, 0.7, 8, 16]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.15} roughness={0.5} />
      </mesh>

      {/* Hips */}
      <mesh castShadow position={[0, 0.25, 0]}>
        <capsuleGeometry args={[0.24, 0.25, 8, 16]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.15} roughness={0.5} />
      </mesh>

      {/* Legs */}
      <mesh castShadow position={[-0.14, -0.45, 0]}>
        <capsuleGeometry args={[0.1, 0.75, 8, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.1} roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0.14, -0.45, 0]}>
        <capsuleGeometry args={[0.1, 0.75, 8, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.1} roughness={0.55} />
      </mesh>

      {/* Arms */}
      <mesh castShadow position={[-0.42, 0.85, 0]} rotation={[0, 0, 0.25]}>
        <capsuleGeometry args={[0.08, 0.55, 8, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.1} roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0.42, 0.85, 0]} rotation={[0, 0, -0.25]}>
        <capsuleGeometry args={[0.08, 0.55, 8, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.1} roughness={0.55} />
      </mesh>
    </group>
  );
}
