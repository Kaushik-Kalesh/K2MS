<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';

  let {
    items = [],
    defaultIndex = 2,
    accentColor = '#ffffff',
    overlayColor = '#060010',
    textColor = '#ffffff',
    height = 460,
    gap = 10,
    radius = 16,
    expandRatio = 0.52,
    orientation = 'horizontal',
    duration = 0.6,
    ease = 'power3.out',
    parallax = 0.5,
    tilt = 8,
    stagger = 0.06,
    trigger = 'hover',
    showLabels = true,
    grayscale = true,
    className = '',
    onItemClick = undefined
  } = $props();

  let rootEl;
  let panelRefs = [];
  let mediaRefs = [];
  let barRefs = [];
  let textRefs = [];
  
  let tlRef = null;
  let firstRun = true;
  let mediaSize = 320;

  let active = $state(defaultIndex);
  let isMobile = $state(false);
  
  let vertical = $derived(orientation === 'vertical' || isMobile);
  let count = $derived(items.length);

  // Safely clamp active
  let clampedActive = $derived(Math.min(Math.max(active, 0), Math.max(0, count - 1)));

  function applyLayout(animate) {
    if (!panelRefs.length || !rootEl) return;

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
    const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;

    if (tlRef) tlRef.kill();
    const dur = animate && !prefersReduced ? duration : 0;
    const tl = gsap.timeline();

    panelRefs.forEach((panel, i) => {
      if (!panel) return;
      const isActive = i === clampedActive;
      const media = mediaRefs[i];
      const bar = barRefs[i];
      const text = textRefs[i];

      const rot = isActive ? 0 : i < clampedActive ? tilt : -tilt;
      const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };
      const flexVal = isActive ? `${grow} 1 0%` : `1 1 0%`;

      tl.to(panel, { flex: flexVal, ...rotProp, duration: dur, ease }, 0);

      if (media) {
        const drift = Math.max(-1.5, Math.min(1.5, clampedActive - i));
        const shift = drift * parallax * mediaSize * 0.06;
        const gray = grayscale ? (isActive ? 0 : 1) : 0;
        tl.to(
          media,
          {
            xPercent: -50,
            yPercent: -50,
            x: vertical ? 0 : isActive ? 0 : shift,
            y: vertical ? (isActive ? 0 : shift) : 0,
            '--ag-gray': gray,
            '--ag-dim': isActive ? 0 : 0.35,
            duration: dur,
            ease
          },
          0
        );
      }

      if (showLabels && bar && text) {
        if (isActive) {
          tl.to([bar, text], { opacity: 1, x: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger }, 0);
        } else {
          tl.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0);
        }
      }
    });

    tlRef = tl;
  }

  function measure() {
    if (!rootEl) return;
    isMobile = window.innerWidth <= 520;
    const rect = rootEl.getBoundingClientRect();
    const total = vertical ? rect.height : rect.width;
    const usable = Math.max(total - gap * (count - 1), 120);
    const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
    mediaSize = size;
    rootEl.style.setProperty('--ag-media-size', `${size}px`);
    applyLayout(true);
  }

  onMount(() => {
    // Wait for a tick to ensure refs are populated
    setTimeout(() => {
      measure();
      const ro = new ResizeObserver(measure);
      if (rootEl) ro.observe(rootEl);
      
      return () => {
        ro.disconnect();
        if (tlRef) tlRef.kill();
      };
    }, 0);
  });

  function updateActive(i) {
    if (active === i) return;
    active = i;
    applyLayout(true);
  }

  function handleEnter(i) {
    if (trigger === 'hover') updateActive(i);
  }

  function handleClick(i, e) {
    if (i !== clampedActive) {
      e.preventDefault();
      updateActive(i);
    } else {
      if (onItemClick) {
        e.preventDefault();
        onItemClick(i);
      }
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      updateActive((i + 1) % count);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      updateActive((i - 1 + count) % count);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (i === clampedActive && onItemClick) onItemClick(i);
      else updateActive(i);
    }
  }

</script>

<div
  bind:this={rootEl}
  class="accordion-gallery {vertical ? 'accordion-gallery--vertical' : ''} {className}"
  style="
    --ag-accent: {accentColor};
    --ag-overlay: {overlayColor};
    --ag-text: {textColor};
    --ag-gap: {gap}px;
    --ag-radius: {radius}px;
    height: {vertical ? Math.round(height * 1.6) : height}px;
  "
  role="list"
  aria-label="Image accordion gallery"
>
  {#each items as item, i}
    <a
      bind:this={panelRefs[i]}
      class="ag-panel"
      style="border-radius: {radius}px;"
      href={item.link || '#'}
      onclick={(e) => handleClick(i, e)}
      onmouseenter={() => handleEnter(i)}
      onfocus={() => active = i}
      onkeydown={(e) => handleKeyDown(i, e)}
      tabindex="0"
      aria-label={item.label}
    >
      <span class="ag-panel__frame">
        <span class="ag-panel__media" bind:this={mediaRefs[i]}>
          <img src={item.image} alt={item.alt || item.label || ''} draggable="false" />
        </span>
        <span class="ag-panel__overlay" aria-hidden="true"></span>
      </span>
      {#if showLabels}
        <span class="ag-panel__label" aria-hidden="true">
          <span class="ag-panel__bar" bind:this={barRefs[i]}></span>
          <span class="ag-panel__text" bind:this={textRefs[i]}>
            {item.label}
          </span>
        </span>
      {/if}
    </a>
  {/each}
</div>

<style>
  .accordion-gallery {
    --ag-accent: #ffffff;
    --ag-overlay: #060010;
    --ag-text: #ffffff;
    --ag-gap: 10px;
    --ag-radius: 16px;
    --ag-media-size: 320px;

    display: flex;
    flex-direction: row;
    gap: var(--ag-gap);
    width: 100%;
    max-width: 100%;
    perspective: 1400px;
    perspective-origin: 50% 50%;
  }

  .accordion-gallery--vertical {
    flex-direction: column;
  }

  .ag-panel {
    position: relative;
    flex: 1 1 0;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    border-radius: var(--ag-radius);
    cursor: pointer;
    display: block;
    text-decoration: none;
    outline: none;
    transform-style: preserve-3d;
    transform-origin: center center;
    background: #0a0713;
    box-shadow: 0 10px 30px -18px rgba(0, 0, 0, 0.8);
    will-change: flex-grow, transform;
    -webkit-tap-highlight-color: transparent;
  }

  .ag-panel:focus-visible {
    box-shadow:
      0 0 0 2px var(--ag-accent),
      0 10px 30px -18px rgba(0, 0, 0, 0.8);
  }

  .ag-panel__frame {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: inherit;
  }

  .ag-panel__media {
    --ag-gray: 1;
    --ag-dim: 0.35;
    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--ag-media-size);
    height: 100%;
    filter: grayscale(var(--ag-gray));
    will-change: transform, filter;
  }

  .accordion-gallery--vertical .ag-panel__media {
    width: 100%;
    height: var(--ag-media-size);
  }

  .ag-panel__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    user-select: none;
    -webkit-user-drag: none;
    pointer-events: none;
  }

  .ag-panel__overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(180deg, transparent 45%, color-mix(in srgb, var(--ag-overlay) 78%, transparent) 100%),
      color-mix(in srgb, var(--ag-overlay) calc(var(--ag-dim, 0.35) * 100%), transparent);
  }

  .ag-panel__label {
    position: absolute;
    left: 20px;
    bottom: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    pointer-events: none;
    z-index: 2;
  }

  .ag-panel__bar {
    flex: 0 0 auto;
    width: 3px;
    height: 26px;
    border-radius: 3px;
    background: var(--ag-accent);
    opacity: 0;
    box-shadow: 0 0 12px color-mix(in srgb, var(--ag-accent) 60%, transparent);
  }

  .ag-panel__text {
    color: var(--ag-text);
    font-family: inherit;
    font-weight: 600;
    font-size: clamp(1rem, 1.4vw, 1.4rem);
    letter-spacing: 0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0;
    text-shadow: 0 2px 14px rgba(0, 0, 0, 0.55);
  }

  @media (max-width: 520px) {
    .accordion-gallery {
      flex-direction: column;
      perspective: none;
      height: 65vh !important;
      min-height: 500px;
    }
    .ag-panel {
      min-height: 60px;
    }
    .accordion-gallery .ag-panel__media {
      width: 100%;
      height: var(--ag-media-size);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ag-panel,
    .ag-panel__media {
      will-change: auto;
    }
  }
</style>
