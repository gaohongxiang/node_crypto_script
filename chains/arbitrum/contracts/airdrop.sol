// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20Token {
    function balanceOf(address account) external view returns (uint);
    function transfer(address recipient, uint amount) external returns (bool);
}

contract Airdrop {

    IERC20Token public token;  
    address public owner;
    mapping (address => bool) public claimed;
    
    constructor(address _token) {
        owner = msg.sender;
        token = IERC20Token(_token);
    }
    
    function claim() public {
        require(!claimed[msg.sender], "Already claimed");
        claimed[msg.sender] = true;
        // 发送自己部署的ERC20代币
        uint amount = 1000; 
        token.transfer(msg.sender, amount);  
    }
    
    // Only owner can withdraw funds
    function withdraw() public {
        require(msg.sender == owner, "Only owner");
        payable(owner).transfer(address(this).balance);
    }
}