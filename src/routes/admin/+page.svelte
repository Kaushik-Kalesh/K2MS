<script>
    import { enhance } from "$app/forms";
    let { form } = $props();

    let pinInput = $state("");
    let formElement;

    $effect(() => {
        if (pinInput.length === 4 && formElement) {
            formElement.submit();
        }
    });
</script>

<svelte:head>
    <title>Admin Login | K2M Services</title>
</svelte:head>

<div class="login-page">
    <div class="login-box">
        <div class="icon">🔒</div>
        <h2>Admin Access</h2>
        <p>Enter your PIN to manage the website</p>

        <form method="POST" action="?/login" bind:this={formElement} use:enhance>
            <div class="input-group">
                <input
                    type="password"
                    name="pin"
                    bind:value={pinInput}
                    placeholder="••••"
                    maxlength="4"
                    autofocus
                    class={form?.error ? 'error' : ''}
                />
            </div>
            <div class="error-container">
                {#if form?.error}
                    <p class="error-text">{form.error}</p>
                {/if}
            </div>
        </form>

        <a href="/" class="back-link">&larr; Back to Website</a>
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        background: #111;
        font-family: system-ui, -apple-system, sans-serif;
        color: #f0ede8;
    }

    .login-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }

    .login-box {
        background: #191919;
        border: 1px solid rgba(240, 237, 232, 0.08);
        border-radius: 24px;
        padding: 2.5rem;
        width: 100%;
        max-width: 380px;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }

    .icon {
        font-size: 3rem;
        margin-bottom: 1.5rem;
    }

    h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
    }

    p {
        color: rgba(240, 237, 232, 0.6);
        font-size: 0.9rem;
        margin: 0 0 2rem 0;
    }

    .input-group {
        margin-bottom: 0.5rem;
    }

    input {
        width: 100%;
        text-align: center;
        font-size: 2rem;
        letter-spacing: 0.5em;
        padding-left: 0.5em;
        padding-top: 1rem;
        padding-bottom: 1rem;
        border-radius: 12px;
        background: rgba(20, 20, 20, 0.5);
        border: 1px solid rgba(240, 237, 232, 0.1);
        color: #fff;
        transition: border-color 0.2s, background 0.2s;
    }

    input:focus {
        outline: none;
        border-color: rgba(240, 237, 232, 0.3);
        background: rgba(30, 30, 30, 0.8);
    }

    input.error {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.05);
    }

    .error-container {
        height: 24px;
        margin-top: 0.5rem;
    }

    .error-text {
        color: #ef4444;
        font-size: 0.85rem;
        margin: 0;
        animation: shake 0.3s ease-in-out;
    }

    .back-link {
        display: inline-block;
        margin-top: 1.5rem;
        font-size: 0.85rem;
        color: rgba(240, 237, 232, 0.4);
        text-decoration: none;
        transition: color 0.2s;
    }

    .back-link:hover {
        color: #f0ede8;
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
</style>
