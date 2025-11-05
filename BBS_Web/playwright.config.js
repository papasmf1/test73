// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright 테스트 설정
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* 테스트 실행 최대 시간 (30초) */
  timeout: 30 * 1000,
  expect: {
    /* assertion의 타임아웃 (5초) */
    timeout: 5000
  },
  /* 병렬 실행 설정 */
  fullyParallel: true,
  /* 실패 시 재시도 */
  retries: process.env.CI ? 2 : 0,
  /* 병렬 실행 워커 수 */
  workers: process.env.CI ? 1 : undefined,
  /* 보고서 설정 */
  reporter: 'html',
  /* 공유 설정 */
  use: {
    /* 기본 액션 타임아웃 */
    actionTimeout: 0,
    /* 스크린샷 찍기 */
    screenshot: 'only-on-failure',
    /* 비디오 녹화 */
    video: 'retain-on-failure',
    /* 트레이스 수집 */
    trace: 'on-first-retry',
  },

  /* 프로젝트별 브라우저 설정 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* 로컬 서버 설정 */
  webServer: {
    command: 'npx http-server -p 8000',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

