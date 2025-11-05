import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';

class ShaderToScreen {
    constructor(shader, width, height) {
        const aspect = width / height;
        this.sceneRTT = new THREE.Scene();
        this.cameraRTT = new THREE.OrthographicCamera(
            -0.5 * aspect,
            0.5 * aspect,
            0.5,
            -0.5,
            1,
            3
        );
        this.cameraRTT.position.set(0, 0, 1);
        this.sceneRTT.add(this.cameraRTT);

        this.outputTexture = new THREE.WebGLRenderTarget(width, height, {
            format: THREE.RGBFormat,
        });

        this.shader = new THREE.ShaderMaterial(shader);

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(1 * aspect, 1, 1, 1),
            this.shader
        );
        this.sceneRTT.add(plane);
    }

    render(renderer) {
        renderer.setRenderTarget(this.outputTexture);
        renderer.clear();
        renderer.render(this.sceneRTT, this.cameraRTT);
    }
}

export { ShaderToScreen };
