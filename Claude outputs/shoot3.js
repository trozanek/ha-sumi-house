const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  await page.goto('file:///mnt/user-data/outputs/sumi-house-mock.html');
  await page.waitForTimeout(400);

  const views = ['home','living','master','kids','mezzanine','onsen','garden','utility'];
  for (const v of views) {
    await page.click(`.tab[data-view="${v}"]`);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `/mnt/user-data/outputs/shots3/final-${v}.png`, fullPage: true });
  }

  // utility doorbell lightbox check (existing cam now clickable)
  await page.click('.tab[data-view="utility"]');
  await page.waitForTimeout(200);
  await page.click('.cam[data-cam="doorbell"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/mnt/user-data/outputs/shots3/utility-lightbox.png' });

  console.log('page errors:', errors.length ? errors : 'none');
  await browser.close();
})();
