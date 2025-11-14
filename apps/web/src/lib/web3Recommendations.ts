/**
 * Web3-Enhanced Recommendation System
 *
 * Integrates blockchain data via Reown/WalletConnect to provide
 * Web3-native recommendations based on:
 * - On-chain transaction history
 * - NFT ownership and collections
 * - Wallet activity patterns
 * - Token holdings
 * - Previous event attendance (NFT tickets)
 */

import type { Address, PublicClient } from "viem";
import type { EventWithMetadata } from "@/types/multilang-event";
import { getEventCategory, getEventPrice, getEventId } from "./eventHelpers";
import type { UserProfile } from "./recommendations";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

/**
 * Web3 user profile enrichment
 */
export interface Web3Profile {
  address: Address;
  nftCollections?: string[];
  attendedEvents?: string[];
  tokenBalances?: Record<string, bigint>;
  transactionCount?: number;
  accountAge?: number;
  interactionScore?: number;
}

/**
 * Public client instance (Base Sepolia)
 */
export const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

/**
 * Fetch user's NFT collections (mock for now)
 */
export async function fetchUserNFTCollections(
  address: Address,
  publicClient: PublicClient
): Promise<string[]> {
  try {
    const collections: string[] = [];
    return collections;
  } catch (error) {
    console.error("Error fetching NFT collections:", error);
    return [];
  }
}

/**
 * Fetch user's attended events from Eventura ticket NFTs
 */
export async function fetchAttendedEvents(
  address: Address,
  publicClient: PublicClient,
  eventContractAddress: Address
): Promise<string[]> {
  try {
    const attendedEvents: string[] = [];

    return attendedEvents;
  } catch (error) {
    console.error("Error fetching attended events:", error);
    return [];
  }
}

/**
 * Calculate Web3 interaction score
 */
export async function calculateWeb3Score(
  address: Address,
  publicClient: PublicClient
): Promise<number> {
  try {
    let score = 0;

    const txCount = await publicClient.getTransactionCount({ address });
    score += Math.min(txCount / 100, 5);

    const balance = await publicClient.getBalance({ address });
    const ethBalance = Number(balance) / 1e18;
    score += Math.min(ethBalance / 10, 3);

    return score;
  } catch (error) {
    console.error("Error calculating Web3 score:", error);
    return 0;
  }
}

/**
 * Build enriched Web3 profile
 */
export async function buildWeb3Profile(
  address: Address,
  publicClient: PublicClient,
  eventContractAddress?: Address
): Promise<Web3Profile> {
  const [nftCollections, attendedEvents, interactionScore] = await Promise.all([
    fetchUserNFTCollections(address, publicClient),
    eventContractAddress
      ? fetchAttendedEvents(address, publicClient, eventContractAddress)
      : Promise.resolve([]),
    calculateWeb3Score(address, publicClient),
  ]);

  return {
    address,
    nftCollections,
    attendedEvents,
    interactionScore,
  };
}

/**
 * Apply Web3 scoring boosts
 */
export function applyWeb3Boost(
  events: EventWithMetadata[],
  web3Profile: Web3Profile,
  baseScores: Map<string, number>
): Map<string, { score: number; reasons: string[] }> {
  const enhancedScores = new Map<
    string,
    { score: number; reasons: string[] }
  >();

  events.forEach((event) => {
    const eventId = getEventId(event);
    const baseScore = baseScores.get(eventId) || 0;
    let boost = 0;
    const reasons: string[] = [];

    if (web3Profile.interactionScore && web3Profile.interactionScore > 5) {
      boost += 1;
      reasons.push("Active Web3 user");
    }

    if (
      web3Profile.nftCollections &&
      web3Profile.nftCollections.includes(event.organizer.toLowerCase())
    ) {
      boost += 2;
      reasons.push("From collection you own");
    }

    if (web3Profile.attendedEvents?.length) {
      boost += 0.5;
      reasons.push("Similar to events you attended");
    }

    const eventPrice = getEventPrice(event);
    if (web3Profile.tokenBalances) {
      const totalValue = Object.values(web3Profile.tokenBalances).reduce(
        (sum, balance) => sum + Number(balance),
        0
      );
      if (totalValue > 1e18 && eventPrice > 100) {
        boost += 1;
        reasons.push("Premium event match");
      }
    }

    enhancedScores.set(eventId, {
      score: baseScore + boost,
      reasons,
    });
  });

  return enhancedScores;
}

/**
 * Main Web3 recommendation entry point
 */
export async function getWeb3Recommendations(
  address: Address,
  publicClient: PublicClient,
  allEvents: EventWithMetadata[],
  userProfile: UserProfile,
  baseRecommendations: Map<string, number>,
  eventContractAddress?: Address
) {
  const web3Profile = await buildWeb3Profile(
    address,
    publicClient,
    eventContractAddress
  );

  const enhancedScores = applyWeb3Boost(
    allEvents,
    web3Profile,
    baseRecommendations
  );

  return Array.from(enhancedScores.entries())
    .map(([eventId, { score, reasons }]) => ({
      eventId,
      score,
      reasons,
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Check if user can afford an event
 */
export async function canAffordEvent(
  address: Address,
  publicClient: PublicClient,
  event: EventWithMetadata
): Promise<boolean> {
  try {
    const balance = await publicClient.getBalance({ address });
    const priceWithGas = (event.ticketPrice * 110n) / 100n;

    return balance >= priceWithGas;
  } catch (error) {
    console.error("Error checking affordability:", error);
    return false;
  }
}

/**
 * Filter events user can afford
 */
export async function filterAffordableEvents(
  address: Address,
  publicClient: PublicClient,
  events: EventWithMetadata[]
) {
  const checks = await Promise.all(
    events.map((event) => canAffordEvent(address, publicClient, event))
  );

  return events.filter((_, i) => checks[i]);
}
