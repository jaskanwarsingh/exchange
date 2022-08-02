
const hre = require("hardhat");
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {

const accounts = await ethers.getSigners()

//Fetch tokens 

const DApp =  await ethers.getContractAt('Token', '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1')
console.log('DApp Token Fetched: ' + DApp.address)


const mETH =  await ethers.getContractAt('Token', '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE')
console.log('mETH Token Fetched: ' + mETH.address)


const mDAI =  await ethers.getContractAt('Token', '0x68B1D87F95878fE05B998F19b66F4baba5De1aed')
console.log('mETH Token Fetched: ' + mDAI.address)

const exchange =  await ethers.getContractAt('Exchange', '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c')
console.log('Exchange Fetched: ' + exchange.address)

const sender = accounts[0]
const reciever = accounts[1]
let amount = tokens(10000)

let transaction,result 

transaction = await mETH.connect(sender).transfer(reciever.address, amount)
result = await transaction.wait()
console.log(amount + ' mETH sent to ' + reciever.address +" from " + sender.address)


//exchange users
const user1 = accounts[0]
const user2 = accounts[1]
amount = tokens(10000)

   // Approve Token - user1
        transaction = await DApp.connect(user1).approve(exchange.address, amount)
        result = await transaction.wait()
        // Deposit token - user1
        transaction = await exchange.connect(user1).depositToken(DApp.address, amount)
        result = await transaction.wait()
        console.log('10K DApp tokens deposited in exchange by user1')


           // Approve Token - user2
        transaction = await mETH.connect(user2).approve(exchange.address, amount)
        result = await transaction.wait()
        // Deposit token - user2
        transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
        result = await transaction.wait()
        console.log('10K mETH tokens deposited in exchange by user2')

  // user 1 makes and cancels an order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, amount, DApp.address, amount)
      result = await transaction.wait()
      console.log(user1.address + "made an order")

 
      transaction = await exchange.connect(user1).cancelOrder(result.events[0].args.id)
          result = await transaction.wait()
          console.log(user1.address + ' cancelled order')


  //user 1 makes order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), DApp.address, token(50))
      result = await transaction.wait()
      console.log(user1.address + "made an order")

  //user 2 fills order
  transaction = await exchange.connect(user2).fillOrder(result.events[0].args.id)
  result = await transaction.wait()
  console.log(user2.address + "filled order")


  //user 1 makes order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), DApp.address, token(50))
      result = await transaction.wait()
      console.log(user1.address + "made an order")

  //user 2 fills order
  transaction = await exchange.connect(user2).fillOrder(result.events[0].args.id)
  result = await transaction.wait()
  console.log(user2.address + "filled order")


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

