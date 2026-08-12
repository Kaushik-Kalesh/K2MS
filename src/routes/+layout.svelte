<script>
  let { children, data } = $props();
  let content = $derived(data?.content || {});
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
</svelte:head>
{@render children()}
