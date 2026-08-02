// 品牌手册专属组件库（js/brand-components.js）
const { test, expect } = require('@playwright/test');

const IDS = ['toc', 'quote', 'terminal', 'datacard', 'notice', 'enddiv', 'signature'];

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

async function useMode(page, id) {
  await page.evaluate(modeId => {
    const i = MODES.findIndex(m => m.id === modeId);
    STATE.mode = MODES[i].id;
    if (typeof selectMode === 'function') selectMode(i);
    updatePreview();
  }, id);
  await page.waitForTimeout(250);
}

// 清空编辑器并把光标放进去，让插入落在可预期的位置
async function clearEditor(page) {
  await page.evaluate(() => {
    editor.innerHTML = '<p><br></p>';
    const r = document.createRange();
    r.selectNodeContents(editor.querySelector('p'));
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
    savedEditorRange = r.cloneRange();
    updatePreview();
  });
  await page.waitForTimeout(150);
}

async function insert(page, id) {
  await clearEditor(page);
  await page.evaluate(i => insertBrandComponent(i), id);
  await page.waitForTimeout(400);
}

test('品牌手册模式下「设计」弹出的是品牌组件面板，列出全部 7 个', async ({ page }) => {
  await useMode(page, 'brand-manual');
  await page.evaluate(() => showDesignLayoutPanel());
  await page.waitForTimeout(300);
  await expect(page.locator('#brandComponentChoices')).toBeVisible();
  await expect(page.locator('#brandComponentChoices [data-brand-component]')).toHaveCount(7);
  // 不该是旧的三项面板
  expect(await page.locator('#designLayoutChoices').count()).toBe(0);
  expect(page.errors).toEqual([]);
});

test('其他两个模式的「设计」面板保持原样（三项，不受影响）', async ({ page }) => {
  for (const mode of ['ai-pocket-green', 'ai-pocket-card']) {
    await useMode(page, mode);
    await page.evaluate(() => showDesignLayoutPanel());
    await page.waitForTimeout(300);
    await expect(page.locator('#designLayoutChoices')).toBeVisible();
    await expect(page.locator('#designLayoutChoices [data-design-action]')).toHaveCount(3);
    expect(await page.locator('#brandComponentChoices').count()).toBe(0);
    await page.evaluate(() => hideModal());
    await page.waitForTimeout(150);
  }
  expect(page.errors).toEqual([]);
});

test('7 个组件都能插入编辑器并在预览里存活（不被 sanitize 清掉）', async ({ page }) => {
  await useMode(page, 'brand-manual');
  for (const id of IDS) {
    await insert(page, id);
    const sel = `[data-theme-component="brand-${id === 'enddiv' ? 'enddiv' : id}"]`;
    const inEditor = await page.locator(`#editor ${sel}`).count();
    const inPreview = await page.locator(`#preview ${sel}`).count();
    expect(inEditor, `${id} 应插进编辑器`).toBe(1);
    expect(inPreview, `${id} 应在预览里存活`).toBe(1);
  }
  expect(page.errors).toEqual([]);
});

test('终端代码框：不用 white-space:pre，每行一个 p，缩进是全角空格', async ({ page }) => {
  await useMode(page, 'brand-manual');
  await insert(page, 'terminal');
  const info = await page.evaluate(() => {
    const el = editor.querySelector('[data-theme-component="brand-terminal"]');
    const ps = Array.from(el.querySelectorAll('p'));
    return {
      html: el.outerHTML,
      pCount: ps.length,
      pMarginsAllZero: ps.every(p => /margin:\s*0|margin-top:\s*0px/.test(p.getAttribute('style') || '')),
      hasFullwidthIndent: ps.some(p => p.textContent.startsWith('　')),
    };
  });
  expect(info.html).not.toMatch(/white-space\s*:\s*pre/i);
  expect(info.pCount).toBeGreaterThanOrEqual(2);
  expect(info.pMarginsAllZero).toBe(true);
  expect(info.hasFullwidthIndent).toBe(true);
  expect(page.errors).toEqual([]);
});

test('终端代码框：三个红黄绿圆点都在（用字符撑住，不是空元素）', async ({ page }) => {
  await useMode(page, 'brand-manual');
  await insert(page, 'terminal');
  // 注意：浏览器会把 border-radius:50% 展开成四个角的长写形式，
  // 且 sanitizeStyleText 把颜色归一化成 rgb()，所以按展开后的写法匹配
  const dots = await page.evaluate(() => {
    const el = editor.querySelector('[data-theme-component="brand-terminal"]');
    return Array.from(el.querySelectorAll('span'))
      .filter(s => /border-top-left-radius:\s*50%/.test(s.getAttribute('style') || ''))
      .map(s => ({
        color: s.style.backgroundColor,
        hasText: (s.textContent || '').length > 0,
      }));
  });
  expect(dots.length).toBe(3);
  expect(dots.map(d => d.color)).toEqual([
    'rgb(255, 95, 86)', 'rgb(255, 189, 46)', 'rgb(39, 201, 63)',
  ]);
  // 空元素会被公众号吃掉，圆点里必须有字符
  expect(dots.every(d => d.hasText)).toBe(true);
  expect(page.errors).toEqual([]);
});

test('终端代码框：圆点在微信预览下仍是圆的，没被 width→max-width 改写压成细条', async ({ page }) => {
  await useMode(page, 'brand-manual');
  await insert(page, 'terminal');
  // wechatPreviewActive 默认开着，sanitizeFixedWidthsForWechat 会把 width:Npx
  // 全局改写成 max-width:Npx，靠 width 定宽的空内容 span 会塌成 0.5px
  const boxes = await page.evaluate(() => {
    const active = typeof wechatPreviewActive !== 'undefined' ? wechatPreviewActive : null;
    const dots = Array.from(document.querySelectorAll('#preview [data-theme-component="brand-terminal"] span'))
      .filter(s => /border-top-left-radius:\s*50%/.test(s.getAttribute('style') || ''));
    return {
      active,
      sizes: dots.map(d => {
        const r = d.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height) };
      }),
    };
  });
  expect(boxes.active).toBe(true);
  expect(boxes.sizes.length).toBe(3);
  boxes.sizes.forEach(({ w, h }) => {
    expect(w).toBeGreaterThanOrEqual(8);   // 塌掉时是 0.5px
    expect(Math.abs(w - h)).toBeLessThanOrEqual(2);   // 圆的，不是竖条
  });
  expect(page.errors).toEqual([]);
});

test('横滑目录卡：不用 display:grid，靠 overflow-x + inline-block 横排', async ({ page }) => {
  await useMode(page, 'brand-manual');
  await insert(page, 'toc');
  const info = await page.evaluate(() => {
    const el = editor.querySelector('[data-theme-component="brand-toc"]');
    const scroller = el.querySelector('[data-theme-role="toc-scroll"]');
    const cards = el.querySelectorAll('[data-theme-role="toc-card"], [data-theme-role="toc-card-active"]');
    return {
      html: el.outerHTML,
      scrollerOverflowX: scroller ? getComputedStyle(scroller).overflowX : null,
      scrollerWhiteSpace: scroller ? getComputedStyle(scroller).whiteSpace : null,
      cardCount: cards.length,
      cardsInlineBlock: Array.from(cards).every(c => getComputedStyle(c).display === 'inline-block'),
    };
  });
  expect(info.html).not.toMatch(/display\s*:\s*grid/i);
  expect(info.scrollerOverflowX).toBe('scroll');
  expect(info.scrollerWhiteSpace).toBe('nowrap');
  expect(info.cardCount).toBe(3);
  expect(info.cardsInlineBlock).toBe(true);
  expect(page.errors).toEqual([]);
});

test('横滑目录卡：预览区里卡片确实横向排布（不是竖着堆）', async ({ page }) => {
  await useMode(page, 'brand-manual');
  await insert(page, 'toc');
  const tops = await page.evaluate(() => {
    const cards = document.querySelectorAll('#preview [data-theme-role="toc-card"], #preview [data-theme-role="toc-card-active"]');
    return Array.from(cards).map(c => Math.round(c.getBoundingClientRect().top));
  });
  expect(tops.length).toBe(3);
  // 横排 → 三张卡 top 基本一致
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(2);
  expect(page.errors).toEqual([]);
});

test('数据卡：三组数字用 table 横排，预览里同一行', async ({ page }) => {
  await useMode(page, 'brand-manual');
  await insert(page, 'datacard');
  const info = await page.evaluate(() => {
    const nums = document.querySelectorAll('#preview [data-theme-role="data-num"]');
    return {
      count: nums.length,
      tops: Array.from(nums).map(n => Math.round(n.getBoundingClientRect().top)),
      html: editor.querySelector('[data-theme-component="brand-datacard"]').outerHTML,
    };
  });
  expect(info.count).toBe(3);
  expect(Math.max(...info.tops) - Math.min(...info.tops)).toBeLessThanOrEqual(2);
  expect(info.html).not.toMatch(/display\s*:\s*grid/i);
  expect(page.errors).toEqual([]);
});

test('组件配色跟随配色方案：切到 AI口袋绿 后金句块变绿', async ({ page }) => {
  await useMode(page, 'brand-manual');
  await page.evaluate(() => { selectColorScheme(1); });   // 1 = AI 口袋绿 #059669
  await page.waitForTimeout(250);
  await insert(page, 'quote');
  const color = await page.evaluate(() => {
    const q = document.querySelector('#preview [data-theme-role="quote"]');
    return getComputedStyle(q).color;
  });
  expect(color).toBe('rgb(5, 150, 105)');
  expect(page.errors).toEqual([]);
});

test('署名卡插第二个会先问一次', async ({ page }) => {
  await useMode(page, 'brand-manual');
  await insert(page, 'signature');
  let asked = false;
  page.on('dialog', () => { asked = true; });
  // 第二次插入：confirm 被 beforeEach 里的 handler 自动 accept，这里只验证问过
  await page.evaluate(() => insertBrandComponent('signature'));
  await page.waitForTimeout(400);
  expect(asked).toBe(true);
  expect(page.errors).toEqual([]);
});

test('导出到微信 HTML：组件不含公众号禁用的东西', async ({ page }) => {
  await useMode(page, 'brand-manual');
  // 一次把 7 个都插进去，再走导出管道
  await clearEditor(page);
  await page.evaluate(ids => {
    ids.forEach(id => {
      const r = document.createRange();
      r.selectNodeContents(editor.lastElementChild || editor);
      r.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      savedEditorRange = r.cloneRange();
      insertBrandComponent(id);
    });
    updatePreview();
  }, IDS);
  await page.waitForTimeout(600);

  const html = await page.evaluate(() => buildWechatHTMLFromElement(preview, false));
  // 公众号会过滤/改写这些
  expect(html).not.toMatch(/<style[\s>]/i);
  expect(html).not.toMatch(/<script[\s>]/i);
  expect(html).not.toMatch(/<link[\s>]/i);
  expect(html).not.toMatch(/\sclass\s*=/i);
  expect(html).not.toMatch(/display\s*:\s*grid/i);
  expect(html).not.toMatch(/position\s*:\s*(fixed|sticky)/i);
  expect(html).not.toMatch(/@media|@keyframes|@import/i);
  expect(html).not.toMatch(/var\s*\(\s*--/i);
  expect(html).not.toMatch(/white-space\s*:\s*pre/i);
  expect(page.errors).toEqual([]);
});

test('导出到微信 HTML：组件根节点的 flex 已转 block 并带宽度兜底', async ({ page }) => {
  await useMode(page, 'brand-manual');
  await insert(page, 'toc');
  const info = await page.evaluate(() => {
    const out = buildWechatHTMLFromElement(preview, false);
    const tpl = document.createElement('template');
    tpl.innerHTML = out;
    const el = tpl.content.querySelector('[data-theme-component="brand-toc"]');
    const style = el ? el.getAttribute('style') || '' : '';
    return { found: !!el, style };
  });
  expect(info.found).toBe(true);
  expect(info.style).not.toMatch(/display\s*:\s*flex/i);
  expect(info.style).toMatch(/max-width:\s*100%/i);
  expect(page.errors).toEqual([]);
});

test('design-intro 底部署名条不再被强刷成渐变（保持纯色，和题头统一）', async ({ page }) => {
  await useMode(page, 'ai-pocket-green');
  await page.evaluate(() => {
    editor.innerHTML = '<p><br></p>';
    const r = document.createRange();
    r.selectNodeContents(editor.querySelector('p'));
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
    savedEditorRange = r.cloneRange();
    insertDesignIntro();
    updatePreview();
  });
  await page.waitForTimeout(500);
  const bg = await page.evaluate(() => {
    const bar = document.querySelector('#preview [data-theme-component="design-intro"] [data-theme-role="bar"]');
    return bar ? getComputedStyle(bar).backgroundImage : null;
  });
  // 之前会是 linear-gradient(...)，修好后应该没有渐变
  expect(bg === 'none' || bg === null).toBe(true);
  expect(page.errors).toEqual([]);
});
