import { test, expect } from '@playwright/test'

test.describe('인증 페이지 테스트', () => {
  test('로그인 페이지가 정상적으로 렌더링되어야 함', async ({ page }) => {
    await page.goto('/login')

    // 페이지 제목 확인
    await expect(page.getByRole('heading', { name: /환영합니다/i })).toBeVisible()

    // 폼 요소 확인
    await expect(page.getByLabel(/이메일/i)).toBeVisible()
    await expect(page.getByLabel(/비밀번호/i)).toBeVisible()
    await expect(page.getByRole('button', { name: '로그인', exact: true })).toBeVisible()

    // 링크 확인
    await expect(page.getByRole('link', { name: /비밀번호를 잊으셨나요/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /회원가입/i })).toBeVisible()
  })

  test('로그인 폼 유효성 검사가 동작해야 함', async ({ page }) => {
    await page.goto('/login')

    // 빈 폼 제출
    await page.getByRole('button', { name: '로그인', exact: true }).click()

    // 에러 메시지 확인
    await expect(page.getByText(/이메일을 입력해주세요/i)).toBeVisible()
    await expect(page.getByText(/비밀번호를 입력해주세요/i)).toBeVisible()
  })

  test('이메일 필드만 입력했을 때 비밀번호 유효성 검사', async ({ page }) => {
    await page.goto('/login')

    // 이메일만 입력하고 비밀번호는 비워둠
    await page.getByLabel(/이메일/i).fill('test@example.com')
    await page.getByRole('button', { name: '로그인', exact: true }).click()

    // 비밀번호 에러 메시지 확인
    await expect(page.getByText(/비밀번호를 입력해주세요/i)).toBeVisible()
  })

  test('회원가입 페이지가 정상적으로 렌더링되어야 함', async ({ page }) => {
    await page.goto('/signup')

    // 페이지 제목 확인
    await expect(page.getByRole('heading', { name: /계정을 만들어보세요/i })).toBeVisible()

    // 폼 요소 확인
    await expect(page.getByLabel(/이름/i)).toBeVisible()
    await expect(page.getByLabel(/이메일/i)).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('#confirmPassword')).toBeVisible()
    await expect(page.getByRole('button', { name: '회원가입', exact: true })).toBeVisible()
  })

  test('회원가입 비밀번호 유효성 검사', async ({ page }) => {
    await page.goto('/signup')

    // 약한 비밀번호 입력
    await page.getByLabel(/이메일/i).fill('test@example.com')
    await page.locator('#password').fill('123')
    await page.locator('#confirmPassword').fill('123')
    await page.getByRole('button', { name: '회원가입', exact: true }).click()

    // 에러 메시지 확인 (8자 이상)
    await expect(page.getByText(/비밀번호는 최소 8자 이상/i)).toBeVisible()
  })

  test('비밀번호 확인 불일치 검사', async ({ page }) => {
    await page.goto('/signup')

    await page.getByLabel(/이메일/i).fill('test@example.com')
    await page.locator('#password').fill('Password123')
    await page.locator('#confirmPassword').fill('DifferentPassword123')
    await page.getByRole('button', { name: '회원가입', exact: true }).click()

    // 에러 메시지 확인
    await expect(page.getByText(/비밀번호가 일치하지 않습니다/i)).toBeVisible()
  })

  test('비밀번호 찾기 페이지가 정상적으로 렌더링되어야 함', async ({ page }) => {
    await page.goto('/forgot')

    // 페이지 제목 확인 (CardTitle은 div이므로 텍스트로 검색)
    await expect(page.getByText('비밀번호를 잊으셨나요?')).toBeVisible()

    // 폼 요소 확인
    await expect(page.getByLabel(/이메일/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /재설정 링크 보내기/i })).toBeVisible()
  })

  test('로그인 페이지에서 회원가입 페이지로 이동', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('link', { name: /회원가입/i }).click()

    await expect(page).toHaveURL('/signup')
  })

  test('회원가입 페이지에서 로그인 페이지로 이동', async ({ page }) => {
    await page.goto('/signup')

    await page.getByRole('link', { name: /로그인/i }).click()

    await expect(page).toHaveURL('/login')
  })
})
