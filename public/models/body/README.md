# 3D Models

Place static 3D assets here. Files in `public/` are served at the site root.

## Recommended structure

```
public/models/
├── body/
│   ├── body-model.glb        ← hero body model
├── props/                    ← future product props, accessories, etc.
│   └── example.glb
└── environments/             ← optional HDR/EXR backgrounds (if needed)
    └── studio.hdr
```

## Formats

- **`.glb`** — preferred (single binary file, best for web)
- **`.gltf`** — supported, but may require separate texture files

## Tips

- Keep hero models under ~5 MB when possible
- Use [gltf-transform](https://gltf-transform.dev/) or Blender to optimize/decimate
- Name files by purpose, not by tool: `body-model.glb`, not `export-final-v3.glb`
- Update paths in `src/lib/three/model-paths.ts` if you add new categories

## Hero body

The landing page loads `/models/body/body-model.glb` when `NEXT_PUBLIC_BODY_MODEL_ENABLED=true`. Until then, a placeholder silhouette is shown (no network requests).
