// CRT Noise and Distortion Effect
uniform sampler2D tDiffuse;
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

// Noise function for CRT static
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// Barrel distortion to simulate CRT curvature
vec2 barrelDistortion(vec2 coord, float amount) {
    vec2 cc = coord - 0.5;
    float dist = dot(cc, cc) * amount;
    return coord + cc * (1.0 + dist) * dist;
}

void main() {
    // Apply barrel distortion
    vec2 uv = barrelDistortion(vUv, 0.1);
    
    // Edge fade (vignette)
    float vignette = 1.0 - length(uv - 0.5) * 0.8;
    vignette = smoothstep(0.3, 1.0, vignette);
    
    // Sample texture with distorted coordinates
    vec4 color = texture2D(tDiffuse, uv);
    
    // Add subtle noise
    float noise = random(vUv + time) * 0.05;
    
    // Scanline effect
    float scanline = sin(vUv.y * resolution.y * 2.0) * 0.04;
    
    // RGB shift for chromatic aberration
    float shift = 0.001;
    vec4 colorR = texture2D(tDiffuse, uv + vec2(shift, 0.0));
    vec4 colorB = texture2D(tDiffuse, uv - vec2(shift, 0.0));
    color.r = colorR.r;
    color.b = colorB.b;
    
    // Apply effects
    color.rgb += noise;
    color.rgb += scanline;
    color.rgb *= vignette;
    
    // Edge clipping (don't show pixels outside screen bounds)
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        color = vec4(0.0, 0.0, 0.0, 1.0);
    }
    
    gl_FragColor = color;
}
