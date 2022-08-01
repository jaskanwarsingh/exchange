//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
	address public feeAccount;
	uint256 public feePercent;
	uint256 public orderCount;
	mapping (address => mapping(address => uint256)) public tokens;
	mapping (uint256 => _Order) public orders;
	mapping (uint256 => bool) public orderCancelled;

	event Deposit(address token, address user, uint256 amount, uint256 balance);

	event Withdraw(address token, address user, uint256 amount, uint256 balance);

	event Order(
		uint256 id,
		address user,
		address tokenGet, 
		uint256 amountGet,
		address tokenGive, 
		uint256 amountGive,
		uint256 timeStamp
		);

	event Cancel(
		uint256 id,
		address user,
		address tokenGet, 
		uint256 amountGet,
		address tokenGive, 
		uint256 amountGive,
		uint256 timeStamp
		);

	struct _Order {
		uint256 id;
		address user;
		address _tokenGet; 
		uint256 _amountGet;
		address _tokenGive; 
		uint256 _amountGive;
		uint256 timeStamp; 

	}

	constructor (address _feeAccount, uint256 _feePercent) {
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}

	//Deposit Token 

	function depositToken (address _token, uint256 _amount) public {

		//transfer tokens to exchange

		Token(_token).transferFrom(msg.sender, address(this), _amount);

		//Update user balance 

		tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;  
		//emit and event 
		emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}


	function withdrawToken(address _token, uint256 _amount) public {
		//check if users have enough tokens to withdraw
		require(tokens[_token][msg.sender] >= _amount);


		//update user balance 
		tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;

		//transfer tokens to user 
		Token(_token).transfer(msg.sender, _amount);

		//emit event 
		emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	//Check balances

	function balanceOf(
		address _token, 
		address _user) 
	public view returns (uint256){
		return tokens[_token][_user];
	}


	//MAKE AND CANCEL ORDERS
//token give - user wants to spend 
//token get - user wants to recieve
	function makeOrder(
		address _tokenGet, 
		uint256 _amountGet, 
		address _tokenGive, 
		uint256 _amountGive
		) public {

		require(balanceOf(_tokenGive, msg.sender) >= _amountGive);
		orderCount += 1;

		orders[orderCount] = _Order(
			orderCount, 
			msg.sender,
			_tokenGet,
			_amountGet,
			_tokenGive,
			_amountGive,
			block.timestamp
			);
		emit Order(orderCount, 
			msg.sender,
			_tokenGet,
			_amountGet,
			_tokenGive,
			_amountGive,
			block.timestamp
			);

	}

	function cancelOrder(
		uint256 _id) public {

		//Fetch the order 
		_Order storage _order = orders[_id]; 

		//check if order exists 
		require(_order.id == _id);

		//requireorder to be actually users
		require(_order.user == msg.sender);

		//cancel the order
		orderCancelled[_id] = true;
		//emit event
		emit Cancel(
			_order.id,
			_order.user,
			_order._tokenGet,
			_order._amountGet,
			_order._tokenGive,
			_order._amountGive,
			block.timestamp

			);


	}
}