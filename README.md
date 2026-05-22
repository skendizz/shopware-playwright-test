# Shopware 6 – Automated E2E Checkout Test

Test automatik për Guest Checkout me Cash on Delivery.  
Shkruar me Playwright + JavaScript.

## Si ta ndezësh

**Hapi 1 – Klono repozitorin**
```bash
git clone https://github.com/skendizz/shopware-playwright-test.git
cd shopware-playwright-test
```

**Hapi 2 – Instalo varësitë**
```bash
npm install
```

**Hapi 3 – Instalo browser-in**
```bash
npx playwright install chromium
```

**Hapi 4 – Ndiz testin**
```bash
npx playwright test integration-tests/guest-checkout.spec.js --headed
```