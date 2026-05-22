// @ts-check
const { defineConfig, devices } = require('@playwright/test');

// 防止系统代理（socks5 / http）拦截 webServer 健康检测请求，导致误判端口已占用
process.env.NO_PROXY = [process.env.NO_PROXY, '127.0.0.1', 'localhost'].filter(Boolean).join(',');
process.env.no_proxy = process.env.NO_PROXY;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 15_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: 'http://127.0.0.1:3001',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
  },

  webServer: {
    command: 'npx serve . --listen tcp://127.0.0.1:3001 --no-clipboard --no-port-switching',
    url: 'http://127.0.0.1:3001',
    reuseExistingServer: false,
    timeout: 20_000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
