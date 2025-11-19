import { ethers, run, network } from "hardhat"
import { saveDeployment, verifyContract } from "./utils/deploy-utils"

async function main() {
  console.log(`\nDeploying EventFactory to ${network.name}...`)

  // Get deployer
  const [deployer] = await ethers.getSigners()
  console.log(`Deploying with account: ${deployer.address}`)

  // Deploy EventFactory
  const EventFactory = await ethers.getContractFactory("EventFactory")
  const deploymentTx = await EventFactory.getDeployTransaction()
  const estimatedGas = await ethers.provider.estimateGas(deploymentTx)
  
  console.log(`Estimated gas: ${estimatedGas.toString()}`)
  
  const eventFactory = await EventFactory.deploy()
  const deployTx = await eventFactory.deployTransaction.wait()
  
  console.log(`Transaction hash: ${deployTx.transactionHash}`)
  console.log(`EventFactory deployed to: ${eventFactory.address}`)

  // Get contract ABI
  const contractArtifact = await artifacts.readArtifact("EventFactory")
  
  // Save deployment info
  await saveDeployment(
    "EventFactory",
    eventFactory.address,
    deployTx.transactionHash,
    contractArtifact.abi
  )

  // Verify contract
  if (process.env.VERIFY_CONTRACT === "true") {
    console.log("Waiting for block confirmations...")
    await deployTx.wait(6) // Wait for 6 block confirmations
    
    await verifyContract(eventFactory.address, [])
  }

  return eventFactory.address
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
