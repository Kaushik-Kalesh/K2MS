<script>
  import { onMount } from 'svelte';

  const SMOOTH_TAU = 0.25;
  const MIN_COPIES = 2;
  const COPY_HEADROOM = 2;

  let {
    logos = [],
    speed = 120,
    direction = 'left',
    width = '100%',
    logoHeight = 28,
    gap = 32,
    pauseOnHover = false,
    hoverSpeed = undefined,
    fadeOut = false,
    fadeOutColor = undefined,
    scaleOnHover = false,
    ariaLabel = 'Partner logos',
    className = '',
  } = $props();

  // DOM refs
  let containerEl;
  let trackEl;
  let seqEl;

  // Reactive state
  let seqWidth = $state(0);
  let seqHeight = $state(0);
  let copyCount = $state(MIN_COPIES);
  let isHovered = $state(false);

  // Derived values
  let effectiveHoverSpeed = $derived(
    hoverSpeed !== undefined ? hoverSpeed : pauseOnHover ? 0 : speed
  );

  let isVertical = $derived(direction === 'up' || direction === 'down');

  let targetVelocity = $derived(isHovered ? effectiveHoverSpeed : speed);

  let rootClassName = $derived(
    [
      'logoloop',
      isVertical && 'logoloop--vertical',
      fadeOut && 'logoloop--fade',
      scaleOnHover && 'logoloop--scale-hover',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  let containerStyle = $derived(
    isVertical ? `height: 100%;` : `width: ${width}; overflow: hidden;`
  );

  let cssVariables = $derived(
    `--logoloop-gap: ${gap}px; --logoloop-logoHeight: ${logoHeight}px;` +
      (fadeOutColor ? ` --logoloop-fadeColor: ${fadeOutColor};` : '')
  );

  // ResizeObserver effect — measure the sequence and compute copy count
  $effect(() => {
    if (!seqEl || !containerEl) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === seqEl) {
          const rect = entry.contentRect;
          seqWidth = rect.width;
          seqHeight = rect.height;
        }
      }

      // Compute how many copies are needed to fill container + headroom
      const containerRect = containerEl.getBoundingClientRect();
      const containerSize = isVertical ? containerRect.height : containerRect.width;
      const seqSize = isVertical ? seqHeight : seqWidth;

      if (seqSize > 0 && containerSize > 0) {
        const needed = Math.ceil(containerSize / seqSize) + COPY_HEADROOM;
        copyCount = Math.max(MIN_COPIES, needed);
      }
    });

    ro.observe(seqEl);
    ro.observe(containerEl);

    return () => ro.disconnect();
  });

  // Image loader effect — wait for all images to load, then remeasure
  $effect(() => {
    if (!seqEl) return;

    const images = /** @type {HTMLImageElement[]} */ (
      Array.from(seqEl.querySelectorAll('img'))
    );
    if (images.length === 0) return;

    let pending = images.filter((img) => !img.complete).length;
    if (pending === 0) return;

    const onLoad = () => {
      pending--;
      if (pending <= 0 && seqEl) {
        const rect = seqEl.getBoundingClientRect();
        seqWidth = rect.width;
        seqHeight = rect.height;
      }
    };

    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', onLoad);
        img.addEventListener('error', onLoad);
      }
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onLoad);
      });
    };
  });

  // Animation loop effect
  $effect(() => {
    if (!trackEl) return;

    const seqSize = isVertical ? seqHeight : seqWidth;
    if (seqSize <= 0) return;

    let offset = 0;
    let velocity = speed;
    let lastTime = performance.now();
    let rafId = 0;

    const isReverse = direction === 'right' || direction === 'down';

    function tick(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Smooth interpolation of velocity toward target
      const alpha = 1 - Math.exp(-dt / SMOOTH_TAU);
      velocity += (targetVelocity - velocity) * alpha;

      offset += velocity * dt;

      // Wrap offset around sequence size
      if (seqSize > 0) {
        offset = ((offset % seqSize) + seqSize) % seqSize;
      }

      const translate = isReverse ? offset : -offset;

      if (isVertical) {
        trackEl.style.transform = `translate3d(0, ${translate}px, 0)`;
      } else {
        trackEl.style.transform = `translate3d(${translate}px, 0, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  });

  // Generate copy indices
  let copies = $derived(Array.from({ length: copyCount }, (_, i) => i));
</script>

<div
  class={rootClassName}
  style="{cssVariables} {containerStyle}"
  role="marquee"
  aria-label={ariaLabel}
  bind:this={containerEl}
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
>
  <div class="logoloop__track" bind:this={trackEl}>
    {#each copies as copyIndex (copyIndex)}
      {#if copyIndex === 0}
        <ul
          class="logoloop__list"
          bind:this={seqEl}
          role="list"
        >
          {#each logos as logo, i (i)}
            <li class="logoloop__item">
              {#if logo.href}
                <a
                  class="logoloop__link"
                  href={logo.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={logo.title || logo.alt}
                >
                  <img
                    src={logo.src}
                    alt={logo.alt || ''}
                    width={logo.width || undefined}
                    height={logo.height || undefined}
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              {:else}
                <span class="logoloop__node">
                  <img
                    src={logo.src}
                    alt={logo.alt || ''}
                    width={logo.width || undefined}
                    height={logo.height || undefined}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
              {/if}
            </li>
          {/each}
        </ul>
      {:else}
        <ul
          class="logoloop__list"
          aria-hidden="true"
          role="presentation"
        >
          {#each logos as logo, i (i)}
            <li class="logoloop__item">
              {#if logo.href}
                <a
                  class="logoloop__link"
                  href={logo.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={logo.title || logo.alt}
                >
                  <img
                    src={logo.src}
                    alt={logo.alt || ''}
                    width={logo.width || undefined}
                    height={logo.height || undefined}
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              {:else}
                <span class="logoloop__node">
                  <img
                    src={logo.src}
                    alt={logo.alt || ''}
                    width={logo.width || undefined}
                    height={logo.height || undefined}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    {/each}
  </div>
</div>

<style>
  .logoloop {
    position: relative;
    --logoloop-gap: 32px;
    --logoloop-logoHeight: 28px;
    --logoloop-fadeColorAuto: #ffffff;
  }
  .logoloop--vertical {
    height: 100%;
    display: inline-block;
  }
  .logoloop--scale-hover {
    padding-top: calc(var(--logoloop-logoHeight) * 0.1);
    padding-bottom: calc(var(--logoloop-logoHeight) * 0.1);
  }
  @media (prefers-color-scheme: dark) {
    .logoloop {
      --logoloop-fadeColorAuto: #0b0b0b;
    }
  }

  .logoloop__track {
    display: flex;
    width: max-content;
    will-change: transform;
    user-select: none;
    position: relative;
    z-index: 0;
  }
  .logoloop--vertical .logoloop__track {
    flex-direction: column;
    height: max-content;
    width: 100%;
  }

  .logoloop__list {
    display: flex;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .logoloop--vertical .logoloop__list {
    flex-direction: column;
  }

  .logoloop__item {
    flex: 0 0 auto;
    margin-right: var(--logoloop-gap);
    font-size: var(--logoloop-logoHeight);
    line-height: 1;
    list-style: none;
  }
  .logoloop--vertical .logoloop__item {
    margin-right: 0;
    margin-bottom: var(--logoloop-gap);
  }
  .logoloop__item:last-child {
    margin-right: var(--logoloop-gap);
  }
  .logoloop--vertical .logoloop__item:last-child {
    margin-right: 0;
    margin-bottom: var(--logoloop-gap);
  }

  .logoloop__node {
    display: inline-flex;
    align-items: center;
  }
  .logoloop__item img {
    height: var(--logoloop-logoHeight);
    width: auto;
    display: block;
    object-fit: contain;
    image-rendering: -webkit-optimize-contrast;
    -webkit-user-drag: none;
    pointer-events: none;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .logoloop--scale-hover .logoloop__item {
    overflow: visible;
  }
  .logoloop--scale-hover .logoloop__item:hover img,
  .logoloop--scale-hover .logoloop__item:hover .logoloop__node {
    transform: scale(1.2);
    transform-origin: center center;
  }
  .logoloop--scale-hover .logoloop__node {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .logoloop__link {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    border-radius: 4px;
    transition: opacity 0.2s ease;
  }
  .logoloop__link:hover {
    opacity: 0.8;
  }
  .logoloop__link:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .logoloop--fade::before,
  .logoloop--fade::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: clamp(24px, 8%, 120px);
    pointer-events: none;
    z-index: 10;
  }
  .logoloop--fade::before {
    left: 0;
    background: linear-gradient(
      to right,
      var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%,
      rgba(0, 0, 0, 0) 100%
    );
  }
  .logoloop--fade::after {
    right: 0;
    background: linear-gradient(
      to left,
      var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%,
      rgba(0, 0, 0, 0) 100%
    );
  }
  .logoloop--vertical.logoloop--fade::before,
  .logoloop--vertical.logoloop--fade::after {
    left: 0;
    right: 0;
    width: 100%;
    height: clamp(24px, 8%, 120px);
  }
  .logoloop--vertical.logoloop--fade::before {
    top: 0;
    bottom: auto;
    background: linear-gradient(
      to bottom,
      var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%,
      rgba(0, 0, 0, 0) 100%
    );
  }
  .logoloop--vertical.logoloop--fade::after {
    bottom: 0;
    top: auto;
    background: linear-gradient(
      to top,
      var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%,
      rgba(0, 0, 0, 0) 100%
    );
  }

  @media (prefers-reduced-motion: reduce) {
    .logoloop__track {
      transform: translate3d(0, 0, 0) !important;
    }
    .logoloop__item img,
    .logoloop__node {
      transition: none !important;
    }
  }
</style>
