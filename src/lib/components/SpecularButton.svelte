<script>
  import { onMount } from 'svelte';
  import { Renderer, Triangle, Program, Mesh, Color } from 'ogl';

  const PAD = 20;

  let {
    children,
    size = 'lg',
    radius = 18,
    tint = '#ffffff',
    tintOpacity = 0,
    blur = 0,
    textColor = '#f5f5f5',
    lineColor = '#ffffff',
    baseColor = '#525252',
    intensity = 1,
    baseIntensity = 0.45,
    shineSize = 10,
    shineFade = 40,
    thickness = 1,
    speed = 0.35,
    followMouse = true,
    proximity = 250,
    autoAnimate = false,
    disabled = false,
    onclick = undefined,
    className = '',
    type = 'button',
  } = $props();

  let currentProps = $derived({
    radius, lineColor, baseColor, intensity, baseIntensity, shineSize, shineFade,
    thickness, speed, followMouse, proximity, autoAnimate,
  });

  let btnEl;
  let fxEl;

  const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

  const FRAG = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;
uniform float uBaseIntensity;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float shapeSDF(vec2 p) { return sdRoundedRect(p, uHalfSize, uRadius); }

float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = shapeSDF(p);
  vec2 L = vec2(cos(uAngle), sin(uAngle));

  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * uBaseIntensity;

  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;

  vec3 col = uBaseColor * base + uLineColor * hi;
  float a = clamp(base + hi, 0.0, 1.0);
  fragColor = vec4(col, a);
}`;

  onMount(() => {
    const btn = btnEl;
    const fx = fxEl;
    if (!btn || !fx) return;

    const dpr = window.devicePixelRatio || 1;
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true, dpr });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uCenter: { value: [0, 0] },
        uHalfSize: { value: [1, 1] },
        uRadius: { value: 0 },
        uAngle: { value: 2.4 },
        uPx: { value: dpr },
        uLineColor: { value: [1, 1, 1] },
        uBaseColor: { value: [0.32, 0.32, 0.32] },
        uIntensity: { value: 1 },
        uBaseIntensity: { value: 0.45 },
        uShineSize: { value: 0.17 },
        uShineFade: { value: 0.7 },
        uThickness: { value: 1 },
        uBaseWidth: { value: dpr },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    fx.appendChild(gl.canvas);

    const sizeRef = { w: 1, h: 1 };
    const resize = () => {
      const w = btn.offsetWidth;
      const h = btn.offsetHeight;
      sizeRef.w = w;
      sizeRef.h = h;
      renderer.setSize(w + PAD * 2, h + PAD * 2);
      program.uniforms.uCenter.value = [(PAD + w / 2) * dpr, (PAD + h / 2) * dpr];
      program.uniforms.uHalfSize.value = [(w / 2) * dpr, (h / 2) * dpr];
    };
    const ro = new ResizeObserver(resize);
    ro.observe(btn);
    resize();

    let pointerAngle = null;
    let proximityT = 0;
    const onPointerMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      const dist = Math.hypot(dx, dy);
      if (dist === 0) {
        const nx = (e.clientX - cx) / (rect.width / 2);
        const ny = (cy - e.clientY) / (rect.height / 2);
        pointerAngle = Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
      } else {
        pointerAngle = Math.atan2(cy - e.clientY, e.clientX - cx);
      }
      const t = Math.max(0, 1 - dist / Math.max(currentProps.proximity, 1));
      proximityT = t * t * (3 - 2 * t);
    };
    window.addEventListener('pointermove', onPointerMove);

    let angle = 2.4;
    let idleAngle = 2.4;
    let bright = 0;
    let last = performance.now();
    let raf = 0;

    const isTouch = window.matchMedia('(hover: none)').matches;
    const lineC = new Color();
    const baseC = new Color();

    const update = (now) => {
      raf = requestAnimationFrame(update);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const p = currentProps;
      const activeAutoAnimate = p.autoAnimate || isTouch;

      idleAngle += p.speed * dt;
      const steer = p.followMouse && pointerAngle != null && (!activeAutoAnimate || proximityT > 0);
      const target = steer ? pointerAngle : idleAngle;
      const diff = ((target - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      angle += diff * (1 - Math.exp(-dt * 7));

      const brightTarget = activeAutoAnimate ? 1 : proximityT;
      bright += (brightTarget - bright) * (1 - Math.exp(-dt * 8));

      lineC.set(p.lineColor);
      baseC.set(p.baseColor);
      program.uniforms.uAngle.value = angle;
      program.uniforms.uRadius.value = Math.min(p.radius, Math.min(sizeRef.w, sizeRef.h) / 2) * dpr;
      program.uniforms.uLineColor.value = [lineC.r, lineC.g, lineC.b];
      program.uniforms.uBaseColor.value = [baseC.r, baseC.g, baseC.b];
      program.uniforms.uIntensity.value = p.intensity * bright;
      program.uniforms.uBaseIntensity.value = p.baseIntensity;
      program.uniforms.uShineSize.value = (p.shineSize * Math.PI) / 180;
      program.uniforms.uShineFade.value = (p.shineFade * Math.PI) / 180;
      program.uniforms.uThickness.value = p.thickness * dpr;
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      if (gl.canvas.parentNode === fx) fx.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  });
</script>

<button
  bind:this={btnEl}
  {type}
  {disabled}
  {onclick}
  class="specular-button specular-button--{size} {className}"
  style:--sb-radius="{radius}px"
  style:--sb-tint={tint}
  style:--sb-tint-opacity={tintOpacity}
  style:--sb-blur="{blur}px"
  style:--sb-text-color={textColor}
>
  <span class="specular-button__fx" bind:this={fxEl} aria-hidden="true"></span>
  <span class="specular-button__label">
    {#if children}
      {@render children()}
    {/if}
  </span>
</button>

<style>
  .specular-button {
    --sb-radius: 18px;
    --sb-tint: #ffffff;
    --sb-tint-opacity: 0;
    --sb-blur: 0px;
    --sb-text-color: #f5f5f5;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    margin: 0;
    font-family: inherit;
    font-weight: 500;
    letter-spacing: 0.01em;
    line-height: 1;
    color: var(--sb-text-color);
    background: color-mix(in srgb, var(--sb-tint) calc(var(--sb-tint-opacity) * 100%), transparent);
    border-radius: var(--sb-radius);
    backdrop-filter: blur(var(--sb-blur));
    -webkit-backdrop-filter: blur(var(--sb-blur));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 8px 24px rgba(0, 0, 0, 0.25);
    cursor: pointer;
    outline: none;
    transition: transform 0.15s ease;
  }
  .specular-button:active { transform: scale(0.97); }
  .specular-button:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--sb-text-color) 60%, transparent);
    outline-offset: 3px;
  }
  .specular-button:disabled { opacity: 0.55; cursor: default; }
  .specular-button:disabled:active { transform: none; }
  .specular-button--sm { font-size: 0.85rem; padding: 10px 22px; }
  .specular-button--md { font-size: 1rem; padding: 14px 30px; }
  .specular-button--lg { font-size: 1.15rem; padding: 18px 40px; }
  .specular-button__fx {
    position: absolute;
    inset: -20px;
    pointer-events: none;
    z-index: 1;
  }
  .specular-button__fx :global(canvas) {
    display: block;
    width: 100%;
    height: 100%;
  }
  .specular-button__label {
    position: relative;
    z-index: 2;
  }
</style>
