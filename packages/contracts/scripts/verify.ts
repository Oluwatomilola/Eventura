import { ethers, network, run } from "hardhat"
import { getDeploymentInfo, DeploymentInfo } from "./utils/deploy-utils"
import fs from "fs"
import path from "path"

const DEPLOYMENTS_FILE = path.join(__dirname, "../deployments.json")

async function verifyContract(
  contractName: string,
  contractAddress: string,
  constructorArguments: any[] = [],
  contractPath?: string
): Promise<boolean> {
  try {
    console.log(`\nVerifying ${contractName} at ${contractAddress}...`)
    
    // If contract path is not provided, try to find it in the artifacts
    if (!contractPath) {
      contractPath = `contracts/${contractName}.sol:${contractName}`
    }

    await run("verify:verify", {
      address: contractAddress,
      constructorArguments,
      contract: contractPath,
    })

    console.log(`${contractName} verified successfully!`)
    return true
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log(`${contractName} is already verified`)
      return true
    }
    console.error(`Error verifying ${contractName}:`, error.message)
    return false
  }
}

async function verifyDeployment(deployment: DeploymentInfo): Promise<boolean> {
  let constructorArgs: any[] = []
  
  // For known contracts, we need to provide the correct constructor arguments
  if (deployment.contract === "EventFactory") {
    constructorArgs = []
  } else if (deployment.contract === "EventTicketing") {
    // Get EventFactory address from deployments
    const factoryDeployment = getDeploymentInfo(network.name, "EventFactory")
    if (!factoryDeployment) {
      console.error("EventFactory deployment not found. Cannot verify EventTicketing.")
      return false
    }
    constructorArgs = [factoryDeployment.address]
  } else if (deployment.contract === "TicketMarketplace") {
    // Get EventTicketing address from deployments
    const ticketingDeployment = getDeploymentInfo(network.name, "EventTicketing")
    if (!ticketingDeployment) {
      console.error("EventTicketing deployment not found. Cannot verify TicketMarketplace.")
      return false
    }
    // This should match the deployer address and platform fee used in deploy-marketplace.ts
    const [deployer] = await ethers.getSigners()
    const platformFee = ethers.utils.parseEther("0.01")
    constructorArgs = [ticketingDeployment.address, deployer.address, platformFee]
  }

  return verifyContract(deployment.contract, deployment.address, constructorArgs)
}

async function verifyAllContracts(networkName: string): Promise<void> {
  if (!fs.existsSync(DEPLOYMENTS_FILE)) {
    console.error("Deployments file not found. Please deploy contracts first.")
    return
  }

  const deployments: Record<string, DeploymentInfo[]> = JSON.parse(
    fs.readFileSync(DEPLOYMENTS_FILE, "utf-8")
  )

  const networkDeployments = deployments[networkName]
  if (!networkDeployments || networkDeployments.length === 0) {
    console.error(`No deployments found for network: ${networkName}`)
    return
  }

  console.log(`\n=== Verifying all contracts on ${networkName} ===`)
  
  for (const deployment of networkDeployments) {
    if (!deployment.verified) {
      const success = await verifyDeployment(deployment)
      if (success) {
        // Update the verified status in the deployments file
        deployment.verified = true
      }
    } else {
      console.log(`\n${deployment.contract} is already verified`)
    }
  }

  // Save the updated deployments file
  fs.writeFileSync(DEPLOYMENTS_FILE, JSON.stringify(deployments, null, 2))
  console.log("\nVerification process completed!")
}

async function main() {
  const args = process.argv.slice(2)
  const networkName = network.name

  if (args.length === 0) {
    // Verify all contracts for the current network
    await verifyAllContracts(networkName)
  } else {
    // Verify a specific contract
    const contractName = args[0]
    const deployment = getDeploymentInfo(networkName, contractName)
    
    if (!deployment) {
      console.error(`No deployment found for ${contractName} on ${networkName}`)
      return
    }

    console.log(`\n=== Verifying ${contractName} on ${networkName} ===`)
    const success = await verifyDeployment(deployment)
    
    if (success) {
      // Update the verified status in the deployments file
      const deployments = JSON.parse(fs.readFileSync(DEPLOYMENTS_FILE, "utf-8"))
      const deploymentIndex = deployments[networkName].findIndex(
        (d: DeploymentInfo) => d.contract === contractName
      )
      if (deploymentIndex >= 0) {
        deployments[networkName][deploymentIndex].verified = true
        fs.writeFileSync(DEPLOYMENTS_FILE, JSON.stringify(deployments, null, 2))
      }
    }
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { verifyContract, verifyAllContracts }
