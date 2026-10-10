# Living Portrait Character Assets

The following files are **base64-encoded binary glTF (.glb)** assets loaded via `GLTFLoader.parse()` in `app.js`. Encoding them as .b64 allows this simple static GitHub Pages project to serve binary character meshes through the existing text-only GitHub file-writing workflow. These are actual textured 3D models, not procedural primitives.

## 3D character asset credits

| Local file | Character | Artist / source | License |
| --- | --- | --- | --- |
| `models/dumbledore.glb.b64` | Dumbledore | [zack_graham — Sketchfab](https://sketchfab.com/3d-models/dumbledore-bcb0ca50e18544d299e496521abed7ef), rediscovered via [Aditya-Kahandal/Portfolio](https://github.com/Aditya-Kahandal/Portfolio) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `models/harry.glb.b64` | Harry Potter | [zack_graham — Sketchfab](https://sketchfab.com/3d-models/harry-potter-e3ec02b483044325b8de13c4cd64b673), packaged in [anthonyplusAI/twilio-games](https://github.com/anthonyplusAI/twilio-games/blob/main/assets/CREDITS.md) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `models/hermione.glb.b64` | Hermione Granger | [zack_graham — Sketchfab](https://sketchfab.com/3d-models/hermione-granger-95714784f5bb4ac697040ec602b97932), packaged in [anthonyplusAI/twilio-games](https://github.com/anthonyplusAI/twilio-games/blob/main/assets/CREDITS.md) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `models/ron.glb.b64` | Ron Weasley | [zack_graham — Sketchfab](https://sketchfab.com/3d-models/ronald-weasley-d3419667f6a345a09987a6c57d936d0a), packaged in [anthonyplusAI/twilio-games](https://github.com/anthonyplusAI/twilio-games/blob/main/assets/CREDITS.md) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |

### Important quality and rights notes

- These are **textured 3D fan models**, not photorealistic film-quality likenesses. The trio models originate from older game-era assets. The current models are not sufficient for the requested film-quality close-up portraits. Attribution to fan uploaders does not supersede third-party character, actor-likeness, or game rights.
- **Snape and Umbridge** still use custom stylized geometry because suitably detailed, appropriately licensed GLB models were not available. Their current animation is idle geometry motion, not a rigged film-like performance.
- Dumbledore contains a skeleton with head and hand bones, animated gently in Three.js. The three trio GLB models contain no native skeleton/animation clips, so their movement currently uses 3D object transformations. For fully expressive animation, use rigged models with head, jaw, arm, and eye controls or glTF animation clips.
- The website keeps the preexisting modeled characters as offline loading fallbacks while new GLB files are fetched.
- A high-quality result requires **six suitable detailed rigged character models**, compatible textures, animation clips/blend shapes, and in-browser visual review. Do not describe the current branch as meeting those requirements until verified.

### Replacing an asset

Provide a legally usable `.glb` file for the relevant character, base64-encode the file, and save its content to `models/<character>.glb.b64`. Update `portraitModels` and the installation wiring in `app.js` if adding a new character. Keep attribution and license information current.
