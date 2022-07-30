const { expect} = require('chai');
const { ethers} = require('hardhat');

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("Token", ()=> {
	
	let token
	let deployer
	let accounts
	let reciever
	beforeEach(async () =>{
		//fetch token from blockchain
		const Token = await ethers.getContractFactory('Token')
		token = await Token.deploy("Dapp University", "DAPP", 1000000)

		accounts = await ethers.getSigners()
		deployer = accounts[0]
		reciever = accounts[1]

	})

	describe("deployment", () => {

		const name = "Dapp University";
		const symbol = "DAPP"
		const decimals = 18
		const totalSupply = tokens('1000000')

		it("It has a name", async ()=> {
		//check that the name is correct
		

		//Check that the name is correct
		expect(await token.name()).to.equal("Dapp University")

		
	})

	it("has the correct symbol", async () => {

		//test for symbol 
		expect(await token.symbol()).to.equal("DAPP")

	})

	it("has the correct decimal", async () => {

		//test for symbol 
		expect(await token.decimals()).to.equal(18);

	})

	it("has the correct total supply", async () => {
		expect(await token.totalSupply()).to.equal(tokens('1000000'))
		

	})

	it("assigns the total supply to deployer", async () => {
		expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)	

	})

	})

	describe("sending tokens", () => {

			let amount, transaction, result

			describe('Success', () => {

				beforeEach(async () => {
				amount = tokens(100)

				transaction = await token.connect(deployer).transfer(reciever.address, amount)
				result = await transaction.wait()
			})

			it("transfers token balances", async () => {
				
				expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
				expect(await token.balanceOf(reciever.address)).to.equal(amount)
			})

			it("Emits a transfer event", async () => {
				
				expect(await result.events[0].event).to.equal('Transfer')
				

				expect(await result.events[0].args.from).to.equal(deployer.address)
				expect(await result.events[0].args.to).to.equal(reciever.address)
				expect(await result.events[0].args.value).to.equal(amount)
				
				
				
			})


			})

			describe('Failure', () => {
				it('rejects insufficent balances', async () => {
					//Transfer more token than TS
					const invalidamount = tokens(100000000)

				transaction = await token.connect(deployer).transfer(reciever.address, amount)
				result = await transaction.wait()

				await expect(token.connect(deployer).transfer(reciever.address, invalidamount)).to.be.reverted


				})
			})

			
	})

	
	
})