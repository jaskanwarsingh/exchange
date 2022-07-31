const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Exchange', () => {
  let deployer,feeAccount,exchange,token1,token2,user1

  const feePercent = 10;

  beforeEach(async () => {
   
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    feeAccount = accounts[1]

    const Exchange = await ethers.getContractFactory('Exchange')
    exchange = await Exchange.deploy(feeAccount.address, feePercent)

    const Token = await ethers.getContractFactory('Token')
    token1 = await Token.deploy('Dapp University', 'DAPP', '1000000')

    user1 = accounts[2]

    transaction = await token1.connect(deployer).transfer(user1.address, tokens(100))
    result = await transaction.wait()
   
  })

  describe('Deployment', () => {
    

    it('tracks the fee account', async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address)
    })

    it('correct fee % = 10', async () => {
      expect(await exchange.feePercent()).to.equal(10)
    })

  })

  describe('Depositing tokens', () => {

          let amount = tokens(10)
    let transaction, result
     beforeEach(async () => {
    

    //approve token

    transaction = await token1.connect(user1).approve(exchange.address, amount)
    result = await transaction.wait()

    //deposit token

    transaction = await exchange.connect(user1).depositToken(token1.address, amount)
    result = await transaction.wait()
   
  })
    describe("Success", async () => {

      it('tracks the token deposit', async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(amount)
      })

      it('tracks user balance', async () => {
        expect (await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
      })

      it('emits a deposit event', async () => {
        const event = result.events[1]
        expect(event.event).to.equal('Deposit')

        const args = event.args
        expect(args.token).to.equal(token1.address)
        expect(args.user).to.equal(user1.address)
        expect(args.amount).to.equal(amount)
        expect(args.balance).to.equal(amount)
      })

      

    })

    describe('Failure', () => {

    })
  })

})
