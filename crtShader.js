// Simplified CRT Shader Effect Overlay
// Applies WebGL shaders on top of the terminal for authentic CRT effects

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';

export class CRTShaderEffect {
    constructor() {
        this.canvas = null;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.material = null;
        this.time = 0;
        this.enabled = true;
    }
    
    init() {
        try {
            // Create overlay canvas
            this.canvas = document.createElement('canvas');
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '10';
            this.canvas.style.mixBlendMode = 'screen';
            this.canvas.style.opacity = '0.3';
            
            const terminalContainer = document.getElementById('terminal-container');
            if (!terminalContainer) {
                console.warn('Terminal container not found');
                return false;
            }
            
            terminalContainer.appendChild(this.canvas);
            
            // Setup Three.js renderer
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                alpha: true,
                antialias: false
            });
            
            const rect = terminalContainer.getBoundingClientRect();
            this.renderer.setSize(rect.width, rect.height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            
            // Create scene and camera
            this.scene = new THREE.Scene();
            this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            
            // Create shader material
            this.material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    resolution: { value: new THREE.Vector2(rect.width, rect.height) },
                    bloomStrength: { value: 0.4 },
                    scanlineIntensity: { value: 0.3 }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform vec2 resolution;
                    uniform float bloomStrength;
                    uniform float scanlineIntensity;
                    varying vec2 vUv;
                    
                    // Random noise
                    float random(vec2 st) {
                        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                    }
                    
                    void main() {
                        vec2 uv = vUv;
                        
                        // Phosphor glow effect (bloom simulation)
                        float glow = bloomStrength * (0.5 + 0.5 * sin(time * 2.0));
                        vec3 color = vec3(0.0, glow * 0.8, 0.0);
                        
                        // Scanlines
                        float scanline = sin(uv.y * resolution.y * 2.0) * scanlineIntensity;
                        color += scanline;
                        
                        // Subtle noise/static
                        float noise = random(uv + time * 0.1) * 0.05;
                        color += noise;
                        
                        // Flicker effect
                        float flicker = 0.95 + 0.05 * sin(time * 30.0);
                        color *= flicker;
                        
                        // Vignette edges
                        float vignette = 1.0 - length(uv - 0.5) * 0.5;
                        color *= vignette;
                        
                        gl_FragColor = vec4(color, 0.8);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending
            });
            
            // Create plane mesh
            const geometry = new THREE.PlaneGeometry(2, 2);
            const mesh = new THREE.Mesh(geometry, this.material);
            this.scene.add(mesh);
            
            // Handle resize
            window.addEventListener('resize', () => this.handleResize());
            
            // Start animation
            this.animate();
            
            console.log('CRT Shader Effect initialized successfully');
            return true;
            
        } catch (error) {
            console.error('CRT Shader initialization failed:', error);
            return false;
        }
    }
    
    handleResize() {
        if (!this.renderer || !this.canvas) return;
        
        const terminalContainer = document.getElementById('terminal-container');
        if (!terminalContainer) return;
        
        const rect = terminalContainer.getBoundingClientRect();
        this.renderer.setSize(rect.width, rect.height);
        
        if (this.material) {
            this.material.uniforms.resolution.value.set(rect.width, rect.height);
        }
    }
    
    animate() {
        if (!this.enabled || !this.renderer || !this.scene || !this.camera) {
            return;
        }
        
        this.time += 0.016; // ~60fps
        
        if (this.material) {
            this.material.uniforms.time.value = this.time;
        }
        
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animate());
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        if (this.canvas) {
            this.canvas.style.display = enabled ? 'block' : 'none';
        }
        if (enabled) {
            this.animate();
        }
    }
    
    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}
