import { ethers, run, network } from "hardhat"
import { saveDeployment, verifyContract, getDeploymentInfo } from "./utils/deploy-utils"

async function main() {
  console.log(`\nDeploying TicketMarketplace to ${network.name}...`)

  // Get deployer
  const [deployer] = await ethers.getSigners()
  console.log(`Deploying with account: ${deployer.address}`)

  // Get EventTicketing address from deployments
  const eventTicketingDeployment = getDeploymentInfo(network.name, "EventTicketing")
  if (!eventTicketingDeployment) {
    throw new Error("EventTicketing not found in deployments")
  }
  const eventTicketingAddress = eventTicketingDeployment.address
  console.log(`Using EventTicketing at: ${eventTicketingAddress}`)

  // Configuration
  const platformFee = ethers.utils.parseEther("0.01") // 1% fee
  const platformFeeRecipient = deployer.address

  // Deploy TicketMarketplace
  const TicketMarketplace = await ethers.getContractFactory("TicketMarketplace")
  const ticketMarketplace = await TicketMarketplace.deploy(
    eventTicketingAddress,
    platformFeeRecipient,
    platformFee
  )
  
  const deployTx = await ticketMarketplace.deployTransaction.wait()
  
  console.log(`Transaction hash: ${deployTx.transactionHash}`)
  console.log(`TicketMarketplace deployed to: ${ticketMarketplace.address}`)
  console.log(`Platform fee set to: ${ethers.utils.formatEther(platformFee)} ETH`)
  console.log(`Platform fee recipient: ${platformFeeRecipient}`)

  // Get contract ABI
  const contractArtifact = await artifacts.readArtifact("TicketMarketplace")
  
  // Save deployment info
  await saveDeployment(
    "TicketMarketplace",
    ticketMarketplace.address,
    deployTx.transactionHash,
    contractArtifact.abi
  )

  // Verify contract
  if (process.env.VERIFY_CONTRACT === "true") {
    console.log("Waiting for block confirmations...")
    await deployTx.wait(6) // Wait for 6 block confirmations
    
    await verifyContract(ticketMarketplace.address, [
      eventTicketingAddress,
      platformFeeRecipient,
      platformFee
    ])
  }

  return ticketMarketplace.address
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
