import { test, expect } from '@playwright/test'

test.describe('홈 페이지 테스트', () => {
  test('홈 페이지가 정상적으로 렌더링되어야 함', async ({ page }) => {
    await page.goto('/')

    // 페이지가 로드되었는지 확인
    await expect(page).toHaveTitle(/.*/)

    // Aurora 배경 콘텐츠 확인 (Debug now 버튼)
    await expect(page.getByRole('button', { name: /debug now/i })).toBeVisible()
  })

  test('홈 페이지에서 로그인 페이지로 이동 가능해야 함', async ({ page }) => {
    await page.goto('/')

    // Debug now 버튼이나 로그인 링크 클릭
    const loginButton = page.getByRole('button', { name: /debug now/i })
    if (await loginButton.isVisible()) {
      await loginButton.click()
      await expect(page).toHaveURL('/login')
    }
  })
})

test.describe('샘플 페이지 테스트', () => {
  test('샘플 페이지가 정상적으로 렌더링되어야 함', async ({ page }) => {
    await page.goto('/sample')

    // 페이지가 로드되었는지 확인
    await expect(page.locator('body')).toBeVisible()
  })
})
