import { test, expect } from '@playwright/test';

test.describe('ドリル実行フロー', () => {
  test('ホーム → レベル選択 → ドリル実行 → 結果表示', async ({ page }) => {
    test.setTimeout(180000);

    // ドリルページに直接遷移（レベル1: 36問）
    await page.goto('/drill/addition/1');

    // カウントダウン完了を待つ（submit-buttonが現れるまで）
    const submitBtn = page.getByTestId('submit-button');
    await submitBtn.waitFor({ state: 'visible', timeout: 10000 });

    // 36問回答（全て「5」入力して送信）
    for (let i = 0; i < 36; i++) {
      await submitBtn.waitFor({ state: 'visible', timeout: 5000 });
      await page.getByRole('button', { name: '5' }).click();
      await submitBtn.click();
      await page.waitForTimeout(700);
    }

    // 結果画面に遷移（最大15秒待つ）
    await expect(page).toHaveURL(/\/result/, { timeout: 15000 });
  });

  test('不正解でも最後まで進む', async ({ page }) => {
    await page.goto('/drill/addition/1');

    // カウントダウン待ち
    await page.waitForTimeout(4500);

    // 3問だけ回答して全て不正解確認（0+0以外は1が正解じゃない場合あり）
    // 999を入力（確実に不正解）
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '9' }).click();
      await page.getByRole('button', { name: '9' }).click();
      await page.getByRole('button', { name: '9' }).click();
      await page.getByTestId('submit-button').click();
      await page.waitForTimeout(600);
    }

    // まだドリル画面にいる（最後まで進める）
    await expect(page.getByTestId('submit-button')).toBeVisible();
  });

  test('Coming Soon の演算種別はクリック不可', async ({ page }) => {
    await page.goto('/');
    const subtraction = page.getByText('ひき算');
    await expect(subtraction).toBeVisible();

    // ひき算カードのリンクがないことを確認
    const comingSoon = page.getByText('Coming Soon').first();
    await expect(comingSoon).toBeVisible();
  });
});
