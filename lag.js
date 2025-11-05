import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { ShaderToScreen } from './shaderToScreen.js';

// Load shaders
const vertexShader = await fetch('./shaders/vertex.vert').then(r => r.text());
const lagFragmentShader = await fetch('./shaders/lag.frag').then(r => r.text());

class Lag {
    constructor(buffer, width, height) {
        this.lagMat = new THREE.ShaderMaterial();
        this.shaderToScreen1 = new ShaderToScreen(
            {
                uniforms: {
                    uDiffuse: { value: buffer.texture },
                    uLagTex: { value: null },
                    uNeedUpdate: { value: false },
                },
                vertexShader: vertexShader,
                fragmentShader: lagFragmentShader,
            },
            width,
            height
        );
        this.outputTexture = this.shaderToScreen1.outputTexture;

        this.outputCopy = new ShaderToScreen(
            {
                uniforms: {
                    uDiffuse: { value: this.outputTexture.texture },
                },
                vertexShader: vertexShader,
                fragmentShader: `uniform sampler2D uDiffuse; varying vec2 vUv; void main() {gl_FragColor = texture2D(uDiffuse, vUv);}`,
            },
            width,
            height
        );

        this.shaderToScreen1.shader.uniforms.uLagTex.value =
            this.outputCopy.outputTexture.texture;
    }

    render(renderer) {
        this.shaderToScreen1.render(renderer);
        this.outputCopy.render(renderer);
    }
}

export { Lag };
