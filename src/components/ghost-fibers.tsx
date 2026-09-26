/**
 * GhostFibers — WebGL canvas background
 * Inspired by the ReactBits Pro GhostFibers component.
 * Renders layered animated sine-wave fibers with glow, twist, vignette and grain.
 */
import { useEffect, useRef } from "react";

export interface GhostFibersProps {
  lineColor?: string;
  glowColor?: string;
  speed?: number;
  scale?: number;
  rotation?: number;
  rotationSpeed?: number;
  layers?: number;
  waveAmplitude?: number;
  waveFrequency?: number;
  waveSpeed?: number;
  layerSpeed?: number;
  twist?: number;
  twistFrequency?: number;
  twistSpeed?: number;
  lineFrequency?: number;
  lineSpacing?: number;
  lineSharpness?: number;
  glowFalloff?: number;
  glowIntensity?: number;
  brightness?: number;
  blueBoost?: number;
  vignette?: number;
  grain?: number;
  dpr?: number;
  className?: string;
}

// Convert hex color (#rrggbb) to [r, g, b] in 0..1
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return [r, g, b];
}

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform vec3  u_lineColor;
uniform vec3  u_glowColor;
uniform float u_scale;
uniform float u_rotation;
uniform int   u_layers;
uniform float u_waveAmp;
uniform float u_waveFreq;
uniform float u_waveSpeed;
uniform float u_layerSpeed;
uniform float u_twist;
uniform float u_twistFreq;
uniform float u_twistSpeed;
uniform float u_lineFreq;
uniform float u_lineSpacing;
uniform float u_lineSharp;
uniform float u_glowFalloff;
uniform float u_glowIntensity;
uniform float u_brightness;
uniform float u_blueBoost;
uniform float u_vignette;
uniform float u_grain;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float fiber(vec2 uv, float t, float layerIdx) {
  float twist = u_twist * sin(uv.x * u_twistFreq + t * u_twistSpeed + layerIdx);
  float wave  = u_waveAmp * sin(uv.x * u_waveFreq + t * u_waveSpeed + layerIdx * 1.3);
  float y     = uv.y - wave - twist;
  // periodic lines along y
  float lines = fract(y * u_lineFreq / u_lineSpacing);
  float dist  = abs(lines - 0.5) * 2.0;
  float line  = pow(max(0.0, 1.0 - dist), u_lineSharp);
  // glow falloff around each line
  float glow  = exp(-dist * u_glowFalloff) * u_glowIntensity;
  return line + glow;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - u_res * 0.5) / (min(u_res.x, u_res.y) * u_scale);
  uv = rot(u_rotation) * uv;

  vec3 col = vec3(0.0);

  for (int i = 0; i < 8; i++) {
    if (i >= u_layers) break;
    float fi    = float(i);
    float t     = u_time * (u_layerSpeed + fi * 0.01);
    vec2  luv   = uv + vec2(fi * 0.07, fi * 0.13);
    float f     = fiber(luv, t, fi);
    // mix line colour and glow colour per layer depth
    float depth = fi / max(float(u_layers) - 1.0, 1.0);
    vec3  c     = mix(u_lineColor, u_glowColor, depth * 0.6);
    col += c * f * (1.0 - depth * 0.4);
  }

  col *= u_brightness;
  col.b *= u_blueBoost;

  // vignette
  vec2 vUV = (gl_FragCoord.xy / u_res) * 2.0 - 1.0;
  float vig = 1.0 - dot(vUV * u_vignette, vUV * u_vignette);
  col *= clamp(vig, 0.0, 1.0);

  // grain
  float g = rand(gl_FragCoord.xy + u_time * 0.1) * u_grain;
  col += g;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return sh;
}

export default function GhostFibers({
  lineColor = "#140E35",
  glowColor = "#3437A0",
  speed = 0.2,
  scale = 2,
  rotation = 0,
  rotationSpeed = 0.25,
  layers = 4,
  waveAmplitude = 0.015,
  waveFrequency = 3,
  waveSpeed = 0.15,
  layerSpeed = 0.08,
  twist = 0.1,
  twistFrequency = 5,
  twistSpeed = 1.2,
  lineFrequency = 5,
  lineSpacing = 2,
  lineSharpness = 16,
  glowFalloff = 10,
  glowIntensity = 1.6,
  brightness = 2,
  blueBoost = 1.25,
  vignette = 0.8,
  grain = 0.05,
  dpr = 1,
  className = "",
}: GhostFibersProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    // Compile program
    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes       = u("u_res");
    const uTime      = u("u_time");
    const uLineColor = u("u_lineColor");
    const uGlowColor = u("u_glowColor");
    const uScale     = u("u_scale");
    const uRotation  = u("u_rotation");
    const uLayers    = u("u_layers");
    const uWaveAmp   = u("u_waveAmp");
    const uWaveFreq  = u("u_waveFreq");
    const uWaveSpeed = u("u_waveSpeed");
    const uLayerSpeed = u("u_layerSpeed");
    const uTwist     = u("u_twist");
    const uTwistFreq = u("u_twistFreq");
    const uTwistSpeed = u("u_twistSpeed");
    const uLineFreq  = u("u_lineFreq");
    const uLineSpacing = u("u_lineSpacing");
    const uLineSharp = u("u_lineSharp");
    const uGlowFalloff = u("u_glowFalloff");
    const uGlowIntensity = u("u_glowIntensity");
    const uBrightness = u("u_brightness");
    const uBlueBoost = u("u_blueBoost");
    const uVignette  = u("u_vignette");
    const uGrain     = u("u_grain");

    const lc = hexToRgb(lineColor);
    const gc = hexToRgb(glowColor);
    gl.uniform3fv(uLineColor, lc);
    gl.uniform3fv(uGlowColor, gc);
    gl.uniform1f(uScale, scale);
    gl.uniform1i(uLayers, Math.min(layers, 8));
    gl.uniform1f(uWaveAmp, waveAmplitude);
    gl.uniform1f(uWaveFreq, waveFrequency);
    gl.uniform1f(uWaveSpeed, waveSpeed);
    gl.uniform1f(uLayerSpeed, layerSpeed);
    gl.uniform1f(uTwist, twist);
    gl.uniform1f(uTwistFreq, twistFrequency);
    gl.uniform1f(uTwistSpeed, twistSpeed);
    gl.uniform1f(uLineFreq, lineFrequency);
    gl.uniform1f(uLineSpacing, lineSpacing);
    gl.uniform1f(uLineSharp, lineSharpness);
    gl.uniform1f(uGlowFalloff, glowFalloff);
    gl.uniform1f(uGlowIntensity, glowIntensity);
    gl.uniform1f(uBrightness, brightness);
    gl.uniform1f(uBlueBoost, blueBoost);
    gl.uniform1f(uVignette, vignette);
    gl.uniform1f(uGrain, grain);

    let start: number | null = null;
    let raf: number;

    const resize = () => {
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const draw = (ts: number) => {
      if (!start) start = ts;
      const t = ((ts - start) / 1000) * speed;
      const rot = t * rotationSpeed + rotation;

      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uRotation, rot);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, [
    lineColor, glowColor, speed, scale, rotation, rotationSpeed, layers,
    waveAmplitude, waveFrequency, waveSpeed, layerSpeed, twist, twistFrequency,
    twistSpeed, lineFrequency, lineSpacing, lineSharpness, glowFalloff,
    glowIntensity, brightness, blueBoost, vignette, grain, dpr,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
