
const hre = require("hardhat");
const { ethers } = require('hardhat');
const config = require('../src/config.json')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {

const accounts = await ethers.getSigners()

//get network ID
const {chainId} = await ethers.provider.getNetwork()
console.log("using chain ID " + chainId)

//Fetch tokens 

const DApp =  await ethers.getContractAt('Token', config[chainId].DApp.address)
console.log('DApp Token Fetched: ' + DApp.address)


const mETH =  await ethers.getContractAt('Token', config[chainId].mETH.address)
console.log('mETH Token Fetched: ' + mETH.address)


const mDAI =  await ethers.getContractAt('Token', config[chainId].mDAI.address)
console.log('mETH Token Fetched: ' + mDAI.address)

const exchange =  await ethers.getContractAt('Exchange', config[chainId].exchange.address)
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
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), DApp.address, tokens(50))
      result = await transaction.wait()
      console.log(user1.address + "made an order")

  //user 2 fills order
  transaction = await exchange.connect(user2).fillOrder(result.events[0].args.id)
  result = await transaction.wait()
  console.log(user2.address + "filled order")


  //user 1 makes order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), DApp.address, tokens(50))
      result = await transaction.wait()
      console.log(user1.address + "made an order")

  //user 2 fills order
  transaction = await exchange.connect(user2).fillOrder(result.events[0].args.id)
  result = await transaction.wait()
  console.log(user2.address + "filled order")



  //user 1 makes order
      transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), DApp.address, tokens(50))
      result = await transaction.wait()
      console.log(user1.address + " made an order")

  //user 2 fills order
  transaction = await exchange.connect(user2).fillOrder(result.events[0].args.id)
  result = await transaction.wait()
  console.log(user2.address + "filled order")


  // Seed open orders 

  //user 1 makes 10 orders 

  for(let i = 0; i <= 10; i++ ) {

    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(i*10), DApp.address, tokens(i*5))
      result = await transaction.wait()
      console.log(user1.address + " made an order")


  }
//user 2 makes 10 orders 

  for(let i = 0; i <= 10; i++ ) {

    transaction = await exchange.connect(user2).makeOrder(mDAI.address, tokens(i*5), mETH.address, tokens(i*10))
      result = await transaction.wait()
      console.log(user2.address + " made an order")


  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

