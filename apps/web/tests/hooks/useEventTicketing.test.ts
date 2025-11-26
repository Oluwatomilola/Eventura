import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEventTicketing } from '../../src/hooks/useEventTicketing'

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useChainId: vi.fn(),
  useReadContract: vi.fn(),
  useWriteContract: vi.fn(),
}))

vi.mock('@/lib/contracts', () => ({
  EventTicketingABI: [
    {
      inputs: [{ name: 'eventId', type: 'uint256' }],
      name: 'getEvent',
      outputs: [
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'startTime', type: 'uint256' },
        { name: 'endTime', type: 'uint256' },
        { name: 'ticketPrice', type: 'uint256' },
        { name: 'maxTickets', type: 'uint256' },
        { name: 'ticketsSold', type: 'uint256' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ name: 'eventId', type: 'uint256' }],
      name: 'isSoldOut',
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ name: 'eventId', type: 'uint256' }],
      name: 'getAvailableTickets',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { name: 'eventId', type: 'uint256' },
      ],
      name: 'purchaseTicket',
      outputs: [{ name: 'ticketId', type: 'uint256' }],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [{ name: 'ticketId', type: 'uint256' }],
      name: 'refundTicket',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ name: 'eventId', type: 'uint256' }],
      name: 'joinWaitlist',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ name: 'eventId', type: 'uint256' }],
      name: 'leaveWaitlist',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
  getContractAddresses: vi.fn(),
}))

const mockUseAccount = vi.mocked(require('wagmi').useAccount)
const mockUseChainId = vi.mocked(require('wagmi').useChainId)
const mockUseReadContract = vi.mocked(require('wagmi').useReadContract)
const mockUseWriteContract = vi.mocked(require('wagmi').useWriteContract)

describe('useEventTicketing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock values
    mockUseAccount.mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    })
    
    mockUseChainId.mockReturnValue(1)
    
    mockUseReadContract.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    
    mockUseWriteContract.mockReturnValue({
      writeContract: vi.fn(),
      isPending: false,
    })
    
    vi.mocked(require('@/lib/contracts').getContractAddresses).mockReturnValue({
      EventTicketing: '0x1234567890123456789012345678901234567890',
    })
  })

  describe('hook initialization', () => {
    it('returns initial state correctly', () => {
      const { result } = renderHook(() => useEventTicketing())
      
      expect(result.current.walletAddress).toBe('0x1234567890123456789012345678901234567890')
      expect(result.current.chainId).toBe(1)
      expect(result.current.isReady).toBe(true)
      expect(result.current.isWriting).toBe(false)
      expect(typeof result.current.purchaseTicket).toBe('function')
      expect(typeof result.current.refundTicket).toBe('function')
      expect(typeof result.current.joinWaitlist).toBe('function')
      expect(typeof result.current.leaveWaitlist).toBe('function')
    })

    it('returns isReady as false when wallet not connected', () => {
      mockUseAccount.mockReturnValue({
        address: undefined,
        isConnected: false,
      })
      
      const { result } = renderHook(() => useEventTicketing())
      
      expect(result.current.isReady).toBe(false)
    })

    it('returns isReady as false when contract address invalid', () => {
      vi.mocked(require('@/lib/contracts').getContractAddresses).mockReturnValue({
        EventTicketing: '0x123', // Invalid address
      })
      
      const { result } = renderHook(() => useEventTicketing())
      
      expect(result.current.isReady).toBe(false)
    })

    it('returns isReady as false when no contract address', () => {
      vi.mocked(require('@/lib/contracts').getContractAddresses).mockReturnValue({})
      
      const { result } = renderHook(() => useEventTicketing())
      
      expect(result.current.isReady).toBe(false)
    })
  })

  describe('getEvent', () => {
    it('calls useReadContract with correct parameters', () => {
      renderHook(() => useEventTicketing())
      
      const eventId = BigInt(123)
      const { result } = renderHook(() => useEventTicketing())
      const getEvent = result.current.getEvent
      
      // Call the returned function
      getEvent(eventId)
      
      expect(mockUseReadContract).toHaveBeenCalledWith({
        address: '0x1234567890123456789012345678901234567890',
        abi: expect.arrayContaining([
          expect.objectContaining({ name: 'getEvent' })
        ]),
        functionName: 'getEvent',
        args: [eventId],
        query: { enabled: true },
      })
    })

    it('does not query when eventId is undefined', () => {
      renderHook(() => useEventTicketing())
      
      const { result } = renderHook(() => useEventTicketing())
      const getEvent = result.current.getEvent
      
      // Call with undefined
      getEvent(undefined as any)
      
      expect(mockUseReadContract).toHaveBeenCalledWith({
        address: '0x1234567890123456789012345678901234567890',
        abi: expect.arrayContaining([
          expect.objectContaining({ name: 'getEvent' })
        ]),
        functionName: 'getEvent',
        args: [undefined],
        query: { enabled: false },
      })
    })

    it('does not query when hook is not ready', () => {
      mockUseAccount.mockReturnValue({
        address: undefined,
        isConnected: false,
      })
      
      renderHook(() => useEventTicketing())
      
      const { result } = renderHook(() => useEventTicketing())
      const getEvent = result.current.getEvent
      
      const eventId = BigInt(123)
      getEvent(eventId)
      
      expect(mockUseReadContract).toHaveBeenCalledWith({
        address: '0x1234567890123456789012345678901234567890',
        abi: expect.arrayContaining([
          expect.objectContaining({ name: 'getEvent' })
        ]),
        functionName: 'getEvent',
        args: [eventId],
        query: { enabled: false },
      })
    })
  })

  describe('isSoldOut', () => {
    it('calls useReadContract with correct parameters', () => {
      const { result } = renderHook(() => useEventTicketing())
      const isSoldOut = result.current.isSoldOut
      
      const eventId = BigInt(456)
      isSoldOut(eventId)
      
      expect(mockUseReadContract).toHaveBeenCalledWith({
        address: '0x1234567890123456789012345678901234567890',
        abi: expect.arrayContaining([
          expect.objectContaining({ name: 'isSoldOut' })
        ]),
        functionName: 'isSoldOut',
        args: [eventId],
        query: { enabled: true },
      })
    })
  })

  describe('getAvailableTickets', () => {
    it('calls useReadContract with correct parameters', () => {
      const { result } = renderHook(() => useEventTicketing())
      const getAvailableTickets = result.current.getAvailableTickets
      
      const eventId = BigInt(789)
      getAvailableTickets(eventId)
      
      expect(mockUseReadContract).toHaveBeenCalledWith({
        address: '0x1234567890123456789012345678901234567890',
        abi: expect.arrayContaining([
          expect.objectContaining({ name: 'getAvailableTickets' })
        ]),
        functionName: 'getAvailableTickets',
        args: [eventId],
        query: { enabled: true },
      })
    })
  })

  describe('purchaseTicket', () => {
    it('throws error when not ready', async () => {
      mockUseAccount.mockReturnValue({
        address: undefined,
        isConnected: false,
      })
      
      const { result } = renderHook(() => useEventTicketing())
      
      await act(async () => {
        await expect(result.current.purchaseTicket(BigInt(123), BigInt(1000)))
          .rejects.toThrow('Wallet not connected or contract not configured')
      })
    })

    it('calls writeContract with correct parameters', async () => {
      const mockWriteContract = vi.fn()
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        isPending: false,
      })
      
      const { result } = renderHook(() => useEventTicketing())
      
      const eventId = BigInt(123)
      const price = BigInt(1000)
      
      await act(async () => {
        await result.current.purchaseTicket(eventId, price)
      })
      
      expect(mockWriteContract).toHaveBeenCalledWith({
        address: '0x1234567890123456789012345678901234567890',
        abi: expect.arrayContaining([
          expect.objectContaining({ name: 'purchaseTicket' })
        ]),
        functionName: 'purchaseTicket',
        args: [eventId],
        value: price,
      })
    })

    it('includes event ID as ticket value', async () => {
      const mockWriteContract = vi.fn()
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        isPending: false,
      })
      
      const { result } = renderHook(() => useEventTicketing())
      
      const eventId = BigInt(456)
      const price = BigInt(2000)
      
      await act(async () => {
        await result.current.purchaseTicket(eventId, price)
      })
      
      expect(mockWriteContract).toHaveBeenCalledWith({
        address: '0x1234567890123456789012345678901234567890',
        abi: expect.arrayContaining([
          expect.objectContaining({ name: 'purchaseTicket' })
        ]),
        functionName: 'purchaseTicket',
        args: [BigInt(456)],
        value: BigInt(2000),
      })
    })
  })

  describe('refundTicket', () => {
    it('throws error when not ready', async () => {
      mockUseAccount.mockReturnValue({
        address: undefined,
        isConnected: false,
      })
      
      const { result } = renderHook(() => useEventTicketing())
      
      await act(async () => {
        await expect(result.current.refundTicket(BigInt(789)))
          .rejects.toThrow('Wallet not connected or contract not configured')
      })
    })

    it('calls writeContract with correct parameters', async () => {
      const mockWriteContract = vi.fn()
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        isPending: false,
      })
      
      const { result } = renderHook(() => useEventTicketing())
      
      const ticketId = BigInt(789)
      
      await act(async () => {
        await result.current.refundTicket(ticketId)
      })
      
      expect(mockWriteContract).toHaveBeenCalledWith({
        address: '0x1234567890123456789012345678901234567890',
        abi: expect.arrayContaining([
          expect.objectContaining({ name: 'refundTicket' })
        ]),
        functionName: 'refundTicket',
        args: [ticketId],
      })
    })
  })

  describe('joinWaitlist', () => {
    it('throws error when not ready', async () => {
      mockUseAccount.mockReturnValue({
        address: undefined,
        isConnected: false,
      })
      
      const { result } = renderHook(() => useEventTicketing())
      
      await act(async () => {
        await expect(result.current.joinWaitlist(BigInt(123)))
          .rejects.toThrow('Wallet not connected or contract not configured')
      })
    })

    it('calls writeContract with correct parameters', async () => {
      const mockWriteContract = vi.fn()
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        isPending: false,
      })
      
      const { result } = renderHook(() => useEventTicketing())
      
      const eventId = BigInt(123)
      
      await act(async () => {
        await result.current.joinWaitlist(eventId)
      })
      
      expect(mockWriteContract).toHaveBeenCalledWith({
        address: '0x1234567890123456789012345678901234567890',
        abi: expect.arrayContaining([
          expect.objectContaining({ name: 'joinWaitlist' })
        ]),
        functionName: 'joinWaitlist',
        args: [eventId],
      })
    })
  })

  describe('leaveWaitlist', () => {
    it('throws error when not ready', async () => {
      mockUseAccount.mockReturnValue({
        address: undefined,
        isConnected: false,
      })
      
      const { result } = renderHook(() => useEventTicketing())
      
      await act(async () => {
        await expect(result.current.leaveWaitlist(BigInt(123)))
          .rejects.toThrow('Wallet not connected or contract not configured')
      })
    })

    it('calls writeContract with correct parameters', async () => {
      const mockWriteContract = vi.fn()
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        isPending: false,
      })
      
      const { result } = renderHook(() => useEventTicketing())
      
      const eventId = BigInt(123)
      
      await act(async () => {
        await result.current.leaveWaitlist(eventId)
      })
      
      expect(mockWriteContract).toHaveBeenCalledWith({
        address: '0x1234567890123456789012345678901234567890',
        abi: expect.arrayContaining([
          expect.objectContaining({ name: 'leaveWaitlist' })
        ]),
        functionName: 'leaveWaitlist',
        args: [eventId],
      })
    })
  })

  describe('state management', () => {
    it('reflects writing state', () => {
      mockUseWriteContract.mockReturnValue({
        writeContract: vi.fn(),
        isPending: true,
      })
      
      const { result } = renderHook(() => useEventTicketing())
      
      expect(result.current.isWriting).toBe(true)
    })

    it('updates when write state changes', () => {
      let writeState = { writeContract: vi.fn(), isPending: false }
      mockUseWriteContract.mockReturnValue(writeState)
      
      const { result, rerender } = renderHook(() => useEventTicketing())
      
      expect(result.current.isWriting).toBe(false)
      
      // Update write state
      writeState = { writeContract: vi.fn(), isPending: true }
      mockUseWriteContract.mockReturnValue(writeState)
      
      rerender()
      
      expect(result.current.isWriting).toBe(true)
    })
  })

  describe('contract address memoization', () => {
    it('memoizes contract addresses by chainId', () => {
      let chainId = 1
      mockUseChainId.mockReturnValue(chainId)
      
      const { rerender } = renderHook(() => useEventTicketing())
      
      // First call with chainId 1
      expect(vi.mocked(require('@/lib/contracts').getContractAddresses)).toHaveBeenCalledTimes(1)
      
      // Re-render with same chainId
      rerender()
      expect(vi.mocked(require('@/lib/contracts').getContractAddresses)).toHaveBeenCalledTimes(1) // Should not be called again
      
      // Change chainId
      chainId = 137 // Polygon
      mockUseChainId.mockReturnValue(chainId)
      rerender()
      expect(vi.mocked(require('@/lib/contracts').getContractAddresses)).toHaveBeenCalledTimes(2) // Should be called again
    })
  })
})