const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1400 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  await page.goto('file:///mnt/user-data/outputs/sumi-house-mock.html');
  await page.waitForTimeout(500);

  // Home view (default)
  await page.screenshot({ path: '/mnt/user-data/outputs/shots3/home.png', fullPage: true });

  // Click doorbell cam in Home to open lightbox
  await page.click('#dbl-cam-card .cam[data-cam="doorbell"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/mnt/user-data/outputs/shots3/lightbox-doorbell.png', fullPage: false });
  await page.click('#camlb-close');
  await page.waitForTimeout(300);

  // Todo card interactions - switch tabs
  await page.click('#todo-tabs [data-tdtab="groceries"]');
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/mnt/user-data/outputs/shots3/home-todo-groceries.png', clip: { x: 0, y: 0, width: 1200, height: 900 } });

  // Garden view
  await page.click('.tab[data-view="garden"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/mnt/user-data/outputs/shots3/garden.png', fullPage: true });

  await page.click('#atrium-cam-card .cam[data-cam="atrium"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/mnt/user-data/outputs/shots3/lightbox-atrium.png', fullPage: false });
  await page.click('#camlb-close');

  // Onsen view
  await page.click('.tab[data-view="onsen"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/mnt/user-data/outputs/shots3/onsen.png', fullPage: true });

  // Mezzanine & Utility clocks check
  await page.click('.tab[data-view="mezzanine"]');
  await page.waitForTimeout(1200);
  const clock7 = await page.textContent('#clock7');
  await page.click('.tab[data-view="utility"]');
  await page.waitForTimeout(300);
  const clock8 = await page.textContent('#clock8');
  console.log('clock7:', clock7, 'clock8:', clock8);

  console.log('page errors:', errors.length ? errors : 'none');
  await browser.close();
})();
