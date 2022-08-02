const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Exchange', () => {
  let deployer, feeAccount, exchange

  const feePercent = 10

  beforeEach(async () => {
    const Exchange = await ethers.getContractFactory('Exchange')
    const Token = await ethers.getContractFactory('Token')

    token1 = await Token.deploy('Dapp University', 'DAPP', '1000000')
    token2 = await Token.deploy('mock DAI', 'mDAI', '1000000')

    accounts = await ethers.getSigners()
    deployer = accounts[0]
    feeAccount = accounts[1]
    user1 = accounts[2]
    user2 = accounts[3]

    let transaction = await token1.connect(deployer).transfer(user1.address, tokens(100))
    await transaction.wait()

    transaction = await token2.connect(deployer).transfer(user2.address, tokens(100))
    await transaction.wait()

    exchange = await Exchange.deploy(feeAccount.address, feePercent)
  })

  describe('Deployment', () => {

    it('tracks the fee account', async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address)
    })

    it('tracks the fee percent', async () => {
      expect(await exchange.feePercent()).to.equal(feePercent)
    })
  })

  describe('Depositing Tokens', () => {
    let transaction, result
    let amount = tokens(10)

    describe('Success', () => {
      beforeEach(async () => {
        // Approve Token
        transaction = await token1.connect(user1).approve(exchange.address, amount)
        result = await transaction.wait()
        // Deposit token
        transaction = await exchange.connect(user1).depositToken(token1.address, amount)
        result = await transaction.wait()
      })

      it('tracks the token deposit', async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(amount)
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
      })

      it('emits a Deposit event', async () => {
        const event = result.events[1] // 2 events are emitted
        expect(event.event).to.equal('Deposit')

        const args = event.args
        expect(args.token).to.equal(token1.address)
        expect(args.user).to.equal(user1.address)
        expect(args.amount).to.equal(amount)
        expect(args.balance).to.equal(amount)
      })

    })

    describe('Failure', () => {
      it('fails when no tokens are approved', async () => {
        // Don't approve any tokens before depositing
        await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
      })
    })

  })


  describe('Withdrawing Tokens', () => {
    let transaction, result
    let amount = tokens(10)

    describe('Success', () => {
      beforeEach(async () => {
        // Deposit tokens before withdrawing

        // Approve Token
        transaction = await token1.connect(user1).approve(exchange.address, amount)
        result = await transaction.wait()
        // Deposit token
        transaction = await exchange.connect(user1).depositToken(token1.address, amount)
        result = await transaction.wait()

        // Now withdraw Tokens
        transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
        result = await transaction.wait()
      })

      it('withdraws token funds', async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(0)
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
      })

      it('emits a Withdraw event', async () => {
        const event = result.events[1] // 2 events are emitted
        expect(event.event).to.equal('Withdraw')

        const args = event.args
        expect(args.token).to.equal(token1.address)
        expect(args.user).to.equal(user1.address)
        expect(args.amount).to.equal(amount)
        expect(args.balance).to.equal(0)
      })

    })

    describe('Failure', () => {
      it('fails for insufficient balances', async () => {
        // Attempt to withdraw tokens without depositing
        await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted
      })
    })

  })

  describe('Checking Balances', () => {
    let transaction, result
    let amount = tokens(1)

    beforeEach(async () => {
      // Approve Token
      transaction = await token1.connect(user1).approve(exchange.address, amount)
      result = await transaction.wait()
      // Deposit token
      transaction = await exchange.connect(user1).depositToken(token1.address, amount)
      result = await transaction.wait()
    })

    it('returns user balance', async () => {
      expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
    })

  })

   describe('making orders', () => {
    let transaction, result
    let amount_give = tokens(1)
    let amount_get = tokens(1)

    beforeEach(async () => {
      // Approve Token
      transaction = await token1.connect(user1).approve(exchange.address, amount_give)
      result = await transaction.wait()
      // Deposit token
      transaction = await exchange.connect(user1).depositToken(token1.address, amount_give)
      result = await transaction.wait()
      //make Order

      transaction = await exchange.connect(user1).makeOrder(token2.address, amount_get, token1.address, amount_give)
      result = await transaction.wait()
    })

   it('tracks the newly created order', async () => {
        expect(await exchange.orderCount()).to.equal(1)
      })

      it('emits an Order event', async () => {
        const event = result.events[0]
        expect(event.event).to.equal('Order')

        const args = event.args
        expect(args.id).to.equal(1)
        expect(args.user).to.equal(user1.address)
        expect(args.tokenGet).to.equal(token2.address)
        expect(args.amountGet).to.equal(tokens(1))
        expect(args.tokenGive).to.equal(token1.address)
        expect(args.amountGive).to.equal(tokens(1))
        expect(args.timeStamp).to.at.least(1)
      })

  })

   describe('Order actions', async () => {

    let transaction, result
    let amount_give = tokens(1)
    let amount_get = tokens(1)

    beforeEach(async () => {

       // Approve Token
      transaction = await token1.connect(user1).approve(exchange.address, amount_give)
      result = await transaction.wait()
      // Deposit token
      transaction = await exchange.connect(user1).depositToken(token1.address, amount_give)
      result = await transaction.wait()
      //make Order
      transaction = await exchange.connect(user1).makeOrder(token2.address, amount_get, token1.address, amount_give)
      result = await transaction.wait()

      

    })

      describe('Cancelling Orders', async () => {

        beforeEach(async () => {
          //cancel the order
          transaction = await exchange.connect(user1).cancelOrder(1)
          result = await transaction.wait()
        })

        describe('Success', async () => {

        it('updates the cancelled Order', async() => {
          expect(await exchange.orderCancelled(1)).to.equal(true)
        })
        it('emits cancel event', async() => {
          const event = result.events[0]
        expect(event.event).to.equal('Cancel')

        const args = event.args
        expect(args.id).to.equal(1)
        expect(args.user).to.equal(user1.address)
        expect(args.tokenGet).to.equal(token2.address)
        expect(args.amountGet).to.equal(tokens(1))
        expect(args.tokenGive).to.equal(token1.address)
        expect(args.amountGive).to.equal(tokens(1))
        expect(args.timeStamp).to.at.least(1)
        })

   })
    describe('Failure', async () => {

      it('reverts unvalid id txn', async() => {
        await expect(exchange.connect(user1).cancelOrder(2)).to.be.reverted
      })

      it('reverts cancel from other user account ', async() => {
        await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted
      })

  

   })

   })


   describe('Filling orders', async () => {

        beforeEach(async () => {

          

           // Approve Token - user 1
      transaction = await token1.connect(user1).approve(exchange.address, amount_give)
      result = await transaction.wait()
      // Deposit token - user 1
      transaction = await exchange.connect(user1).depositToken(token1.address, amount_give)
      result = await transaction.wait()
      //make Order - user 1 
      transaction = await exchange.connect(user1).makeOrder(token2.address, amount_get, token1.address, amount_give)
      result = await transaction.wait()


           // Approve Token - user 2
      transaction = await token2.connect(user2).approve(exchange.address, tokens(2))
      result = await transaction.wait()
      // Deposit token - user 2
      transaction = await exchange.connect(user2).depositToken(token2.address, tokens(2))
      result = await transaction.wait()

          //fill order
          transaction = await exchange.connect(user2).fillOrder(1)
          result = await transaction.wait()
        })

        describe('Success', async () => {

        it('transfers tokens to maker', async() => {
          expect(await exchange.balanceOf(token2.address,user1.address)).to.equal(tokens(1))
          
        })

        it('transfers tokens to taker', async() => {
          expect(await exchange.balanceOf(token1.address,user2.address)).to.equal(tokens(1))
          
        })

        it('transfers tokens to fee account', async() => {
          expect(await exchange.balanceOf(token2.address,feeAccount.address)).to.equal(tokens(0.1))
          
        })


        it('emits trade event', async() => {
          const event = result.events[0]
        expect(event.event).to.equal('Trade')


        const args = event.args
        expect(args.id).to.equal(1)
        expect(args.user).to.equal(user2.address)
        expect(args.tokenGet).to.equal(token2.address)
        expect(args.amountGet).to.equal(tokens(1))
        expect(args.tokenGive).to.equal(token1.address)
        expect(args.amountGive).to.equal(tokens(1))
        expect(args.creator).to.equal(user1.address)
        expect(args.timeStamp).to.at.least(1)

        })

   })
   /* describe('Failure', async () => {

      it('reverts unvalid id txn', async() => {
        await expect(exchange.connect(user1).cancelOrder(2)).to.be.reverted
      })

      it('reverts cancel from other user account ', async() => {
        await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted
      })

  

   })*/

   })   

   })


})