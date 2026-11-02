# INCPT logo in 3D

The new chrome logo as a real 3D model, so it can turn in a shot with live reflections.

## How it was made (2026-11-02)

1. **Image → 3D on Higgsfield.** The official render (`reference/app_v3/logo.jpg`) went through three image-to-3D models; their front silhouettes were scored against the render's filled silhouette (IoU, best orientation found by search):

   | Model | Credits | IoU | Notes |
   |---|---|---|---|
   | Tripo H3.1 (detailed geometry) | 18 | **0.944** | Chosen: silhouette, the fold and the ribs as real geometry |
   | Hunyuan3D v3 (1.5M faces) | 19 | 0.895 | Vivid texture, weaker fold |
   | Meshy 7 (ultra) | 44 | 0.69 | Shape off |

2. **Fixes on top of Tripo** (Higgsfield sandbox, three.js):
   - orientation that reproduces the render (yaw 280°, pitch 20°) baked in, so the GLB's front view is the logo;
   - depth flattened to 0.38: Tripo made the shape nearly as deep as it is tall (an "egg" from the side), the logo is a tube;
   - colour: the render's low-frequency colour field (saturation ×1.7) projected from the front view as vertex colours;
   - decimated with meshoptimizer: `lite` 570k triangles (17 MB), `mini` 285k (8.5 MB), visually the same at full frame.

3. **Material** (chosen by a sweep scored against the render, then by eye): coloured metal under a clear coat, RoomEnvironment light. Parameters in `material.json`.

## Where the files are

`incpt_logo3d_kit.zip` (both GLBs, the viewer, the colour field, `material.json`, the preview) is stored on Higgsfield:
`https://d2ol7oe51mr4n9.cloudfront.net/user_3Gln7uLR9v15bOY3vDAsQKMvK9v/9ce2bb78-1eb2-4b6b-96e1-da18ccaf90c1.zip`.
This environment's network policy blocks Higgsfield's CDN hosts, so the kit lands in `assets/` once
`d2ol7oe51mr4n9.cloudfront.net` (and `d8j0ntlcm91z4.cloudfront.net`, `upload.higgsfield.ai`) are allowed.

Preview: `renders/style/logo3d_preview.jpg` (the render | the model at the same view, and a turn from −60° to the back).

## Known gaps to the render

- The ribs are slightly finer and less even than in the render, and the render's dark rim is missing.
- Plan for the hero moments: cut from the turning 3D logo to the official render on a fast move (motion blur hides the swap),
  or match the ribs exactly by projecting the render's rib phase onto a smoothed body as a normal map.
