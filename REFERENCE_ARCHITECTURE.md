# Retro Computer Website - Complete Style & Architecture Reference

## Overview
This document provides a comprehensive analysis of the [edhinrichsen/retro-computer-website](https://github.com/edhinrichsen/retro-computer-website) repository, documenting all elements that contribute to its retro terminal aesthetic and technical implementation.

---

## 📁 Directory Structure

```
retro-computer-website/
├── index.html                      # Fallback HTML content with navigation
├── src/
│   ├── main.ts                     # Entry point, WebGL initialization
│   ├── main.css                    # Core styling, colors, typography
│   ├── nav.css                     # Navigation menu styles
│   ├── collapse.css                # Collapsible elements
│   ├── DeltaTime.ts                # Delta time calculation utility
│   │
│   ├── webgl/                      # Main WebGL system
│   │   ├── index.ts                # Scene, camera, renderer setup
│   │   ├── loader.ts               # Asset loading with progress tracking
│   │   │
│   │   ├── screen/                 # Screen rendering subsystem
│   │   │   ├── index.ts            # Screen orchestration
│   │   │   ├── textEngine.ts       # 3D text rendering (700+ lines)
│   │   │   ├── renderEngine.ts     # Post-processing pipeline
│   │   │   ├── lag.ts              # Phosphor lag effect
│   │   │   └── shaderToScreen.ts   # Render-to-texture utility
│   │   │
│   │   └── shaders/                # GLSL shaders
│   │       ├── vertex.vert         # Basic vertex shader
│   │       ├── lag.frag            # Phosphor persistence shader
│   │       └── noise.frag          # CRT distortion effects
│   │
│   ├── terminal/                   # Terminal logic
│   │   ├── index.ts                # Terminal interface
│   │   └── fileSystemBash.ts       # Virtual file system
│   │
│   └── file-system/                # Content as markdown files
│       └── home/user/projects/     # Project descriptions
│           ├── 01-folio.md
│           └── 04-glowbal.md
│
├── fonts/                          # Custom fonts
│   ├── public-pixel.woff           # Pixel font for headers
│   ├── public-pixel.json           # THREE.js font data
│   ├── chill.woff                  # Sans-serif for body
│   └── chill.json                  # THREE.js font data
│
├── models/                         # 3D assets
│   └── Commodore710_33.5.glb       # Computer model
│
└── textures/                       # Texture maps
    ├── bake-quality-5.jpg          # Baked lighting
    ├── bake_floor-quality-3.jpg    # Shadow plane
    └── environmentMap/             # Reflection cubemap
        ├── px.jpg, nx.jpg
        ├── py.jpg, ny.jpg
        └── pz.jpg, nz.jpg
```

---

## 🎨 Color Palette & Visual Design

### Primary Colors
```css
/* Core color scheme */
--color: #525252;                    /* Dark gray (UI elements) */
background: #f6d4b1;                 /* Beige/cream (page background) */
textColor: #f99021;                  /* Orange (terminal text) */

/* Usage */
Text: #525252 (dark gray)
Buttons: #525252 background, #f6d4b1 text
Terminal: #f99021 (orange) text on transparent
Loading screen: #f6d4b1 text on #525252 background
```

### Shadow System
```css
/* Layered shadow approach for depth */
box-shadow: 1px 1px 0px #f6d4b1, 6px 6px 0px rgba(82, 82, 82, 0.25);
/* Hover effect */
box-shadow: 8px 8px 6px rgba(82, 82, 82, 0.25);
/* Active/pressed */
box-shadow: 4px 4px 0px rgba(82, 82, 82, 0.4);
```

### Typography System
```typescript
// Font definitions with precise metrics

h1Font: {
  size: 0.05
  height: 0.05 (size)
  width: 0.05 (size)
  leading: 0.1 (height * 2)
  tracking: 0.02 (width * 0.4)
  font: publicPixelFont
}

h2Font: {
  size: 0.04
  height: 0.04
  width: 0.032 (size * 0.8)
  leading: 0.08 (height * 2)
  tracking: 0.007 (width * 0.22)
  font: chillFont
}

h3Font: {
  size: 0.03
  height: 0.03
  width: 0.024 (size * 0.8)
  leading: 0.075 (height * 2.5)
  tracking: 0.0053 (width * 0.22)
  font: chillFont
}

paragraphFont: {
  size: 0.0275
  height: 0.0275
  width: 0.022 (size * 0.8)
  leading: 0.0688 (height * 2.5)
  tracking: 0.0048 (width * 0.22)
  font: chillFont
}
```

---

## 🖥️ WebGL Render Pipeline Architecture

### 1. Main Scene Setup
```typescript
// src/webgl/index.ts

Scene Background: THREE.Color(0xf6d4b1)  // Beige
AmbientLight: 0xffffff, intensity 0.55

Camera (PerspectiveCamera):
  FOV: 50
  Position: (0, 0, -2.5)
  Rotation: (-Math.PI, 0, Math.PI)
  
Renderer:
  setPixelRatio(2)
  outputEncoding: THREE.sRGBEncoding
```

### 2. Screen Render Pipeline (Multi-Pass)
```typescript
// src/webgl/screen/renderEngine.ts

Resolution: 576 pixels (512 + 64)

Camera (OrthographicCamera):
  left: -0.1
  right: 1.496
  top: 0.1
  bottom: -1.1
  near: 1
  far: 3
  position: (0, 0, 1)

WebGLRenderTarget:
  width: 576 * 1.33 = 768
  height: 576
  format: THREE.RGBFormat

EffectComposer Pipeline:
  1. RenderPass (sceneRTT, cameraRTT)
  2. UnrealBloomPass
     - resolution: Vector2(128, 128)
     - strength: 1.1
     - radius: 0.4
     - threshold: 0
  3. Lag Effect (phosphor persistence)
  4. Noise Shader (CRT distortion)
```

### 3. Phosphor Lag System
```typescript
// src/webgl/screen/lag.ts

LAG: 0.8            // 80% previous frame
LAG_INVERSE: 0.2    // 20% current frame

Dual Render Target System:
  - shaderToScreen1: Mixes current + previous
  - outputCopy: Stores result for next frame

Formula:
  gl_FragColor = (Diffuse * 0.2) + (LagTex * 0.8)
```

### 4. CRT Distortion Shader
```glsl
// src/webgl/shaders/noise.frag

#define LINE_SIZE 288.0
#define LINE_STRENGTH 0.05
#define LINE_OFFSET 2.0
#define NOISE_STRENGTH 0.2

Effects Applied:
  - Scanlines (square wave function)
  - Random noise per pixel
  - Progress effect (boot sequence)
  - Vignette darkening
```

---

## 📝 3D Text Rendering System

### TextGeometry Configuration
```typescript
// src/webgl/screen/textEngine.ts

new TextGeometry(string, {
  font: font,
  size: font.size,
  height: 0.0001,              // Very thin extrusion
  curveSegments: 12,           // Curve quality
  bevelEnabled: false
})
```

### Three Mesh System
```typescript
// Layer architecture for text rendering

textColorMesh: MeshBasicMaterial({ color: "#f99021" })  // Orange text
textBlackMesh: MeshBasicMaterial({ color: 0x000000 })   // Black text (highlighted)
textBgMesh: MeshBasicMaterial({ color: "#f99021" })     // Background highlight

// Performance optimization
mergeBufferGeometries(geometries) // Batch geometries into single mesh
```

### Caret System
```typescript
caret: PlaneBufferGeometry(h2Font.size, h2Font.size * 1.6)
material: MeshBasicMaterial({ color: textColor })
position.z: -0.1               // Slightly in front
animation: Blinking effect with caretTimeSinceUpdate
```

### Text Layout Engine
```typescript
charNextLoc: { x: 0, y: 0 }    // Current text cursor position

Text wrapping:
  if (textWidth + x > screenWidth) {
    y += font.leading
    x = 0
  }

Line tracking:
  tracking: spacing between characters
  leading: spacing between lines
```

---

## 🎯 Markdown Parser & Renderer

### Supported Tokens
```typescript
type MDtoken = {
  type: "h1" | "h2" | "h3" | "p" | "br" | "img"
  emphasis: boolean   // For *italic* text
  value: string
}
```

### Parsing Rules
```typescript
// Header detection
"#"    → h1
"##"   → h2
"###"  → h3

// Emphasis (italic)
"*text*" → emphasis: true

// Line breaks
"\n\n" → <br> token

// Images with parameters
"![](url?aspect=1.5&width=0.8)"
```

### Image Rendering
```typescript
// Images as textured planes in 3D space

placeImage(val: string) {
  params: URLSearchParams from query string
  aspectRatio: required parameter
  width: optional, default 1
  height: width / aspectRatio
  
  PlaneBufferGeometry(width, height, 1, 1)
  MeshBasicMaterial with loaded texture
  TextureLoader with magFilter: NearestFilter
}
```

---

## 💻 Terminal System Integration

### Input Capture
```typescript
// Hidden textarea for keyboard input
<input type="text" id="textarea" readonly />

CSS:
  position: fixed
  z-index: -1
  opacity: 0
  
// Becomes visible in debug mode (#debug hash)
```

### Terminal Interface
```typescript
screenTextEngine.placeMarkdown(md: string): number  // Returns pixel height
screenTextEngine.placeText(str: string): number     // Returns line count
screenTextEngine.scroll(val, units, options)
screenTextEngine.scrollToEnd()
screenTextEngine.freezeInput()                      // Convert input buffer to static text
screenTextEngine.userInput(change, selectionPos)    // Handle typing
```

### Scroll System
```typescript
scroll(val: number, units: "lines" | "px", options) {
  amount = (units === "lines") ? val * h2Font.leading : val
  
  if (options.moveView) rootGroup.position.y += amount
  if (options.updateMaxScroll) maxScroll += amount
  
  // Clamp to bounds
  rootGroup.position.y = clamp(0, maxScroll)
}
```

---

## 🎮 Computer Model Integration

### GLTF Model Parts
```typescript
// Extracted from Commodore710_33.5.glb

screenMesh: Screen mesh (receives rendered texture)
computerMesh: Computer body
crtMesh: CRT screen bezel
keyboardMesh: Keyboard
shadowPlaneMesh: Shadow plane for ground
```

### Material Application
```typescript
// Baked textures for realism
bakeTexture: Computer and keyboard material
bakeFloorTexture: Shadow plane material
environmentMapTexture: CubeTexture for reflections

screenMesh.material = renderEngine.material  // Dynamic texture from render pipeline
computerMesh.material = bakeTexture
crtMesh.material = bakeTexture
shadowPlaneMesh.material = bakeFloorTexture

// Screen material properties
MeshStandardMaterial {
  metalness: 0
  roughness: 0.125
  envMapIntensity: 0.7
  map: shaderToScreen.outputTexture.texture
}
```

### Interactive Controls
```typescript
// Mouse parallax effect
computerParallax: { x: 0, y: 0 }

on mousemove:
  computerParallax.x += (clientX - mousedown.x) / (window.innerWidth * 0.5)
  computerParallax.y += (clientY - mousedown.y) / (window.innerHeight * 0.5)
  // Clamped to [-1, 1]

// Applied to camera
camera.position.x = computerParallax.x * scroll_factor * 0.1 + camera.position.x * 0.9
camera.position.y = computerParallax.y * scroll_factor * 0.1 + camera.position.y * 0.9
```

### Scroll-based Animation
```typescript
// Zoom and rotation based on page scroll
scroll = window.scrollY / viewHeight

camera.position.z = map(scroll, [0, 1], [-2.5, -10])
computerGroup.position.y = map(scroll, [0, 1], [0, 1.5])
computerGroup.rotation.y = controlProps.computerAngle * zoomFac
canvas.style.opacity = map(scroll, [1.25, 1.75], [1, 0])

// Portrait mode rotation
if (portrait) {
  computerGroup.rotation.z = map(scroll, [0, 1], [-PI/2, 0])
}
```

---

## 📦 Asset Loading System

### Loading Manager
```typescript
// THREE.LoadingManager with progress tracking

manager.onLoad:
  - Fade out loading screen (opacity transition)
  - 200ms delay
  - Execute callback

manager.onProgress:
  - Update loading bar: scaleX(itemsLoaded / itemsTotal)
  - Display: "${itemsLoaded} of ${itemsTotal} File Loaded: ${url}"
```

### Asset Types Loaded
```typescript
1. Fonts (FontLoader)
   - /fonts/public-pixel.json
   - /fonts/chill.json

2. Textures (TextureLoader)
   - /textures/bake-quality-5.jpg (flipY: false, encoding: sRGBEncoding)
   - /textures/bake_floor-quality-3.jpg

3. Environment Map (CubeTextureLoader)
   - /textures/environmentMap/[px,nx,py,ny,pz,nz].jpg

4. 3D Model (GLTFLoader)
   - /models/Commodore710_33.5.glb
```

---

## 🎭 CSS Styling Approach

### Loading Screen
```css
#loading {
  color: #f6d4b1;
  background-color: #525252;
  position: fixed;
  top: 0; bottom: 0; left: 0; right: 0;
  z-index: 6;
  transition: opacity 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

#loading-bar {
  border: dashed 2px #f6d4b1;
  box-shadow: 2px 2px 0px var(--color), 6px 6px 0px rgba(246, 212, 177, 0.7);
}

#loading-bar-progress {
  background-color: #f6d4b1;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.2s;
}
```

### Button Styling
```css
.btn {
  font-family: "chill", sans-serif;
  font-size: 18px;
  box-shadow: 6px 6px 0px rgba(82, 82, 82, 0.25);
  background-color: var(--color);
  color: #f6d4b1;
  padding: 4px 24px;
  border: #f6d4b1 solid 1px;
  transition: all 0.3s;
}

.btn:hover {
  transform: scale(1.1);
  box-shadow: 8px 8px 6px rgba(82, 82, 82, 0.25);
}

.btn:active {
  transform: scale(0.95);
  box-shadow: 4px 4px 0px rgba(82, 82, 82, 0.4);
}
```

### Typography Hierarchy
```css
h1 {
  color: #f6d4b1;
  background-color: var(--color);
  font-family: "public-pixel", monospace;
  font-size: 2em;
  padding: 16px;
}

h2 {
  color: #f6d4b1;
  background-color: var(--color);
  font-family: "public-pixel", monospace;
  font-size: 1.2em;
}

h3 {
  color: var(--color);
  font-family: "public-pixel", monospace;
  font-size: 1.2em;
}

p {
  line-height: 1.5;
  width: clamp(0px, 95vw, 680px);
}
```

### Navigation Menu
```css
nav {
  position: fixed;
  background-color: antiquewhite;
  z-index: 5;
}

.menu-body {
  background-color: #525252;
  color: #f6d4b1;
  font-size: 2em;
  font-family: "public-pixel", monospace;
  transition: all 0.7s;
}

.active .menu-body {
  opacity: 1;
}
```

---

## 🔧 Technical Specifications

### Performance Optimizations
```typescript
1. Geometry Merging
   mergeBufferGeometries(geometries)  // Reduce draw calls

2. Material Reuse
   textMaterial.clone()               // Share base material

3. Render Target Pooling
   Reuse WebGLRenderTarget between frames

4. Pixel Ratio Limiting
   renderer.setPixelRatio(2)          // Cap at 2x for performance
```

### Resolution Settings
```typescript
Screen Resolution: 576px (512 base + 64 padding)
Aspect Ratio: 1.33 (4:3)
Final Dimensions: 768x576 pixels

Bloom Pass: 128x128 internal resolution
Lag Effect: Full screen resolution (768x576)
```

### Shader Uniforms
```glsl
// Lag Shader
uniform sampler2D uDiffuse;    // Current frame
uniform sampler2D uLagTex;     // Previous frame
uniform bool uNeedUpdate;

// Noise Shader
uniform sampler2D uDiffuse;
uniform float uTime;           // Animation time
uniform float uProgress;       // Boot progress (0.0 to 1.2)
```

---

## 🚀 Build & Deployment

### Development Setup
```bash
npm install              # Install dependencies
npm run dev             # Local server at localhost:1234
npm run build           # Production build in dist/
```

### Tech Stack
- **TypeScript** - Type-safe development
- **Three.js** - WebGL 3D rendering
- **Parcel** - Zero-config bundler
- **GLSL** - Custom shaders
- **Vite/Rollup** - Module bundling

### Browser Requirements
- WebGL 2.0 support
- ES6+ JavaScript
- Modern font loading API

---

## 📊 Key Architectural Decisions

### Why Render-to-Texture?
- Allows multi-pass post-processing
- Enables phosphor lag effect (frame history)
- Separates text rendering from CRT effects
- Improves modularity

### Why 3D Text Instead of DOM?
- Consistent with WebGL pipeline
- Can apply 3D transformations
- Better integration with shaders
- Unified rendering path

### Why Dual Mesh System (color/black/bg)?
- Performance: Batch rendering
- Flexibility: Independent highlighting
- Visual depth: Layered text effects

### Why Custom Font System?
- Precise typography control
- 3D text generation requirements
- Retro aesthetic (pixel fonts)
- Consistent metrics across platforms

---

## 🎯 Style Characteristics Summary

### Visual Identity
✅ Orange text (#f99021) on transparent/beige backgrounds  
✅ Pixel font (public-pixel) for headers and terminal  
✅ Layered shadows for depth (1px, 6px offsets)  
✅ Dashed borders for retro aesthetic  
✅ Beige/cream (#f6d4b1) primary background  
✅ Dark gray (#525252) for UI elements  

### CRT Effects
✅ Scanlines via square wave shader  
✅ Phosphor persistence (80% lag)  
✅ Bloom glow (strength 1.1, radius 0.4)  
✅ Random noise overlay (20% strength)  
✅ Barrel distortion shader  
✅ Chromatic aberration  

### Typography
✅ Precise leading/tracking metrics  
✅ Multiple font sizes for hierarchy  
✅ Character-level positioning  
✅ Word wrapping with overflow  
✅ Markdown formatting support  
✅ Blinking caret animation  

### Interaction
✅ Mouse parallax on computer  
✅ Scroll-based zoom animation  
✅ Hidden input for keyboard capture  
✅ Terminal command system  
✅ Smooth scrolling with clamping  
✅ Loading screen with progress  

---

## 📝 Implementation Notes

### For AI Agents
When implementing a similar retro terminal style, focus on:

1. **Color Palette**: Use warm beige/orange scheme, not green
2. **Typography**: Precise font metrics are crucial for layout
3. **Render Pipeline**: Multi-pass post-processing is essential
4. **Phosphor Lag**: Frame blending creates authentic CRT feel
5. **Geometry Merging**: Critical for performance with 3D text
6. **Shader Effects**: Scanlines + bloom + noise = authentic CRT

### Common Pitfalls
❌ Don't use CSS transforms for CRT distortion (use shaders)  
❌ Don't render each character separately (merge geometries)  
❌ Don't skip the phosphor lag effect (it's essential)  
❌ Don't use wrong color scheme (warm beige, not green)  
❌ Don't forget environment mapping on screen material  
❌ Don't use high bloom strength (1.1 is sweet spot)  

### Testing Checklist
- [ ] Loading screen displays correctly
- [ ] Fonts load before text renders
- [ ] Text wraps at screen boundaries
- [ ] Caret blinks smoothly
- [ ] Scroll stays within bounds
- [ ] CRT effects visible but not overwhelming
- [ ] Performance maintains 60fps
- [ ] Responsive on mobile devices

---

## 🔗 References

- **Repository**: https://github.com/edhinrichsen/retro-computer-website
- **Live Site**: https://edh.dev
- **Three.js Docs**: https://threejs.org/docs
- **TextGeometry**: https://threejs.org/docs/#examples/en/geometries/TextGeometry
- **EffectComposer**: https://threejs.org/docs/#examples/en/postprocessing/EffectComposer

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Purpose**: AI-friendly comprehensive reference for retro terminal styling
