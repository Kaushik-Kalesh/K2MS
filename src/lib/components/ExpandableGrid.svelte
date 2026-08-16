<script>
    import { crossfade } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';

    let { items = [] } = $props();

    let activeItem = $state(null);

    const [send, receive] = crossfade({
        duration: 400,
        easing: cubicOut
    });

    function close() {
        activeItem = null;
    }

    function handleKeydown(e) {
        if (e.key === 'Escape') close();
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- OVERLAY AND MODAL -->
{#if activeItem}
    <div 
        class="modal-backdrop" 
        transition:receive={{ key: 'backdrop' }}
        onclick={close}
        aria-hidden="true"
    ></div>
    
    <div class="modal-wrapper">
        <button class="close-btn" onclick={close} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
        </button>
        <div 
            class="modal-card"
            in:receive={{ key: activeItem.id }}
            out:send={{ key: activeItem.id }}
        >
            <div class="modal-img-container">
                {#if activeItem.images && activeItem.images.length > 0}
                    <img class="modal-img" src={`/api/images/${activeItem.images[0]}`} alt={activeItem.name} />
                {:else}
                    <div class="modal-img-placeholder"></div>
                {/if}
            </div>
            
            <div class="modal-content">
                <div class="modal-header">
                    <div>
                        <h3 class="modal-title">{activeItem.name}</h3>
                        <p class="modal-desc">{activeItem.description}</p>
                    </div>
                </div>
                
                <div class="modal-body">
                    <div class="p-tags">
                        {#each activeItem.tags as tag}<span class="tag">{tag}</span>{/each}
                    </div>
                    {#if activeItem.client}
                        <p style="margin-top: 1rem; color: #888;">Client: {activeItem.client}</p>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- GRID -->
<div class="expandable-grid">
    {#each items as item (item.name)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            class="grid-card"
            onclick={() => activeItem = item}
            in:receive={{ key: item.id }}
            out:send={{ key: item.id }}
            style={activeItem === item ? 'opacity: 0; pointer-events: none;' : ''}
        >
            <div class="grid-img-container">
                {#if item.images && item.images.length > 0}
                    <img class="grid-img" src={`/api/images/${item.images[0]}`} alt={item.name} />
                {:else}
                    <div class="grid-img-placeholder"></div>
                {/if}
            </div>
            <div class="grid-info">
                <h3 class="grid-title">{item.name}</h3>
                <p class="grid-desc">{item.description}</p>
            </div>
        </div>
    {/each}
</div>

<style>
    /* GRID */
    .expandable-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
    }
    .grid-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        overflow: hidden;
        cursor: pointer;
        transition: background 0.3s, transform 0.3s;
        display: flex;
        flex-direction: column;
    }
    .grid-card:hover {
        background: rgba(255, 255, 255, 0.08);
        transform: scale(1.02);
    }
    .grid-img-container {
        height: 200px;
        width: 100%;
        overflow: hidden;
    }
    .grid-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top;
    }
    .grid-img-placeholder {
        width: 100%;
        height: 100%;
        background: #333;
    }
    .grid-info {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }
    .grid-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: #f0ede8;
        margin-bottom: 0.5rem;
    }
    .grid-desc {
        font-size: 0.9rem;
        color: rgba(240, 237, 232, 0.6);
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    /* MODAL */
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 100;
        backdrop-filter: blur(5px);
    }
    .modal-wrapper {
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        z-index: 101;
        padding: 1rem;
        pointer-events: none;
    }
    .modal-card {
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        background: #1a1a1a;
        border-radius: 24px;
        overflow: hidden;
        pointer-events: auto;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .modal-img-container {
        height: 300px;
        width: 100%;
    }
    .modal-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top;
    }
    .modal-img-placeholder {
        width: 100%;
        height: 100%;
        background: #333;
    }
    .modal-content {
        padding: 1.5rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }
    .modal-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #fff;
        margin-bottom: 0.5rem;
    }
    .modal-desc {
        font-size: 1rem;
        color: #aaa;
        line-height: 1.6;
    }
    .modal-body {
        font-size: 0.95rem;
        color: #bbb;
        line-height: 1.6;
    }
    .close-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255,255,255,0.1);
        border: none;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        pointer-events: auto;
        z-index: 102;
        transition: background 0.2s;
    }
    .close-btn:hover {
        background: rgba(255,255,255,0.2);
    }
    
    .p-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    .tag {
        font-size: 0.75rem;
        padding: 0.25rem 0.6rem;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(240, 237, 232, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    @media (max-width: 600px) {
        .modal-card {
            border-radius: 16px;
        }
        .modal-img-container {
            height: 200px;
        }
        .close-btn {
            top: 0.5rem;
            right: 0.5rem;
        }
    }
</style>
