// 插图面板分两层：常用四项常驻，圆角/边框/边框色收进「样式微调」折叠区
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.errors = errors;
  page.on('dialog', d => d.accept());
  await page.addInitScript(() => { try { localStorage.setItem('gzh-ob-done', '1'); } catch {} });
  await page.goto('/');
  await page.waitForTimeout(500);
});

test('默认折叠：圆角和边框不占屏，布局/对齐/宽度仍在', async ({ page }) => {
  await page.evaluate(() => toggleImgPanel());
  await expect(page.locator('#imgLayout')).toBeVisible();
  await expect(page.locator('#imgAlign')).toBeVisible();
  await expect(page.locator('#imgWidth')).toBeVisible();
  await expect(page.locator('#imgRadius')).toBeHidden();
  await expect(page.locator('#imgBorderW')).toBeHidden();
  expect(page.errors).toEqual([]);
});

test('展开样式微调后圆角边框出现，边框>0 才显示配色', async ({ page }) => {
  await page.evaluate(() => toggleImgPanel());
  await page.locator('#imgAdvanced > summary').click();

  await expect(page.locator('#imgRadius')).toBeVisible();
  await expect(page.locator('#imgBorderW')).toBeVisible();
  await expect(page.locator('#imgBorderColors')).toBeHidden();

  await page.locator('#imgBorderW').fill('3');
  await expect(page.locator('#imgBorderColors')).toBeVisible();
  expect(page.errors).toEqual([]);
});

test('折叠状态下插图仍用得上圆角默认值（读值不依赖展开）', async ({ page }) => {
  await page.evaluate(() => {
    editor.innerHTML = '<p><br></p>';
    const r = document.createRange();
    r.selectNodeContents(editor.querySelector('p'));
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
    savedEditorRange = r.cloneRange();
    toggleImgPanel();
    // 1x1 透明 png
    $('imgUrlInput').value = 'https://mmbiz.qpic.cn/test.png';
    doInsertImage();
  });
  await page.waitForTimeout(300);

  const style = await page.evaluate(() => {
    const img = editor.querySelector('img');
    return img ? img.getAttribute('style') || '' : null;
  });
  expect(style).not.toBeNull();
  // sanitizeStyleText 会把 border-radius 简写展开成四个角
  expect(style).toMatch(/border-top-left-radius\s*:\s*12px/);
  expect(page.errors).toEqual([]);
});

test('badge 尺寸行不在折叠区里（从题头 badge 进入时它是主要决定）', async ({ page }) => {
  const inside = await page.evaluate(() => {
    const adv = document.querySelector('#imgAdvanced');
    const row = document.querySelector('#imgBadgeSizeRow');
    return adv.contains(row);
  });
  expect(inside).toBe(false);
  expect(page.errors).toEqual([]);
});
