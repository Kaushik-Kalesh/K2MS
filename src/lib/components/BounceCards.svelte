<script>
  import { gsap } from 'gsap';

  let {
    className = '',
    images = [],
    containerWidth = 400,
    containerHeight = 400,
    animationDelay = 0.5,
    animationStagger = 0.06,
    easeType = 'elastic.out(1, 0.8)',
    transformStyles = [
      'rotate(10deg) translate(-170px)',
      'rotate(5deg) translate(-85px)',
      'rotate(-3deg)',
      'rotate(-10deg) translate(85px)',
      'rotate(2deg) translate(170px)'
    ],
    enableHover = true,
    onCardClick = undefined
  } = $props();

  let containerEl;

  $effect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.card',
        { scale: 0 },
        {
          scale: 1,
          stagger: animationStagger,
          ease: easeType,
          delay: animationDelay
        }
      );
    }, containerEl);

    return () => ctx.revert();
  });

  function getNoRotationTransform(transformStr) {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr);
    if (hasRotate) {
      return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)');
    } else if (transformStr === 'none') {
      return 'rotate(0deg)';
    } else {
      return `${transformStr} rotate(0deg)`;
    }
  }

  function getPushedTransform(baseTransform, offsetX) {
    const translateRegex = /translate\(([-0-9.]+)px\)/;
    const match = baseTransform.match(translateRegex);
    if (match) {
      const currentX = parseFloat(match[1]);
      const newX = currentX + offsetX;
      return baseTransform.replace(translateRegex, `translate(${newX}px)`);
    } else {
      return baseTransform === 'none'
        ? `translate(${offsetX}px)`
        : `${baseTransform} translate(${offsetX}px)`;
    }
  }

  function pushSiblings(hoveredIdx) {
    if (!enableHover || !containerEl) return;
    const q = gsap.utils.selector(containerEl);

    images.forEach((_, i) => {
      const target = q(`.card-${i}`);
      gsap.killTweensOf(target);
      const baseTransform = transformStyles[i] || 'none';

      if (i === hoveredIdx) {
        const noRotationTransform = getNoRotationTransform(baseTransform);
        gsap.to(target, {
          transform: noRotationTransform,
          duration: 0.4,
          ease: 'back.out(1.4)',
          overwrite: 'auto'
        });
      } else {
        const offsetX = i < hoveredIdx ? -160 : 160;
        const pushedTransform = getPushedTransform(baseTransform, offsetX);
        const distance = Math.abs(hoveredIdx - i);
        const delay = distance * 0.05;
        gsap.to(target, {
          transform: pushedTransform,
          duration: 0.4,
          ease: 'back.out(1.4)',
          delay,
          overwrite: 'auto'
        });
      }
    });
  }

  function resetSiblings() {
    if (!enableHover || !containerEl) return;
    const q = gsap.utils.selector(containerEl);

    images.forEach((_, i) => {
      const target = q(`.card-${i}`);
      gsap.killTweensOf(target);
      const baseTransform = transformStyles[i] || 'none';
      gsap.to(target, {
        transform: baseTransform,
        duration: 0.4,
        ease: 'back.out(1.4)',
        overwrite: 'auto'
      });
    });
  }
</script>

<div
  class={`bounceCardsContainer ${className}`}
  bind:this={containerEl}
  style="position: relative; width: {typeof containerWidth === 'number' ? `${containerWidth}px` : containerWidth}; height: {typeof containerHeight === 'number' ? `${containerHeight}px` : containerHeight};"
>
  {#each images as src, idx}
    <div
      class={`card card-${idx}`}
      style="transform: {transformStyles[idx] ?? 'none'}; cursor: {onCardClick ? 'pointer' : 'default'};"
      onmouseenter={() => pushSiblings(idx)}
      onmouseleave={resetSiblings}
      ontouchstart={() => pushSiblings(idx)}
      ontouchend={resetSiblings}
      onclick={() => onCardClick?.(idx)}
      onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCardClick?.(idx); }}
      role="button"
      tabindex="0"
    >
      <img class="image" src={src} alt={`card-${idx}`} />
    </div>
  {/each}
</div>

<style>
  .bounceCardsContainer {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .card {
    position: absolute;
    width: clamp(120px, 40vw, 200px);
    aspect-ratio: 1;
    border: 5px solid #fff;
    border-radius: clamp(15px, 5vw, 25px);
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
  .card .image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
