
const hre = require("hardhat");
const { ethers } = require('hardhat');

async function main() {
  console.log("Preparing deployment")
  // Fetch contract to deploy
  const Token = await hre.ethers.getContractFactory("Token")
  const Exchange = await ethers.getContractFactory("Exchange")

  const accounts = await ethers.getSigners()

  console.log("Account 0 : \n" + accounts[0].address + "Account 1 : \n" + accounts[1].address )


  //Deploy Contract

  const dapp = await Token.deploy('Dapp University', 'DAPP', '1000000')
  await dapp.deployed()

  console.log(`dapp Token deployed to : ${dapp.address}`)

   const mETH = await Token.deploy('Mock ETH', 'mETH', '1000000')
  await mETH.deployed()

  console.log(`dapp Token deployed to : ${mETH.address}`)

   const mDAI = await Token.deploy('mock DAI', 'mDAI', '1000000')
  await mDAI.deployed()

  console.log(`dapp Token deployed to : ${mDAI.address}`)

/*  const exchange = await Exchange.deploy(accounts[1], 10)
  await exchange.deployed()
  console.log(`exchange deployed to : ${exchange.address}`) */

console.log(accounts[1])

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

