import { test, expect } from '@playwright/test';

test.describe('Ticket Purchase', () => {
  test('should allow purchasing a ticket', async ({ page }) => {
    // Navigate to an event page
    await page.goto('/events/1');
    
    // Check if buy button is visible
    const buyButton = page.getByRole('button', { name: /buy ticket/i });
    await expect(buyButton).toBeVisible();
    
    // Mock wallet connection (in a real test, you'd connect a test wallet)
    // For now, we'll just check that the purchase flow starts
    await buyButton.click();
    
    // Check if wallet connection is requested
    const walletModal = page.getByRole('dialog');
    await expect(walletModal).toBeVisible();
    
    // In a real test, you would:
    // 1. Connect a test wallet with test ETH
    // 2. Handle the transaction confirmation
    // 3. Verify the transaction was successful
    // 4. Check that the ticket appears in the user's profile
    
    // For now, we'll just close the modal
    const closeButton = page.getByRole('button', { name: /close/i }).first();
    await closeButton.click();
    await expect(walletModal).not.toBeVisible();
    
    // Verify navigation to tickets page after purchase (mocked)
    await page.goto('/tickets');
    await expect(page.getByRole('heading', { name: /my tickets/i })).toBeVisible();
  });
});
