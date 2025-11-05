import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { ShaderToScreen } from './shaderToScreen.js';

// Vertex shader
const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Lag fragment shader - phosphor persistence effect
const lagFragmentShader = `
#define LAG 0.8
#define LAG_INVERSE 0.2

uniform sampler2D uDiffuse;
uniform sampler2D uLagTex;
varying vec2 vUv;

void main() {
    vec4 Diffuse = texture2D(uDiffuse, vUv);
    vec4 LagTex = texture2D(uLagTex, vUv);

    gl_FragColor = (Diffuse * LAG_INVERSE) + (LagTex * LAG);            
}
`;

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
