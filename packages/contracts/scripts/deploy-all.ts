import { ethers, run, network } from "hardhat"
import { saveDeployment, verifyContract } from "./utils/deploy-utils"
import { deployFactory } from "./deploy-factory"
import { deployTicketing } from "./deploy-ticketing"
import { deployMarketplace } from "./deploy-marketplace"

async function main() {
  console.log(`\nStarting deployment to ${network.name}...`)
  console.log(`Network ID: ${network.config.chainId}`)
  console.log(`Network URL: ${network.config.url || 'local'}`)

  // Get deployer
  const [deployer] = await ethers.getSigners()
  console.log(`\nDeployer: ${deployer.address}`)
  console.log(`Balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`)

  // Deploy contracts in order
  console.log("\n=== Deploying EventFactory ===")
  const eventFactoryAddress = await deployFactory()
  
  console.log("\n=== Deploying EventTicketing ===")
  const eventTicketingAddress = await deployTicketing()
  
  console.log("\n=== Deploying TicketMarketplace ===")
  const ticketMarketplaceAddress = await deployMarketplace()

  // Verify all contracts if on a live network
  if (process.env.VERIFY_CONTRACT === "true" && network.name !== "hardhat") {
    console.log("\n=== Verifying contracts on BaseScan ===")
    
    try {
      // Verify EventFactory
      console.log("\nVerifying EventFactory...")
      await verifyContract(eventFactoryAddress, [])
      
      // Verify EventTicketing
      console.log("\nVerifying EventTicketing...")
      await verifyContract(eventTicketingAddress, [eventFactoryAddress])
      
      // Verify TicketMarketplace
      console.log("\nVerifying TicketMarketplace...")
      const platformFee = ethers.utils.parseEther("0.01") // Should match deploy-marketplace.ts
      await verifyContract(ticketMarketplaceAddress, [
        eventTicketingAddress,
        deployer.address,
        platformFee
      ])
    } catch (error) {
      console.error("Verification failed:", error)
    }
  }

  // Deployment summary
  console.log("\n=== Deployment Summary ===")
  console.log(`Network: ${network.name}`)
  console.log(`Deployer: ${deployer.address}`)
  console.log("\nDeployed Contracts:")
  console.log(`- EventFactory: ${eventFactoryAddress}`)
  console.log(`- EventTicketing: ${eventTicketingAddress}`)
  console.log(`- TicketMarketplace: ${ticketMarketplaceAddress}`)
  
  // Save deployment info
  const deployments = {
    network: network.name,
    chainId: network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      EventFactory: eventFactoryAddress,
      EventTicketing: eventTicketingAddress,
      TicketMarketplace: ticketMarketplaceAddress,
    },
  }
  
  const fs = require("fs")
  const path = require("path")
  const summaryPath = path.join(__dirname, `../../deployment-summary-${network.name}.json`)
  fs.writeFileSync(summaryPath, JSON.stringify(deployments, null, 2))
  
  console.log(`\nDeployment summary saved to: ${summaryPath}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { main }
