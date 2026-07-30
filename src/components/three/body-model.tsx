"use client";

import { Center, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { BufferGeometry, Group, Material, Mesh, Object3D } from "three";
import { Color, MeshPhysicalMaterial, MeshStandardMaterial } from "three";
import { getMeshMaterials } from "@/lib/three/mesh-materials";
import { MODEL_PATHS } from "@/lib/three/model-paths";
import { ModelErrorBoundary } from "./model-error-boundary";
import { PlaceholderBody } from "./placeholder-body";

type MaterialWithColor = Material & {
  color?: { getHSL(target: { h: number; s: number; l: number }): void };
};

type MeshData = {
  mesh: Mesh;
  orig: Float32Array;
  midY: number;
  range: number;
};

function isColoredHelper(mat: MaterialWithColor): boolean {
  if (!mat.color) return false;
  const hsl = { h: 0, s: 0, l: 0 };
  mat.color.getHSL(hsl);
  if (hsl.s < 0.3) return false;
  const h = hsl.h * 360;
  return (h >= 190 && h <= 280) || (h >= 10 && h <= 50) || (h >= 90 && h <= 170);
}

function enhanceMaterial(material: Material): Material {
  if (!(material instanceof MeshStandardMaterial)) return material;

  const enhanced = new MeshPhysicalMaterial();
  enhanced.color.copy(material.color);
  if (material.map) enhanced.map = material.map;
  if (material.normalMap) enhanced.normalMap = material.normalMap;
  if (material.roughnessMap) enhanced.roughnessMap = material.roughnessMap;
  if (material.aoMap) enhanced.aoMap = material.aoMap;
  enhanced.emissive.copy(material.emissive);
  if (material.emissiveMap) enhanced.emissiveMap = material.emissiveMap;
  if (material.alphaMap) enhanced.alphaMap = material.alphaMap;
  if (material.lightMap) enhanced.lightMap = material.lightMap;
  if (material.envMap) enhanced.envMap = material.envMap;
  enhanced.alphaTest = material.alphaTest;
  enhanced.transparent = material.transparent;
  enhanced.opacity = material.opacity;
  enhanced.side = material.side;
  enhanced.roughness = 0.4;
  enhanced.metalness = 0;
  enhanced.sheen = 0.15;
  enhanced.sheenColor = new Color("#f5d5b8");
  enhanced.sheenRoughness = 0.5;
  enhanced.clearcoat = 0.05;
  enhanced.clearcoatRoughness = 0.4;
  return enhanced;
}

function processMeshMaterials(mesh: Mesh) {
  const materials = getMeshMaterials(mesh);
  const processed = materials.map((material) => enhanceMaterial(material));
  mesh.material = processed.length === 1 ? processed[0] : processed;
}

const SKELETON_KEYWORDS = [
  "bone",
  "skeleton",
  "joint",
  "armature",
  "helper",
  "ctrl",
  "def",
  "mch",
  "root",
  "hip",
  "spine",
  "chest",
  "neck",
  "head",
  "shoulder",
  "arm",
  "hand",
  "leg",
  "foot",
  "finger",
  "ik",
  "pole",
  "target",
  "origin",
  "empty",
];

function isSkeletonMesh(mesh: Mesh): boolean {
  const name = mesh.name.toLowerCase();
  if (SKELETON_KEYWORDS.some((kw) => name.includes(kw))) return true;
  const geo = mesh.geometry;
  if (
    geo?.getAttribute("position")?.count !== undefined &&
    geo.getAttribute("position").count < 50
  )
    return true;
  return false;
}

function cleanupScene(root: Group) {
  const meshes: Mesh[] = [];
  root.traverse((child) => {
    const obj = child as Object3D;
    if ((obj as Mesh).isMesh) {
      meshes.push(obj as Mesh);
    } else if ("isLine" in obj || "isPoints" in obj) {
      obj.visible = false;
    }
  });

  const mainMeshCount = Math.max(
    ...meshes.map((m) => m.geometry?.getAttribute("position")?.count ?? 0),
  );

  for (const mesh of meshes) {
    const materials = getMeshMaterials(mesh);
    if (materials.some((m) => isColoredHelper(m as MaterialWithColor))) {
      mesh.visible = false;
      continue;
    }
    if (isSkeletonMesh(mesh)) {
      mesh.visible = false;
      continue;
    }
    const vertexCount = mesh.geometry?.getAttribute("position")?.count ?? 0;
    if (vertexCount < mainMeshCount * 0.05) {
      mesh.visible = false;
      continue;
    }
    processMeshMaterials(mesh);
  }
}

function collectMeshData(root: Group): MeshData[] {
  const data: MeshData[] = [];
  root.traverse((child) => {
    if (!(child as Mesh).isMesh) return;
    const mesh = child as Mesh;
    const pos = (mesh.geometry as BufferGeometry).getAttribute("position");
    if (!pos) return;
    const orig = new Float32Array(pos.array);
    let minY = Infinity,
      maxY = -Infinity;
    for (let i = 0; i < pos.count; i++) {
      const y = orig[i * 3 + 1];
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    data.push({ mesh, orig, midY: (minY + maxY) / 2, range: maxY - minY });
  });
  return data;
}

/**
 * Scroll distance, in viewports, over which the stretch unwinds at the end of the page.
 * Roughly the footer's own height, so it starts as the body is revealed under the about
 * image and reaches the default shape exactly at the page bottom.
 */
const UNWIND_VIEWPORTS = 1;

function getScrollProgress(): number {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return 1;
  const rect = hero.getBoundingClientRect();
  return Math.max(0, Math.min(1, -rect.top / rect.height));
}

/** 0 while there's still page left, 1 at the very bottom — reverses on scroll up */
function getUnwindProgress(): number {
  const distance = window.innerHeight * UNWIND_VIEWPORTS;
  if (distance <= 0) return 1;

  const remaining =
    document.documentElement.scrollHeight - window.scrollY - window.innerHeight;

  return 1 - Math.max(0, Math.min(1, remaining / distance));
}

function BodyModelWithStretch({ model }: { model: Group }) {
  const dataRef = useRef<MeshData[]>([]);
  const prevStretch = useRef(-1);

  useEffect(() => {
    dataRef.current = collectMeshData(model);
  }, [model]);

  useFrame(() => {
    const raw = getScrollProgress();
    const p = Math.min(1, raw * 3);
    // Ramps up across the hero, holds through the page, then unwinds over the footer.
    // Tracked on the resulting amount rather than raw scroll, which pins at 1 past the hero.
    const stretch = p * p * 0.5 * (1 - getUnwindProgress());

    if (Math.abs(stretch - prevStretch.current) < 0.002) return;
    prevStretch.current = stretch;

    if (stretch < 0.001) {
      for (const { mesh, orig } of dataRef.current) {
        const pos = (mesh.geometry as BufferGeometry).getAttribute("position");
        pos.array.set(orig);
        pos.needsUpdate = true;
      }
      return;
    }

    for (const { mesh, orig, midY, range } of dataRef.current) {
      if (range < 0.001) continue;
      const pos = (mesh.geometry as BufferGeometry).getAttribute("position");
      const array = pos.array as Float32Array;
      const halfRange = range / 2;

      for (let i = 0; i < pos.count; i++) {
        const i3 = i * 3;
        const oy = orig[i3 + 1];

        const dist = (oy - midY) / halfRange;
        const lowerHalf = 1 - Math.max(0, -dist);
        const stretchY = stretch * 1.2 * lowerHalf * lowerHalf;
        array[i3 + 1] = oy * (1 + stretchY);

        const glitch = stretch * 0.006;
        const seed = i * 12.9898;
        const rx = (Math.sin(seed) * 43758.5453) % 1;
        array[i3] = orig[i3] + (rx - 0.5) * glitch * lowerHalf;
        array[i3 + 2] = orig[i3 + 2];
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <Center>
      <primitive object={model} scale={1.2} />
    </Center>
  );
}

function BodyModelStatic({ model }: { model: Group }) {
  return (
    <Center>
      <primitive object={model} scale={1.2} />
    </Center>
  );
}

function LoadedBodyModel({ enableStretch }: { enableStretch: boolean }) {
  const { scene } = useGLTF(MODEL_PATHS.body.main);
  const model = useMemo(() => {
    const cloned = scene.clone();
    cleanupScene(cloned);
    return cloned;
  }, [scene]);

  if (enableStretch) {
    return <BodyModelWithStretch model={model} />;
  }

  return <BodyModelStatic model={model} />;
}

export function BodyModel({ enableStretch = false }: { enableStretch?: boolean }) {
  return (
    <ModelErrorBoundary fallback={<PlaceholderBody />}>
      <LoadedBodyModel enableStretch={enableStretch} />
    </ModelErrorBoundary>
  );
}
