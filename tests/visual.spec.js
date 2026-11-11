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
    await expect(page.locator(selector)).toHaveScreenshot(`${name}.png`, {
      animations: 'disabled',
      // Small tolerance for font smoothing differences between machines.
      // Text drawn over an icon changes thousands of pixels.
      maxDiffPixels: 100,
    });
  });
}
