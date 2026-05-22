import { test, expect } from '@playwright/test';
import fs from 'fs';

async function shot(page, name) {
  if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  console.log(`📸 ${name}.png`);
}

test('TC-01: Guest Checkout - Cash on Delivery', async ({ page }) => {
  test.setTimeout(120000);

  // ── HAPI 1: Hap faqen Clothing ────────────────────────────────────────────
  console.log('\n🚀 HAPI 1: Hap faqen...');
  await page.goto('https://www.shopware6-demo.development-s25.com/Clothing/', {
    waitUntil: 'networkidle',
  });
  await shot(page, '01-clothing-page');

  // ── HAPI 2: Kliko produktin e parë ───────────────────────────────────────
  console.log('\n🚀 HAPI 2: Kliko produktin...');
  const product = page.locator('.product-name a, a.product-name, article.product-box a').first();
  await product.waitFor({ state: 'visible', timeout: 20000 });
  await product.click();
  await page.waitForLoadState('networkidle');
  await shot(page, '02-product-page');

  // ── HAPI 3: "In den Warenkorb" ────────────────────────────────────────────
  console.log('\n🚀 HAPI 3: Shto në shportë...');
  const addToCart = page.locator([
    'button:has-text("In den Warenkorb")',
    'button.btn-buy',
  ].join(', ')).first();
  await addToCart.waitFor({ state: 'visible', timeout: 20000 });
  await addToCart.click();
  await page.waitForTimeout(2500);
  await shot(page, '03-cart-open');

  // ── HAPI 4: "Zur Kasse" ───────────────────────────────────────────────────
  console.log('\n🚀 HAPI 4: Shko tek Checkout...');
  const toCheckout = page.locator([
    'a:has-text("Zur Kasse")',
    'a:has-text("Proceed to checkout")',
    '.offcanvas a[href*="checkout"]',
  ].join(', ')).first();
  await toCheckout.waitFor({ state: 'visible', timeout: 15000 });
  await toCheckout.click();
  await page.waitForLoadState('networkidle');
  await shot(page, '04-checkout-form');

  // ── HAPI 5: Plotëso formularin ────────────────────────────────────────────
  // NUK KA OPSION GUEST — forma shfaqet direkt
  // Faqja: /checkout/register
  // Fushat: Vorname, Nachname, E-Mail-Adresse, Straße, PLZ, Ort, Land, Bundesland
  console.log('\n🚀 HAPI 5: Plotëso formularin...');

  // Prit të shfaqet forma
  await page.getByRole('textbox', { name: 'Vorname' })
    .waitFor({ state: 'visible', timeout: 15000 });

  // Anrede (dropdown "Not specified")
  const anrede = page.locator('select').first();
  await anrede.selectOption({ index: 1 }); // Herr / Mr

  // Emri dhe Mbiemri
  await page.getByRole('textbox', { name: 'Vorname' }).fill('Skender');
  await page.getByRole('textbox', { name: 'Nachname' }).fill('Dervina');

  // E-Mail — unik çdo herë që mos refuzohet
  await page.getByRole('textbox', { name: 'E-Mail-Adresse' })
    .fill(`test.auto.${Date.now()}@example.com`);

  // Adresa
  await page.getByRole('textbox', { name: 'Straße und Hausnummer' })
    .fill('Musterstraße 1');
  await page.getByRole('textbox', { name: 'PLZ' }).fill('10115');
  await page.getByRole('textbox', { name: 'Ort' }).fill('Berlin');

  // Land — Germany është zgjedhur automatikisht (nuk ndryshojmë)

  // Bundesland — zgjedh "Berlin" (e detyrueshme për Germany)
 const bundesland = page.locator('#billingAddressAddressCountryState');
  if (await bundesland.isVisible()) {
    await bundesland.selectOption({ label: 'Berlin' });
  }

  await shot(page, '05-form-filled');

  // ── HAPI 6: Kliko "Weiter" ────────────────────────────────────────────────
  console.log('\n🚀 HAPI 6: Kliko Weiter...');
  await page.getByRole('button', { name: 'Weiter' }).click();
  await page.waitForLoadState('networkidle');
  await shot(page, '06-payment-page');
  console.log(`   URL: ${page.url()}`);

  // ── HAPI 7: Zgjidh "Nachnahme" (Cash on Delivery) ────────────────────────
  console.log('\n🚀 HAPI 7: Zgjedh Nachnahme...');
  const nachnahme = page.locator([
    'label:has-text("Nachnahme")',
    'label:has-text("Cash on delivery")',
  ].join(', ')).first();
  await nachnahme.waitFor({ state: 'visible', timeout: 15000 });
  await nachnahme.click({ force: true });
  await page.waitForTimeout(500);
  await shot(page, '07-payment-selected');

  // ── HAPI 8: Prano AGB / TOS ───────────────────────────────────────────────
  console.log('\n🚀 HAPI 8: Prano AGB...');
  const tos = page.locator('#tos, input[name="tos"]').first();
  await tos.waitFor({ state: 'visible', timeout: 10000 });
  await tos.check({ force: true });
  await shot(page, '08-tos-checked');

  // ── HAPI 9: "Zahlungspflichtig bestellen" ─────────────────────────────────
  console.log('\n🚀 HAPI 9: Submit porosinë...');
  const submit = page.locator([
    'button:has-text("Zahlungspflichtig bestellen")',
    'button:has-text("Submit order")',
    '#confirmOrderForm button[type="submit"]',
  ].join(', ')).first();
  await submit.waitFor({ state: 'visible', timeout: 10000 });
  await submit.click();
  await page.waitForLoadState('networkidle');
  await shot(page, '09-after-submit');
  console.log(`   URL: ${page.url()}`);

  // ── HAPI 10: Verifiko /checkout/finish ────────────────────────────────────
  console.log('\n🚀 HAPI 10: Verifiko suksesin...');
  await expect(page).toHaveURL(/.*\/checkout\/finish/, { timeout: 25000 });
  await shot(page, '10-SUCCESS');
  console.log('\n✅ ✅ ✅  TESTI KALOI ME SUKSES!');
});