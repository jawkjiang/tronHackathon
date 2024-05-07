// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "./TokenWithMetadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Metana is Ownable {
    event TokenCreated(address tokenAddress);

    address payable private recipient;
    address[] public ft_addresses;

    ERC20TokenWithMetadata public credit;
    address public credit_address;


    constructor(string memory name, string memory symbol, string memory metadataUri) Ownable(msg.sender) {
        ERC20TokenWithMetadata newToken = new ERC20TokenWithMetadata(name, symbol, metadataUri, 0);
        credit = newToken;
        credit_address = address(newToken);
    }


    function setRecipient(address payable _address) public virtual onlyOwner {
        recipient = _address;
    }


    function getFTAddresses() public view returns (address[] memory) {
        return ft_addresses;
    }


    function createFT(string memory name, string memory symbol, string memory metadataUri, uint256 price) public {
        ERC20TokenWithMetadata newToken = new ERC20TokenWithMetadata(name, symbol, metadataUri, price);
        ft_addresses.push(address(newToken));
        emit TokenCreated(address(newToken));
    }

    function buy_ft(address[] calldata fts, uint256[] calldata amounts, bool use_credit, uint256 swap_credits) public payable {
        uint256 totalTransfer = 0;
        for (uint i = 0; i < fts.length; i++) {
            ERC20TokenWithMetadata ft = ERC20TokenWithMetadata(fts[i]);
            totalTransfer = totalTransfer + amounts[i] * ft.getPrice();
        }

        if (use_credit) {
            uint256 payerCredits = credit.balanceOf(msg.sender);

            if (swap_credits > 0) {
                uint256 swapTrx = swap_credits * 100;
                recipient.transfer(swapTrx);
                credit.mint(msg.sender, swap_credits);
                payerCredits += swap_credits;
            }

            uint256 canUsedCredits = payerCredits;
            if (totalTransfer * 3 / 10 < canUsedCredits * 2 * 1e2) {
                canUsedCredits = totalTransfer * 3 / (2 * 1e3);
            }
            totalTransfer = totalTransfer - canUsedCredits * 2 * 1e2;
        }

        //pay the trx
        require(msg.value >= totalTransfer, "Insufficient amount of TRX sent.");
        recipient.transfer(totalTransfer);

        //send ft to payer
        for (uint i = 0; i < fts.length; i++) {
            ERC20TokenWithMetadata ft = ERC20TokenWithMetadata(fts[i]);
            ft.mint(msg.sender, amounts[i]);
        }

        //mint credit to payer
        credit.mint(msg.sender, totalTransfer / 1e4);

    }
}