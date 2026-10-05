const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to http://localhost:4173/miniaturas');
  await page.goto('http://localhost:4173/miniaturas', { waitUntil: 'networkidle0' });
  
  const content = await page.content();
  console.log('Body length:', content.length);
  
  await browser.close();
})();
