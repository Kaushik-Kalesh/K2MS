<script>
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import GradientWaves from "$lib/components/GradientWaves.svelte";
    import StrokeText from "$lib/components/StrokeText.svelte";
    import LogoLoop from "$lib/components/LogoLoop.svelte";
    import SpecularButton from "$lib/components/SpecularButton.svelte";
    import AccordionGallery from "$lib/components/AccordionGallery.svelte";
    import SwipeCards from "$lib/components/SwipeCards.svelte";
    import MagicRings from "$lib/components/MagicRings.svelte";

    let { data } = $props();
    let content = $derived(data.content || {});
    let portfolioData = $derived(data.portfolio || []);

    // Derive unique client logos for the LogoLoop
    let clientLogos = $derived.by(() => {
        const seen = new Set();
        return portfolioData
            .filter(p => p.logo && !seen.has(p.client) && seen.add(p.client))
            .map(p => ({
                src: `/api/images/${p.logo}`,
                alt: p.client || p.name,
                title: p.client || p.name,
            }));
    });
    
    let heroLines = $derived((content.hero_headline || '').includes('?') ? (content.hero_headline || '').split('? ') : [content.hero_headline || '']);

    let formStatus = $state("");
    let formLoading = $state(false);
    let selectedProject = $state(null);
    let currentImageIndex = $state(0);
    let showContactModal = $state(false);
    let innerWidth = $state(0);
    let isMobile = $derived(innerWidth > 0 && innerWidth <= 768);

    function openProjectModal(idx) {
        selectedProject = portfolioData[idx];
        currentImageIndex = 0;
    }

    $effect(() => {
        if (typeof window !== "undefined") {
            if (showContactModal || selectedProject) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "";
            }
        }
    });

    function nextImage() {
        if (!selectedProject || !selectedProject.images) return;
        currentImageIndex = (currentImageIndex + 1) % selectedProject.images.length;
    }

    function prevImage() {
        if (!selectedProject || !selectedProject.images) return;
        currentImageIndex = (currentImageIndex - 1 + selectedProject.images.length) % selectedProject.images.length;
    }

    $effect(() => {
        let timer;
        if (selectedProject && selectedProject.images && selectedProject.images.length > 1) {
            // Depend on currentImageIndex to reset the timer on manual navigation
            const _ = currentImageIndex; 
            timer = setTimeout(() => {
                nextImage();
            }, 3000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    });

    function reveal(node) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        node.classList.add("revealed");
                        observer.unobserve(node);
                    }
                });
            },
            { threshold: 0.05, rootMargin: "0px 0px -50px 0px" },
        );
        observer.observe(node);
        return {
            destroy() {
                observer.disconnect();
            },
        };
    }



    async function handleSubmit(e) {
        e.preventDefault();
        formLoading = true;
        formStatus = "";
        const form = e.currentTarget;
        const fd = new FormData(form);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.fromEntries(fd)),
            });
            formStatus = res.ok ? "success" : "error";
            if (res.ok) form.reset();
        } catch {
            formStatus = "error";
        } finally {
            formLoading = false;
        }
    }
</script>


<svelte:window bind:innerWidth />
<main class="k2ms-main">
    <div class="global-bg">
        <GradientWaves 
            horizonColor="#1a0f00" 
            waveColor="#F59E0B" 
            crestColor="#451a03" 
            speed={0.3} 
            amplitude={1.8} 
            tilt={1.11} 
            zoom={0.8}
            mouseInteraction={false}
        />
    </div>

    <!-- NAV -->
    <nav class="nav">
        <a href="/" class="nav-brand">{content.companyName || "K2M Services"}</a>
        <a href="#services" class="nav-link">about us</a>
        <a href="#work" class="nav-link">work</a>
        <button class="nav-link" onclick={() => showContactModal = true} style="background: none; border: none; cursor: pointer; font-family: inherit;">start a project</button>
    </nav>

    <!-- HERO -->
    <section class="hero">
        <div class="hero-display">
        <StrokeText
            text={heroLines[0] + (heroLines.length > 1 ? '?' : '')}
            strokeColor="#F59E0B"
            fillColor="#f0ede8"
            strokeWidth={1.4}
            fontSize={128}
            fontWeight={700}
            letterSpacing={-4}
            trigger="mount"
            fillMode="wipe"
            drawDuration={1.6}
            fillDelay={0.2}
            className="hero-stroke-text"
        />
        {#if heroLines.length > 1}
            <StrokeText
                text={heroLines[1]}
                strokeColor="#F59E0B"
                fillColor="#f0ede8"
                strokeWidth={1.4}
                fontSize={128}
                fontWeight={700}
                letterSpacing={-4}
                trigger="mount"
                fillMode="wipe"
                drawDuration={1.6}
                fillDelay={0.2}
                className="hero-stroke-text"
                style={{ marginTop: '-0.3em' }}
            />
        {/if}
    </div>
    <div class="hero-sub-wrap">
        <p class="hero-sub">{content.hero_subheadline}</p>
        <div style="margin-top: 1.5rem;">
            <SpecularButton 
                onclick={() => showContactModal = true}
                lineColor="#F59E0B"
                baseColor="#F59E0B"
                baseIntensity={1}
                intensity={2.5}
                radius={32}
                size="lg"
            >
                <span style="font-weight: 600; padding: 0 1rem; color: #fff; font-size: 1.1rem;">Let's Talk →</span>
            </SpecularButton>
        </div>
    </div>
</section>

<!-- DASHED SEPARATOR -->


<!-- SERVICES -->
<section class="section reveal" id="services" use:reveal>
    <div class="section-label">{content.services_headline}</div>
    <div class="section-head">
        <h2>{content.services_subheadline}</h2>
        <p>{content.services_paragraph}</p>
    </div>
    <div class="services-grid">
        <div class="svc-card reveal" use:reveal>
            <div class="svc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    ><path
                        d="M2 12h4l3-9 5 18 3-9h5"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    /></svg
                >
            </div>
            <div class="svc-num">01</div>
            <h3>{content.service_software_title}</h3>
            <p>{content.service_software_desc}</p>
        </div>
        <div class="svc-card reveal" use:reveal>
            <div class="svc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    ><rect
                        x="2"
                        y="3"
                        width="20"
                        height="14"
                        rx="2"
                        stroke-width="2"
                    /><path
                        d="M8 21h8M12 17v4"
                        stroke-width="2"
                        stroke-linecap="round"
                    /></svg
                >
            </div>
            <div class="svc-num">02</div>
            <h3>{content.service_marketing_title}</h3>
            <p>{content.service_marketing_desc}</p>
        </div>
        <div class="svc-card reveal" use:reveal>
            <div class="svc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    ><path
                        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                        stroke-width="2"
                    /><polyline
                        points="3.27 6.96 12 12.01 20.73 6.96"
                        stroke-width="2"
                    /><line x1="12" y1="22.08" x2="12" y2="12" stroke-width="2"
                    /></svg
                >
            </div>
            <div class="svc-num">03</div>
            <h3>{content.service_infra_title}</h3>
            <p>{content.service_infra_desc}</p>
        </div>
        <div class="svc-card reveal" use:reveal>
            <div class="svc-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                    <path d="M5 3v4"/>
                    <path d="M7 5H3"/>
                    <path d="M21 17v4"/>
                    <path d="M23 19h-4"/>
                </svg>
            </div>
            <div class="svc-num">04</div>
            <h3>{content.service_both_title}</h3>
            <p>{content.service_both_desc}</p>
        </div>
    </div>
</section>



<!-- PORTFOLIO / WORK -->
<section class="section reveal" id="work" use:reveal>
    <div class="section-label">{content.portfolio_headline}</div>
    <p class="section-sub">{content.portfolio_subheadline}</p>

    <div class="portfolio-grid-wrapper" style="margin: 4rem 0; width: 100%;">
        {#if isMobile}
            <div class="mobile-portfolio" style="display: block;">
                <SwipeCards 
                    items={portfolioData.map(p => ({
                        image: (p.images && p.images.length > 0) ? `/api/images/${p.images[0]}` : 'https://r2.k2ms.in/images/content_ph.jpg',
                        label: p.name,
                        alt: p.client || p.name
                    }))}
                    onItemClick={openProjectModal}
                />
            </div>
        {:else}
            <AccordionGallery 
                items={portfolioData.map(p => ({
                    image: (p.images && p.images.length > 0) ? `/api/images/${p.images[0]}` : 'https://r2.k2ms.in/images/content_ph.jpg',
                    label: p.name,
                    alt: p.client || p.name
                }))}
                onItemClick={openProjectModal}
            />
        {/if}
    </div>

    <!-- CLIENT LOGOS -->
    {#if clientLogos.length > 0}
        <div class="clients-strip" style="margin-top: 4rem;">
            <LogoLoop
                logos={clientLogos}
                speed={80}
                direction="left"
                logoHeight={36}
                gap={64}
                fadeOut={true}
                fadeOutColor="#111"
                pauseOnHover={true}
                scaleOnHover={true}
            />
        </div>
    {/if}
</section>



<!-- CONTACT MODAL -->
{#if showContactModal}
    <div 
        class="modal-backdrop" 
        role="button" 
        tabindex="0"
        onclick={() => (showContactModal = false)}
        onkeydown={(e) => { if(e.key === 'Escape' || e.key === 'Enter') showContactModal = false; }}
        style="backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); background: rgba(0,0,0,0.6);"
    >
        <div style="position: absolute; inset: 0; z-index: -1; opacity: 0.6; pointer-events: none;">
            <MagicRings 
                color="#F59E0B" 
                colorTwo="#FF4500" 
                speed={1.5} 
                opacity={0.8}
                noiseAmount={0.2}
                ringCount={8}
            />
        </div>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div 
            class="modal-content contact-modal" 
            role="dialog"
            onclick={(e) => e.stopPropagation()}
        >
            <div class="contact-modal-glow"></div>
            <button
                class="modal-close"
                aria-label="Close modal"
                onclick={() => (showContactModal = false)}>✕</button
            >
            <h2 class="contact-heading">{content.contact_headline}</h2>
            <form class="contact-form glass-form" onsubmit={handleSubmit}>
                <div class="form-row">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input id="name" type="text" name="name" placeholder="Your name" required />
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input id="email" type="email" name="email" placeholder="your@email.com" required />
                    </div>
                </div>
                <div class="form-group">
                    <label for="reason">What do you need?</label>
                    <div class="select-wrapper">
                        <select id="reason" name="reason" required>
                            <option value="" disabled selected>Select a reason</option>
                            <option value="software">Custom Software</option>
                            <option value="marketing">Digital Marketing</option>
                            <option value="both">Both</option>
                            <option value="other">Something Else</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="message">Tell us about your project</label>
                    <textarea id="message" name="message" rows="4" placeholder="The more detail, the better..." required></textarea>
                </div>
                
                <SpecularButton
                    type="submit"
                    className="contact-submit-specular"
                    radius={18}
                    baseColor="#F59E0B"
                    baseIntensity={1}
                    lineColor="#ffffff"
                    textColor="#ffffff"
                    intensity={1.5}
                    shineSize={20}
                    speed={0.5}
                    disabled={formLoading}
                >
                    {formLoading ? "Sending..." : "Send Message →"}
                </SpecularButton>

                {#if formStatus === "success"}
                    <div class="form-msg ok"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Message sent successfully!</div>
                {:else if formStatus === "error"}
                    <div class="form-msg err"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Something went wrong. Please try again.</div>
                {/if}
            </form>
        </div>
    </div>
{/if}

<!-- FOOTER -->
<footer class="footer">
    <div class="footer-inner">
        <div class="footer-brand">
            <img
                src={content.logoUrl}
                alt={content.companyName}
                class="footer-logo"
            />
            <p>{content.footer_tagline}</p>
            <p class="footer-copy">{content.footer_copyright}</p>
        </div>
        <div class="footer-cols">
            <div class="footer-col">
                <h4>Navigate</h4>
                <a href="#services">Services</a>
                <a href="#work">Portfolio</a>
                <a href="#contact">Contact</a>
            </div>
            <div class="footer-col">
                <h4>Connect</h4>
                <a
                    href="https://wa.me/917845299722?text=Hi"
                    target="_blank"
                    rel="noopener noreferrer">WhatsApp</a
                >
                <a href="mailto:hello@k2ms.in">Email</a>
            </div>
        </div>
    </div>
</footer>

<!-- PORTFOLIO MODAL (with carousel) -->
{#if selectedProject}
    <div 
        class="modal-backdrop" 
        role="button" 
        tabindex="0"
        onclick={() => (selectedProject = null)}
        onkeydown={(e) => { if(e.key === 'Escape' || e.key === 'Enter') selectedProject = null; }}
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div 
            class="modal-content" 
            role="dialog"
            onclick={(e) => e.stopPropagation()}
        >
            <button
                class="modal-close"
                aria-label="Close modal"
                onclick={() => (selectedProject = null)}>✕</button
            >
            <div class="modal-header">
                <h2 class="modal-title">{selectedProject.name}</h2>
                {#if selectedProject.client}
                    <p class="modal-client">Client: {selectedProject.client}</p>
                {/if}
                <div class="p-tags" style="margin-top: 1rem;">
                    {#each selectedProject.tags as tag}<span class="tag">{tag}</span>{/each}
                </div>
                {#if selectedProject.description}
                    <p class="modal-desc">{selectedProject.description}</p>
                {/if}
            </div>

            {#if selectedProject.images && selectedProject.images.length > 0}
                <div class="modal-carousel">
                    <img
                        src="/api/images/{selectedProject.images[currentImageIndex]}"
                        alt={selectedProject.name}
                        loading="lazy"
                    />
                    {#if selectedProject.images.length > 1}
                        <div class="carousel-controls">
                            <button class="carousel-btn" onclick={prevImage}>←</button>
                            <span class="carousel-indicator">{currentImageIndex + 1} / {selectedProject.images.length}</span>
                            <button class="carousel-btn" onclick={nextImage}>→</button>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
{/if}


<!-- WhatsApp FAB -->
<a
    href="https://wa.me/917845299722?text=Hi"
    class="wa-fab"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat on WhatsApp"
>
    <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26"
        ><path
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
        /></svg
    >
</a>
</main>

<style>
    /* ─── RESET / BASE ─── */
    :global(*, *::before, *::after) {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }
    :global(html) {
        scroll-behavior: smooth;
    }
    :global(body) {
        background: #111;
        color: #f0ede8;
        font-family: "Funnel Sans", "Inter", system-ui, sans-serif;
        font-size: 16px;
        line-height: 1.6;
        overflow-x: hidden;
    }
    :global(a) {
        color: inherit;
    }

    /* ─── NAV ─── */
    .global-bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: -1;
        overflow: hidden;
        pointer-events: none;
    }
    
    .hero {
        position: relative;
        min-height: 80vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 8rem 0 2rem;
        position: relative;
        overflow: hidden;
    }
    .nav {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 200;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.4rem 2.5rem;
        mix-blend-mode: normal;
    }
    .nav-brand {
        font-size: 0.92rem;
        font-weight: 500;
        letter-spacing: 0.01em;
        text-decoration: none;
        color: #f0ede8;
        text-transform: lowercase;
    }
    .nav-link {
        font-size: 0.88rem;
        font-weight: 400;
        text-decoration: none;
        color: rgba(240, 237, 232, 0.6);
        letter-spacing: 0.01em;
        transition: color 0.2s;
        text-transform: lowercase;
    }
    .nav-link:hover {
        color: #f0ede8;
    }

    /* ─── HERO ─── */
    .hero {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 10rem 0 4rem;
        position: relative;
        overflow: hidden;
    }
    .hero-display {
        padding: 0;
        line-height: 0.85;
        overflow: hidden;
    }
    .aurora-bg {
        position: absolute;
        inset: 0;
        z-index: -1;
    }

    :global(.hero-stroke-text) {
        font-size: clamp(4rem, 10vw, 8rem) !important;
        margin-left: -0.05em;
    }
    @media (max-width: 600px) {
        :global(.hero-stroke-text) {
            font-size: clamp(5.5rem, 15vw, 7rem) !important;
        }
    }

    .hero-sub-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2rem;
        padding: 2.5rem 2.5rem 0;
    }
    .hero-sub {
        max-width: 900px;
        font-size: 1.35rem;
        color: rgba(240, 237, 232, 0.65);
        line-height: 1.5;
        letter-spacing: 0.01em;
        flex-shrink: 0;
        text-align: center;
    }

    /* ─── SCROLL REVEAL ─── */
    .reveal {
        opacity: 0;
        transform: translateY(30px);
        transition:
            opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .reveal:global(.revealed) {
        opacity: 1;
        transform: translateY(0);
    }

    /* ─── BUTTONS ─── */
    .btn-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        padding: 0.75rem 1.75rem;
        background: #f0ede8;
        color: #111;
        font-weight: 600;
        font-size: 0.9rem;
        border-radius: 6px;
        text-decoration: none;
        border: none;
        cursor: pointer;
        font-family: inherit;
        transition:
            background 0.2s,
            transform 0.15s;
        white-space: nowrap;
    }
    .btn-primary:hover {
        background: #ddd9d3;
        transform: translateY(-1px);
    }
    .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    /* ─── SEPARATOR ─── */
    .sep {
        border: none;
        border-top: 1px dashed rgba(240, 237, 232, 0.12);
        margin: 0;
    }

    /* ─── SECTIONS ─── */
    .section {
        padding: 5rem 2.5rem;
    }
    .section-label {
        font-size: 0.72rem;
        font-weight: 500;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: rgba(240, 237, 232, 0.35);
        margin-bottom: 1.25rem;
    }
    .section-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 2rem;
        margin-bottom: 3rem;
    }
    .section-head h2 {
        font-size: clamp(1.8rem, 3vw, 2.75rem);
        font-weight: 600;
        letter-spacing: -0.04em;
        line-height: 1.1;
    }
    .section-head p {
        max-width: 400px;
        color: rgba(240, 237, 232, 0.6);
        line-height: 1.5;
    }
    .section-sub {
        font-size: 0.95rem;
        color: rgba(240, 237, 232, 0.45);
        max-width: 540px;
        margin-bottom: 3rem;
        line-height: 1.7;
    }

    /* ─── SERVICES ─── */
    .services-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
    }
    .svc-card {
        background: rgba(255, 255, 255, 0.04);
        border-radius: 32px;
        padding: 2.5rem 2rem;
        display: flex;
        flex-direction: column;
        border: 1px solid rgba(255, 255, 255, 0.05);
        transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        position: relative;
        overflow: hidden;
        box-shadow: 0 10px 30px -10px rgba(0,0,0,0.2);
    }
    .svc-card:hover {
        background: rgba(255, 255, 255, 0.08);
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 40px -15px rgba(0,0,0,0.4);
        border-color: rgba(255,255,255,0.1);
    }
    .svc-icon {
        width: 32px;
        height: 32px;
        color: #F59E0B;
        margin-bottom: 2rem;
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .svc-card:hover .svc-icon {
        transform: scale(1.15) rotate(5deg);
    }
    .svc-num {
        position: absolute;
        top: 2rem;
        right: 2rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: rgba(240, 237, 232, 0.15);
    }
    .svc-card h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #f0ede8;
    }
    .svc-card p {
        font-size: 0.95rem;
        line-height: 1.5;
        color: rgba(240, 237, 232, 0.6);
        margin-top: auto;
    }

    /* ─── MODAL & CAROUSEL ─── */
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        animation: fadeIn 0.3s ease;
    }
    .modal-content {
        background: #151515;
        border: 1px solid rgba(240, 237, 232, 0.1);
        border-radius: 20px;
        width: 100%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        padding: 3rem 2.5rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .modal-close {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        background: rgba(255,255,255,0.1);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        color: rgba(240, 237, 232, 0.8);
        font-size: 1.2rem;
        cursor: pointer;
        display: grid;
        place-items: center;
        transition:
            background 0.2s,
            transform 0.2s;
        z-index: 10;
    }
    .modal-close:hover {
        background: rgba(255,255,255,0.2);
        color: #fff;
        transform: scale(1.1) rotate(90deg);
    }
    .modal-header {
        margin-bottom: 2rem;
    }
    .modal-title {
        font-size: 2rem;
        font-weight: 700;
        letter-spacing: -0.03em;
        margin-bottom: 0.5rem;
    }
    .modal-client {
        font-size: 0.95rem;
        color: rgba(240, 237, 232, 0.6);
    }
    .modal-desc {
        font-size: 1.05rem;
        color: rgba(240, 237, 232, 0.75);
        margin-top: 1.5rem;
        line-height: 1.6;
        white-space: pre-line;
    }
    .modal-carousel {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        background: #0d0d0d;
        display: flex;
        flex-direction: column;
    }
    .modal-carousel img {
        width: 100%;
        aspect-ratio: 16/9;
        object-fit: contain;
        background: #050505;
        display: block;
    }
    .carousel-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 1rem;
        background: rgba(0,0,0,0.5);
        border-top: 1px solid rgba(255,255,255,0.05);
    }
    .carousel-btn {
        background: rgba(255,255,255,0.1);
        border: none;
        color: #fff;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        transition: background 0.2s;
        font-size: 1.2rem;
    }
    .carousel-btn:hover {
        background: rgba(255,255,255,0.2);
    }
    .carousel-indicator {
        font-size: 0.9rem;
        color: rgba(240,237,232,0.6);
        min-width: 40px;
        text-align: center;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes slideUp {
        from { opacity: 0; transform: translateY(40px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* ─── PORTFOLIO GRID ─── */
    .category-header {
        margin-bottom: 2.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(240, 237, 232, 0.08);
    }
    .category-header h3 {
        font-size: 1.25rem;
        font-weight: 500;
        color: #f0ede8;
    }
    .portfolio-grid {
        columns: 2 400px;
        column-gap: 2.5rem;
    }
    .p-card {
        break-inside: avoid;
        margin-bottom: 2.5rem;
        display: flex;
        flex-direction: column;
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(240, 237, 232, 0.08);
        background: rgba(20, 20, 20, 0.5);
        transition:
            border-color 0.4s,
            transform 0.4s,
            box-shadow 0.4s;
        text-decoration: none;
        cursor: pointer;
    }
    .p-card:hover {
        border-color: rgba(240, 237, 232, 0.3);
        box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.4);
    }

    .p-img {
        width: 100%;
        height: 260px;
        flex-grow: 0;
        position: relative;
    }
    .p-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
    .p-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0);
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        padding: 1rem;
        transition: background 0.25s;
    }
    .p-card:hover .p-overlay {
        background: rgba(0, 0, 0, 0.35);
    }
    .p-view {
        font-size: 0.8rem;
        font-weight: 500;
        color: #f0ede8;
        opacity: 0;
        transform: translateY(4px);
        transition:
            opacity 0.2s,
            transform 0.2s;
    }
    .p-card:hover .p-view {
        opacity: 1;
        transform: translateY(0);
    }

    /* Info bar at bottom of card */
    .p-info {
        padding: 1.25rem;
        border-top: 1px solid rgba(240, 237, 232, 0.06);
    }
    .p-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
        margin-bottom: 0.8rem;
    }
    .tag {
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: rgba(240, 237, 232, 0.06);
        color: rgba(240, 237, 232, 0.8);
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        white-space: nowrap;
    }
    .p-title-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    .p-name {
        font-size: 1.15rem;
        font-weight: 500;
        color: #f0ede8;
    }
    .p-desc {
        font-size: 0.85rem;
        color: rgba(240, 237, 232, 0.6);
        margin-top: 0.5rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    /* Client logo chip */
    .p-logo-chip {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        overflow: hidden;
    }
    .p-logo-chip img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
    }

    /* ─── CONTACT ─── */
    .contact-layout {
        display: grid;
        grid-template-columns: 1fr 1.6fr;
        gap: 5rem;
        align-items: start;
    }
    .contact-heading {
        font-size: clamp(1.5rem, 2.5vw, 2.2rem);
        font-weight: 600;
        letter-spacing: -0.04em;
        line-height: 1.2;
        margin-bottom: 2rem;
    }
    .contact-meta {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
    }
    .meta-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(240, 237, 232, 0.06);
        padding-bottom: 0.75rem;
    }
    .meta-label {
        font-size: 0.8rem;
        color: rgba(240, 237, 232, 0.35);
    }
    .meta-val {
        font-size: 0.88rem;
        font-weight: 500;
    }

    .contact-form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }
    .form-group label {
        font-size: 0.78rem;
        font-weight: 500;
        color: rgba(240, 237, 232, 0.4);
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }
    .form-group input,
    .form-group select,
    .form-group textarea {
        padding: 0.8rem 1rem;
        border-radius: 6px;
        border: 1px solid rgba(240, 237, 232, 0.1);
        background: rgba(255, 255, 255, 0.03);
        color: #f0ede8;
        font-family: inherit;
        font-size: 0.9rem;
        transition: border-color 0.2s;
        resize: vertical;
    }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: rgba(240, 237, 232, 0.3);
    }
    .form-group select {
        cursor: pointer;
    }
    .form-group select option {
        background: #1a1a1a;
    }
    ::placeholder {
        color: rgba(240, 237, 232, 0.25);
    }
    .form-msg {
        font-size: 0.85rem;
    }
    .contact-modal {
        max-width: 500px !important;
        padding: 3.5rem 3rem !important;
        background: rgba(15, 15, 15, 0.45) !important;
        backdrop-filter: blur(40px) saturate(1.5);
        -webkit-backdrop-filter: blur(40px) saturate(1.5);
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 0 80px -20px rgba(245, 158, 11, 0.15) !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        max-height: 90vh !important;
    }
    .contact-modal-glow {
        position: absolute;
        top: -50px;
        left: 50%;
        transform: translateX(-50%);
        width: 150px;
        height: 150px;
        background: radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0) 70%);
        pointer-events: none;
        z-index: 0;
    }
    .contact-heading {
        margin-bottom: 0.5rem;
        font-size: 2rem;
        text-align: center;
        background: linear-gradient(135deg, #fff, rgba(255,255,255,0.6));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        position: relative;
        z-index: 1;
    }
    .contact-subheading {
        text-align: center;
        color: rgba(240, 237, 232, 0.5);
        font-size: 0.95rem;
        margin-bottom: 2.5rem;
        position: relative;
        z-index: 1;
    }
    .glass-form {
        position: relative;
        z-index: 1;
    }
    .glass-form input,
    .glass-form select,
    .glass-form textarea {
        width: 100% !important;
        box-sizing: border-box !important;
        background: rgba(255, 255, 255, 0.03) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        color: #fff !important;
        border-radius: 12px !important;
        padding: 1rem 1.25rem !important;
        font-size: 0.95rem !important;
        transition: all 0.3s ease !important;
        appearance: none;
        -webkit-appearance: none;
    }
    .glass-form input:focus,
    .glass-form select:focus,
    .glass-form textarea:focus {
        border-color: rgba(245, 158, 11, 0.5) !important;
        background: rgba(255, 255, 255, 0.06) !important;
        box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1) !important;
        outline: none;
    }
    .glass-form label {
        font-size: 0.82rem !important;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.7) !important;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.5rem;
    }
    .select-wrapper {
        position: relative;
    }
    .select-wrapper::after {
        content: '▼';
        position: absolute;
        top: 50%;
        right: 1.25rem;
        transform: translateY(-50%);
        color: rgba(255,255,255,0.4);
        font-size: 0.7rem;
        pointer-events: none;
    }
    :global(.contact-submit-specular) {
        width: 100% !important;
        margin-top: 0.5rem;
        background: rgba(255, 255, 255, 0.05) !important;
    }
    :global(.contact-submit-specular:disabled) {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .form-msg {
        margin-top: 1.5rem;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem;
        border-radius: 10px;
    }
    .form-msg.ok {
        background: rgba(74, 222, 128, 0.1);
        color: #4ade80;
        border: 1px solid rgba(74, 222, 128, 0.2);
    }
    .form-msg.err {
        background: rgba(248, 113, 113, 0.1);
        color: #f87171;
        border: 1px solid rgba(248, 113, 113, 0.2);
    }

    /* ─── FOOTER ─── */
    .footer {
        padding: 3.5rem 2.5rem 1rem;
        border-top: 1px solid rgba(240, 237, 232, 0.06);
        background: #0d0d0d;
    }
    .footer-inner {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 2.5rem;
    }
    .footer-brand {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        gap: 0.6rem;
    }
    .footer-logo {
        height: 56px;
        width: auto;
    }
    .footer-brand p {
        font-size: 0.82rem;
        color: rgba(240, 237, 232, 0.35);
    }
    .footer-copy {
        margin-top: 1rem;
        font-size: 0.78rem !important;
        color: rgba(240, 237, 232, 0.25) !important;
    }

    .footer-cols {
        display: flex;
        gap: 4rem;
    }
    .footer-col {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    .footer-col h4 {
        font-size: 0.72rem;
        font-weight: 500;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: rgba(240, 237, 232, 0.3);
        margin-bottom: 0.25rem;
    }
    .footer-col a {
        font-size: 0.88rem;
        color: rgba(240, 237, 232, 0.55);
        text-decoration: none;
        transition: color 0.2s;
    }
    .footer-col a:hover {
        color: #f0ede8;
    }

    /* ─── WHATSAPP FAB ─── */
    .wa-fab {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: #25d366;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        z-index: 300;
        transition:
            transform 0.2s,
            background 0.2s;
    }
    .wa-fab:hover {
        transform: scale(1.15) rotate(-5deg);
        background: #1ebe5c;
    }



    /* ─── MOBILE PORTFOLIO ─── */
    .mobile-portfolio {
        display: block;
    }

    /* ─── RESPONSIVE ─── */
    @media (max-width: 900px) {
        .hero-sub-wrap {
            flex-direction: column;
            align-items: flex-start;
            padding: 2rem 1.5rem 0;
        }
        .section {
            padding: 4rem 1.5rem;
        }
        .services-grid {
            grid-template-columns: 1fr 1fr;
            border-radius: 8px;
        }
        .contact-layout {
            grid-template-columns: 1fr;
            gap: 3rem;
        }
        .form-row {
            grid-template-columns: 1fr;
        }
        .footer-inner {
            flex-direction: column;
            gap: 2rem;
        }
        .footer-cols {
            gap: 2.5rem;
        }
    }

    @media (max-width: 600px) {
        .hero {
            min-height: auto;
            justify-content: flex-start;
            padding-top: 8rem;
            padding-bottom: 2rem;
            text-align: center;
        }
        .nav {
            padding: 1.2rem 1.5rem;
        }
        .hero-headline {
            font-size: 17vw;
            line-height: 0.9;
            margin-top: 0;
        }
        .hero-sub {
            font-size: 1.1rem;
            text-align: center;
        }
        .hero-sub-wrap {
            align-items: center;
            justify-content: center;
            padding: 1.5rem 1.5rem 0;
        }
        .section {
            padding: 3rem 1.25rem;
        }
        .services-grid {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .services-grid .svc-card {
            position: sticky;
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            background: rgba(20, 20, 20, 0.85);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 2rem;
            box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
        }
        .services-grid .svc-card:nth-child(1) { top: 100px; z-index: 1; }
        .services-grid .svc-card:nth-child(2) { top: 125px; z-index: 2; }
        .services-grid .svc-card:nth-child(3) { top: 150px; z-index: 3; }
        .services-grid .svc-card:nth-child(4) { top: 175px; z-index: 4; }
        .portfolio-grid {
            columns: 1;
            column-gap: 0;
        }
        .p-card {
            margin-bottom: 2rem;
        }
        .contact-modal {
            padding: 2.5rem 1.5rem !important;
        }
    }
</style>
