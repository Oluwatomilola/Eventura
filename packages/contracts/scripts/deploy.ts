import { ethers, network, run } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Network:', network.name);

  const feeRecipient = process.env.FEE_RECIPIENT || deployer.address;
  const feeBps = Number.parseInt(process.env.MARKET_FEE_BPS || '250', 10); // default 2.5%

  console.log('Config:');
  console.log('  feeRecipient:', feeRecipient);
  console.log('  feeBps:', feeBps);

  // Deploy EventFactory
  const EventFactory = await ethers.getContractFactory('EventFactory');
  const eventFactory = await EventFactory.deploy();
  await eventFactory.waitForDeployment();
  const eventFactoryAddress = await eventFactory.getAddress();
  console.log('EventFactory deployed to:', eventFactoryAddress);

  // Deploy EventTicketing
  const EventTicketing = await ethers.getContractFactory('EventTicketing');
  const eventTicketing = await EventTicketing.deploy();
  await eventTicketing.waitForDeployment();
  const eventTicketingAddress = await eventTicketing.getAddress();
  console.log('EventTicketing deployed to:', eventTicketingAddress);

  // Deploy TicketMarketplace
  const TicketMarketplace = await ethers.getContractFactory('TicketMarketplace');
  const ticketMarketplace = await TicketMarketplace.deploy(feeRecipient, feeBps);
  await ticketMarketplace.waitForDeployment();
  const ticketMarketplaceAddress = await ticketMarketplace.getAddress();
  console.log('TicketMarketplace deployed to:', ticketMarketplaceAddress);

  // Optional: Etherscan/BaseScan verification if API key present and not local network
  const shouldVerify =
    !!process.env.BASESCAN_API_KEY && !['hardhat', 'localhost'].includes(network.name);
  if (shouldVerify) {
    console.log('Attempting verification on BaseScan...');
    try {
      await run('verify:verify', { address: eventFactoryAddress, constructorArguments: [] });
    } catch (e) {
      console.warn('Verify EventFactory skipped/failed:', (e as Error).message);
    }
    try {
      await run('verify:verify', { address: eventTicketingAddress, constructorArguments: [] });
    } catch (e) {
      console.warn('Verify EventTicketing skipped/failed:', (e as Error).message);
    }
    try {
      await run('verify:verify', {
        address: ticketMarketplaceAddress,
        constructorArguments: [feeRecipient, feeBps],
      });
    } catch (e) {
      console.warn('Verify TicketMarketplace skipped/failed:', (e as Error).message);
    }
  }

  console.log('Deployment completed!');
  console.log(
    JSON.stringify(
      {
        network: network.name,
        deployer: deployer.address,
        contracts: {
          EventFactory: eventFactoryAddress,
          EventTicketing: eventTicketingAddress,
          TicketMarketplace: ticketMarketplaceAddress,
        },
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
