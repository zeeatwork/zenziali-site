// Pre-publish checks from the README checklist, automated.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

// Every public page. Add new pages here.
const pages = [
  { path: '/index.html', name: 'Home' },
  { path: '/about.html', name: 'About' },
  { path: '/case-studies.html', name: 'Case Studies' },
  { path: '/quality-is-glue-work.html', name: 'Quality Is Glue Work' },
  { path: '/nimble-not-agile.html', name: 'Nimble, not Agile' },
  { path: '/ai-job-search.html', name: 'AI Job Search' },
  { path: '/production-escape.html', name: 'Production Escape' },
  { path: '/projects.html', name: 'Projects' },
  { path: '/testing-my-own-portfolio.html', name: 'Testing My Own Portfolio' },
];

for (const { path, name } of pages) {
  test.describe(name, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test('has no automatically detectable WCAG 2.1 AA issues', async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const summary = results.violations.map(
        (v) => `${v.id} (${v.impact}): ${v.help} -> ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`
      );
      expect(summary, 'axe violations').toEqual([]);
    });

    test('has one H1 and headings step down in order', async ({ page }) => {
      const levels = await page.$$eval('h1, h2, h3, h4, h5, h6', (els) =>
        els.map((el) => Number(el.tagName[1]))
      );
      expect(levels.filter((l) => l === 1), 'H1 count').toHaveLength(1);
      expect(levels[0], 'first heading').toBe(1);
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i] - levels[i - 1], `heading jump at heading #${i + 1}`).toBeLessThanOrEqual(1);
      }
    });

    test('skip link is first in tab order and moves to main content', async ({ page, browserName }, testInfo) => {
      test.skip(testInfo.project.name === 'phone', 'Keyboard checks run on desktop');
      await page.keyboard.press('Tab');
      const skip = page.locator('a.skip-link');
      await expect(skip).toBeFocused();
      await expect(skip).toBeVisible();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/#main$/);
      await expect(page.locator('#main')).toBeInViewport();
    });

    test('every focusable element shows a visible focus indicator', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name === 'phone', 'Keyboard checks run on desktop');
      const count = await page.locator('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])').count();
      for (let i = 0; i < count; i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
          const el = document.activeElement;
          const s = getComputedStyle(el);
          return {
            label: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 40),
            outline: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0,
            shadow: s.boxShadow !== 'none',
          };
        });
        expect(info.outline || info.shadow, `no visible focus on "${info.label}"`).toBe(true);
      }
    });

    test('fits the screen with no sideways scrolling', async ({ page }) => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0);
    });

    test('images have alt text', async ({ page }) => {
      const missing = await page.$$eval('img', (imgs) =>
        imgs.filter((i) => !i.hasAttribute('alt')).map((i) => i.getAttribute('src'))
      );
      expect(missing).toEqual([]);
    });

    test('follows writing and privacy rules', async ({ page }) => {
      const html = await page.content();
      const text = await page.locator('body').innerText();
      expect(text.includes('—'), 'em dash in page text').toBe(false);
      expect(html, 'mailto link').not.toMatch(/mailto:/i);
      expect(text, 'email address').not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
      expect(await page.locator('a[href="#"], a[href=""], a:not([href])').count(), 'placeholder links').toBe(0);
    });

    test('has a title and meta description', async ({ page }) => {
      await expect(page).toHaveTitle(/\S/);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /^.{20,}$/);
    });

    test('internal links and images resolve', async ({ page, request }, testInfo) => {
      test.skip(testInfo.project.name === 'phone', 'Same links on every viewport');
      const urls = await page.$$eval('a[href], img[src], link[rel="stylesheet"]', (els) =>
        els.map((el) => el.getAttribute('href') || el.getAttribute('src'))
      );
      const internal = [...new Set(urls)].filter((u) => !/^(https?:|mailto:|#)/.test(u));
      for (const u of internal) {
        const res = await request.get(new URL(u, page.url()).href);
        expect(res.status(), `broken: ${u}`).toBe(200);
      }
    });

    test('external links that open new tabs say so and are safe', async ({ page }) => {
      const links = await page.$$eval('a[target="_blank"]', (els) =>
        els.map((a) => ({
          href: a.href,
          rel: a.getAttribute('rel') || '',
          name: (a.getAttribute('aria-label') || a.textContent).toLowerCase(),
        }))
      );
      for (const l of links) {
        expect(l.rel, `rel on ${l.href}`).toMatch(/noopener/);
        expect(l.name, `new-tab warning on ${l.href}`).toMatch(/new tab|new window/);
      }
    });
  });
}

// Share previews (LinkedIn and others read Open Graph tags).
for (const { path, name } of pages) {
  test(`${name} has a share image and Open Graph tags`, async ({ page, request }, testInfo) => {
    test.skip(testInfo.project.name === 'phone', 'Same tags on every viewport');
    await page.goto(path);
    for (const prop of ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt']) {
      await expect(page.locator(`meta[property="${prop}"]`), prop).toHaveAttribute('content', /\S/);
    }
    const img = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(img, 'og:image must be an absolute https URL').toMatch(/^https:\/\/zenziali\.com\/images\/og\/.+\.png$/);
    // Check the file exists in this build (the live URL may not be deployed yet).
    const res = await request.get(new URL(img).pathname);
    expect(res.status(), `missing share image ${img}`).toBe(200);
  });
}
