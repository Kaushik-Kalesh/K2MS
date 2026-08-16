<script>
    let { items = [], onItemClick = () => {} } = $props();
    
    let activeIndex = $state(0);
    
    let touchStartX = 0;
    let touchStartY = 0;
    let swipeOffset = $state(0);
    let isDragging = $state(false);
    
    let hasMoved = false;

    function onPointerDown(e) {
        touchStartX = e.clientX;
        touchStartY = e.clientY;
        swipeOffset = 0;
        isDragging = true;
        hasMoved = false;
        if (e.target.setPointerCapture) {
            e.target.setPointerCapture(e.pointerId);
        }
    }
    
    function onPointerMove(e) {
        if (!isDragging) return;
        let dx = e.clientX - touchStartX;
        let dy = e.clientY - touchStartY;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
            hasMoved = true;
        }
        if (Math.abs(dx) > Math.abs(dy)) {
            swipeOffset = dx;
        }
    }
    
    function onPointerUp(e) {
        if (!isDragging) return;
        isDragging = false;
        if (e.target.releasePointerCapture) {
            e.target.releasePointerCapture(e.pointerId);
        }
        
        if (!hasMoved) {
            const cardElement = e.target.closest('.swipe-card');
            if (cardElement) {
                if (cardElement.classList.contains('active')) {
                    onItemClick(activeIndex);
                } else if (cardElement.classList.contains('next') && activeIndex < items.length - 1) {
                    activeIndex++;
                } else if (cardElement.classList.contains('prev') && activeIndex > 0) {
                    activeIndex--;
                }
            }
        } else {
            if (swipeOffset < -80 && activeIndex < items.length - 1) {
                activeIndex++;
            } else if (swipeOffset > 80 && activeIndex > 0) {
                activeIndex--;
            }
        }
        swipeOffset = 0;
    }
    
    function handleKeyDown(e, i) {
        if (e.key === 'Enter' || e.key === ' ') {
            if (i === activeIndex) onItemClick(i);
            else activeIndex = i;
        } else if (e.key === 'ArrowRight' && activeIndex < items.length - 1) {
            activeIndex++;
        } else if (e.key === 'ArrowLeft' && activeIndex > 0) {
            activeIndex--;
        }
    }
</script>

<div 
    class="swipe-container"
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
    role="region"
    aria-label="Swipeable portfolio cards"
>
    {#each items as item, i}
        {@const isActive = i === activeIndex}
        {@const isNext = i === activeIndex + 1}
        {@const isPrev = i === activeIndex - 1}
        {@const isFar = !isActive && !isNext && !isPrev}
        
        <!-- Only render cards that are nearby to save DOM -->
        {#if !isFar || items.length <= 5}
            <div 
                class="swipe-card"
                class:active={isActive}
                class:next={isNext}
                class:prev={isPrev}
                style="
                    --offset: {isActive ? swipeOffset + 'px' : '0px'};
                    --rot: {isActive ? (swipeOffset * 0.05) + 'deg' : isNext ? '10deg' : isPrev ? '-10deg' : '0deg'};
                    --scale: {isActive ? 1 : 0.85};
                    --z: {isActive ? 10 : 5};
                    --op: {isActive ? 1 : (isNext || isPrev) ? 0.6 : 0};
                    --x: {isActive ? 'var(--offset)' : isNext ? '15%' : isPrev ? '-15%' : '0'};
                    --y: {isActive ? '0' : '5%'};
                    transform: translate3d(var(--x), var(--y), 0) scale(var(--scale)) rotate(var(--rot));
                    z-index: var(--z);
                    opacity: var(--op);
                    transition: {isDragging && isActive ? 'none' : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease'};
                "
                onkeydown={(e) => handleKeyDown(e, i)}
                role="button"
                tabindex={isActive ? "0" : "-1"}
                aria-current={isActive ? "true" : "false"}
            >
                <img src={item.image} alt={item.alt} draggable="false" />
                <div class="card-info" style="opacity: {isActive ? 1 : 0}; transition: opacity 0.3s;">
                    <h3>{item.label}</h3>
                    {#if i === 0 && swipeOffset === 0 && !isDragging}
                        <div class="swipe-hint">
                            <svg class="swipe-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M5 12h14"></path>
                                <path d="m12 5 7 7-7 7"></path>
                            </svg>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    {/each}
    
    <div class="dots-indicator">
        {#each items as _, i}
            <button 
                class="dot-btn" 
                class:active={i === activeIndex}
                onclick={() => activeIndex = i}
                aria-label="Go to slide {i + 1}"
            ></button>
        {/each}
    </div>
</div>

<style>
    .swipe-container {
        position: relative;
        width: 100%;
        height: 420px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        touch-action: pan-y; /* allow vertical scrolling but capture horizontal */
    }
    .swipe-card {
        position: absolute;
        width: 75%;
        max-width: 320px;
        height: 360px;
        border-radius: 28px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255,255,255,0.15);
        box-shadow: 0 15px 35px -10px rgba(0,0,0,0.5);
        cursor: pointer;
        user-select: none;
        will-change: transform, opacity;
    }
    .swipe-card::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%);
        pointer-events: none;
    }
    .swipe-card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        pointer-events: none;
    }
    .card-info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1.5rem;
        z-index: 2;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .card-info h3 {
        font-size: 1.4rem;
        font-weight: 600;
        color: #fff;
        margin: 0;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    .swipe-hint {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(245, 158, 11, 0.2);
        backdrop-filter: blur(4px);
        border: 1px solid rgba(245, 158, 11, 0.4);
        padding: 6px 16px;
        border-radius: 20px;
        width: max-content;
        animation: hint-bounce 1.5s infinite ease-in-out;
    }
    .swipe-arrow {
        width: 20px;
        height: 20px;
        color: #F59E0B;
    }
    @keyframes hint-bounce {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(10px); }
    }
    
    .dots-indicator {
        position: absolute;
        bottom: 0;
        display: flex;
        gap: 8px;
        z-index: 20;
    }
    .dot-btn {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        border: none;
        padding: 0;
        cursor: pointer;
        transition: all 0.3s;
    }
    .dot-btn.active {
        background: #F59E0B;
        width: 24px;
        border-radius: 4px;
    }
</style>
