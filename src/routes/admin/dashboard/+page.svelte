<script>
    import { onMount } from "svelte";

    let { data } = $props();

    // The data is bound to state to allow editing
    // svelte-ignore state_referenced_locally
    let content = $state(JSON.parse(JSON.stringify(data.content || {})));
    // svelte-ignore state_referenced_locally
    let portfolio = $state(JSON.parse(JSON.stringify(data.portfolio || [])));

    let status = $state("");

    let search = $state("");

    async function save() {
        status = "Saving...";
        try {
            const res = await fetch("/api/save-all", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, portfolio }),
            });
            status = res.ok ? "Saved successfully" : "Error saving";
            setTimeout(() => (status = ""), 3000);
        } catch (e) {
            status = "Error: " + e.message;
        }
    }

    // filtering content
    let filteredContent = $derived(
        search.trim() === ""
            ? []
            : Object.entries(content).filter(
                  ([k, v]) =>
                      k.toLowerCase().includes(search.toLowerCase()) ||
                      String(v).toLowerCase().includes(search.toLowerCase()),
              ),
    );

    async function uploadImages(e, callback) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        status = "Uploading...";
        let uploaded = [];

        for (const file of files) {
            const formData = new FormData();
            formData.append("image", file);
            try {
                const res = await fetch("/api/upload-image", {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();
                if (res.ok) {
                    uploaded.push(data.filename);
                }
            } catch (err) {
                console.error(err);
            }
        }
        if (uploaded.length > 0) {
            callback(uploaded);
            status = "Uploaded successfully";
        } else {
            status = "Upload failed";
        }
        setTimeout(() => (status = ""), 3000);
        e.target.value = "";
    }
</script>

<svelte:head>
    <title>K2MS CMS</title>
</svelte:head>

<div class="admin-ui">
    <header>
        <div class="head-left">
            <h1>K2MS CMS</h1>
        </div>
        <div class="actions">
            <span class="status">{status}</span>
            <button onclick={save} class="btn">Save Changes</button>
            <a href="/" target="_blank" class="btn outline">View Site ↗</a>
        </div>
    </header>

    <main>
        <section class="panel">
            <div class="panel-head">
                <h2>Content Dictionary</h2>
                <input
                    type="text"
                    bind:value={search}
                    placeholder="Search keys or text..."
                    class="search-box"
                />
            </div>
            <div class="list content-grid">
                {#if search.trim() === ""}
                    <div class="empty-search">
                        Type in the search box to find and edit content keys...
                    </div>
                {/if}
                {#each filteredContent as [key, val]}
                    <div class="field">
                        <label>{key}</label>
                        <textarea
                            value={val}
                            oninput={(e) => (content[key] = e.target.value)}
                            rows={String(val).length > 80 ? 3 : 1}
                        ></textarea>
                    </div>
                {/each}
            </div>
        </section>

        <section class="panel">
            <div class="panel-head">
                <h2>Portfolio Projects</h2>
            </div>
            <div class="list">
                {#each portfolio as proj, i}
                    <div class="card">
                        <div class="card-header">
                            <input
                                type="text"
                                bind:value={proj.name}
                                placeholder="Project Name"
                                class="title-input"
                            />
                        </div>
                        <div class="field-row">
                            <!-- svelte-ignore a11y_label_has_associated_control -->
                            <label>Client</label>
                            <input type="text" bind:value={proj.client} placeholder="Client name" />
                        </div>
                        <div class="field-row">
                            <!-- svelte-ignore a11y_label_has_associated_control -->
                            <label>Tags</label>
                            <input type="text" 
                                value={proj.tags.join(', ')}
                                oninput={(e) =>
                                    (proj.tags = e.target.value
                                        .split(",")
                                        .map((s) => s.trim())
                                        .filter(Boolean))}
                                placeholder="e.g. Svelte, Node.js"
                            />
                        </div>
                        <div class="field-row">
                            <label>Images</label>
                            <div class="img-list">
                                {#each proj.images || [] as img, imgIdx}
                                    <div class="img-badge">
                                        <img
                                            src="/api/images/{img}"
                                            alt="preview"
                                            class="img-thumb"
                                        />
                                        <div class="img-actions">
                                            {#if imgIdx > 0}
                                                <button type="button" class="move-btn" onclick={() => {
                                                    const temp = proj.images[imgIdx - 1];
                                                    proj.images[imgIdx - 1] = proj.images[imgIdx];
                                                    proj.images[imgIdx] = temp;
                                                }}>←</button>
                                            {/if}
                                            {#if imgIdx < proj.images.length - 1}
                                                <button type="button" class="move-btn" onclick={() => {
                                                    const temp = proj.images[imgIdx + 1];
                                                    proj.images[imgIdx + 1] = proj.images[imgIdx];
                                                    proj.images[imgIdx] = temp;
                                                }}>→</button>
                                            {/if}
                                        </div>
                                        <button
                                            type="button"
                                            class="del-btn"
                                            onclick={() =>
                                                proj.images.splice(imgIdx, 1)}
                                            >✕</button
                                        >
                                    </div>
                                {/each}
                                <label class="file-upload-btn">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onchange={(e) =>
                                            uploadImages(e, (names) => {
                                                proj.images = [
                                                    ...(proj.images || []),
                                                    ...names,
                                                ];
                                            })}
                                    />
                                    <span>+ Add Image(s)</span>
                                </label>
                            </div>
                        </div>
                        <div class="field-row">
                            <label>Logo</label>
                            <div class="img-list">
                                {#if proj.logo}
                                    <div class="img-badge">
                                        <img
                                            src="/api/images/{proj.logo}"
                                            alt="preview"
                                            class="img-thumb"
                                        />
                                        <button
                                            type="button"
                                            class="del-btn"
                                            onclick={() => (proj.logo = "")}
                                            >✕</button
                                        >
                                    </div>
                                {:else}
                                    <label class="file-upload-btn">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onchange={(e) =>
                                            uploadImages(e, (names) => {
                                                proj.logo = names[0];
                                            })}
                                    />
                                    <span>+ Add Logo</span>
                                    </label>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </section>
    </main>
</div>

<style>
    :global(body) {
        background: #09090b;
        margin: 0;
        font-family:
            "Inter",
            system-ui,
            -apple-system,
            sans-serif;
        color: #ededed;
    }

    .admin-ui {
        max-width: 1100px;
        margin: 0 auto;
        padding: 3rem 2rem;
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #f0ede8;
    }
    .head-left {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    header h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
    }

    .actions {
        display: flex;
        gap: 1rem;
        align-items: center;
    }
    .status {
        color: #4ade80;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .btn {
        padding: 0.65rem 1.25rem;
        background: #ededed;
        color: #09090b;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        text-decoration: none;
        font-size: 0.9rem;
        transition: opacity 0.2s;
    }
    .btn.outline {
        background: transparent;
        color: #ededed;
        border: 1px solid #333;
    }
    .btn:hover {
        opacity: 0.8;
    }

    .panel {
        background: #121214;
        border: 1px solid #222;
        border-radius: 10px;
        margin-bottom: 2.5rem;
        padding: 2rem;
    }
    .panel-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }
    .panel-head h2 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 500;
        color: #a1a1aa;
    }
    .search-box {
        padding: 0.6rem 1rem;
        border-radius: 6px;
        border: 1px solid #333;
        background: #09090b;
        color: #fff;
        width: 320px;
        font-size: 0.9rem;
    }

    .content-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }
    .field label {
        font-size: 0.75rem;
        color: #71717a;
        font-family: ui-monospace, monospace;
    }
    textarea,
    input[type="text"] {
        padding: 0.75rem 1rem;
        border-radius: 6px;
        border: 1px solid #27272a;
        background: #09090b;
        color: #ededed;
        font-family: inherit;
        font-size: 0.9rem;
        resize: vertical;
        width: 100%;
        box-sizing: border-box;
        transition: border-color 0.2s;
    }
    textarea:focus,
    input:focus {
        border-color: #52525b;
        outline: none;
    }

    .list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .card {
        background: #09090b;
        border: 1px solid #27272a;
        padding: 1.5rem;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 4px;
    }
    .title-input {
        font-size: 1.25rem !important;
        font-weight: 600;
        border: none !important;
        background: transparent !important;
        padding: 0 !important;
        width: 70% !important;
    }
    .title-input:focus {
        border-bottom: 1px solid #52525b !important;
        border-radius: 0 !important;
    }

    .field-row {
        display: grid;
        grid-template-columns: 140px 1fr;
        align-items: center;
        gap: 1rem;
    }
    .field-row label {
        font-size: 0.85rem;
        color: #a1a1aa;
    }
    .empty-search {
        padding: 2rem;
        color: rgba(240, 237, 232, 0.4);
        text-align: center;
        grid-column: 1 / -1;
    }

    .img-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }
    .img-badge {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        background: rgba(240, 237, 232, 0.05);
        border: 1px solid rgba(240, 237, 232, 0.1);
        border-radius: 8px;
        overflow: hidden;
        position: relative;
    }
    .img-thumb {
        width: 80px;
        height: 60px;
        object-fit: cover;
        display: block;
    }
    .img-badge .del-btn {
        position: absolute;
        top: 2px;
        right: 2px;
        background: rgba(0, 0, 0, 0.6);
        border: none;
        color: #fff;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
    }
    .img-badge .del-btn:hover {
        background: #ef4444;
    }
    .img-actions {
        display: flex;
        background: rgba(0,0,0,0.6);
        border-radius: 4px;
        position: absolute;
        bottom: 2px;
        left: 50%;
        transform: translateX(-50%);
        overflow: hidden;
    }
    .move-btn {
        background: transparent;
        border: none;
        color: #fff;
        cursor: pointer;
        padding: 2px 6px;
        font-size: 0.7rem;
    }
    .move-btn:hover {
        background: rgba(255,255,255,0.2);
    }
    .file-upload-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 60px;
        padding: 0 1rem;
        background: rgba(240, 237, 232, 0.05);
        border: 1px dashed rgba(240, 237, 232, 0.2);
        border-radius: 8px;
        cursor: pointer;
        color: rgba(240, 237, 232, 0.6);
        font-size: 0.85rem;
        transition:
            background 0.2s,
            color 0.2s;
    }
    .file-upload-btn:hover {
        background: rgba(240, 237, 232, 0.1);
        color: #f0ede8;
    }
    .file-upload-btn input[type="file"] {
        display: none;
    }
</style>
