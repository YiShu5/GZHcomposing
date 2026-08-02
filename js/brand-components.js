// === 品牌手册模式专属组件库 ===
//
// 只在「品牌手册」(brand-manual) 模式下的「设计」面板里出现，其余模式的设计面板不变。
// 设计约定（都是为了公众号后台能正常显示，踩过的坑写在各组件里）：
//   1. 配色一律走 getColors()，不写死颜色，跟随用户选的配色方案
//   2. 横向布局用 table 或 inline-block，不用 display:grid（公众号不支持）
//   3. 代码块每行一个 <p style="margin:0">，缩进用全角空格，绝不用 white-space:pre
//   4. 装饰用的空元素塞一个 <br>，否则公众号会把空标签连样式一起吃掉
//   5. 组件根节点带 data-theme-component，wechat-compat 靠它做 flex→block 兜底

// 品牌手册组件的注册表：面板按这个顺序渲染，加组件只改这里
const BRAND_COMPONENTS = [
  { id: 'toc',       name: '横滑目录卡',     desc: '开头列 3-4 个看点，手指可横向滑动' },
  { id: 'quote',     name: '金句块',         desc: '左粗竖条 + 浅底，放核心观点' },
  { id: 'terminal',  name: '终端代码框',     desc: 'macOS 三色圆点，放命令行或提示词' },
  { id: 'datacard',  name: '数据卡',         desc: '一行三组数字 + 标签' },
  { id: 'notice',    name: '提示块',         desc: '左竖条 + 类型胶囊，放注意事项' },
  { id: 'enddiv',    name: 'END 分割线',     desc: '三点 + END + 细线，正文收尾' },
  { id: 'signature', name: '署名卡',         desc: '一句话简介 + 点赞在看转发引导' },
];

function buildBrandComponentHTML(id) {
  const c = getColors();
  const main = c.main || '#03ADF0';
  const accent = c.accent || '#F5C518';
  const sub = c.sub || '#E0F4FE';
  const text = c.text || '#2B2B2B';
  const muted = c.muted || '#9CA3AF';
  const line = c.line || '#E5E7EB';
  switch (id) {
    case 'toc':       return buildBrandTocHTML(main, accent, sub, text, muted, line);
    case 'quote':     return buildBrandQuoteHTML(main, sub, text);
    case 'terminal':  return buildBrandTerminalHTML(main, muted);
    case 'datacard':  return buildBrandDataCardHTML(main, text, muted, line);
    case 'notice':    return buildBrandNoticeHTML(main, sub, text);
    case 'enddiv':    return buildBrandEndDividerHTML(muted, line);
    case 'signature': return buildBrandSignatureHTML(main, sub, text, muted, line);
    default:          return '';
  }
}

// 横滑目录卡：overflow-x:scroll + inline-block 绕开公众号禁 display:grid。
// 首卡填主色作当前项，其余白底描边。
function buildBrandTocHTML(main, accent, sub, text, muted, line) {
  const card = (kicker, title, caption, active) => `<section data-theme-role="${active ? 'toc-card-active' : 'toc-card'}" style="display:inline-block;vertical-align:top;white-space:normal;box-sizing:border-box;min-width:132px;max-width:132px;margin:0 12px 0 0;padding:16px;border-radius:16px;background:${active ? main : '#FFFFFF'};border:${active ? '1px solid ' + main : '1.5px solid ' + line};box-shadow:${active ? '0 10px 22px ' + alphaColor(main, 0.18, 'rgba(3,173,240,0.18)') : '0 4px 14px rgba(17,24,39,0.045)'};overflow:hidden;">
      <p style="margin:0 0 14px;font-size:12px;font-weight:900;letter-spacing:1.8px;line-height:1;color:${active ? 'rgba(255,255,255,0.78)' : muted};">${kicker}</p>
      <p style="margin:0;font-size:16px;font-weight:900;line-height:1.35;color:${active ? '#FFFFFF' : '#111827'};">${title}</p>
      <p style="margin:10px 0 0;font-size:11px;font-weight:800;letter-spacing:1px;line-height:1.35;color:${active ? 'rgba(255,255,255,0.74)' : muted};">${caption}</p>
    </section>`;
  return `<section data-theme-component="brand-toc" style="display:block;margin:0 0 32px;padding:0;box-sizing:border-box;width:100%;max-width:100%;background:#FFFFFF;overflow:hidden;">
    <table style="width:100%;border-collapse:collapse;border-spacing:0;border:0;margin:0 0 14px;"><tbody><tr>
      <td style="border:0;padding:0;vertical-align:middle;text-align:left;">
        <span style="display:inline-block;font-size:13px;font-weight:900;letter-spacing:3px;color:${muted};">📦 3 PARTS</span>
      </td>
      <td style="border:0;padding:0;vertical-align:middle;text-align:right;">
        <span style="display:inline-block;font-size:12px;font-weight:800;color:${muted};">👉 滑动</span>
      </td>
    </tr></tbody></table>
    <section data-theme-role="toc-scroll" style="display:block;overflow-x:scroll;overflow-y:hidden;-webkit-overflow-scrolling:touch;white-space:nowrap;padding:0 0 8px;margin:0;box-sizing:border-box;font-size:0;">
      ${card('PART 01', '第一个看点', 'OVERVIEW', true)}
      ${card('PART 02', '第二个看点', 'METHOD', false)}
      ${card('PART ///', '写在最后', 'CONCLUSION', false)}
    </section>
  </section><p><br></p>`;
}

// 金句块：左 4px 粗竖条 + 浅底 + 不对称圆角（右侧圆左侧直，视觉上像被竖条"钉"住）
function buildBrandQuoteHTML(main, sub, text) {
  return `<section data-theme-component="brand-quote" style="display:block;margin:0 0 24px;padding:18px 22px;box-sizing:border-box;width:100%;max-width:100%;background:${sub};border-left:4px solid ${main};border-radius:0 10px 10px 0;">
    <p data-theme-role="quote" style="margin:0;font-size:16px;font-weight:800;line-height:1.8;color:${main};">「在这里写核心观点或金句」</p>
  </section><p><br></p>`;
}

// 终端代码框：标题栏三个红黄绿圆点 + 每行一个 <p style="margin:0">。
// 三个必须遵守的点：
// 1. 圆点用字符「.」配 font-size:0 撑住 —— 公众号会吃掉真正的空元素；
// 2. 圆点的宽度靠左右 padding 撑，不能用 width:10px —— sanitizeFixedWidthsForWechat
//    会把所有 width:Npx 全局改写成 max-width:Npx（为了规避公众号「宽度异常」警告），
//    没有 width 的空内容 span 会塌成 0.5px 细条；
// 3. 代码缩进用全角空格，不能用 white-space:pre —— 公众号会把源码缩进渲染成一大片左空白。
function buildBrandTerminalHTML(main, muted) {
  const dot = (color, last) => `<span style="display:inline-block;height:10px;padding:0 5px;border-radius:50%;background:${color};margin-right:${last ? '0' : '7px'};font-size:0;line-height:10px;overflow:hidden;vertical-align:middle;">.</span>`;
  const codeLine = txt => `<p style="margin:0;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;line-height:1.6;color:#E2E8F0;">${txt}</p>`;
  return `<section data-theme-component="brand-terminal" style="display:block;margin:0 0 24px;padding:0;box-sizing:border-box;width:100%;max-width:100%;border-radius:8px;overflow:hidden;background:#1E293B;box-shadow:0 4px 16px rgba(15,23,42,0.22);">
    <section style="display:block;padding:9px 14px;background:#0F172A;">
      ${dot('#FF5F56')}${dot('#FFBD2E')}${dot('#27C93F', true)}
      <span style="display:inline-block;margin-left:12px;font-size:12px;font-family:Consolas,Monaco,monospace;letter-spacing:1px;color:#64748B;vertical-align:middle;">bash</span>
    </section>
    <section style="display:block;padding:12px 14px;">
      ${codeLine('npm install')}
      ${codeLine('　　# 缩进用全角空格，公众号里才不会塌')}
    </section>
  </section><p><br></p>`;
}

// 数据卡：一行三组数字 + 标签，用 table 保证公众号里横向排列
function buildBrandDataCardHTML(main, text, muted, line) {
  const cell = (num, label, first) => `<td style="border:0;${first ? '' : 'border-left:1px solid ' + line + ';'}padding:0 8px;vertical-align:middle;text-align:center;width:33%;">
        <p data-theme-role="data-num" style="margin:0 0 6px;font-size:26px;font-weight:900;line-height:1;letter-spacing:-1px;color:${main};">${num}</p>
        <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:1px;line-height:1.4;color:${muted};">${label}</p>
      </td>`;
  return `<section data-theme-component="brand-datacard" style="display:block;margin:0 0 24px;padding:22px 16px;box-sizing:border-box;width:100%;max-width:100%;background:#FFFFFF;border:1.5px solid ${line};border-radius:14px;">
    <table style="width:100%;border-collapse:collapse;border-spacing:0;border:0;margin:0;"><tbody><tr>
      ${cell('12', '第一项', true)}
      ${cell('86%', '第二项', false)}
      ${cell('3.5x', '第三项', false)}
    </tr></tbody></table>
  </section><p><br></p>`;
}

// 提示块：左竖条 + 类型胶囊 + 正文，和已有 tip-card 同源但带胶囊标签
// 竖条用 main 不用 accent：跟已有的 tip-card 对齐（js/components.js 的 buildTipCardHTML
// 也是 border-left:4px solid main），否则金竖条配蓝胶囊两个色打架。
function buildBrandNoticeHTML(main, sub, text) {
  return `<section data-theme-component="brand-notice" style="display:block;margin:0 0 24px;padding:16px 20px;box-sizing:border-box;width:100%;max-width:100%;background:#FFFFFF;border-left:4px solid ${main};border-radius:0 10px 10px 0;box-shadow:0 4px 14px rgba(17,24,39,0.045);">
    <p style="margin:0 0 8px;">
      <span data-theme-role="notice-tag" style="display:inline-block;padding:3px 10px;border-radius:6px;background:${sub};font-size:11px;font-weight:900;letter-spacing:1px;line-height:1.4;color:${main};">注意</span>
    </p>
    <p data-theme-role="body" style="margin:0;font-size:15px;font-weight:400;line-height:1.8;color:${text};">在这里写需要提醒读者的内容。</p>
  </section><p><br></p>`;
}

// END 分割线：三点 + END + 细线。空的线段里塞 <br>，否则公众号会连样式一起吃掉。
function buildBrandEndDividerHTML(muted, line) {
  const rule = () => `<td style="border:0;padding:0;vertical-align:middle;width:40%;"><section style="display:block;border-top:1px solid ${line};font-size:0;line-height:0;"><br></section></td>`;
  return `<section data-theme-component="brand-enddiv" style="display:block;margin:36px 0 28px;padding:0;box-sizing:border-box;width:100%;max-width:100%;">
    <table style="width:100%;border-collapse:collapse;border-spacing:0;border:0;margin:0;"><tbody><tr>
      ${rule()}
      <td style="border:0;padding:0 12px;vertical-align:middle;text-align:center;white-space:nowrap;">
        <span style="display:inline-block;font-size:11px;font-weight:900;letter-spacing:3px;color:${muted};">· · ·　END</span>
      </td>
      ${rule()}
    </tr></tbody></table>
  </section><p><br></p>`;
}

// 署名卡：一句话简介 + 点赞/在看/转发引导。一篇文章只该有一个，插之前会提示。
function buildBrandSignatureHTML(main, sub, text, muted, line) {
  return `<section data-theme-component="brand-signature" style="display:block;margin:32px 0 0;padding:24px 22px;box-sizing:border-box;width:100%;max-width:100%;background:${sub};border-radius:14px;">
    <p style="margin:0 0 10px;font-size:11px;font-weight:900;letter-spacing:3px;line-height:1;color:${main};">ABOUT · 关于作者</p>
    <p data-theme-role="body" style="margin:0 0 14px;font-size:15px;font-weight:400;line-height:1.8;color:${text};">我是意疏，在这里写一句话简介。</p>
    <section style="display:block;border-top:1px solid ${alphaColor(main, 0.16, line)};padding:14px 0 0;margin:0;">
      <p style="margin:0;font-size:13px;font-weight:700;line-height:1.7;color:${muted};">觉得有收获，欢迎<span style="color:${main};font-weight:900;">点赞、在看、转发</span>三连，我们下篇见。</p>
    </section>
  </section>`;
}
