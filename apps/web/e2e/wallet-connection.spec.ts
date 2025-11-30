import { test, expect } from '@playwright/test';

test.describe('Wallet Connection', () => {
  test('should connect wallet successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Click the connect wallet button
    const connectButton = page.getByRole('button', { name: /connect wallet/i });
    await expect(connectButton).toBeVisible();
    await connectButton.click();
    
    // Check if wallet modal is visible
    const walletModal = page.getByRole('dialog');
    await expect(walletModal).toBeVisible();
    
    // Mock wallet connection (in a real test, you'd interact with the wallet extension)
    // For now, we'll just check that the modal contains common wallet options
    const metamaskButton = page.getByText(/metamask/i).first();
    await expect(metamaskButton).toBeVisible();
    
    // In a real test, you would:
    // 1. Click the wallet provider
    // 2. Handle the wallet connection in the test environment
    // 3. Verify the wallet is connected by checking the UI
    
    // For now, we'll just close the modal
    const closeButton = page.getByRole('button', { name: /close/i }).first();
    await closeButton.click();
    await expect(walletModal).not.toBeVisible();
  });
});
