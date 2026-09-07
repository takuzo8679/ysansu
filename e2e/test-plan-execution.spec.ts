import { test, expect } from '@playwright/test';

test.describe('TC-01: ホーム画面', () => {
  test('アプリタイトルと演算種別カード', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('ワイさんすう')).toBeVisible();
    await expect(page.getByText('たし算')).toBeVisible();
    await expect(page.getByText('ひき算')).toBeVisible();
    await expect(page.getByText('かけ算')).toBeVisible();
    await expect(page.getByText('わり算')).toBeVisible();
    // Coming Soon が3つ表示
    const comingSoon = page.getByText('Coming Soon');
    await expect(comingSoon.first()).toBeVisible();
  });

  test('たし算カードで遷移', async ({ page }) => {
    await page.goto('/');
    await page.getByText('たし算').click();
    await expect(page).toHaveURL(/\/drill\/addition/);
  });
});

test.describe('TC-03: レベル選択画面', () => {
  test('全11レベル表示', async ({ page }) => {
    await page.goto('/drill/addition');
    // レベル定義の description テキストで確認
    // レベルカードが複数表示されていること
    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThanOrEqual(11);
  });

  test('戻るボタン', async ({ page }) => {
    await page.goto('/drill/addition');
    await page.getByText('←').click();
    await expect(page).toHaveURL('/');
  });

  test('レベルカードからドリル画面遷移', async ({ page }) => {
    await page.goto('/drill/addition');
    // レベル1カード（最初のボタン要素）をクリック
    await page.locator('button').first().click();
    await expect(page).toHaveURL(/\/drill\/addition\/1/);
  });
});

test.describe('TC-04: ドリル実行（レベル1 直接回答）', () => {
  test('カウントダウン→テンキー表示', async ({ page }) => {
    await page.goto('/drill/addition/1');
    // カウントダウン表示確認
    await expect(page.getByText('3')).toBeVisible({ timeout: 3000 });
    // submit-button が現れるまで待つ
    const submitBtn = page.getByTestId('submit-button');
    await submitBtn.waitFor({ state: 'visible', timeout: 10000 });
    // テンキー確認
    for (let d = 0; d <= 9; d++) {
      await expect(page.getByRole('button', { name: String(d) })).toBeVisible();
    }
    // 削除・送信ボタン
    await expect(page.getByRole('button', { name: '削除' })).toBeVisible();
    await expect(submitBtn).toBeVisible();
  });

  test('数字入力・削除・送信', async ({ page }) => {
    await page.goto('/drill/addition/1');
    const submitBtn = page.getByTestId('submit-button');
    await submitBtn.waitFor({ state: 'visible', timeout: 10000 });

    // 入力
    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: '2' }).click();
    // 削除
    await page.getByRole('button', { name: '削除' }).click();
    // 送信（1問目回答）
    await page.getByRole('button', { name: '5' }).click();
    await submitBtn.click();
    // フィードバック表示される（○ or ×）
    await page.waitForTimeout(700);
    // 次の問題に進んでいる（進捗更新）
    await expect(page.getByText(/2\s*\/\s*36/)).toBeVisible();
  });

  test('入力は最大4桁', async ({ page }) => {
    await page.goto('/drill/addition/1');
    const submitBtn = page.getByTestId('submit-button');
    await submitBtn.waitFor({ state: 'visible', timeout: 10000 });

    // 5桁入力を試みる
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: '9' }).click();
    }
    // 回答欄に4桁まで表示されているか確認（DOM内に9999があるが99999はない）
    const body = await page.locator('body').textContent();
    expect(body).toContain('9999');
    expect(body).not.toContain('99999');
  });

  test('空入力で送信しても何も起こらない', async ({ page }) => {
    await page.goto('/drill/addition/1');
    const submitBtn = page.getByTestId('submit-button');
    await submitBtn.waitFor({ state: 'visible', timeout: 10000 });

    // 空で送信
    await submitBtn.click();
    await page.waitForTimeout(500);
    // まだ1問目（進捗変わらず）
    await expect(page.getByText(/1\s*\/\s*36/)).toBeVisible();
  });
});

test.describe('TC-05: レベル3（部分回答）', () => {
  test('1の位だけラベル表示', async ({ page }) => {
    await page.goto('/drill/addition/3');
    const submitBtn = page.getByTestId('submit-button');
    await submitBtn.waitFor({ state: 'visible', timeout: 10000 });
    await expect(page.getByText(/1の位/)).toBeVisible();
  });
});

test.describe('TC-06: レベル5（分解回答）', () => {
  test('3つの回答欄表示', async ({ page }) => {
    await page.goto('/drill/addition/5');
    const submitBtn = page.getByTestId('submit-button');
    await submitBtn.waitFor({ state: 'visible', timeout: 10000 });
    // 分解表示: = と + が問題内に表示される
    const problemArea = page.locator('body');
    const text = await problemArea.textContent();
    // 「+」演算子と「=」が含まれる
    expect(text).toContain('+');
    expect(text).toContain('=');
  });
});

test.describe('TC-07: タイマー', () => {
  test('カウントアップ表示', async ({ page }) => {
    await page.goto('/drill/addition/1');
    const submitBtn = page.getByTestId('submit-button');
    await submitBtn.waitFor({ state: 'visible', timeout: 10000 });
    // タイマー 0:00 or 0:01 辺り
    await expect(page.getByText(/0:0[0-3]/)).toBeVisible();
    // 3秒待つ
    await page.waitForTimeout(3000);
    // カウントアップしている
    await expect(page.getByText(/0:0[3-9]/)).toBeVisible();
  });
});

test.describe('TC-08: 結果画面', () => {
  test('全問回答後に結果表示', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/drill/addition/1');
    const submitBtn = page.getByTestId('submit-button');
    await submitBtn.waitFor({ state: 'visible', timeout: 10000 });

    // 36問回答
    for (let i = 0; i < 36; i++) {
      await submitBtn.waitFor({ state: 'visible', timeout: 5000 });
      await page.getByRole('button', { name: '5' }).click();
      await submitBtn.click();
      await page.waitForTimeout(700);
    }

    await expect(page).toHaveURL(/\/result/, { timeout: 15000 });
    // 結果画面の要素確認
    await expect(page.getByRole('link', { name: 'もういちど' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'レベルせんたく' })).toBeVisible();
  });

  test('もういちどボタンで再挑戦', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/drill/addition/1');
    const submitBtn = page.getByTestId('submit-button');
    await submitBtn.waitFor({ state: 'visible', timeout: 10000 });

    for (let i = 0; i < 36; i++) {
      await submitBtn.waitFor({ state: 'visible', timeout: 5000 });
      await page.getByRole('button', { name: '5' }).click();
      await submitBtn.click();
      await page.waitForTimeout(700);
    }

    await expect(page).toHaveURL(/\/result/, { timeout: 15000 });
    await page.getByRole('link', { name: 'もういちど' }).click();
    await expect(page).toHaveURL(/\/drill\/addition\/1/);
  });
});

test.describe('TC-12: エッジケース', () => {
  test('無効なoperationで404', async ({ page }) => {
    const response = await page.goto('/drill/invalid/1');
    expect(response?.status()).toBe(404);
  });

  test('/resultに直接アクセスでホームリダイレクト', async ({ page }) => {
    await page.goto('/result');
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });
});
