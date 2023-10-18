// imports
const { ContractTransactionResponse } = require("ethers")
const { ethers, run, network } = require("hardhat")

// async main
async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage")// grabs the contract factory
  console.log("Grabbing Contract...") 
  const simpleStorage = await SimpleStorageFactory.deploy()
  await simpleStorage.waitForDeployment()
  console.log(`Deployed contract address: ${simpleStorage.target}`)

  if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    console.log(`Waiting for block txes...`)
    await simpleStorage.deploymentTransaction().wait(6)
    await verify(simpleStorage.address, [])
  }

  const currentValue = await simpleStorage.retrieve()
  console.log(`Current Value is: ${currentValue}`)

  //Update the current value
  const transactionsResponse = await simpleStorage.store(7)
  await transactionsResponse.wait(1)
  const updatedValue = await simpleStorage.retrieve()
  console.log(`Updated Value is: ${updatedValue}`)
}

async function verify(contractAddress, args) {
  console.log(`Verifying contract...`)
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Contract already verified")
    } else {
      console.log(e)
    }
  }
}

//main
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});