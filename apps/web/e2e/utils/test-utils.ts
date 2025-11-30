import { Page } from '@playwright/test';

/**
 * Mocks wallet connection for testing
 */
export async function mockWalletConnection(page: Page, address: string = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266') {
  // Mock the window.ethereum object
  await page.addInitScript(`
    window.ethereum = {
      isMetaMask: true,
      isConnected: () => true,
      request: async (request: { method: string, params?: any[] }) => {
        switch (request.method) {
          case 'eth_requestAccounts':
            return ['${address}'];
          case 'eth_accounts':
            return ['${address}'];
          case 'eth_chainId':
            return '0x1';
          default:
            console.warn('Unhandled request:', request);
            return null;
        }
      },
      on: (event: string, callback: Function) => {
        // Mock event listeners
        console.log('Mock event listener added:', event);
      },
      removeListener: () => {}
    };
  `);
}

/**
 * Logs in a test user
 */
export async function loginTestUser(page: Page) {
  await mockWalletConnection(page);
  await page.goto('/');
  const connectButton = page.getByRole('button', { name: /connect wallet/i });
  await connectButton.click();
  
  // Wait for connection to complete
  await expect(page.getByText(/0x.../i)).toBeVisible();
}

/**
 * Creates a test event
 */
export async function createTestEvent(page: Page, eventData: any) {
  // Navigate to create event page
  await page.goto('/create');
  
  // Fill out the event form
  await page.getByLabel('Event Name').fill(eventData.name);
  await page.getByLabel('Description').fill(eventData.description);
  await page.getByLabel('Date and Time').fill(eventData.dateTime);
  await page.getByLabel('Location').fill(eventData.location);
  
  // Upload a test image
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByText('Upload Image').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles('e2e/fixtures/test-image.jpg');
  
  // Submit the form
  await page.getByRole('button', { name: /create event/i }).click();
  
  // Wait for the event to be created and get the event ID
  await page.waitForURL(/\/events\/[^/]+/);
  const url = page.url();
  const eventId = url.split('/').pop();
  
  return eventId;
}

/**
 * Waits for a transaction to complete
 */
export async function waitForTransaction(page: Page, txHash: string) {
  // In a real test, you would wait for the transaction to be mined
  // For now, we'll just wait a short time
  await page.waitForTimeout(2000);
}
