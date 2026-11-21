import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const htmlPath = resolve(process.cwd(), 'd3-3d-studio/index.html');
const html = await readFile(htmlPath);
const server = createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }
  res.writeHead(404);
  res.end('Not found');
});
await new Promise((resolveListen, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolveListen);
});

let browser;
try {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });

  const address = server.address();
  await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: 'networkidle', timeout: 45000 });
  assert.match(await page.title(), /D3 3D Cabinet Studio/);
  try {
    await page.waitForSelector('#canvas canvas', { timeout: 20000 });
  } catch (error) {
    throw new Error(`3D renderer did not initialise. Console errors: ${consoleErrors.join(' | ')}. Page errors: ${pageErrors.join(' | ')}. ${error.message}`);
  }

  await page.locator('#build').click();
  await page.waitForFunction(() => document.querySelectorAll('#schedule tr').length >= 5);
  assert.match(await page.locator('#scheduleSummary').innerText(), /Total panel pieces/);
  assert.ok(await page.locator('#drawing2d svg').count(), '2D dimensioned drawing should render');
  assert.ok(await page.locator('#hardwareDrawing svg').count(), 'hardware reference drawing should render');

  await page.locator('#optimise').click();
  await page.waitForFunction(() => document.querySelector('#sheetPreview')?.children.length > 0, null, { timeout: 15000 });
  assert.ok((await page.locator('#optimiseResult').innerText()).trim().length > 0);

  // Mach3 simultaneous 4-axis setup: profile persistence and rotary math preview.
  assert.ok(await page.locator('#mach3FourAxisSetup').count(), 'Mach3 setup section should render');
  await page.locator('#mach3StepsPerDegree').fill('10');
  await page.locator('#mach3RotaryDiameter').fill('100');
  await page.locator('#mach3TargetAngle').fill('90');
  await page.locator('#mach3CalculateRotary').click();
  assert.match(await page.locator('#mach3RotaryCalculation').innerText(), /900\.000 motor pulses/);
  assert.match(await page.locator('#mach3RotaryCalculation').innerText(), /78\.540 mm/);
  await page.locator('#mach3RotaryZero').selectOption('top');
  await page.locator('#mach3Direction').selectOption('positive');
  await page.locator('#saveMach3Profile').click();
  assert.match(await page.locator('#mach3ProfileStatus').innerText(), /saved in this browser/i);
  assert.match(await page.evaluate(() => localStorage.getItem('d3-mach3-four-axis-profile-v1')), /simultaneous-4-axis/);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('#mach3StepsPerDegree').inputValue(), '10');
  assert.equal(await page.locator('#mach3RotaryDiameter').inputValue(), '100');
  await page.locator('#clearMach3Profile').click();
  assert.equal(await page.evaluate(() => localStorage.getItem('d3-mach3-four-axis-profile-v1')), null);

  assert.deepEqual(pageErrors, [], 'app should not throw uncaught browser errors');
  console.log('D3 Studio browser smoke test passed: 3D canvas, cabinet build, panel schedule, 2D/hardware drawings, cutting layout and Mach3 rotary setup.');
} finally {
  if (browser) await browser.close();
  await new Promise(resolveClose => server.close(resolveClose));
}
