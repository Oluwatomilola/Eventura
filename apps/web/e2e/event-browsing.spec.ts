import { test, expect } from '@playwright/test';

test.describe('Event Browsing', () => {
  test('should search and view event details', async ({ page }) => {
    // Navigate to the events page
    await page.goto('/events');
    
    // Check if events are loaded
    const eventCards = page.locator('[data-testid="event-card"]');
    await expect(eventCards.first()).toBeVisible();
    
    // Search for an event
    const searchInput = page.getByPlaceholder('Search events...');
    await searchInput.fill('Test Event');
    await searchInput.press('Enter');
    
    // Wait for search results
    await page.waitForLoadState('networkidle');
    
    // Click on the first event
    const firstEvent = eventCards.first();
    const eventTitle = await firstEvent.locator('h3').textContent();
    expect(eventTitle).toBeTruthy();
    await firstEvent.click();
    
    // Verify we're on the event details page
    await expect(page).toHaveURL(/\/events\/[^/]+/);
    await expect(page.getByRole('heading', { name: eventTitle! })).toBeVisible();
    
    // Check event details
    await expect(page.getByText(/date and time/i)).toBeVisible();
    await expect(page.getByText(/location/i)).toBeVisible();
    await expect(page.getByText(/description/i)).toBeVisible();
    
    // Take a screenshot for visual regression testing
    await expect(page).toHaveScreenshot('event-details.png');
  });
});
