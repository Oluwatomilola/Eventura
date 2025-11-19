import { ethers, network, run } from "hardhat"
import fs from "fs"
import path from "path"

export interface DeploymentInfo {
  network: string
  contract: string
  address: string
  transactionHash: string
  abi: any[]
  verified: boolean
  timestamp: string
}

const DEPLOYMENTS_FILE = path.join(__dirname, "../../deployments.json")

export async function saveDeployment(
  contractName: string,
  contractAddress: string,
  transactionHash: string,
  abi: any[]
): Promise<void> {
  let deployments: Record<string, DeploymentInfo[]> = {}

  // Load existing deployments
  if (fs.existsSync(DEPLOYMENTS_FILE)) {
    deployments = JSON.parse(fs.readFileSync(DEPLOYMENTS_FILE, "utf-8"))
  }

  const deploymentInfo: DeploymentInfo = {
    network: network.name,
    contract: contractName,
    address: contractAddress,
    transactionHash,
    abi,
    verified: false,
    timestamp: new Date().toISOString(),
  }

  if (!deployments[network.name]) {
    deployments[network.name] = []
  }

  // Update if exists, otherwise add new
  const existingIndex = deployments[network.name].findIndex(
    (d) => d.contract === contractName
  )
  if (existingIndex >= 0) {
    deployments[network.name][existingIndex] = deploymentInfo
  } else {
    deployments[network.name].push(deploymentInfo)
  }

  fs.writeFileSync(
    DEPLOYMENTS_FILE,
    JSON.stringify(deployments, null, 2),
    "utf-8"
  )
}

export async function verifyContract(
  contractAddress: string,
  constructorArguments: any[] = [],
  contractPath?: string
): Promise<boolean> {
  try {
    console.log(`\nVerifying contract at ${contractAddress}...`)
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments,
      contract: contractPath,
    })
    console.log("Contract verified successfully!")
    return true
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Contract already verified")
      return true
    }
    console.error("Verification failed:", error)
    return false
  }
}

export function getDeploymentInfo(
  networkName: string,
  contractName: string
): DeploymentInfo | undefined {
  if (!fs.existsSync(DEPLOYMENTS_FILE)) {
    return undefined
  }

  const deployments = JSON.parse(fs.readFileSync(DEPLOYMENTS_FILE, "utf-8"))
  const networkDeployments = deployments[networkName] || []
  return networkDeployments.find(
    (d: DeploymentInfo) => d.contract === contractName
  )
}

export async function getDeployedContract(contractName: string, signer: any) {
  const deployment = getDeploymentInfo(network.name, contractName)
  if (!deployment) {
    throw new Error(`${contractName} not found in deployments for ${network.name}`)
  }

  const contractFactory = await ethers.getContractFactory(contractName)
  return contractFactory.attach(deployment.address).connect(signer)
}
