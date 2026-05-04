import { expect, test } from '@playwright/test'

const studentSession = {
  token: 'test-token',
  user: {
    id: 7,
    email: 'learner@example.com',
    displayName: 'Grace',
    role: 'student',
    coins: 140,
    travelerProfile: {
      avatar: {
        presetKey: 'north-star',
      },
    },
  },
}

const progressPayload = {
  user: {
    coins: 140,
    travelerProfile: {
      avatar: {
        presetKey: 'north-star',
      },
    },
  },
  years: {
    y2: {
      levels: [
        { id: 1, unlocked: true, completed: false, skipped: false },
      ],
    },
    y3: {
      levels: [
        { id: 1, unlocked: true, completed: false, skipped: false },
      ],
    },
  },
}

async function fulfillJson(route, data) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data }),
  })
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cw-web-language', 'en')
  })

  await page.route('**/api/auth/login', (route) => fulfillJson(route, studentSession))
  await page.route('**/api/progress', (route) => fulfillJson(route, progressPayload))
  await page.route('**/api/shop/items', (route) => fulfillJson(route, { items: [] }))
  await page.route('**/api/inventory', (route) => fulfillJson(route, { items: [] }))
})

test('renders the login page and switches to registration mode', async ({ page }) => {
  await page.goto('/login')

  await expect(page.getByRole('heading', { name: 'Student / Teacher Sign In' })).toBeVisible()
  await expect(page.getByText('XJTLU Portal')).toBeVisible()

  await page.getByRole('button', { name: 'Register', exact: true }).click()

  await expect(page.getByLabel('Display Name')).toBeVisible()
  await expect(page.locator('form.auth-panel button.submit-btn')).toHaveText('Create Account')
})

test('logs in a student and loads the map with mocked progress', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel('Email').fill('learner@example.com')
  await page.getByLabel('Password').fill('correct-horse-battery-staple')
  await page.locator('form.auth-panel button.submit-btn').click()

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: /Year 2/ })).toBeVisible()
  await expect(page.getByText('Overall Progress')).toBeVisible()
  await expect(page.getByText(/Grace|learner@example.com/)).toBeVisible()
})
