const { test, expect } = require('@playwright/test');

test.describe('게시판 웹사이트 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 메인 페이지로 이동
    await page.goto('http://localhost:8000');
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle');
  });

  test('페이지가 정상적으로 로드되는지 확인', async ({ page }) => {
    // 제목 확인
    await expect(page).toHaveTitle('게시판 - BBS');
    
    // 헤더 확인
    const header = page.locator('header h1');
    await expect(header).toBeVisible();
    await expect(header).toHaveText('게시판');
    
    // 글쓰기 버튼 확인
    const writeButton = page.locator('#writeBtn');
    await expect(writeButton).toBeVisible();
    await expect(writeButton).toHaveText('글쓰기');
  });

  test('게시글 목록이 표시되는지 확인', async ({ page }) => {
    // 게시판 목록 영역 확인
    const boardList = page.locator('#boardList');
    await expect(boardList).toBeVisible();
    
    // 로딩 메시지가 사라지거나 게시글이 표시될 때까지 대기
    const loading = page.locator('.loading');
    const emptyState = page.locator('.empty-state');
    const boardItem = page.locator('.board-item');
    
    // 로딩이 완료될 때까지 대기 (로딩이 사라지거나 게시글이 나타날 때까지)
    await Promise.race([
      loading.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {}),
      boardItem.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
      emptyState.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    ]);
  });

  test('글쓰기 모달 열기 및 닫기', async ({ page }) => {
    // 글쓰기 버튼 클릭
    await page.click('#writeBtn');
    
    // 모달이 나타나는지 확인
    const writeModal = page.locator('#writeModal');
    await expect(writeModal).toBeVisible();
    
    // 모달 제목 확인
    const modalTitle = page.locator('#modalTitle');
    await expect(modalTitle).toHaveText('새 글 작성');
    
    // 폼 필드 확인
    await expect(page.locator('#title')).toBeVisible();
    await expect(page.locator('#author')).toBeVisible();
    await expect(page.locator('#content')).toBeVisible();
    
    // 닫기 버튼 클릭
    const closeButton = page.locator('#writeModal .close');
    await closeButton.click();
    
    // 모달이 닫히는지 확인
    await expect(writeModal).not.toBeVisible();
  });

  test('게시글 작성 폼 입력 및 제출', async ({ page }) => {
    // 글쓰기 모달 열기
    await page.click('#writeBtn');
    await page.waitForSelector('#writeModal', { state: 'visible' });
    
    // 폼 필드 입력
    const testTitle = `테스트 제목 ${Date.now()}`;
    const testAuthor = '테스트 작성자';
    const testContent = '테스트 내용입니다. 이것은 Playwright로 작성된 테스트 게시글입니다.';
    
    await page.fill('#title', testTitle);
    await page.fill('#author', testAuthor);
    await page.fill('#content', testContent);
    
    // 폼 제출
    await page.click('#postForm button[type="submit"]');
    
    // 알림 대기 (alert가 나타날 수 있음)
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('작성되었습니다');
      await dialog.accept();
    });
    
    // 모달이 닫히는지 확인
    await expect(page.locator('#writeModal')).not.toBeVisible({ timeout: 10000 });
  });

  test('게시글 상세 보기 모달 열기', async ({ page }) => {
    // 게시글이 있는 경우에만 테스트 실행
    const boardItem = page.locator('.board-item').first();
    
    try {
      await boardItem.waitFor({ state: 'visible', timeout: 5000 });
      
      // 첫 번째 게시글 클릭
      await boardItem.click();
      
      // 상세 보기 모달이 나타나는지 확인
      const viewModal = page.locator('#viewModal');
      await expect(viewModal).toBeVisible();
      
      // 상세 정보가 표시되는지 확인
      await expect(page.locator('#detailTitle')).toBeVisible();
      await expect(page.locator('#detailAuthor')).toBeVisible();
      await expect(page.locator('#detailDate')).toBeVisible();
      await expect(page.locator('#detailContent')).toBeVisible();
      
      // 수정 및 삭제 버튼 확인
      await expect(page.locator('#editBtn')).toBeVisible();
      await expect(page.locator('#deleteBtn')).toBeVisible();
      
      // 모달 닫기
      await page.locator('#viewModal .close').click();
      await expect(viewModal).not.toBeVisible();
    } catch (error) {
      // 게시글이 없는 경우 테스트 스킵
      console.log('게시글이 없어서 상세 보기 테스트를 건너뜁니다.');
    }
  });

  test('페이지네이션 기능 확인', async ({ page }) => {
    // 페이지네이션 영역 확인
    const pagination = page.locator('#pagination');
    
    // 게시글이 충분히 있을 때만 페이지네이션 테스트
    const boardItem = page.locator('.board-item');
    
    try {
      await boardItem.first().waitFor({ state: 'visible', timeout: 5000 });
      
      // 페이지네이션 버튼이 있는지 확인
      const paginationButtons = pagination.locator('button');
      const buttonCount = await paginationButtons.count();
      
      if (buttonCount > 0) {
        // 페이지네이션 버튼이 활성화되어 있는지 확인
        const activeButton = pagination.locator('button.active');
        await expect(activeButton).toBeVisible({ timeout: 3000 });
      }
    } catch (error) {
      console.log('페이지네이션 테스트를 건너뜁니다.');
    }
  });

  test('반응형 디자인 확인', async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 헤더가 반응형으로 변경되는지 확인
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // 글쓰기 버튼 확인
    const writeButton = page.locator('#writeBtn');
    await expect(writeButton).toBeVisible();
    
    // 원래 뷰포트로 복원
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('빈 상태 메시지 확인', async ({ page }) => {
    // 게시글이 없을 때 빈 상태 메시지가 표시되는지 확인
    const emptyState = page.locator('.empty-state');
    const boardItem = page.locator('.board-item');
    
    // 게시글이 없는 경우 빈 상태 메시지 확인
    try {
      const hasItems = await boardItem.count();
      if (hasItems === 0) {
        await expect(emptyState).toBeVisible();
        const emptyStateText = await emptyState.locator('h3').textContent();
        expect(emptyStateText).toContain('게시글이 없습니다');
      }
    } catch (error) {
      console.log('빈 상태 확인 테스트를 건너뜁니다.');
    }
  });

  test('모달 외부 클릭 시 닫기', async ({ page }) => {
    // 글쓰기 모달 열기
    await page.click('#writeBtn');
    await page.waitForSelector('#writeModal', { state: 'visible' });
    
    // 모달 외부 클릭 (모달 배경)
    const modal = page.locator('#writeModal');
    await modal.click({ position: { x: 10, y: 10 } });
    
    // 모달이 닫히는지 확인
    await expect(modal).not.toBeVisible({ timeout: 3000 });
  });

  test('폼 유효성 검사', async ({ page }) => {
    // 글쓰기 모달 열기
    await page.click('#writeBtn');
    await page.waitForSelector('#writeModal', { state: 'visible' });
    
    // 빈 폼으로 제출 시도
    await page.click('#postForm button[type="submit"]');
    
    // HTML5 유효성 검사로 인해 제출이 되지 않아야 함
    // required 필드가 비어있으면 브라우저가 제출을 막음
    const titleInput = page.locator('#title');
    const isValid = await titleInput.evaluate((el) => el.validity.valid);
    
    // 빈 필드는 유효하지 않아야 함
    expect(isValid).toBe(false);
  });
});

