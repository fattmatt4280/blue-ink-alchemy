// Build-time sitemap generator
// Queries Supabase for published blog posts + dynamic CMS pages, writes public/sitemap.xml
// Runs as part of the build: "node scripts/generate-sitemap.js && vite build"

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://vozstxchkgpxzetwdzow.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvenN0eGNoa2dweHpldHdkem93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDQyMjAsImV4cCI6MjA2Njc4MDIyMH0.Ti9dIcVzMY_jNzvbPHPz9n47f8p3xrmrT_mAMb5yG6M';
const BASE_URL = 'https://bluedreambudder.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const staticPages = [
  { loc: '/',                           priority: '1.0', changefreq: 'weekly'  },
  { loc: '/shop',                       priority: '0.9', changefreq: 'weekly'  },
  { loc: '/tattoo-aftercare',           priority: '0.9', changefreq: 'monthly' },
  { loc: '/tattoo-aftercare-guide',     priority: '0.9', changefreq: 'weekly'  },
  { loc: '/tattoo-aftercare-guide/healing-timeline',           priority: '0.8', changefreq: 'monthly' },
  { loc: '/tattoo-aftercare-guide/itching-peeling-scabbing',  priority: '0.8', changefreq: 'monthly' },
  { loc: '/tattoo-aftercare-guide/first-30-days',             priority: '0.8', changefreq: 'monthly' },
  { loc: '/tattoo-aftercare-guide/what-not-to-put-on-tattoos',priority: '0.8', changefreq: 'monthly' },
  { loc: '/tattoo-aftercare-guide/why-some-tattoos-heal-badly',priority: '0.8', changefreq: 'monthly' },
  { loc: '/blog',                       priority: '0.8', changefreq: 'daily'   },
  { loc: '/reviews',                    priority: '0.7', changefreq: 'weekly'  },
  { loc: '/healaid',                    priority: '0.8', changefreq: 'monthly' },
  { loc: '/how-to-use',                 priority: '0.7', changefreq: 'monthly' },
  { loc: '/for-artists',                priority: '0.7', changefreq: 'monthly' },
  { loc: '/contact',                    priority: '0.6', changefreq: 'monthly' },
  { loc: '/size-guide',                 priority: '0.5', changefreq: 'monthly' },
  { loc: '/privacy-policy',             priority: '0.3', changefreq: 'yearly'  },
  { loc: '/terms-of-service',           priority: '0.3', changefreq: 'yearly'  },
];

function urlEntry({ loc, priority, changefreq, lastmod }) {
  return `
  <url>
    <loc>${BASE_URL}${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function generate() {
  console.log('Fetching blog posts from Supabase...');

  let blogEntries = [];

  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, publish_date, updated_at')
      .eq('publish_status', 'published')
      .order('publish_date', { ascending: false });

    if (error) throw error;

    blogEntries = (posts || []).map(post => ({
      loc: `/blog/${post.slug}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: (post.updated_at || post.publish_date || '').split('T')[0],
    }));

    console.log(`Found ${blogEntries.length} published blog posts.`);
  } catch (err) {
    console.warn('Could not fetch blog posts:', err.message);
    console.warn('Sitemap will be generated with static pages only.');
  }

  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Generated: ${today} -->

  <!-- Static pages -->
${staticPages.map(p => urlEntry({ ...p, lastmod: today })).join('')}

  <!-- Blog posts (dynamic from Supabase) -->
${blogEntries.map(p => urlEntry(p)).join('')}
</urlset>
`;

  const outPath = resolve(__dirname, '../public/sitemap.xml');
  writeFileSync(outPath, xml, 'utf8');
  console.log(`Sitemap written to ${outPath} (${staticPages.length} static + ${blogEntries.length} blog posts)`);
}

generate().catch(err => {
  console.error('Sitemap generation failed:', err);
  process.exit(1);
});
