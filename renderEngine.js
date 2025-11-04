// Screen Render Engine with post-processing effects
// This applies WebGL shader effects on top of the terminal as an overlay
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/UnrealBloomPass.js';

// Vertex shader
const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Lag fragment shader (phosphor persistence)
const lagFragmentShader = `
uniform sampler2D tDiffuse;
uniform sampler2D tLag;
uniform float lagAmount;
varying vec2 vUv;

void main() {
    vec4 texel = texture2D(tDiffuse, vUv);
    vec4 lagTexel = texture2D(tLag, vUv);
    gl_FragColor = (texel * (1.0 - lagAmount)) + (lagTexel * lagAmount);
}
`;

// Noise/distortion fragment shader
const noiseFragmentShader = `
uniform sampler2D tDiffuse;
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec2 barrelDistortion(vec2 coord, float amount) {
    vec2 cc = coord - 0.5;
    float dist = dot(cc, cc) * amount;
    return coord + cc * (1.0 + dist) * dist;
}

void main() {
    vec2 uv = barrelDistortion(vUv, 0.08);
    
    float vignette = 1.0 - length(uv - 0.5) * 0.7;
    vignette = smoothstep(0.3, 1.0, vignette);
    
    vec4 color = texture2D(tDiffuse, uv);
    
    float noise = random(vUv + time) * 0.03;
    float scanline = sin(vUv.y * resolution.y * 2.0) * 0.03;
    
    float shift = 0.0008;
    vec4 colorR = texture2D(tDiffuse, uv + vec2(shift, 0.0));
    vec4 colorB = texture2D(tDiffuse, uv - vec2(shift, 0.0));
    color.r = colorR.r;
    color.b = colorB.b;
    
    color.rgb += noise;
    color.rgb += scanline;
    color.rgb *= vignette;
    
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        color = vec4(0.0, 0.0, 0.0, 1.0);
    }
    
    gl_FragColor = color;
}
`;

export class ScreenRenderEngine {
    constructor(renderer, width, height) {
        this.renderer = renderer;
        this.width = width;
        this.height = height;
        
        // Create scene for screen effects
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        
        // Create render targets for double buffering
        this.renderTarget1 = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        });
        
        this.renderTarget2 = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        });
        
        // Setup composer
        this.composer = new EffectComposer(this.renderer, this.renderTarget1);
        
        // Add render pass
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);
        
        // Add bloom for phosphor glow
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(width, height),
            1.1,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(this.bloomPass);
        
        // Lag pass
        this.lagPass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                tLag: { value: this.renderTarget2.texture },
                lagAmount: { value: 0.75 }
            },
            vertexShader: vertexShader,
            fragmentShader: lagFragmentShader
        });
        this.composer.addPass(this.lagPass);
        
        // Noise/distortion pass
        this.noisePass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                time: { value: 0 },
                resolution: { value: new THREE.Vector2(width, height) }
            },
            vertexShader: vertexShader,
            fragmentShader: noiseFragmentShader
        });
        this.noisePass.renderToScreen = false; // Will render to main screen
        this.composer.addPass(this.noisePass);
        
        this.time = 0;
        this.currentTarget = this.renderTarget1;
        this.previousTarget = this.renderTarget2;
    }
    
    async createScreenMesh(terminalElement) {
        // This method is now simplified - effects are applied in render loop
        this.terminalElement = terminalElement;
        return null;
    }
    
    render() {
        this.time += 0.016;
        
        // Update shader uniforms
        this.noisePass.uniforms.time.value = this.time;
        this.lagPass.uniforms.tLag.value = this.previousTarget.texture;
        
        // Swap render targets for lag effect
        const temp = this.currentTarget;
        this.currentTarget = this.previousTarget;
        this.previousTarget = temp;
    }
    
    dispose() {
        this.renderTarget1.dispose();
        this.renderTarget2.dispose();
        this.composer.dispose();
    }
}
