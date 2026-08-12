<script>
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    let { data } = $props();
    let content = $derived(data.content || {});
    let portfolioData = $derived(data.portfolio || []);
    let softwareProjects = $derived(portfolioData.filter(p => p.category === 'software'));
    let marketingProjects = $derived(portfolioData.filter(p => p.category === 'marketing'));

    let formStatus = $state("");
    let formLoading = $state(false);
    let selectedProject = $state(null);

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
            { threshold: 0.1 },
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


<!-- NAV -->
<nav class="nav">
    <a href="/" class="nav-brand">{content.companyName || "K2M Services"}</a>
    <a href="#services" class="nav-link">about us</a>
    <a href="#work" class="nav-link">work</a>
    <a href="#contact" class="nav-link">start a project</a>
</nav>

<!-- HERO -->
<section class="hero">
    <div class="hero-display">
        <h1
            class="hero-headline glitch"
            data-text={content.hero_headline || "K2M Services"}
        >
            {content.hero_headline || "K2M Services"}
        </h1>
    </div>
    <div class="hero-sub-wrap">
        <p class="hero-sub">{content.hero_subheadline}</p>
    </div>
</section>

<!-- DASHED SEPARATOR -->
<hr class="sep" />

<!-- SERVICES -->
<section class="section reveal" id="services" use:reveal>
    <div class="section-label">what we do</div>
    <div class="section-head">
        <h2>{content.services_headline}</h2>
        <p>{content.services_subheadline}</p>
    </div>
    <div class="services-grid">
        <div class="service-card">
            <svg
                class="svc-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                ><polyline points="16 18 22 12 16 6" /><polyline
                    points="8 6 2 12 8 18"
                /></svg
            >
            <div class="svc-num">01</div>
            <h3>{content.service_software_title}</h3>
            <p>{content.service_software_desc}</p>
        </div>
        <div class="service-card">
            <svg
                class="svc-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                ><path d="M3 11l18-5v12L3 14v-3z" /><path
                    d="M11.6 16.8a3 3 0 1 1-5.8-1.6"
                /></svg
            >
            <div class="svc-num">02</div>
            <h3>{content.service_marketing_title}</h3>
            <p>{content.service_marketing_desc}</p>
        </div>
        <div class="service-card">
            <svg
                class="svc-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                ><rect x="2" y="2" width="20" height="8" rx="2" /><rect
                    x="2"
                    y="14"
                    width="20"
                    height="8"
                    rx="2"
                /><line x1="6" y1="6" x2="6.01" y2="6" /><line
                    x1="6"
                    y1="18"
                    x2="6.01"
                    y2="18"
                /></svg
            >
            <div class="svc-num">03</div>
            <h3>{content.service_infra_title}</h3>
            <p>{content.service_infra_desc}</p>
        </div>
        <div class="service-card featured">
            <svg
                class="svc-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                ><path
                    d="M6 12L3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12zm0 0h7.5"
                /></svg
            >
            <div class="svc-num">04</div>
            <h3>{content.service_both_title}</h3>
            <p>{content.service_both_desc}</p>
        </div>
    </div>
</section>

<hr class="sep" />

<!-- PORTFOLIO -->
<section class="section reveal" id="work" use:reveal>
    <div class="section-label">{content.portfolio_headline}</div>
    <p class="section-sub">{content.portfolio_subheadline}</p>

    <div class="category-header">
        <h3>Software Solutions</h3>
    </div>
    <div class="portfolio-grid">
        {#each softwareProjects as project}
            {@const hasImage = project.images && project.images.length > 0}
            <a class="p-card reveal" use:reveal href="#" onclick={(e) => { e.preventDefault(); selectedProject = project; }}>
                <!-- Image area -->
                {#if hasImage}
                    <div class="p-img">
                        <img src="/api/images/{project.images[0]}" alt={project.name} loading="lazy" />
                        <div class="p-overlay">
                            <span class="p-view">View Project →</span>
                        </div>
                    </div>
                {/if}

                <!-- Info bar -->
                <div class="p-info">
                    <div class="p-tags">
                        {#each project.tags as tag}<span class="tag">{tag}</span>{/each}
                    </div>
                    <div class="p-title-row">
                        {#if project.logo}
                            <div class="p-logo-chip">
                                <img src="/api/images/{project.logo}" alt={project.client} />
                            </div>
                        {/if}
                        <h3 class="p-name">{project.name}</h3>
                    </div>
                    {#if project.description}
                        <p class="p-desc">{project.description}</p>
                    {/if}
                </div>
            </a>
        {/each}
    </div>

    <div class="category-header" style="margin-top: 5rem;">
        <h3>Digital Marketing</h3>
    </div>
    <div class="portfolio-grid">
        {#each marketingProjects as project}
            {@const hasImage = project.images && project.images.length > 0}
            <a class="p-card reveal" use:reveal href="#" onclick={(e) => { e.preventDefault(); selectedProject = project; }}>
                <!-- Image area -->
                {#if hasImage}
                    <div class="p-img">
                        <img src="/api/images/{project.images[0]}" alt={project.name} loading="lazy" />
                        <div class="p-overlay">
                            <span class="p-view">View Project →</span>
                        </div>
                    </div>
                {/if}

                <!-- Info bar -->
                <div class="p-info">
                    <div class="p-tags">
                        {#each project.tags as tag}<span class="tag">{tag}</span>{/each}
                    </div>
                    <div class="p-title-row">
                        {#if project.logo}
                            <div class="p-logo-chip">
                                <img src="/api/images/{project.logo}" alt={project.client} />
                            </div>
                        {/if}
                        <h3 class="p-name">{project.name}</h3>
                    </div>
                    {#if project.description}
                        <p class="p-desc">{project.description}</p>
                    {/if}
                </div>
            </a>
        {/each}
    </div>
</section>

<hr class="sep" />

<!-- CONTACT -->
<section class="section contact-section reveal" id="contact" use:reveal>
    <div class="contact-layout">
        <div class="contact-left">
            <div class="section-label">{content.contact_headline}</div>
            <h2 class="contact-heading">{content.contact_subheadline}</h2>
            <div class="contact-meta">
                <div class="meta-item">
                    <span class="meta-label">Response Time</span><span
                        class="meta-val">Within 24 hours</span
                    >
                </div>
                <div class="meta-item">
                    <span class="meta-label">Location</span><span
                        class="meta-val">Chennai, India</span
                    >
                </div>
                <div class="meta-item">
                    <span class="meta-label">Availability</span><span
                        class="meta-val">Anytime</span
                    >
                </div>
            </div>
        </div>
        <form class="contact-form" onsubmit={handleSubmit}>
            <div class="form-row">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Your name"
                        required
                    />
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        required
                    />
                </div>
            </div>
            <div class="form-group">
                <label for="reason">What do you need?</label>
                <select id="reason" name="reason" required>
                    <option value="" disabled selected>Select a reason</option>
                    <option value="software">Custom Software</option>
                    <option value="marketing">Digital Marketing</option>
                    <option value="both">Both</option>
                    <option value="other">Something Else</option>
                </select>
            </div>
            <div class="form-group">
                <label for="message">Tell us about your project</label>
                <textarea
                    id="message"
                    name="message"
                    rows="5"
                    placeholder="The more detail, the better..."
                    required
                ></textarea>
            </div>
            <button type="submit" class="btn-primary" disabled={formLoading}>
                {formLoading ? "Sending..." : "Send Message →"}
            </button>
            {#if formStatus === "success"}
                <p class="form-msg ok">
                    ✓ Message sent! We'll be in touch soon.
                </p>
            {:else if formStatus === "error"}
                <p class="form-msg err">
                    Something went wrong. Please try again.
                </p>
            {/if}
        </form>
    </div>
</section>

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

<!-- PORTFOLIO MODAL -->
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
                    {#each selectedProject.tags as tag}<span class="tag"
                            >{tag}</span
                        >{/each}
                </div>
                {#if selectedProject.description}
                    <p class="modal-desc">{selectedProject.description}</p>
                {/if}
            </div>

            {#if selectedProject.images && selectedProject.images.length > 0}
                <div class="modal-gallery">
                    {#each selectedProject.images as img}
                        <img
                            src="/api/images/{img}"
                            alt={selectedProject.name}
                            loading="lazy"
                        />
                    {/each}
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
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 0 0 4rem;
        position: relative;
        overflow: hidden;
    }
    .hero-display {
        padding: 0;
        line-height: 0.85;
        overflow: hidden;
    }
    .hero-headline {
        position: relative;
        font-size: clamp(10vw, 15vw, 18vw);
        font-weight: 700;
        letter-spacing: -0.05em;
        line-height: 0.85;
        color: #f0ede8;
        text-transform: lowercase;
        white-space: normal;
        word-break: break-word;
        margin-left: -0.02em;
        padding-bottom: 0.05em;
    }

    .glitch {
        animation: glitch-skew 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both
            infinite;
    }

    @keyframes glitch-skew {
        0% {
            text-shadow: none;
            transform: skew(0deg);
        }
        2% {
            text-shadow:
                -2px 0 #ff00c1,
                2px 1px #00fff9;
            transform: skew(-4deg);
        }
        4% {
            text-shadow:
                2px 0 #ff00c1,
                -2px -1px #00fff9;
            transform: skew(4deg);
        }
        6% {
            text-shadow: none;
            transform: skew(0deg);
        }
        100% {
            text-shadow: none;
            transform: skew(0deg);
        }
    }

    .hero-sub-wrap {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: flex-end;
        gap: 2rem;
        padding: 2.5rem 2.5rem 0;
    }
    .hero-sub {
        max-width: 580px;
        font-size: 1.35rem;
        color: rgba(240, 237, 232, 0.65);
        line-height: 1.5;
        letter-spacing: 0.01em;
        flex-shrink: 0;
        white-space: pre-line;
    }

    /* ─── SCROLL REVEAL ─── */
    .reveal {
        opacity: 0;
        transform: translateY(30px);
        transition:
            opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    :global(.revealed) {
        opacity: 1 !important;
        transform: none !important;
    }

    /* ─── BUTTONS ─── */
    .btn-primary {
        display: inline-flex;
        align-items: center;
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
        font-size: 0.92rem;
        color: rgba(240, 237, 232, 0.5);
        line-height: 1.7;
        text-align: right;
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
        border: 1px solid rgba(240, 237, 232, 0.08);
        border-radius: 10px;
        overflow: hidden;
    }
    .service-card {
        position: relative;
        padding: 2.25rem 1.75rem;
        border-right: 1px solid rgba(240, 237, 232, 0.08);
        transition: background 0.25s;
    }
    .service-card:last-child {
        border-right: none;
    }
    .service-card:hover {
        background: rgba(255, 255, 255, 0.03);
    }
    .service-card.featured {
        background: rgba(240, 237, 232, 0.03);
    }
    .svc-icon {
        width: 24px;
        height: 24px;
        color: rgba(240, 237, 232, 0.35);
        margin-bottom: 1.25rem;
    }
    .svc-num {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        font-size: 0.7rem;
        font-weight: 500;
        letter-spacing: 0.08em;
        color: rgba(240, 237, 232, 0.2);
    }
    .service-card h3 {
        font-size: 1rem;
        font-weight: 600;
        letter-spacing: -0.02em;
        margin-bottom: 0.6rem;
    }
    .service-card p {
        font-size: 0.85rem;
        color: rgba(240, 237, 232, 0.5);
        line-height: 1.65;
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
    .form-msg.ok {
        color: #4ade80;
    }
    .form-msg.err {
        color: #f87171;
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

    /* ─── MODAL ─── */
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
        border-radius: 12px;
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
        background: none;
        border: none;
        color: rgba(240, 237, 232, 0.5);
        font-size: 1.5rem;
        cursor: pointer;
        transition:
            color 0.2s,
            transform 0.2s;
    }
    .modal-close:hover {
        color: #f0ede8;
        transform: scale(1.1) rotate(90deg);
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
    .modal-gallery {
        margin-top: 2.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    .modal-gallery img {
        width: 100%;
        border-radius: 8px;
        display: block;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    /* ─── RESPONSIVE ─── */
    @media (max-width: 900px) {
        .hero-headline {
            font-size: 15vw;
        }
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
            grid-template-columns: 1fr;
        }
        .portfolio-grid {
            columns: 1;
            column-gap: 0;
        }
        .p-card {
            min-height: 280px;
            margin-bottom: 2rem;
        }
    }
</style>
