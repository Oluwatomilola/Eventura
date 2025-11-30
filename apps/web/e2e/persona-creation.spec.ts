import { test, expect } from '@playwright/test';

test.describe('Persona Creation', () => {
  test('should create a new persona for an event', async ({ page }) => {
    // Navigate to an event page where the user has a ticket
    await page.goto('/events/1');
    
    // Check if create persona button is visible (should be visible if user has a ticket)
    const createPersonaButton = page.getByRole('button', { name: /create persona/i });
    await expect(createPersonaButton).toBeVisible();
    
    // Click the create persona button
    await createPersonaButton.click();
    
    // Fill out the persona form
    await page.getByLabel('Display Name').fill('Test Persona');
    await page.getByLabel('Bio').fill('This is a test bio for my persona');
    await page.getByLabel('Interests').fill('Blockchain, Web3, NFTs');
    await page.getByLabel('Looking For').fill('Networking, Friends, Collaborators');
    
    // Submit the form
    const submitButton = page.getByRole('button', { name: /create persona/i });
    await submitButton.click();
    
    // Verify success message
    await expect(page.getByText(/persona created successfully/i)).toBeVisible();
    
    // Verify navigation to the event attendees page
    await expect(page).toHaveURL(/\/events\/\d+\/attendees/);
    
    // Verify the persona is listed
    await expect(page.getByText('Test Persona')).toBeVisible();
  });
});
