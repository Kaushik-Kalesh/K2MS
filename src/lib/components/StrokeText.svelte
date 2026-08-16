<script module>
  let idCounter = 0;
</script>

<script>
  import { tick, onMount } from 'svelte';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

  if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  let {
    text = 'Draw Attention',
    strokeColor = '#A78BFA',
    fillColor = '#F8FAFC',
    strokeWidth = 1.4,
    drawDuration = 1.6,
    fillDelay = 0.2,
    stagger = 0.05,
    ease = 'power2.out',
    trigger = 'mount',
    fillMode = 'wipe',
    fontSize = 128,
    fontWeight = 800,
    letterSpacing = -4,
    reverse = false,
    className = '',
    style = {}
  } = $props();

  const wipeId = `stroke-text-wipe-${idCounter++}`;

  let rootRef = $state(null);
  let strokeTextRef = $state(null);
  let wipeRectRef = $state(null);
  let box = $state(null);

  let characters = $derived(Array.from(String(text ?? '')));
  let dash = $derived(Math.max(fontSize * 7, 200));

  let fontStyle = $derived(
    `font-size: ${fontSize}px; font-weight: ${fontWeight}; letter-spacing: ${letterSpacing}px`
  );

  let viewBox = $derived(
    box
      ? `${box.x} ${box.y} ${box.width} ${box.height}`
      : `0 ${-fontSize} 600 ${fontSize * 1.3}`
  );

  let styleString = $derived.by(() => {
    const entries = Object.entries(style);
    const parts = entries.map(([k, v]) => {
      const prop = k.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${prop}: ${v}`;
    });
    parts.push(`--stroke-text-height: 1.3em`);
    return parts.join('; ');
  });

  let rootClass = $derived(
    `stroke-text ${trigger === 'hover' ? 'stroke-text--hover' : ''} ${className}`.trim()
  );

  let clipPathAttr = $derived(
    fillMode === 'wipe' && box ? `url(#${wipeId})` : undefined
  );

  // Measure SVG bounding box
  $effect(() => {
    // Track reactive dependencies
    void characters;
    void fontSize;
    void fontWeight;
    void letterSpacing;
    void strokeWidth;

    const node = strokeTextRef;
    if (!node) return;

    let cancelled = false;

    const measure = () => {
      if (cancelled || !strokeTextRef) return;
      let bbox;
      try {
        bbox = strokeTextRef.getBBox();
      } catch {
        return;
      }
      if (!bbox || !bbox.width) return;
      const pad = Math.max(Number(strokeWidth) || 1, fontSize * 0.1);
      const next = {
        x: bbox.x - pad,
        y: bbox.y - pad,
        width: bbox.width + pad * 2,
        height: bbox.height + pad * 2
      };
      const prev = box;
      if (
        prev &&
        Math.abs(prev.x - next.x) < 0.5 &&
        Math.abs(prev.width - next.width) < 0.5 &&
        Math.abs(prev.y - next.y) < 0.5
      ) {
        return;
      }
      box = next;
    };

    // Wait a tick so DOM is updated, then measure
    tick().then(measure);

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  });

  // GSAP animation
  $effect(() => {
    const root = rootRef;
    // Track reactive dependencies
    const currentBox = box;
    const currentDash = dash;
    const currentDrawDuration = drawDuration;
    const currentFillDelay = fillDelay;
    const currentStagger = stagger;
    const currentEase = ease;
    const currentTrigger = trigger;
    const currentFillMode = fillMode;
    const currentReverse = reverse;

    if (typeof window === 'undefined' || !root || !currentBox) return;

    const strokes = gsap.utils.toArray(root.querySelectorAll('[data-stroke-char]'));
    const fills = gsap.utils.toArray(root.querySelectorAll('[data-fill-char]'));
    const wipe = wipeRectRef;
    if (!strokes.length) return;

    const fillEnabled = currentFillMode !== 'none';
    const useWipe = fillEnabled && currentFillMode === 'wipe';
    const fillDuration = Math.max(0.4, currentDrawDuration * 0.5);
    const staggerConfig = currentReverse
      ? { each: currentStagger, from: 'end' }
      : currentStagger;
    const targets = [...strokes, ...fills, wipe].filter(Boolean);

    const setStart = () => {
      gsap.killTweensOf(targets);
      gsap.set(strokes, { strokeDasharray: currentDash, strokeDashoffset: currentDash });
      gsap.set(fills, { opacity: useWipe ? 1 : 0 });
      if (wipe) gsap.set(wipe, { attr: { width: 0 } });
    };

    const setEnd = () => {
      gsap.killTweensOf(targets);
      gsap.set(strokes, { strokeDasharray: currentDash, strokeDashoffset: 0 });
      gsap.set(fills, { opacity: fillEnabled ? 1 : 0 });
      if (wipe) gsap.set(wipe, { attr: { width: fillEnabled ? currentBox.width : 0 } });
    };

    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      setEnd();
      return () => gsap.killTweensOf(targets);
    }

    const build = () => {
      setStart();
      const tl = gsap.timeline({
        paused: true,
        repeat: currentTrigger === 'loop' ? -1 : 0,
        repeatDelay: currentTrigger === 'loop' ? 0.9 : 0,
        defaults: { overwrite: 'auto' }
      });
      tl.to(
        strokes,
        {
          strokeDashoffset: 0,
          duration: currentDrawDuration,
          ease: currentEase,
          stagger: staggerConfig
        },
        0
      );
      if (useWipe && wipe) {
        tl.to(
          wipe,
          { attr: { width: currentBox.width }, duration: fillDuration, ease: 'power2.inOut' },
          currentDrawDuration + currentFillDelay
        );
      } else if (fillEnabled) {
        tl.to(
          fills,
          {
            opacity: 1,
            duration: fillDuration,
            ease: 'power2.out',
            stagger: staggerConfig
          },
          currentDrawDuration + currentFillDelay
        );
      }
      return tl;
    };

    let timeline = null;
    let scrollTrigger = null;
    let removeHover = null;

    if (currentTrigger === 'hover') {
      setEnd();
      const play = () => {
        timeline?.kill();
        timeline = build();
        timeline.play(0);
      };
      root.addEventListener('pointerenter', play);
      removeHover = () => root.removeEventListener('pointerenter', play);
    } else {
      timeline = build();
      if (currentTrigger === 'scroll') {
        scrollTrigger = ScrollTrigger.create({
          trigger: root,
          start: 'top 82%',
          once: true,
          onEnter: () => timeline?.play(0)
        });
      } else {
        timeline.play(0);
      }
    }

    return () => {
      removeHover?.();
      scrollTrigger?.kill();
      timeline?.kill();
      gsap.killTweensOf(targets);
    };
  });
</script>

<span
  bind:this={rootRef}
  class={rootClass}
  style="{styleString};"
  role="img"
  aria-label={String(text ?? '')}
>
  <svg
    class="stroke-text__svg"
    viewBox={viewBox}
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    {#if fillMode === 'wipe' && box}
      <defs>
        <clipPath id={wipeId} clipPathUnits="userSpaceOnUse">
          <rect
            bind:this={wipeRectRef}
            x={box.x}
            y={box.y}
            width="0"
            height={box.height}
          />
        </clipPath>
      </defs>
    {/if}

    <text
      bind:this={strokeTextRef}
      class="stroke-text__stroke"
      x="0"
      y="0"
      fill="none"
      stroke={strokeColor}
      stroke-width={strokeWidth}
      stroke-linejoin="round"
      stroke-linecap="round"
      style={fontStyle}
    >
      {#each characters as char, index}
        <tspan data-stroke-char>{char}</tspan>
      {/each}
    </text>

    <text
      class="stroke-text__fill"
      x="0"
      y="0"
      fill={fillColor}
      stroke="none"
      style={fontStyle}
      clip-path={clipPathAttr}
    >
      {#each characters as char, index}
        <tspan data-fill-char>{char}</tspan>
      {/each}
    </text>
  </svg>
</span>

<style>
  .stroke-text {
    display: block;
    width: 100%;
    line-height: 0;
  }
  .stroke-text--hover {
    cursor: pointer;
  }
  .stroke-text__svg {
    display: block;
    width: 100%;
    height: var(--stroke-text-height, 160px);
  }
  .stroke-text__stroke,
  .stroke-text__fill {
    user-select: none;
  }
</style>
