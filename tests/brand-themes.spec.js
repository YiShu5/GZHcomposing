// 品牌手册子主题（6 套）：仅在品牌手册模式下露出，点击即换配色 + 字体
const { test, expect } = require('@playwright/test');

const THEME_IDS = ['moyu-green', 'red-white', 'graphite', 'zen-space', 'moyu-receipt', 'olive-notes'];

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.errors = errors;
  page.on('dialog', d => d.accept());
  await page.addInitScript(() => { try { localStorage.setItem('gzh-ob-done', '1'); } catch {} });
  await page.goto('/');
  await page.waitForTimeout(400);
});

async function pickStyleCard(page, modeId) {
  await page.click(`[data-quick-style="${modeId}"]`);
  await page.waitForTimeout(250);
}

test('六套子主题定义完整，配色索引各不相同', async ({ page }) => {
  const data = await page.evaluate(() => BRAND_THEMES.map(t => ({
    id: t.id, name: t.name, color: t.color, valid: !!COLOR_SCHEMES[t.color]
  })));
  expect(data.map(d => d.id)).toEqual(THEME_IDS);
  expect(data.every(d => d.valid)).toBe(true);
  expect(new Set(data.map(d => d.color)).size).toBe(6);
});

test('非品牌模式下子主题行隐藏，品牌模式下出现六个', async ({ page }) => {
  const row = page.locator('#brandThemeRow');
  await expect(row).toBeHidden();

  await pickStyleCard(page, 'brand-manual');
  await expect(row).toBeVisible();
  await expect(row.locator('[data-brand-theme]')).toHaveCount(6);

  await pickStyleCard(page, 'ai-pocket-green');
  await expect(row).toBeHidden();
  expect(await page.evaluate(() => STATE.brandTheme)).toBe(null);
});

test('点击每套子主题都会切换配色与高亮', async ({ page }) => {
  await pickStyleCard(page, 'brand-manual');
  const seen = new Set();

  for (const id of THEME_IDS) {
    await page.click(`[data-brand-theme="${id}"]`);
    await page.waitForTimeout(200);

    const s = await page.evaluate(() => ({
      brandTheme: STATE.brandTheme,
      mode: STATE.mode,
      colorScheme: STATE.colorScheme,
      main: getColors().main,
      custom: STATE.customColors,
      titleFont: STATE.titleFont,
      bodyFont: STATE.bodyFont,
    }));
    expect(s.brandTheme).toBe(id);
    expect(s.mode).toBe('brand-manual');
    expect(s.custom).toBe(null);
    expect(s.main).toMatch(/^#[0-9A-Fa-f]{6}$/);
    seen.add(s.main);

    const active = page.locator(`[data-brand-theme="${id}"]`);
    await expect(active).toHaveClass(/active/);
    await expect(active).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('[data-brand-theme].active')).toHaveCount(1);
  }

  expect(seen.size).toBe(6);
  expect(page.errors).toEqual([]);
});

test('从别的模式直接点子主题会自动切到品牌手册', async ({ page }) => {
  expect(await page.evaluate(() => STATE.mode)).toBe('ai-pocket-green');
  await pickStyleCard(page, 'brand-manual');
  await page.click('[data-brand-theme="graphite"]');
  await page.waitForTimeout(150);

  await pickStyleCard(page, 'ai-pocket-card');
  const after = await page.evaluate(() => {
    applyBrandTheme('zen-space');
    return { mode: STATE.mode, brandTheme: STATE.brandTheme };
  });
  expect(after.mode).toBe('brand-manual');
  expect(after.brandTheme).toBe('zen-space');
  await expect(page.locator('#brandThemeRow')).toBeVisible();
});

test('子主题配色只在品牌模式下出现在配色面板', async ({ page }) => {
  const countChips = () => page.evaluate(() => {
    const box = document.createElement('div');
    renderColorSettingsContent(box);
    return box.querySelectorAll('.color-row .color-chip').length;
  });

  const base = await countChips();
  await pickStyleCard(page, 'brand-manual');
  const inBrand = await countChips();
  expect(inBrand).toBe(base + 6);
});

test('保存/读取样式能带上子主题，脏值被清掉', async ({ page }) => {
  await pickStyleCard(page, 'brand-manual');
  await page.click('[data-brand-theme="moyu-receipt"]');
  await page.waitForTimeout(150);

  const round = await page.evaluate(() => {
    const kept = sanitizeState(JSON.parse(JSON.stringify(STATE)));
    const junk = sanitizeState({ mode: 'brand-manual', brandTheme: 'not-a-theme' });
    const wrongMode = sanitizeState({ mode: 'ai-pocket-green', brandTheme: 'graphite' });
    return { kept: kept.brandTheme, junk: junk.brandTheme, wrongMode: wrongMode.brandTheme };
  });
  expect(round.kept).toBe('moyu-receipt');
  expect(round.junk).toBe(null);
  expect(round.wrongMode).toBe(null);
});

test('手动换配色时子主题高亮跟着走', async ({ page }) => {
  await pickStyleCard(page, 'brand-manual');
  await page.click('[data-brand-theme="olive-notes"]');
  await page.waitForTimeout(150);

  const hit = await page.evaluate(() => {
    selectColorScheme(BRAND_THEMES.find(t => t.id === 'red-white').color);
    return STATE.brandTheme;
  });
  expect(hit).toBe('red-white');

  const miss = await page.evaluate(() => { selectColorScheme(0); return STATE.brandTheme; });
  expect(miss).toBe(null);
  await expect(page.locator('[data-brand-theme].active')).toHaveCount(0);
  expect(page.errors).toEqual([]);
});
