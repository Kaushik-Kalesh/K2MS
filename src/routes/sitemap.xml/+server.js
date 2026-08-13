export async function GET({ url }) {
    const origin = url.origin;
    
    // We only have the main page for public view in this single-page design.
    // If you have more routes in the future, add them here.
    const pages = [
        { path: '', changefreq: 'weekly', priority: '1.0' }
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${pages.map(page => `
    <url>
        <loc>${origin}/${page.path}</loc>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>
    `).join('')}
</urlset>`.trim();

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'max-age=0, s-maxage=3600'
        }
    });
}
