// Visual regression checks: compare key sections against approved screenshots.
// Catches layout bugs the accessibility and structure checks can't see,
// like text drawn on top of an icon.
//
// After an intended design change, update the approved screenshots with:
//   npx playwright test tests/visual.spec.js --update-snapshots
// then look at the new images in tests/visual.spec.js-snapshots/ before committing.
const { test, expect } = require('@playwright/test');

const sections = [
  { path: '/index.html', selector: 'section[aria-labelledby="approach-heading"]', name: 'home-approach' },
];

for (const { path, selector, name } of sections) {
  test(`${name} matches the approved screenshot`, async ({ page }) => {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    // Hide everything above the section so it always starts at the same spot.
    // Otherwise edits higher on the page can shift it by a fraction of a pixel,
    // which changes text anti-aliasing and fails the check with no visible change.
    await page.locator(selector).evaluate((el) => {
      document.querySelector('header')?.style.setProperty('display', 'none');
      for (let n = el; n && n !== document.body; n = n.parentElement) {
        for (let s = n.previousElementSibling; s; s = s.previousElementSibling) {
          s.style.setProperty('display', 'none');
        }
      }
    });
    await expect(page.locator(selector)).toHaveScreenshot(`${name}.png`, {
      animations: 'disabled',
      // Small tolerance for font smoothing differences between machines.
      // Text drawn over an icon changes thousands of pixels.
      maxDiffPixels: 100,
    });
  });
}
