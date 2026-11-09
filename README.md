# D3 Interior Designs — Website

Modern responsive website for **D3 Interior Designs**, Attingal, Kerala.

## Services
- CNC Cutting
- Panel Cutting
- Edge Banding
- Mica Pressing
- Multi-Boring
- Modular Kitchen
- Wardrobes
- TV Units
- Interior Production
- CNC Job Works

## Contact
**D3 Interior Designs**  
Attingal • Palace Road • Kerala

**Phone / WhatsApp:** +91 8606470443  
**Instagram:** @D3INTERIORDESIGNS

## Website Files
- `index.html` — Main website
- `style.css` — Design and responsive layout
- `script.js` — Website interactions
- `README.md` — Hosting and website instructions

## Free Hosting with GitHub Pages

1. Create a GitHub account.
2. Create a repository, for example `d3-interior-designs`.
3. Upload `index.html`, `style.css`, and `script.js`.
4. Open **Repository → Settings → Pages**.
5. Select **Deploy from a branch**.
6. Select **main** and **/ (root)**.
7. Save. GitHub will provide a free website address.

## Connect Your GoDaddy Domain

In GitHub, open:

**Repository → Settings → Pages → Custom domain**

Enter your GoDaddy domain.

Then update the DNS records in GoDaddy using the GitHub Pages DNS values shown by GitHub. DNS changes can take some time to become active.

## Before Publishing

Replace the project placeholders with your real D3 Interior Designs photos.

Replace the email address in `index.html` if you want to use a different business email.

## Business

**D3 Interior Designs**  
Attingal, Palace Road, Kerala

CNC cutting • Panel cutting • Edge banding • Mica pressing • Modular kitchen • Wardrobes • TV units • CNC job works

© 2026 D3 Interior Designs. All rights reserved.


## Photo gallery workflow

Add only genuine D3 project and factory photographs to the website. Do not use stock images as evidence of completed D3 work.

Suggested image names:
- `images/cnc-carving-01.webp`
- `images/modular-kitchen-01.webp`
- `images/wardrobe-01.webp`
- `images/edge-banding-01.webp`
- `images/panel-cutting-01.webp`
- `images/factory-team-01.webp`

Use compressed WebP images where possible, keep the original photographs, and add a descriptive alt attribute to every gallery image. Ask the business owner to confirm the project type and location before publishing captions.

## Search visibility checklist

1. Confirm the canonical domain and HTTPS redirect in the hosting settings.
2. Submit `https://www.d3interiordesigns.com/sitemap.xml` in Google Search Console.
3. Verify the site with Google Search Console and inspect the homepage URL.
4. Create or update the official Google Business Profile with the correct business address, phone, hours and genuine photographs.
5. Keep the business name, address and phone consistent across the website and business listings.
6. Add genuine project photos with descriptive filenames and alt text.
7. Ask real customers for honest reviews; never publish fabricated reviews.

SEO cannot guarantee rankings. Monitor Search Console impressions, clicks, indexing and technical issues over time.


## Custom domain connection — GoDaddy DNS

The repository now contains a `CNAME` file for `www.d3interiordesigns.com`. To point the domain to this GitHub Pages website, sign in to the domain's DNS provider and add the records below.

### 1. Add the www record

| Type | Host / Name | Points to |
|---|---|---|
| CNAME | `www` | `d3interiordesigns43-maker.github.io` |

### 2. Point the root domain to GitHub Pages

If you also want `d3interiordesigns.com` to redirect to the www version, configure these A records:

| Type | Host / Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

Before changing DNS, check whether the root or www records are still used by an existing website. Replace only conflicting website records. **Do not delete MX records or email-related TXT records**, because they may be needed for business email.

### 3. Check GitHub Pages

Open **Repository → Settings → Pages** and confirm:
- Publishing source is `main` branch and `/ (root)` (if using branch deployment).
- Custom domain is `www.d3interiordesigns.com`.
- Enable **Enforce HTTPS** when GitHub makes it available.

DNS changes can take up to 24 hours to propagate. GitHub's official guide: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

### 4. Google indexing

After the live site is working:
- Verify `https://www.d3interiordesigns.com/` in Google Search Console.
- Submit `https://www.d3interiordesigns.com/sitemap.xml`.
- Use URL Inspection to request indexing of the homepage and service pages.

Do not expect immediate rankings. Search engines decide when to crawl, index and rank pages.
