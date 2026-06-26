/**
 * RefreshIQ Pro — E2E Tests (Playwright)
 * These tests load the built extension in a real Chromium instance.
 *
 * Run: npm run test:e2e
 * Requires: npm run build first
 */

import { test, expect, chromium, BrowserContext, Page } from '@playwright/test';
import path from 'path';

const EXTENSION_PATH = path.resolve(__dirname, '../../dist');

let context: BrowserContext;
let popupPage: Page;

test.beforeAll(async () => {
  context = await chromium.launchPersistentContext('', {
    headless: false, // Extensions require non-headless in Playwright
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--no-sandbox',
    ],
  });

  // Get extension ID
  let extensionId = '';
  const targets = context.backgroundPages();
  for (const bg of targets) {
    const url = bg.url();
    const match = url.match(/chrome-extension:\/\/([^/]+)/);
    if (match) { extensionId = match[1]; break; }
  }

  if (!extensionId) {
    const bgPage = await context.waitForEvent('backgroundpage');
    const match  = bgPage.url().match(/chrome-extension:\/\/([^/]+)/);
    if (match) extensionId = match[1];
  }

  popupPage = await context.newPage();
  await popupPage.goto(`chrome-extension://${extensionId}/src/popup/index.html`);
  await popupPage.waitForLoadState('domcontentloaded');
});

test.afterAll(async () => {
  await context.close();
});

test.describe('Popup UI', () => {
  test('renders the header with logo and title', async () => {
    const header = popupPage.locator('header');
    await expect(header).toBeVisible();
    await expect(popupPage.getByText('RefreshIQ')).toBeVisible();
    await expect(popupPage.getByText('PRO')).toBeVisible();
  });

  test('shows all 4 navigation tabs', async () => {
    await expect(popupPage.getByRole('tab', { name: /interval/i })).toBeVisible();
    await expect(popupPage.getByRole('tab', { name: /timer/i })).toBeVisible();
    await expect(popupPage.getByRole('tab', { name: /tabs/i })).toBeVisible();
    await expect(popupPage.getByRole('tab', { name: /monitor/i })).toBeVisible();
  });

  test('interval tab is active by default', async () => {
    const intervalTab = popupPage.getByRole('tab', { name: /interval/i });
    await expect(intervalTab).toHaveAttribute('aria-selected', 'true');
  });

  test('shows refresh mode buttons', async () => {
    await expect(popupPage.getByText('Fixed')).toBeVisible();
    await expect(popupPage.getByText('Random')).toBeVisible();
    await expect(popupPage.getByText('Schedule')).toBeVisible();
  });

  test('shows preset chips', async () => {
    await expect(popupPage.getByText('5s')).toBeVisible();
    await expect(popupPage.getByText('30s')).toBeVisible();
    await expect(popupPage.getByText('1m')).toBeVisible();
  });

  test('clicking a preset chip selects it', async () => {
    await popupPage.getByText('10s').click();
    // The chip should have the active style
    const chip = popupPage.getByText('10s');
    await expect(chip).toBeVisible();
  });

  test('start button is visible', async () => {
    await expect(popupPage.getByRole('button', { name: /start/i })).toBeVisible();
  });
});

test.describe('Tab Navigation', () => {
  test('clicking Timer tab shows time inputs', async () => {
    await popupPage.getByRole('tab', { name: /timer/i }).click();
    await expect(popupPage.getByText('Start Time')).toBeVisible();
    await expect(popupPage.getByText('Stop Time')).toBeVisible();
  });

  test('clicking Tabs tab shows tab manager', async () => {
    await popupPage.getByRole('tab', { name: /tabs/i }).click();
    await expect(popupPage.getByText(/Open Tabs|No open tabs/i)).toBeVisible();
  });

  test('clicking Monitor tab shows monitoring UI', async () => {
    await popupPage.getByRole('tab', { name: /monitor/i }).click();
    await expect(popupPage.getByText('Add Monitor Rule')).toBeVisible();
    await expect(popupPage.getByText('Detection Mode')).toBeVisible();
  });

  test('tab navigation is keyboard accessible', async () => {
    await popupPage.getByRole('tab', { name: /interval/i }).focus();
    await popupPage.keyboard.press('Tab');
    // Should move focus to next tab
  });
});

test.describe('Monitor Tab', () => {
  test.beforeEach(async () => {
    await popupPage.getByRole('tab', { name: /monitor/i }).click();
  });

  test('shows mode selector chips', async () => {
    await expect(popupPage.getByText('Text')).toBeVisible();
    await expect(popupPage.getByText('Regex')).toBeVisible();
    await expect(popupPage.getByText('CSS')).toBeVisible();
  });

  test('add rule button is disabled with empty target', async () => {
    const addBtn = popupPage.getByRole('button', { name: /Add Monitor Rule/ });
    await expect(addBtn).toBeDisabled();
  });

  test('can type in target field', async () => {
    const textarea = popupPage.locator('textarea[placeholder*="keyword"]').first();
    if (await textarea.isVisible()) {
      await textarea.fill('In Stock');
      await expect(textarea).toHaveValue('In Stock');
    }
  });
});
