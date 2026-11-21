import { expect, test } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const siteUrl = pathToFileURL(resolve(__dirname, '../EcoGreen-Website/index.html')).href;

test('renders products and updates the order total', async ({ page }) => {
  await page.goto(siteUrl);

  await expect(page).toHaveTitle('Eco Green | Biodegradable Plates for Every Occasion');
  await expect(page.locator('.product')).toHaveCount(4);
  await page.getByRole('button', { name: 'Increase 15-Inch Sitting Plate (Vistaraku) quantity' }).click();
  await page.getByRole('button', { name: 'Increase 15-Inch Sitting Plate (Vistaraku) quantity' }).click();
  await expect(page.locator('#grand-total')).toContainText('250');
  await expect(page.locator('#pack-count')).toHaveText('2 item packs selected');

  await page.getByRole('button', { name: 'Decrease 15-Inch Sitting Plate (Vistaraku) quantity' }).click();
  await expect(page.locator('#grand-total')).toContainText('125');
  await expect(page.locator('#pack-count')).toHaveText('1 item pack selected');
});

test('opens and closes the product photo dialog', async ({ page }) => {
  await page.goto(siteUrl);
  await page.locator('.product-photo').first().click();

  await expect(page.locator('#photo-modal')).toBeVisible();
  await expect(page.locator('#modal-image')).toHaveAttribute('alt', '15-Inch Sitting Plate (Vistaraku)');
  await page.getByRole('button', { name: 'Close image' }).click();
  await expect(page.locator('#photo-modal')).not.toBeVisible();
});

test('validates and prepares a WhatsApp order', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'open', {
      configurable: true,
      value: (url: string) => {
        document.body.dataset.orderUrl = url;
        return null;
      }
    });
  });
  await page.goto(siteUrl);

  await page.getByRole('button', { name: 'Order on WhatsApp' }).click();
  await expect(page.locator('#order-status')).toHaveText('Please select at least one product pack.');

  await page.getByRole('button', { name: 'Increase 15-Inch Sitting Plate (Vistaraku) quantity' }).click();
  await page.getByRole('button', { name: 'Order on WhatsApp' }).click();
  await expect(page.locator('#order-status')).toContainText('WhatsApp opened with your order details.');

  const orderUrl = await page.locator('body').getAttribute('data-order-url');
  expect(orderUrl).toBeTruthy();
  const order = new URL(orderUrl!);
  expect(order.origin + order.pathname).toBe('https://wa.me/917013746525');
  expect(order.searchParams.get('text')).toContain('Total: ₹125.00');
});
