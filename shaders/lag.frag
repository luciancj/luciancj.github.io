// Phosphor Lag Effect - Creates CRT phosphor persistence/ghosting
uniform sampler2D tDiffuse;
uniform sampler2D tLag;
uniform float lagAmount;
varying vec2 vUv;

void main() {
    vec4 texel = texture2D(tDiffuse, vUv);
    vec4 lagTexel = texture2D(tLag, vUv);
    
    // Mix current frame with previous frame for phosphor persistence
    // lagAmount controls how much of the previous frame bleeds through
    gl_FragColor = (texel * (1.0 - lagAmount)) + (lagTexel * lagAmount);
}
