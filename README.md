# zenziali.com

Source for Zenzi Ali's portfolio site, hosted on GitHub Pages.

## What's here

- `index.html`: Home
- `about.html`: About
- `styles.css`: shared styles and design tokens (colors, type scale, spacing)

Plain HTML and CSS. No build step, no dependencies. The font is Manrope (open source, SIL Open Font License), loaded from Google Fonts.

## Preview locally

Open `index.html` in a browser, or run a local server from this folder:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Before each publish

- Every link and button goes somewhere real (no placeholder links).
- Check desktop (1440px) and phone (390px) widths.
- Tab through each page: visible focus, logical order, skip link works.
- One H1 per page; headings step down in order.
- No email address, secrets, or confidential client details in any file. This repo is public.
- Writing rules: no em dashes; claims match real experience.
