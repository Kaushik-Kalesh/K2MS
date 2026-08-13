<script>
  import { page } from '$app/stores';
  let { children, data } = $props();
  let content = $derived(data?.content || {});

  let schema = $derived({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": content.companyName || "K2M Services",
    "url": $page.url.origin,
    "logo": $page.url.origin + "/favicon.svg",
    "description": content.metaDescription || "Custom software solutions & digital marketing that scale your business."
  });
</script>

<svelte:head>
  <title>{content.metaTitle || 'K2MS — Custom Software & Digital Marketing'}</title>
  <meta name="description" content={content.metaDescription || 'Custom software solutions & digital marketing that scale your business.'}>
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content={content.metaOgTitle || content.metaTitle || 'K2MS — Custom Software & Digital Marketing'}>
  <meta property="og:description" content={content.metaOgDescription || content.metaDescription || 'Custom software solutions & digital marketing that scale your business.'}>
  <meta property="og:image" content={content.ogImageUrl || '/favicon.svg'}>
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content={content.metaOgTitle || content.metaTitle || 'K2MS — Custom Software & Digital Marketing'}>
  <meta name="twitter:description" content={content.metaOgDescription || content.metaDescription || 'Custom software solutions & digital marketing that scale your business.'}>
  <meta name="twitter:image" content={content.ogImageUrl || '/favicon.svg'}>
  
  <link rel="canonical" href={$page.url.href} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
</svelte:head>
{@render children()}
