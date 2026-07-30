/**
 * Centralized paths for all 3D assets served from /public/models.
 *
 * Folder convention:
 *   public/models/{category}/{asset-name}.{glb|gltf}
 *
 * Examples:
 *   public/models/body/body-model.glb
 *   public/models/props/watch.glb
 */
export const MODEL_PATHS = {
  body: {
    /** Primary hero body model */
    main: "/models/body/body-model.glb",
  },
} as const;

export type ModelCategory = keyof typeof MODEL_PATHS;
