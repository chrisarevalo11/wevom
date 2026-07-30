import type { Material, Mesh } from "three";

export function getMeshMaterials(mesh: Mesh): Material[] {
  return Array.isArray(mesh.material) ? [...mesh.material] : [mesh.material];
}
