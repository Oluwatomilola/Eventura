import { ethers, run, network } from "hardhat"
import { saveDeployment, verifyContract, getDeploymentInfo } from "./utils/deploy-utils"

async function main() {
  console.log(`\nDeploying EventTicketing to ${network.name}...`)

  // Get deployer
  const [deployer] = await ethers.getSigners()
  console.log(`Deploying with account: ${deployer.address}`)

  // Get EventFactory address from deployments
  const eventFactoryDeployment = getDeploymentInfo(network.name, "EventFactory")
  if (!eventFactoryDeployment) {
    throw new Error("EventFactory not found in deployments")
  }
  const eventFactoryAddress = eventFactoryDeployment.address
  console.log(`Using EventFactory at: ${eventFactoryAddress}`)

  // Deploy EventTicketing
  const EventTicketing = await ethers.getContractFactory("EventTicketing")
  const eventTicketing = await EventTicketing.deploy(eventFactoryAddress)
  const deployTx = await eventTicketing.deployTransaction.wait()
  
  console.log(`Transaction hash: ${deployTx.transactionHash}`)
  console.log(`EventTicketing deployed to: ${eventTicketing.address}`)

  // Get contract ABI
  const contractArtifact = await artifacts.readArtifact("EventTicketing")
  
  // Save deployment info
  await saveDeployment(
    "EventTicketing",
    eventTicketing.address,
    deployTx.transactionHash,
    contractArtifact.abi
  )

  // Verify contract
  if (process.env.VERIFY_CONTRACT === "true") {
    console.log("Waiting for block confirmations...")
    await deployTx.wait(6) // Wait for 6 block confirmations
    
    await verifyContract(eventTicketing.address, [eventFactoryAddress])
  }

  return eventTicketing.address
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
