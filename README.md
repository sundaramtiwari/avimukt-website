# Avimukt Engineers Pvt Ltd — Website

A static, dependency-free multi-page website. Plain HTML + one shared CSS
file (`css/main.css`) + one shared vanilla JS file (`js/main.js`). No build
step, no framework, no bundler — every page is a complete `.html` file that
works by simply opening it (double-click / `file://`) or by serving the
folder with any static file host, including GitHub Pages.

## Structure

```
site/
├── index.html                    Home
├── about.html                    About Us (Our Company, Our Team, Careers)
├── products.html                 Products (Categories, All Products, Support)
├── products/
│   └── charge-controller.html    Perovskite Solar Cell Charge Controller detail page
├── technology.html               Technology (Overview, Innovations, Patents & IP)
├── services.html                 Services (Consulting, Engineering, Support)
├── applications.html             Applications (Industries, Use Cases, Solutions)
├── projects.html                 Projects / Case Studies
├── resources.html                Resources (White Papers, Datasheets, Webinars)
├── contact.html                  Contact (form, locations, support)
├── 404.html                      Custom not-found page
├── robots.txt
├── css/
│   └── main.css                  All styling (custom properties for the brand palette/type)
├── js/
│   └── main.js                   Mobile nav, dropdowns, reveal-on-scroll, tabs,
│                                  accordion, active-nav-state, contact-form mailto
└── assets/
    ├── logo.jpg                  Source logo (1024×1024)
    ├── favicon-32.png            Favicon
    ├── apple-touch-icon.png      iOS home-screen icon
    └── logo-512.png              Social share image (og:image)
```

Every page duplicates its own `<header>`/`<footer>` markup (no client-side
includes) so it renders correctly from `file://` as well as from any static
host or GitHub Pages sub-path. All links are **relative**, including from
`products/charge-controller.html` (which uses `../` to reach the shared
`css/`, `js/`, `assets/`, and other pages).

## Content still needed from Avimukt

Several sections are intentionally rendered as clearly-labelled placeholder
cards (dashed border, "Content to be provided by Avimukt" tag) rather than
invented content. Search the pages for `placeholder-card` to find every spot
that needs real material, including:

- Team bios and photos (About → Our Team)
- Careers / open positions (About → Careers)
- Additional product datasheets/specs beyond the charge controller diagram
- Patents & IP filings (Technology → Patents & IP)
- Featured projects, case studies, and testimonials (Projects)
- White papers, datasheets, brochures, webinars (Resources)
- Office/facility address (Contact → Locations)

A thin "Prototype preview — content under review" ribbon (`#preview-ribbon`,
first element inside `<body>` on every page) marks this as a work-in-progress
build. Remove that single element (and its CSS block in `main.css`, selector
`#preview-ribbon`) when the site is ready to go live.

## Local preview

No server or build step is required — just open `site/index.html` directly
in a browser. If you prefer serving it (recommended for testing the mobile
nav/relative paths exactly as GitHub Pages will), run from inside `site/`:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying to GitHub Pages

1. Create (or reuse) a GitHub repository for the site.
2. Commit the contents of this `site/` folder to the repository. If you want
   the site served from the **root** of the repo (recommended), commit these
   files directly at the repo root rather than nested under a `site/` folder.
3. In the repository, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Pick the branch (e.g. `main`) and the folder (`/root` if you committed at
   the repo root, or `/site` if you kept the nested folder and your Pages
   setup supports a custom publish path via a workflow).
6. Save. GitHub will publish the site at
   `https://<username>.github.io/<repo-name>/`.

Because every internal link in this site is relative, it will work correctly
both at that project sub-path (`/<repo-name>/...`) and, later, at a custom
domain root — no link changes needed either way.

### Pointing a custom domain (e.g. `www.avimuktengineers.in`)

GitHub Pages custom domains are configured via a `CNAME` file at the
published root containing just the domain name, e.g.:

```
www.avimuktengineers.in
```

This repository does **not** include a `CNAME` file — add one only when
you're ready to switch the live domain over, since GitHub Pages will attempt
to serve the custom domain (and may show a "domain not verified" warning at
your registrar) as soon as that file exists. Steps:

1. At your DNS provider, add a `CNAME` record for `www` (or an `ALIAS`/`ANAME`
   / `A` records for an apex domain, per
   [GitHub's custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site))
   pointing at `<username>.github.io`.
2. Add the `CNAME` file (containing only the domain) to the root of the
   published branch/folder.
3. In **Settings → Pages**, enter the same custom domain and enable
   **Enforce HTTPS** once GitHub finishes issuing the certificate.

## Notes on honesty / placeholders

Per the client brief, this build does **not** fabricate team members,
patents, clients, project names, certifications, addresses, phone numbers,
technical specifications (voltages/currents), usage statistics, or any
defence-agency endorsement. Anywhere real content from Avimukt is required,
a placeholder card says so explicitly instead of inventing detail.
