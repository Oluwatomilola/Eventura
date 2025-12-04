import toast from 'react-hot-toast';

/**
 * useToast Hook
 *
 * Wrapper around react-hot-toast for consistent toast notifications
 * throughout the application
 */

export function useToast() {
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    loading: (message: string) => toast.loading(message),
    dismiss: (toastId?: string) => toast.dismiss(toastId),
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((err: any) => string);
      }
    ) => toast.promise(promise, messages),
  };
}

/**
 * Blockchain-specific toast notifications
 */
export function useBlockchainToast() {
  const { success, error, loading, promise } = useToast();

  return {
    // Wallet connection
    walletConnecting: () => loading('Connecting wallet...'),
    walletConnected: (address: string) =>
      success(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`),
    walletDisconnected: () => success('Wallet disconnected'),
    walletConnectionFailed: (err?: string) =>
      error(err || 'Failed to connect wallet'),

    // Network switching
    networkSwitching: (network: string) => loading(`Switching to ${network}...`),
    networkSwitched: (network: string) => success(`Switched to ${network}`),
    networkSwitchFailed: (network: string) =>
      error(`Failed to switch to ${network}`),

    // Transaction notifications
    transactionPending: (message?: string) =>
      loading(message || 'Transaction pending...'),
    transactionSuccess: (message?: string) =>
      success(message || 'Transaction successful!'),
    transactionFailed: (message?: string) =>
      error(message || 'Transaction failed'),

    // Generic blockchain operations
    blockchainOperation: <T,>(
      promise: Promise<T>,
      operation: string
    ) => promise(promise, {
      loading: `${operation}...`,
      success: `${operation} completed!`,
      error: (err) => `${operation} failed: ${err?.message || 'Unknown error'}`,
    }),
  };
}
