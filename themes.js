// ===================================================================
// STATE
// ===================================================================
const DEFAULT_MODE_ID = 'brand-manual';
const STATE = {
  mode: DEFAULT_MODE_ID,
  titleFont: 1,
  bodyFont: 0,
  colorScheme: 0, // index in COLOR_SCHEMES; 0=哆啦A梦
  customColors: null,
  lineHeight: 1.85,
  paraSpacing: 1.2,
  isMobile: false,
  bg: 'plain'
};

// ===================================================================
// BACKGROUND TEXTURES
// ===================================================================
const BG_TEXTURES = [
  { id:'plain', name:'纯白', css:'#FFFFFF' },
  { id:'ivory-fiber', name:'暖米底', css:'radial-gradient(ellipse at 18% 22%, rgba(172,132,76,0.05) 0 0.7px, transparent 1.2px), radial-gradient(ellipse at 64% 40%, rgba(155,128,78,0.04) 0 0.7px, transparent 1.2px), repeating-linear-gradient(22deg, transparent 0 24px, rgba(170,150,110,0.012) 24px 25px), #F5F3F0', cssBgSize:'58px 56px, 68px 66px, 42px 42px' }
];

// ===================================================================
// FONT DEFINITIONS
// ===================================================================
const TITLE_FONTS = [
  { name: '阿里巴巴普惠体 Bold', stack: '"Alibaba PuHuiTi","PingFang SC","Microsoft YaHei",sans-serif', weight: 'bold' },
  { name: '思源黑体 Bold', stack: '"Source Han Sans SC","Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif', weight: 'bold' },
  { name: '思源宋体 Bold', stack: '"Source Han Serif SC","Noto Serif SC","STSong","SimSun",serif', weight: 'bold' },
  { name: '苹方 Medium', stack: '"PingFang SC","Microsoft YaHei",sans-serif', weight: '500' },
  { name: '微软雅黑 Bold', stack: '"Microsoft YaHei","PingFang SC",sans-serif', weight: 'bold' },
  { name: '楷体', stack: '"STKaiti","KaiTi","楷体",serif', weight: 'normal' }
];
const BODY_FONTS = [
  { name: '思源黑体 Regular', stack: '"Source Han Sans SC","Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif', weight: 'normal' },
  { name: '苹方 Regular', stack: '"PingFang SC","Microsoft YaHei",sans-serif', weight: 'normal' },
  { name: '思源宋体 Regular', stack: '"Source Han Serif SC","Noto Serif SC","STSong","SimSun",serif', weight: 'normal' },
  { name: '楷体', stack: '"STKaiti","KaiTi","楷体",serif', weight: 'normal' }
];

// ===================================================================
// COLOR SCHEMES
// ===================================================================
const COLOR_SCHEMES = [
  { name:'哆啦A梦', main:'#03ADF0', sub:'#E0F4FE', accent:'#F5C518', deep:'#016FAD', text:'#2B2B2B', bg:'#F5F3F0', gradient:'linear-gradient(135deg, #016FAD 0%, #03ADF0 50%, #F5C518 100%)' }
];

// ===================================================================
// MODE DEFINITIONS
// ===================================================================
const MODES = [
  {
    id:'brand-manual', name:'品牌手册',
    desc:'蓝金 · 克制高级',
    titleFont:1, bodyFont:0, color:0,
    lineHeight:1.85, paraSpacing:1.2,
    headingStyle:'left-bar-gold',
    quoteStyle:'left-bar-blue',
    hrStyle:'center-gold'
  }
];

const MODE_META = {
  'brand-manual': { emoji:'🔖', color:'#F5C518' },
};

// ===================================================================
// DEFAULT CONTENT
// ===================================================================
const DEFAULT_HTML = `<p>这是「意疏的 AI 口袋」公众号排版器 —— 一个纯前端、零后端、自带哆啦A梦气质的写作工作台。品牌手册排版，一种就够了：蓝做骨架、金做点缀，克制、干净、每一件都准。Markdown 直接粘贴自动识别、自动保存草稿、撤销重做、一键复制到公众号 —— 全部在本地完成。</p>
<h2>一种风格，就够了</h2>
<p>不用在十几种模板里反复横跳。「品牌手册」把字体、配色、标题、引用、分割线一次配齐，你只管写：</p>
<ul>
<li><strong>暖灰底 + 哆啦A梦蓝骨架</strong> — 不是刺眼的纯白，是有呼吸感的暖灰</li>
<li><strong>标题左侧一条铃铛金竖线</strong> — 不堆渐变色块，干净利落</li>
<li><strong>引用淡蓝底 + 蓝竖线</strong> — 重点一眼可见，不喧宾夺主</li>
<li><strong>分割线只是一截居中金线</strong> — 什么都不多，但每一件都准</li>
</ul>
<h2>哆啦A梦两件套</h2>
<p>左上角和工具栏里藏着两个互动元素，欢迎逐一点开试试：</p>
<ul>
<li><strong>🔵 哆啦A梦头像</strong>（左上角）— 戳一下从口袋掏件道具，<em>连点 5/10/15 下有隐藏惊喜</em></li>
<li><strong>👜 哆啦A梦的口袋</strong>（工具栏右，黄色按钮）— 装着引用 / 提示卡片 / 代码块 / 对齐 / 编号标题 / 图片 / 分割线 / 段间空</li>
</ul>
<h2>核心功能速览</h2>
<ul>
<li><strong>✨ 预处理</strong>（工具栏左）— 5 种文章类型一键梳理纯文本：保守整理 / 长文分层 / 教程步骤 / 种草清单 / 口播转图文</li>
<li><strong>🎛 设计</strong>（工具栏中）— 插入大型设计组件（开篇引导、章节卡、结尾签名）</li>
<li><strong>📝 结尾</strong>（工具栏右）— 4 种风格的结尾卡片，自动跟随主题色</li>
<li><strong>💬 微信预览</strong>（预览栏右上）— 提前看到「粘到公众号会变什么样」，避免来回切窗口</li>
<li><strong>📋 一键复制到公众号</strong>（右下）— 所有样式自动转内联，公众号后台直接 Ctrl+V</li>
<li><strong>📤 导出</strong>（右下）— 支持 HTML / Markdown / JSON 样式三种导出</li>
</ul>
<blockquote>不用担心写一半丢稿子 —— 编辑器每 5 秒自动存一次，关页面前再存一次，7 天内重新打开会问你要不要恢复。改错了想反悔？按一下 Ctrl+Z 就回到上一步，最多能回退 60 步。</blockquote>
<h3>Markdown 语法支持</h3>
<p>常用 Markdown 全部支持：<strong>加粗</strong>、<em>斜体</em>、标题、引用、列表、代码块。从飞书 / Word / Notion 复制带 Markdown 的内容自动解析。</p>
<pre><code>// 示例代码块\nfunction hello() {\n  console.log('公众号排版，一键搞定');\n}</code></pre>
<hr>
<p>清空这段内容、开始创作吧 —— 写完试试戳一下左上角的哆啦A梦，连点很多下有惊喜。</p>
<div data-ending-block="true" data-theme-component="ending" data-ending-type="3" style="margin-top:2em">
  <div data-ending-type="3" style="background:linear-gradient(135deg, rgba(30,58,95,0.12), rgba(15,23,42,0.05));border-radius:12px;padding:32px;text-align:center;margin:2em 0">
    <div data-theme-role="title" style="font-size:16px;font-weight:600;color:#1E3A5F;margin-bottom:8px">欢迎点赞 · 在看 · 转发</div>
    <div data-theme-role="meta" style="font-size:12px;color:#1E3A5F;opacity:0.52">你的支持是我创作的动力</div>
  </div>
</div>`;
