# zenziali.com

Source for Zenzi Ali's portfolio site, hosted on GitHub Pages.

## What's here

- `index.html`: Home
- `about.html`: About
- `case-studies.html`: Case Studies list
- `quality-is-glue-work.html`: Case study, Quality Is Glue Work
- `images/zenzi-ali.jpg`: About page portrait (620x775, about 40 KB)
- `styles.css`: shared styles and design tokens (colors, type scale, spacing)

Plain HTML and CSS. No build step. The only dependencies are the test tools, which the site itself doesn't load. The font is Manrope (open source, SIL Open Font License), loaded from Google Fonts.

## Preview locally

Open `index.html` in a browser, or run a local server from this folder:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Automated checks

Playwright and axe-core (both open source) test every page at desktop (1440px) and phone (390px) widths:

- WCAG 2.1 AA scan with axe
- One H1 per page; headings step down in order
- Skip link is first in tab order and jumps to main content
- Every focusable element shows a visible focus ring
- No sideways scrolling; images have alt text
- No em dashes, email addresses, or placeholder links
- Internal links, images, and styles all load
- Links that open a new tab say so

They run on every push through GitHub Actions (`.github/workflows/site-checks.yml`). To run them locally:

```
npm install
npx playwright install chromium
npm test
```

When you add a page, add it to the `pages` list in `tests/site.spec.js`.

Automated checks catch a share of accessibility problems, not all of them. Keep doing the manual pass below.

## Before each publish

- Every link and button goes somewhere real (no placeholder links).
- Check desktop (1440px) and phone (390px) widths.
- Tab through each page: visible focus, logical order, skip link works.
- One H1 per page; headings step down in order.
- No email address, secrets, or confidential client details in any file. This repo is public.
- Writing rules: no em dashes; claims match real experience.
